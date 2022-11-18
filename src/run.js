const fs = require('fs');
const chalk = require('chalk');
const {waitTime} = require('./util/my-util');
const {data} = require('./categoryPool');

const {getTargets} = require('./_getTargets');
const {grepLiveSuccessFailCancel, grepSubmitStart} = require('./_getPage');
const {getUpdates} = require('./_getUpdate');
const {getComments} = require('./_getComment');

const TOTAL_POOL = data;
const {motherUrls} = require('./public/global');
const motherUrl = motherUrls[Math.floor(Math.random() * motherUrls.length)];

async function crawlSubcategory(sub_category_id) {
	const POOL = TOTAL_POOL.find(ele => ele.subCategoryID === sub_category_id);
	const POOL_INDEX = TOTAL_POOL.findIndex(ele => ele.subCategoryID === sub_category_id);

	//	서브카테고리 디렉토리가 없으면 생성 해 준다.
	if(!await isDirBeing(`../SCRAPED_RAW_DATA/${POOL.subCategory}`)) await makeDir(`../SCRAPED_RAW_DATA/${POOL.subCategory}`)

	//	타겟이 없으면 찾고, 관련 파일을 업데이트한다.
	if(!await isTargetReady()) {
		console.time('target job: ')
		try {
			console.log(chalk.blue('\n타겟이 준비되지 않았습니다. 타겟 조사를 시작합니다...\n'));
			const scrapedTargets = await getTargets(userSelectedCategory);;
			const updatedPOOL = {
				...POOL,
				numberOfProject: scrapedTargets.length
			}
			categoryPool.splice(POOL_INDEX, 1, updatedPOOL);
			await writeFile(`./categoryPool.js`, categoryPool);
			await writeFile(`../SCRAPED_RAW_DATA/${POOL.subCategory}/targets.js`, scrapedTargets);
			console.log(chalk.blue('\n타겟 생성이 완료되었습니다.\n'));
		}
		catch(err) {
			console.log(chalk.bold.red('타겟을 얻는데 실패했습니다.'));
			console.error(chalk.bold.red(err));
		}
		console.timeEnd('target job: ');
	}

	//	타겟을 불러온다.
	await waitTime(5 *1000);
	const {data} = require(`../SCRAPED_RAW_DATA/${POOL.subCategory}/targets`);
	let TARGETS = data;

	//	타겟의 반복 수집 작업을 시작한다.
	let targetIdx = 0;
	for (const target of TARGETS) {
		//	공통 사용 변수 선언
		let isVirgin = false;	//	getPage, getComment, getUpdate중 하나라도 실행 했다면 virgin : true가 되고,
								//	이때 모든 데이터 수집에 성공하면 categoryPool의 numberOfScraped를 올려준다.
		const baseDir = `../SCRAPED_RAW_DATA/${POOL.subCategory}/${targetIdx}`;

		//	폴더가 없다면 먼저 만들어주고,
		if(!await isDirBeing(baseDir)) await makeDir(baseDir);


		//	targetData파일이 없다면, 저장 해 준다.
		if(!await isFileBeing(baseDir +'/targetData.js')) {
			writeFile(baseDir +'/targetData.js', JSON.parse(target.data));
		}
		
		//	공통 사용 변수 선언
		const targetData = JSON.parse(target.data);
		const targetIsDone = target.isDone;
		let updatedTarget = {
			...target
		}

		//	
		//		PAGE PART
		//	
		//	isDone pageData : false 라면, 찾아서 저장 해 준다.
		let pageData;
		if(!targetIsDone.pageData) {
			isVirgin = true;
			switch(targetData.state) {
				case 'live':
				case 'successful':
				case 'failed':
				case 'canceled':
					pageData = await grepLiveSuccessFailCancel(targetData.urls.web.project, targetData.state === 'successful' ? true : false, targetData.slug);
					break;
				case 'submitted':
				case 'started' :
					pageData = await grepSubmitStart(targetData.urls.web.project);
					break;
				default :
					throw new Error(`처음 보는 타입의 프로젝트입니다. state : [${targetData.state}]`)
			}

			if(pageData === undefined) throw new Error(`page data가 undefined입니다. 파일을 생성하지 못했습니다.`)
			else {
				//	모든 것이 성공했을 때,
				//	
				//targets.js 파일 업데이트용 변수 업데이트(isDone: true)
				updatedTarget = {
					...updatedTarget,
					isDone: {
						...updatedTarget.isDone,
						pageData: true
					}
				}
				TARGETS.splice(targetIdx, 1, updatedTarget)
				//virgin check to update categoryPool
				//
				//raw data 저장하는 파일 생성
				await writeFile(baseDir +'/pageData.js', pageData);
			}
		}

		
		//	
		//		COMMENT PART
		//	
		//	isDone commentData : false 라면, 찾아서 저장 해 준다.
		let commentData;
		if(!targetIsDone.commentData) {
			isVirgin = true;
			let commentableID;
			if(pageData !== undefined) commentableID = pageData.commentableID;
			else {
				//	pageData가 과거에 완성되어 있었다면 파일에서 읽어 온다.
				const {data} = require(baseDir +'/pageData');
				commentableID = data.commentableID;
			}

			commentData = await getComments(motherUrl, commentableID);

			if(commentData === undefined) throw new Error(`comment data가 undefined입니다. 파일을 생성하지 못했습니다.`)
			else {
				//	모든 것이 성공했을 때,
				//	
				//targets.js 파일 업데이트용 변수 업데이트(isDone: true)
				updatedTarget = {
					...updatedTarget,
					isDone: {
						...updatedTarget.isDone,
						commentData: true
					}
				}
				TARGETS.splice(targetIdx, 1, updatedTarget)
				//virgin check to update categoryPool
				//
				//raw data 저장하는 파일 생성
				await writeFile(baseDir +'/commentData.js', commentData);
			}
		}


		//	
		//		UPDATE PART
		//	
		//	isDone updateData : false 라면, 찾아서 저장 해 준다.
		let updateData;
		if(!targetIsDone.updateData) {
			isVirgin = true;
			//	updateData 파일이 없다면
			if(!await isFileBeing(baseDir +'/updateData.js')) {
				updateData = await getUpdates(motherUrl, targetData.slug);

				if(updateData === undefined) throw new Error(`update data가 undefined입니다. 파일을 생성하지 못했습니다.`)
				else {
					//	모든 것이 성공했을 때,
					//	
					//raw data 저장하는 파일 생성
					await writeFile(baseDir +'/updateData.js', updateData);
				}
			}
			else {
				const {data} = require(baseDir +'/updateData');
				updateData = data;
			}

			//	
			//		SUB-COMMENT PART UNDER UPDATE
			//	
			//	updateData의 길이 만큼 파일이 생성되어 있어야한다.(업데이트에 딸린 코멘트가 0개라도 파일은 무조건 생성시킨다.)
			//	다만, 생산성을 위해 iteration 과정에서 초입에 조건을 건다.
			//	조건 1 : update data의 내역의 코멘트 수가 0이면 getComment함수를 실행하지 않고 빈 배열을 파일에 작성한다.
			//	조건 2 : update data의 내역의 type이 'update'가 아닌 경우 getComment함수를 실행하지 않고 빈 배열을 파일에 작성한다.
			//	조사를 마친 시점에서 파일을 생성하기 때문에 파일이 없다면 조사 되지 않음이 보장된다.
			//
			let checkIsDone = 0;	//	updateData가 존재하지 않는다면 subCommentUpdate는 조사 할 수 없다. 따라서 subCommentUpdate의 조사를 완료했는지만 확인하면 된다.
									//	이것을 확인하는 조건은 : updateData.length === 완성 되어 존재하는 파일 수 + 수집 성공 한 파일 수
			let subCommentFileIdx = 0;
			for (const eachUpdate of updateData) {
				if(await isFileBeing(baseDir +`/subCommentData_${subCommentFileIdx}.js`)) {
					checkIsDone++;
					continue;
				}

				if(eachUpdate.node.type !== 'update') {
					await writeFile(baseDir +`/subCommentData_${subCommentFileIdx}.js`, []);
					continue;
				}

				if(Number(eachUpdate.node.data.commentsCount) === 0) {
					await writeFile(baseDir +`/subCommentData_${subCommentFileIdx}.js`, []);
					continue;
				}
				
				const commentableID = eachUpdate.node.data.id;
				const subCommentData = await getComments(motherUrl, commentableID);

				if(subCommentData === undefined) throw new Error(`sub_comment data가 undefined입니다. 파일을 생성하지 못했습니다.`)
				else {
					//	모든 것이 성공했을 때,
					//	
					//virgin check to update categoryPool
					//
					//raw data 저장하는 파일 생성
					await writeFile(baseDir +`/subCommentData_${subCommentFileIdx}.js`, subCommentData);
					checkIsDone++;
					if(updateData.length === checkIsDone) {
						//targets.js 파일 업데이트용 변수 업데이트(isDone: true)
						updatedTarget = {
							...updatedTarget,
							isDone: {
								...updatedTarget.isDone,
								updateData: true
							}
						}
						TARGETS.splice(targetIdx, 1, updatedTarget)
					}
				}
			}
		}
			
		//	일단 스크랩 실행 결과(isDone상황판)를 TARGETS에 업데이트 해 준다
		await writeFile(`../SCRAPED_RAW_DATA/${POOL.subCategory}/targets.js`, TARGETS);

		//	모두 성공적인데, 이번 타겟이 virgin : true 라면 categoryPool의 numberOfScraped를 업데이트 해 준다
		if(TARGETS[targetIdx].isDone.pageData && TARGETS[targetIdx].isDone.commentData && TARGETS[targetIdx].isDone.updateData && isVirgin) {
			const updatedPOOL = {
				...POOL,
				numberOfScraped: POOL.numberOfScraped +1
			}
			TOTAL_POOL.splice(POOL_INDEX, 1, updatedPOOL);
			await writeFile('./categoryPool', TOTAL_POOL)
		}

		targetIdx++;
	}
}

async function isTargetReady() {
	//	파일이 존재하는지 체크
	try {
		fs.readFileSync(`../SCRAPED_RAW_DATA/${POOL.subCategory}/targets.js`);
		console.log('타겟을 찾았습니다.')
		console.log(`../SCRAPED_RAW_DATA/${POOL.subCategory}/targets.js`)
	}
	catch(err) {
		console.log(chalk.yellow('타겟을 찾을 수 없습니다.'))
		console.log(`../SCRAPED_RAW_DATA/${POOL.subCategory}/targets.js`)
		return false;
	}
	return true;
}

async function isFileBeing(path) {
	try {
		fs.readFileSync(path);
		console.log('파일을 찾았습니다.')
		console.log(path)
	}
	catch(err) {
		console.log('파일을 찾을 수 없습니다.')
		console.log(path)
		return false;
	}
	return true;
}

async function isDirBeing(path) {
	try {
		fs.readdirSync(path)
		console.log('디렉토리를 찾았습니다.')
		console.log(path)
	}
	catch(err) {
		console.log('디렉토리를 찾을 수 없습니다.')
		console.log(path)
		return false;
	}
	return true;
}

async function makeDir(path) {
	try {
		fs.mkdirSync(path);
		console.log('디렉토리를 생성했습니다.')
		console.log(path)
	}
	catch(err) {
		console.log('디렉토리를 만들 수 없습니다.')
		console.log(path)
		return false;
	}
	return true;
}

async function writeFile(path, contentObject) {
	try {
		fs.writeFileSync(path, `exports.data = ${JSON.stringify(contentObject)}`);
		console.log('파일을 생성/업데이트 했습니다.')
		console.log(path)
	}
	catch(err) {
		console.log('파일을 생성/업데이트 할 수 없습니다.')
		console.log(path)
		return false;
	}
	return true;
}

module.exports = {crawlSubcategory};

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
	// TESTING CODE
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//const util = require('util');
//
//(
//	async () => {
//
//		const sub_category_id = 287;
//
//		await crawlSubcategory(sub_category_id);
//
//	}
//)()

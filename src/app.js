const readline = require('readline');
const rl = readline.createInterface({input: process.stdin, output: process.stdout});
const fs = require('fs');
const {categoryPool} = require('./categoryPool');
const {getNumberOfProjectByCategory} = require('./getNumberOfProjectByCategory');	//	STAGE 1
const {getTargets} = require('./getTargets');	//	STAGE 2
const {getPage} = require('./getPage');		//	STAGE 3
const {getUpdates} = require('./getUpdates');		//	STAGE 3
const {getComments} = require('./getComments');		//	STAGE 3

const dirName = '/home/sy/kickstarter';
const now = new Date().toLocaleString().replace(/\//g, '_');
const waitRandom = (randomDelay) => new Promise((resolve) => setTimeout(resolve, randomDelay))	//	setTimeout() 함수가 강제로 프로미스를 반환하도록 만들어준다. 원래는 await 못씀.

const runApp = () => {
	rl.question('카테고리 아이디를 입력 해 주세요: ', async userAnswer => {

		//	categoryPool.js 파일 오류 체크
		if(categoryPool?.length < 1){
			console.log('categoryPool.js 파일에 오류가 있습니다. 확인 해 주세요.')
			rl.close();
			return
		}

		let isFound = false;
		for(let z=0; z<categoryPool.length; z++){
			if(userAnswer === categoryPool[z].categoryId){
				isFound = true;
				const consoleMsg = categoryPool[z].numberOfProject === 0 
					? '이 카테고리는 모아진 자료가 없습니다. 지금 시작합니다...'
					: `이 카테고리는 총 ${categoryPool[z].numberOfProject}개 중 ${categoryPool[z].numberOfScraped}개 진행되었습니다. 이어서 진행합니다...(${Math.floor(categoryPool[z].numberOfScraped/categoryPool[z].numberOfProject)}%)`
				console.log(`\n메인 카테고리: ${categoryPool[z].mainCategory}\n서브 카테고리: ${categoryPool[z].subCategory}\n\n${consoleMsg}\n\n`)

				//////////////////////////////////////////////////////////////////////////////////////////////////////
				//
				//	STAGE 1 : optional
				//
				//	카테고리의 총 프로젝트 개수를 모른다면, 개수를 세고 파일을 수정한다.
				//	getNumberOfProjectByCategory()
				//
				//////////////////////////////////////////////////////////////////////////////////////////////////////
				try{
					if(categoryPool[z].numberOfProject === 0){
						console.log('STAGE 1 start...\n')
						console.time('STAGE 1 time taken')
						const numberOfProject = await getNumberOfProjectByCategory(userAnswer);
						categoryPool.splice(z, 1, {
							...categoryPool[z],
							numberOfProject: numberOfProject,
							createdAt: now
						})
						fs.writeFileSync(`./categoryPool.js`, `exports.categoryPool = ${JSON.stringify(categoryPool)}`);
						console.log(`\n${categoryPool[z].subCategory}.js 파일을 수정했습니다! :>`);
						console.timeEnd('STAGE 2 time taken')
					}
				}catch(err){
					console.log(err)
					console.log('\n\nHint : 소스코드에서 [STAGE 1]을/를 검색하세요.')
					rl.close()
					return
				}

				let targetPool = [];
				try{
					targetPool = require(`./targets/${categoryPool[z].subCategory}`).targets
				}catch(err){
				}

				//////////////////////////////////////////////////////////////////////////////////////////////////////
				//
				//	STAGE 2 : optional
				//
				//	해당 카테고리의 총 프로젝트 개수와 targetPool의 총 수량이 다르다면, target부터 작성한다.
				//	getTargets()
				//
				//////////////////////////////////////////////////////////////////////////////////////////////////////
				try{
					if(categoryPool[z].numberOfProject !== targetPool.length){
						if(targetPool.length === 0){
							console.log('STAGE 2 start...\n')
							console.time('STAGE 2 time taken')
							const totalPage = Math.floor(categoryPool[z].numberOfProject / 12) + 1;
							const startingSeed = '233'+Math.floor(Math.random()*10)+Math.floor(Math.random()*10)+Math.floor(Math.random()*10); // not sure this cause problem..

							let targetArray = [];
							const failPageNumber = [];
							//	1단계 : 첫 페이지부터 차례로 찾는다.
							for(let pageNumber=1; pageNumber<=totalPage; pageNumber++){
								let advantage = 0;
								try{
									targetArray = [...targetArray, ... await getTargets(userAnswer, startingSeed, pageNumber)]
								}catch(err){
									advantage = 300;	//	5 minutes
									failPageNumber.push(pageNumber);
								}
								const randomDelay = Math.floor(Math.random()*10) + 30 + advantage
								await waitRandom(randomDelay * 1000)
							}
							//	2단계 : 오류나서 못찾은 페이지 15분 기다렸다 다시 시도 해 본다.
							if(failPageNumber.length > 0){
								await waitRandom(15 * 60 * 1000)	//	15 minutes
								const originalFailedLength = failPageNumber.length;
								for(let i=1; i<=originalFailedLength; i++){
									let advantage = 0;
									try{
										targetArray = [...targetArray, ... await getTargets(userAnswer, startingSeed, failPageNumber[i])]
										failPageNumber.splice(i, 1)
									}catch(err){
										advantage = 300;	//	5 minutes
									}
									const randomDelay = Math.floor(Math.random()*10) + 30 + advantage
									await waitRandom(randomDelay * 1000)
								}
							}
							fs.writeFileSync(`./targets/${categoryPool[z].subCategory}.js`, `exports.targets = ${JSON.stringify(targetArray)}`)
							fs.writeFileSync(`./targets/${categoryPool[z].subCategory}_fail_page_number.js`, `exports.fail = ${JSON.stringify(failPageNumber)}`)
							console.log(`\n${categoryPool[z].subCategory}.js 파일을 완성했습니다! :> (${targetArray.length}/${categoryPool[z].numberOfProject})`);
							console.timeEnd('STAGE 2 time taken')
						}else{
							//	굳이 미리 만들진 않지만, 
							//	만들게 된다면 fail_page_number 파일을 참조해서 마저 찾아줘라..
							console.log(`\ntarget이 완전히 확보되지 않았습니다. /targets/${categoryPool[z].subCategory}_fail_page_number.js.파일을 확인하세요.\n\n프로그램을 종료합니다.`)
							console.log('from STAGE 2')
							rl.close()
							return
						}
					}
				}catch(err){
					console.log(err)
					console.log(`\n\n${categoryPool[z].subCategory}.js 파일을 완성하지 못했습니다. :<\nHint : 소스코드에서 [STAGE 2]을/를 검색하세요.`)
					rl.close()
					return
				}

				//////////////////////////////////////////////////////////////////////////////////////////////////////
				//
				//	STAGE 3 : 
				//
				//	여기 도달했다는 것은 조사된 targetPool 수량과 numberOfProject By Category 수가 일치한다는 뜻.
				//	targetPool을 순회하면서 아직 조사되지 않은 놈들을 크로링 해 준다.
				//
				//////////////////////////////////////////////////////////////////////////////////////////////////////
				console.log('STAGE 3 start...\n')
				console.time('STAGE 3 total time taken')
				targetPool = require(`./targets/${categoryPool[z].subCategory}`).targets	//	STAGE 2에서 업데이트 됐을 가능성 있음.
				//	유저가 선택한 (sub)category의 폴더가 ./log/ 내부에 존재하지 않는다면 새롭게 만든다.
				try{
					fs.readdirSync(`../log/${categoryPool[z].subCategory}`);
				}catch(err){
					fs.mkdirSync(`../log/${categoryPool[z].subCategory}`);
					console.log(`[${categoryPool[z].subCategory}] 폴더가 만들어졌습니다.`);
				}

				let i;
				for(i=0; i<targetPool.length; i++){
					console.time(`${i}번째 target time taken`)
					//	유저가 선택한 (sub)category의 폴더 내부에 해당 순번(0 ~ numberOfProjectByCategory)을 이름으로 갖는 폴더가 존재하지 않는다면 새롭게 만든다.
					try{
						fs.readdirSync(`../log/${categoryPool[z].subCategory}/${i}`);
					}catch(err){
						fs.mkdirSync(`../log/${categoryPool[z].subCategory}/${i}`);
						console.log(`\n\n[${categoryPool[z].subCategory}/${i}] 폴더가 만들어졌습니다.`);
					}
					
					let wasTargetVirgin = false;		//	이번 실행에 크롤링 작업이 이루어진 타겟에 한하여 categoryPool.js의 numberOfScraped를 올려주기 위한 변수

					let commentableId;
					let projectSlug;
					switch(targetPool[i].state){
						case 'live':
							console.log(`[${i}]번째 target을 시작합니다. state : [${targetPool[i].state}]`)
							if(targetPool[i].foundPage === undefined){
								console.log('getPage함수가 실행됩니다...')
								wasTargetVirgin = true;
								try{
									const result = await getPage.liveOrFailOrCancel(targetPool[i].url);
									commentableId = result.commentable_id;
									projectSlug = result.slug.split('/')[1];
									targetPool.splice(i, 1, {
										...targetPool[i],
										foundPage: true
									})
									fs.writeFileSync(`../log/${categoryPool[z].subCategory}/${i}/pageData.js`, `exports.data = ${JSON.stringify(result)}`);
									console.log(`getPage함수 실행 완료. ${i}번째 target의 .../pageData.js 파일이 생성되었습니다.`)
								}catch(err){
									console.log(`getPage함수 실행이 실패했습니다.\n\nfrom\ncategoryNumber: ${userAnswer}\ncategoryName: ${categoryPool[z].subCategory}\n${i}번째 target\n`)
								}
								await waitRandom(Math.floor(Math.random()*10) + 20 * 1000)
							}else if(targetPool[i].foundPage){	//	pageData만 완성되고 commentsData는 크롤링 해야 할 때에도 commentableId는 구해줘야한다.
								const {data} = require(`../log/${categoryPool[z].subCategory}/${i}/pageData`)
								commentableId = data.commentable_id;
								projectSlug = data.slug.split('/')[1];
							}
							if(commentableId === undefined || projectSlug === undefined){
								console.log('getComments, getUpdates의 query에 필요한 variables를 생성할 수 없습니다.')
								console.log('commentableId: ', commentableId, 'projectSlug: ', projectSlug)
								break;	//	크롤링 세팅이 잘못돼서 undefined로 남을 수 있다. 그러면 아래 getComments나 getUpdates는 실행 할 필요도 없다
							}

							if(targetPool[i].foundUpdates === undefined){
								console.log('getUpdates함수가 실행됩니다...')
								wasTargetVirgin = true;
								try{
									const result = await getUpdates(targetPool[i].url, projectSlug);
									targetPool.splice(i, 1, {
										...targetPool[i],
										foundUpdates: true
									})
									fs.writeFileSync(`../log/${categoryPool[z].subCategory}/${i}/updatesData.js`, `exports.data = ${JSON.stringify(result)}`);
									console.log(`getUpdates함수 실행 완료. ${i}번째 target의 .../updatesData.js 파일이 생성되었습니다.`)
								}catch(err){
									console.log(`getUpdates함수 실행이 실패했습니다.\n\nfrom\ncategoryNumber: ${userAnswer}\ncategoryName: ${categoryPool[z].subCategory}\n${i}번째 target\n`)
								}
								await waitRandom(Math.floor(Math.random()*10) + 25 * 1000)
							}

							if(targetPool[i].foundComments === undefined){
								console.log('getComments함수가 실행됩니다...')
								wasTargetVirgin = true;
								try{
									const result = await getComments(targetPool[i].url, commentableId);
									targetPool.splice(i, 1, {
										...targetPool[i],
										foundComments: true
									})
									fs.writeFileSync(`../log/${categoryPool[z].subCategory}/${i}/commentsData.js`, `exports.data = ${JSON.stringify(result)}`);
									console.log(`getComments함수 실행 완료. ${i}번째 target의 .../commentsData.js 파일이 생성되었습니다.`)
								}catch(err){
									console.log(`getComments함수 실행이 실패했습니다.\n\nfrom\ncategoryNumber: ${userAnswer}\ncategoryName: ${categoryPool[z].subCategory}\n${i}번째 target\n`)
								}
								await waitRandom(Math.floor(Math.random()*10) + 35 * 1000)
							}
							break;
						case 'submitted':
							console.log(`[${i}]번째 target을 시작합니다. state : [${targetPool[i].state}]`)
							if(targetPool[i].foundPage === undefined){
								console.log('getPage함수가 실행됩니다...')
								wasTargetVirgin = true;
								try{
									const result = await getPage.submitted(targetPool[i].url);
									targetPool.splice(i, 1, {
										...targetPool[i],
										foundPage: true
									})
									fs.writeFileSync(`../log/${categoryPool[z].subCategory}/${i}/pageData.js`, `exports.data = ${JSON.stringify(result)}`);
									console.log(`getPage함수 실행 완료. ${i}번째 target의 .../pageData.js 파일이 생성되었습니다.`)
								}catch(err){
									console.log(`getPage함수 실행이 실패했습니다.\n\nfrom\ncategoryNumber: ${userAnswer}\ncategoryName: ${categoryPool[z].subCategory}\n${i}번째 target\n`)
								}
								await waitRandom(Math.floor(Math.random()*10) + 20 * 1000)
							}
							break;
						case 'successful':
							console.log(`[${i}]번째 target을 시작합니다. state : [${targetPool[i].state}]`)
							if(targetPool[i].foundPage === undefined){
								console.log('getPage함수가 실행됩니다...')
								wasTargetVirgin = true;
								try{
									const result = await getPage.successful(targetPool[i].url);
									commentableId = result.commentable_id;
									projectSlug = result.slug.split('/')[1];
									targetPool.splice(i, 1, {
										...targetPool[i],
										foundPage: true
									})
									fs.writeFileSync(`../log/${categoryPool[z].subCategory}/${i}/pageData.js`, `exports.data = ${JSON.stringify(result)}`);
									console.log(`getPage함수 실행 완료. ${i}번째 target의 .../pageData.js 파일이 생성되었습니다.`)
								}catch(err){
									console.log(`getPage함수 실행이 실패했습니다.\nfrom\ncategoryNumber: ${userAnswer}\ncategoryName: ${categoryPool[z].subCategory}\n${i}번째 target\n`)
								}
								await waitRandom(Math.floor(Math.random()*10) + 20 * 1000)
							}else if(targetPool[i].foundPage){	//	pageData만 완성되고 commentsData는 크롤링 해야 할 때에도 commentableId는 구해줘야한다.
								const {data} = require(`../log/${categoryPool[z].subCategory}/${i}/pageData`)
								commentableId = data.commentable_id;
								projectSlug = data.slug.split('/')[1];
							}
							if(commentableId === undefined || projectSlug === undefined){
								console.log('getComments, getUpdates의 query에 필요한 variables를 생성할 수 없습니다.')
								console.log('commentableId: ', commentableId, 'projectSlug: ', projectSlug)
								break;	//	크롤링 세팅이 잘못돼서 undefined로 남을 수 있다. 그러면 아래 getComments나 getUpdates는 실행 할 필요도 없다
							}

							if(targetPool[i].foundUpdates === undefined){
								console.log('getUpdates함수가 실행됩니다...')
								wasTargetVirgin = true;
								try{
									const result = await getUpdates(targetPool[i].url, projectSlug);
									targetPool.splice(i, 1, {
										...targetPool[i],
										foundUpdates: true
									})
									fs.writeFileSync(`../log/${categoryPool[z].subCategory}/${i}/updatesData.js`, `exports.data = ${JSON.stringify(result)}`);
									console.log(`getUpdates함수 실행 완료. ${i}번째 target의 .../updatesData.js 파일이 생성되었습니다.`)
								}catch(err){
									console.log(`getUpdates함수 실행이 실패했습니다.\n\nfrom\ncategoryNumber: ${userAnswer}\ncategoryName: ${categoryPool[z].subCategory}\n${i}번째 target\n`)
								}
								await waitRandom(Math.floor(Math.random()*10) + 25 * 1000)
							}

							if(targetPool[i].foundComments === undefined){
								console.log('getComments함수가 실행됩니다...')
								wasTargetVirgin = true;
								try{
									const result = await getComments(targetPool[i].url, commentableId);
									targetPool.splice(i, 1, {
										...targetPool[i],
										foundComments: true
									})
									fs.writeFileSync(`../log/${categoryPool[z].subCategory}/${i}/commentsData.js`, `exports.data = ${JSON.stringify(result)}`);
									console.log(`getComments함수 실행 완료. ${i}번째 target의 .../commentsData.js 파일이 생성되었습니다.`)
								}catch(err){
									console.log(`getComments함수 실행이 실패했습니다.\n\nfrom\ncategoryNumber: ${userAnswer}\ncategoryName: ${categoryPool[z].subCategory}\n${i}번째 target\n`)
								}
								await waitRandom(Math.floor(Math.random()*10) + 35 * 1000)
							}
							break;
						case 'failed':
							console.log(`[${i}]번째 target을 시작합니다. state : [${targetPool[i].state}]`)
							if(targetPool[i].foundPage === undefined){
								console.log('getPage함수가 실행됩니다...')
								wasTargetVirgin = true;
								try{
									const result = await getPage.liveOrFailOrCancel(targetPool[i].url);
									commentableId = result.commentable_id;
									projectSlug = result.slug.split('/')[1];
									targetPool.splice(i, 1, {
										...targetPool[i],
										foundPage: true
									})
									fs.writeFileSync(`../log/${categoryPool[z].subCategory}/${i}/pageData.js`, `exports.data = ${JSON.stringify(result)}`);
									console.log(`getPage함수 실행 완료. ${i}번째 target의 .../pageData.js 파일이 생성되었습니다.`)
								}catch(err){
									console.log(`getPage함수 실행이 실패했습니다.\n\nfrom\ncategoryNumber: ${userAnswer}\ncategoryName: ${categoryPool[z].subCategory}\n${i}번째 target\n`)
								}
								await waitRandom(Math.floor(Math.random()*10) + 20 * 1000)
							}else if(targetPool[i].foundPage){	//	pageData만 완성되고 commentsData는 크롤링 해야 할 때에도 commentableId는 구해줘야한다.
								const {data} = require(`../log/${categoryPool[z].subCategory}/${i}/pageData`)
								commentableId = data.commentable_id;
								projectSlug = data.slug.split('/')[1];
							}
							if(commentableId === undefined || projectSlug === undefined){
								console.log('getComments, getUpdates의 query에 필요한 variables를 생성할 수 없습니다.')
								console.log('commentableId: ', commentableId, 'projectSlug: ', projectSlug)
								break;	//	크롤링 세팅이 잘못돼서 undefined로 남을 수 있다. 그러면 아래 getComments나 getUpdates는 실행 할 필요도 없다
							}

							if(targetPool[i].foundUpdates === undefined){
								console.log('getUpdates함수가 실행됩니다...')
								wasTargetVirgin = true;
								try{
									const result = await getUpdates(targetPool[i].url, projectSlug);
									targetPool.splice(i, 1, {
										...targetPool[i],
										foundUpdates: true
									})
									fs.writeFileSync(`../log/${categoryPool[z].subCategory}/${i}/updatesData.js`, `exports.data = ${JSON.stringify(result)}`);
									console.log(`getUpdates함수 실행 완료. ${i}번째 target의 .../updatesData.js 파일이 생성되었습니다.`)
								}catch(err){
									console.log(`getUpdates함수 실행이 실패했습니다.\n\nfrom\ncategoryNumber: ${userAnswer}\ncategoryName: ${categoryPool[z].subCategory}\n${i}번째 target\n`)
								}
								await waitRandom(Math.floor(Math.random()*10) + 25 * 1000)
							}

							if(targetPool[i].foundComments === undefined){
								console.log('getComments함수가 실행됩니다...')
								wasTargetVirgin = true;
								try{
									const result = await getComments(targetPool[i].url, commentableId);
									targetPool.splice(i, 1, {
										...targetPool[i],
										foundComments: true
									})
									fs.writeFileSync(`../log/${categoryPool[z].subCategory}/${i}/commentsData.js`, `exports.data = ${JSON.stringify(result)}`);
									console.log(`getComments함수 실행 완료. ${i}번째 target의 .../commentsData.js 파일이 생성되었습니다.`)
								}catch(err){
									console.log(`getComments함수 실행이 실패했습니다.\n\nfrom\ncategoryNumber: ${userAnswer}\ncategoryName: ${categoryPool[z].subCategory}\n${i}번째 target\n`)
								}
								await waitRandom(Math.floor(Math.random()*10) + 35 * 1000)
							}
							break;
						case 'canceled':
							console.log(`[${i}]번째 target을 시작합니다. state : [${targetPool[i].state}]`)
							if(targetPool[i].foundPage === undefined){
								console.log('getPage함수가 실행됩니다...')
								wasTargetVirgin = true;
								try{
									const result = await getPage.liveOrFailOrCancel(targetPool[i].url);
									commentableId = result.commentable_id;
									projectSlug = result.slug.split('/')[1];
									targetPool.splice(i, 1, {
										...targetPool[i],
										foundPage: true
									})
									fs.writeFileSync(`../log/${categoryPool[z].subCategory}/${i}/pageData.js`, `exports.data = ${JSON.stringify(result)}`);
									console.log(`getPage함수 실행 완료. ${i}번째 target의 .../pageData.js 파일이 생성되었습니다.`)
								}catch(err){
									console.log(`getPage함수 실행이 실패했습니다.\n\nfrom\ncategoryNumber: ${userAnswer}\ncategoryName: ${categoryPool[z].subCategory}\n${i}번째 target\n`)
								}
								await waitRandom(Math.floor(Math.random()*10) + 20 * 1000)
							}else if(targetPool[i].foundPage){	//	pageData만 완성되고 commentsData는 크롤링 해야 할 때에도 commentableId는 구해줘야한다.
								const {data} = require(`../log/${categoryPool[z].subCategory}/${i}/pageData`)
								commentableId = data.commentable_id;
								projectSlug = data.slug.split('/')[1];
							}
							if(commentableId === undefined || projectSlug === undefined){
								console.log('getComments, getUpdates의 query에 필요한 variables를 생성할 수 없습니다.')
								console.log('commentableId: ', commentableId, 'projectSlug: ', projectSlug)
								break;	//	크롤링 세팅이 잘못돼서 undefined로 남을 수 있다. 그러면 아래 getComments나 getUpdates는 실행 할 필요도 없다
							}

							if(targetPool[i].foundUpdates === undefined){
								console.log('getUpdates함수가 실행됩니다...')
								wasTargetVirgin = true;
								try{
									const result = await getUpdates(targetPool[i].url, projectSlug);
									targetPool.splice(i, 1, {
										...targetPool[i],
										foundUpdates: true
									})
									fs.writeFileSync(`../log/${categoryPool[z].subCategory}/${i}/updatesData.js`, `exports.data = ${JSON.stringify(result)}`);
									console.log(`getUpdates함수 실행 완료. ${i}번째 target의 .../updatesData.js 파일이 생성되었습니다.`)
								}catch(err){
									console.log(`getUpdates함수 실행이 실패했습니다.\n\nfrom\ncategoryNumber: ${userAnswer}\ncategoryName: ${categoryPool[z].subCategory}\n${i}번째 target\n`)
								}
								await waitRandom(Math.floor(Math.random()*10) + 25 * 1000)
							}

							if(targetPool[i].foundComments === undefined){
								console.log('getComments함수가 실행됩니다...')
								wasTargetVirgin = true;
								try{
									const result = await getComments(targetPool[i].url, commentableId);
									targetPool.splice(i, 1, {
										...targetPool[i],
										foundComments: true
									})
									fs.writeFileSync(`../log/${categoryPool[z].subCategory}/${i}/commentsData.js`, `exports.data = ${JSON.stringify(result)}`);
									console.log(`getComments함수 실행 완료. ${i}번째 target의 .../commentsData.js 파일이 생성되었습니다.`)
								}catch(err){
									console.log(`getComments함수 실행이 실패했습니다.\n\nfrom\ncategoryNumber: ${userAnswer}\ncategoryName: ${categoryPool[z].subCategory}\n${i}번째 target\n`)
								}
								await waitRandom(Math.floor(Math.random()*10) + 35 * 1000)
							}
							break;
						default:
							console.log(`${i}번째 target의 state값이 잘못되었습니다. : ${targetPool[i].state}`)
							rl.close()
							return
					}

					fs.writeFileSync(`./targets/${categoryPool[z].subCategory}.js`, `exports.targets = ${JSON.stringify(targetPool)}`)		//	데이터 수집이 완료된 타겟들은 targets폴더의 파일에 반영 해 준다
					if(targetPool[i].state !== 'submitted'){
						if(targetPool[i].foundPage && targetPool[i].foundUpdates && targetPool[i].foundComments && wasTargetVirgin){			//	page, update, comment 세가지 모두 완료시 categoryPool.js 파일도 업데이트(numberOfScraped +1) 해 준다.
							categoryPool.splice(z, 1, {
								...categoryPool[z],
								numberOfScraped: categoryPool[z].numberOfScraped+1
							})
							fs.writeFileSync(`./categoryPool.js`, `exports.categoryPool = ${JSON.stringify(categoryPool)}`)
							console.log(`/categoryPool파일이 업데이트 되었습니다.`)
						}
					}else{
						if(targetPool[i].foundPage && wasTargetVirgin){			//	page, update, comment 세가지 모두 완료시 categoryPool.js 파일도 업데이트 해 준다.
							categoryPool.splice(z, 1, {
								...categoryPool[z],
								numberOfScraped: categoryPool[z].numberOfScraped+1
							})
							fs.writeFileSync(`./categoryPool.js`, `exports.categoryPool = ${JSON.stringify(categoryPool)}`)
							console.log(`/categoryPool파일이 업데이트 되었습니다.`)
						}
					}
					console.timeEnd(`${i}번째 target time taken`)
					console.log()
				}
				console.timeEnd('STAGE 3 total time taken')
				console.log(`\n${i-1}번째 target까지 스크랩을 완료하였습니다. 프로그램을 종료합니다...\n\n`)
				//		유저가 입력한 categoryId를 categoryPool에서 조회하고, 조회된 경우 마지막 단계까지(STAGE 1~3) 스크랩 완료한 시점. 그러니까 프로그램 종료다.
				rl.close();
				return
			}
		}

		if(!isFound){	//	유저가 입력한 categoryId를 categoryPool.js에서 찾을 수 없을 때.
			console.log(`\n없는 카테고리 아이디 입니다. 카테고리 아이디는 [.../src/categoryPool.js]에서 확인하세요.\n프로그램 종료는 [Ctrl + c]\n`);
			runApp();
		}
	});
}

runApp();

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const userAgent = require('user-agents');
const {globalVariable} = require('./public/global');
const {waitTime} = require('./util/my-util');
const {solveCaptchar} = require('./util/solve-captcha');

const getComments = async (motherUrl, commentableId, givenEndCursor) => {
	const browser = await puppeteer.launch(globalVariable.browserOptions)

	const page = await browser.newPage()
	await page.setUserAgent(userAgent.random().toString());
	await page.setRequestInterception(true)
	await page.authenticate({ username: globalVariable.proxyInfo.name, password: globalVariable.proxyInfo.pw });

	let isHitLast = false;
	let isFirstRequest = false;
	let endCursor = givenEndCursor;

	await page.on('request', async request => {
		if(request.url().includes('https://api.icy-lake.kickstarter.com/v1/t')) {
			console.log('catch dispatcher.ts');
			//console.log(request.headers())
			request.respond({
				status: 200,
				contentType: 'text/plain',
				headers: request.headers(),
				body: JSON.stringify({success: true}),
			})
			//request.continue();
		}
		else if(request.url().includes('/graph') && request.method() === 'POST'){
			if(!isFirstRequest) {
				await request.abort();
			} else {
	//			console.log('request', endCursor)
				isFirstRequest = false;
				const xcsrfToken = await request.headers()["x-csrf-token"];

				await request.continue({
					headers: {
						...request.headers(),
						"x-csrf-token": xcsrfToken,
						'User-Agent': userAgent.random().toString()
					},
					method: 'POST',
					postData: JSON.stringify({
						"query": `
							query ($commentableId: ID!, $nextCursor: String, $previousCursor: String, $replyCursor: String, $first: Int, $last: Int) {
							  commentable: node(id: $commentableId) {
								id
								... on Project {
								  url
								}
								... on Commentable {
								  commentsCount
								  comments(first: $first, last: $last, after: $nextCursor, before: $previousCursor) {
									edges {
									  node {
										...CommentInfo
										...CommentReplies
									  }
									}
									pageInfo {
									  startCursor
									  hasNextPage
									  hasPreviousPage
									  endCursor
									}
								  }
								}
							  }
							}

							fragment CommentInfo on Comment {
							  id
							  body
							  createdAt
							  parentId
							  author {
								id
								imageUrl(width: 200)
								name
								url
								__typename
							  }
							  removedPerGuidelines
							  authorBadges
							  canReport
							  canDelete
							  canPin
							  hasFlaggings
							  deletedAuthor
							  deleted
							  sustained
							  pinnedAt
							  authorCanceledPledge
							  authorBacking {
								backingUrl
								id
								__typename
							  }
							  __typename
							}

							fragment CommentReplies on Comment {
							  replies(last: 25, before: $replyCursor) {
								totalCount
								nodes {
								  ...CommentInfo
								}
							  }
							}
						`,
						"variables": {
							"commentableId": commentableId,
							"nextCursor": endCursor === undefined ? null : endCursor,
							"previousCursor": null,
							"replyCursor": null,
							"first": 25,
							"last": null
						}
					}),
				})
			}
		}else{
			await request.continue()
		}
	})

	let results = [];
	await page.on('response', async response => {
		// Ignore OPTIONS requests
		if(response.request().method() !== 'POST') return
		if(response.url().includes('/graph')) {
			let data;
			try{
				data = await response.json()
			}catch(err){}

			if(data?.data?.commentable?.comments !== undefined) {
				//console.log('res before Cursor', endCursor)
				endCursor = data.data.commentable.comments.pageInfo.endCursor;
				if(!data.data.commentable.comments.pageInfo.hasNextPage) isHitLast = true;
				//console.log('res next Cursor', endCursor)
				try{
					results.push(data.data);
				}catch(err){
					console.error(err);
				}
			}
		}
	})

	try {
		await page.goto(motherUrl, {waitUntil: 'networkidle0'})
		await solveCaptchar(page);
		await page.waitForTimeout(globalVariable.randomTime.fifteenSec);

		await page.click('#projects > div.load_more.mt3 > a');
		await page.waitForNavigation({waitUntil: 'networkidle0'});
		try {
			await page.$eval('#projects_list > div:nth-child(3)', ele => {})
		} catch(err) {
			await page.reload({ waitUntil: 'networkidle0', });
		}
		await solveCaptchar(page);

		//	스크롤을 한번 내릴 때부터 시작하고, 한번 내릴 때마다 한번의  graph POST 요청을 가로채 활용한다.
		const autoScroll = async () => {
			isFirstRequest = true;
			//console.log('scrolling')
			let scrollHeight = await page.evaluate(() => {
				return document.body.scrollHeight;
			})
			await page.mouse.wheel({deltaY: scrollHeight})
			await page.waitForNavigation({waitUntil: 'networkidle0'})
			await page.waitForTimeout(globalVariable.randomTime.fifteenSec)		//	waitForNavigation만으로 충분히 기다리지 않아서 대응(req와 res가 순서를 보장하지 않고 비동기적으로 진행된다.)
		}

		//const roll = new Array(Math.ceil(totalCommentLength /25) +10);
		const roll = new Array(200);	// isHitLast will save my ass

		let deadRollCheck = 0;
		const executeAutoScroll = async () => {
			for(const _ of roll) {
				if(!isHitLast) {
					await page.waitForTimeout(globalVariable.randomTime.fifteenSec)
					await autoScroll();

					deadRollCheck++;
					try {
						await page.$eval(`#projects_list > div:nth-child(${deadRollCheck +3})`, ele => {})
					} catch(err) {
						throw new Error('스크롤에 반응하지 않습니다. 이번 시도를 마칩니다.')
					}
				}
			}
		}
		await executeAutoScroll();

		await browser.close()

		//	25개 댓글을 담은 객체의 배열
		return results
	}
	catch(err) {
		console.log('getComments함수 실행이 실패했습니다.')
		console.log()
		console.error(err)
	}
	finally {
		browser.close();	// 상기 과정에 에러가 발생해도 브라우저는 반드시 종료되도록 한다.
		return results
	}
}

module.exports = {getComments};


////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
	// TESTING CODE
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//const util = require('util');
//const motherUrl = globalVariable.motherUrls[Math.floor(Math.random() * globalVariable.motherUrls.length)];
//
//(
//	async () => {
//	//	const url = 'https://www.kickstarter.com/discover/advanced?category_id=6&woe_id=0&sort=magic&seed=2780996&page=1';
//		const url = motherUrl;
//		const commentableId = 'UHJvamVjdC02MDQxMDkyMTA=';	//	many roll
//		const commentableId2 = 'UHJvamVjdC0xNzk0Nzg0MjE5';	//	count number less than 25 (1 roll)
//
//		const result = await getComments(url, commentableId, 'WyItMSIsIjIwMjAtMTItMjdUMDc6MTE6MzUuMDAwWiIsMzEwNTYzNTVd');
//
//		console.log('final return: ', result.length, util.inspect(result, {depth: null}));
//	}
//)()

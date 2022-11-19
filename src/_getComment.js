const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const userAgent = require('user-agents');
const {globalVariable} = require('./public/global');
const {waitTime} = require('./util/my-util')

const getComments = async (motherUrl, commentableId) => {
	const browser = await puppeteer.launch(globalVariable.browserOptions)

	const page = await browser.newPage()
	await page.setUserAgent(userAgent.random().toString());
	await page.setRequestInterception(true)

	let isHitLast = false;
	let isFirstRequest = false;
	let endCursor;

	await page.on('request', async request => {
		if(request.url().includes('/graph') && request.method() === 'POST'){
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
							  author {
								id
								imageUrl(width: 200)
								name
								url
							  }
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

			if(data?.data?.commentable?.comments !== undefined){
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
		await page.waitForTimeout(globalVariable.randomTime.halfMin)

		await page.click('#projects > div.load_more.mt3 > a');
		await page.waitForNavigation({waitUntil: 'networkidle0'});

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

		const executeAutoScroll = async () => {
			for(const _ of roll) {
				if(!isHitLast) {
					await page.waitForTimeout(globalVariable.randomTime.halfMin)
					await autoScroll(roll.length);
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
//
//(
//	async () => {
//	//	const url = 'https://www.kickstarter.com/discover/advanced?category_id=6&woe_id=0&sort=magic&seed=2780996&page=1';
//		const url = 'https://www.kickstarter.com/discover/advanced?category_id=22&woe_id=0&sort=magic&ref=category&seed=2781111&page=1'
//		const commentableId = 'UHJvamVjdC0xNzY4MDA2Nzgy';
//
//		const result = await getComments(url, commentableId, 168);
//
//		console.log('final return: ', result.length, util.inspect(result, {depth: null}));
//		
//	}
//)()

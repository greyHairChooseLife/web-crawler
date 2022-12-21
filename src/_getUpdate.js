const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const userAgent = require('user-agents');
const {globalVariable} = require('./public/global');
const {waitTime} = require('./util/my-util')
const {solveCaptchar} = require('./util/solve-captcha')

const getUpdates = async (motherUrl, projectSlug) => {
	const browser = await puppeteer.launch(globalVariable.browserOptions)

	const page = await browser.newPage()
	await page.setUserAgent(userAgent.random().toString());
	await page.setRequestInterception(true)
	await page.authenticate({ username: globalVariable.proxyInfo.name, password: globalVariable.proxyInfo.pw });

	let isHitLast = false;
	let isFirstRequest = false;
	let endCursor;

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
				//console.log('request', endCursor)
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
							query PostsFeed($projectSlug: String!, $cursor: String) {
							  project(slug: $projectSlug) {
								id
								slug
								state
								timeline(first: 20, after: $cursor) {
								  totalCount
								  pageInfo {
									hasNextPage
									endCursor
									__typename
								  }
								  edges {
									node {
									  type
									  timestamp
									  data {
										... on Project {
										  goal {
											currency
											amount
											__typename
										  }
										  pledged {
											currency
											amount
											__typename
										  }
										  backersCount
										  __typename
										}
										... on Postable {
										  id
										  type
										  title
										  publishedAt
										  pinnedAt
										  number
										  actions {
											read
											pin
											__typename
										  }
										  author {
											name
											imageUrl(width: 120)
											__typename
										  }
										  authorRole
										  isPublic
										  likesCount
										  ... on CreatorInterview {
											commentsCount(withReplies: true)
											answers {
											  nodes {
												id
												body
												question {
												  id
												  body
												  __typename
												}
												__typename
											  }
											  __typename
											}
											__typename
										  }
										  ... on FreeformPost {
											commentsCount(withReplies: true)
											body
											nativeImages {
											  id
											  url
											  __typename
											}
											__typename
										  }
										  __typename
										}
										__typename
									  }
									  __typename
									}
									__typename
								  }
								  __typename
								}
								__typename
							  }
							}
						`,
						"variables": {
							"projectSlug": projectSlug,
							"cursor": endCursor === undefined ? null : endCursor,
						}
					}),
				})
			}
		} 
		else if(request.resourceType() === 'stylesheet' || request.resourceType() === 'image' || request.resourceType() === 'font') {
			request.abort()
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
			}catch(err){
				return
			}

			if(data?.data?.project?.timeline?.pageInfo?.__typename === 'PageInfo'){
				//console.log('res before Cursor', endCursor)
				endCursor = data.data.project.timeline.pageInfo.endCursor;
				if(!data.data.project.timeline.pageInfo.hasNextPage) isHitLast = true;
				//console.log('res next Cursor', endCursor)
				try{
					const nodes = data.data.project.timeline.edges;
					results.push(...nodes);
				}catch(err){
					console.error(err);
				}
			} else return
		}
	})

	try {
		await page.goto(motherUrl, {waitUntil: 'networkidle0'});
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

		//const roll = new Array(Math.ceil(totalUpdateLength /20) +5);
		const roll = new Array(200);	//	isHitLast will save my ass

		const executeAutoScroll = async () => {
			for(const _ of roll) {
				if(!isHitLast) {
					await page.waitForTimeout(globalVariable.randomTime.halfMin)
					await autoScroll(roll.length);
				}
			}
		}
		await page.waitForTimeout(globalVariable.randomTime.halfMin)
		await executeAutoScroll();

		await browser.close()

		//	25개 댓글을 담은 객체의 배열
		return results
	}
	catch(err) {
		console.log('getUpdates함수 실행이 실패했습니다.')
		console.log()
		console.error(err)
	}
	finally {
		browser.close();	// 상기 과정에 에러가 발생해도 브라우저는 반드시 종료되도록 한다.
	}
}

module.exports = {getUpdates};


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
//		const projectSlug = 'slay-the-spire-the-board-game';
//
//		const result = await getUpdates(url, projectSlug);
//
//		console.log('final return: ', result.length, util.inspect(result, {depth: null}));
//		
//	}
//)()

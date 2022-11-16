const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const userAgent = require('user-agents');
const {globalVariable} = require('./public/global');

const waitRandom = (randomDelay) => new Promise((resolve) => setTimeout(resolve, randomDelay))	//	setTimeout() 함수가 강제로 프로미스를 반환하도록 만들어준다. 원래는 await 못씀.

const getUpdate = async (targetUrl, projectSlug, endCursor) => {
	const browser = await puppeteer.launch({
		executablePath: globalVariable.browserPath,
		args:[
		], 
		defaultViewport: {width: 1366, height: 768},
		headless: false
	}); 

	const page = await browser.newPage()
	await page.setUserAgent(userAgent.random().toString());
	await page.setRequestInterception(true)

	try{

	let count = 1;
	let xcsrfToken;

	await page.on('request', async request => {
		if(request.url().includes('/graph') && request.method() === 'POST'){
			xcsrfToken = await request.headers()["x-csrf-token"];
			switch(count){
				case 1:		//	getUpdates	
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
								"cursor": endCursor 
							}
						}),
					})
					count++;
					break;
				default:
					request.abort();
			}
		}else{
			await request.continue()
		}
	})

	let result;
	await page.on('response', async response => {
		// Ignore OPTIONS requests
		if(response.request().method() !== 'POST') return
		if(response.url().includes('/graph')) {
			let data;
			try{
				data = await response.json()
			}catch(err){}
			if(data?.data !== undefined){
				try{
					result = data.data
	//				results.push({
	//					data: data.data, 
	//					responseHeaders: response.headers(),
	//					requestHeaders: response.request().headers()
	//				})
				}catch(err){
					console.error(err);
				}
			}
		}
	})

	await page.goto(targetUrl, {waitUntil: 'networkidle0'})

	try{
		let clickElement = await page.$('#px-captcha')
		let clickArea = await clickElement.boundingBox()

		//await page.mouse.move(clickArea.x + clickArea.width /2, clickArea.y + clickArea.height / 2)
		await page.mouse.move(350, 250)
		await page.mouse.down()
		await page.waitForTimeout(20*1000)
		await page.mouse.up()
		await page.waitForTimeout(10*1000)
		await page.reload({ waitUntil: 'networkidle0', })
	}catch(err){}

	await browser.close()
	return result

	}catch(err){}
	finally{
		browser.close(); // ➐ 작업이 완료되면 브라우저 종료
	}
}

(
	//async (targetUrl, projectSlug) => {
	async (targetUrl, projectSlug) => {
		let endCursor;
		const results = [];

		const firstResult = await getUpdate(targetUrl, projectSlug);
		const howManyMoreLoop = Math.floor(firstResult.project.timeline.totalCount / 20)	//	did it once already
		
		endCursor = firstResult.project.timeline.pageInfo.endCursor;
		results.push(...firstResult.project.timeline.edges);

		for(let i=0; i<howManyMoreLoop; i++){
			waitRandom((Math.floor(Math.random()*20) + 40) * 1000);
			const result = await getUpdate(targetUrl, projectSlug, endCursor);
			endCursor = result.project.timeline.pageInfo.endCursor;
			results.push(...result.project.timeline.edges);
		}

		return results
	}
)()

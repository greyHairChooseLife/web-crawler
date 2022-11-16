const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const userAgent = require('user-agents');
const {globalVariable} = require('./public/global');

const waitRandom = (randomDelay) => new Promise((resolve) => setTimeout(resolve, randomDelay))	//	setTimeout() 함수가 강제로 프로미스를 반환하도록 만들어준다. 원래는 await 못씀.

const getComment = async (targetUrl, commentableId, endCursor) => {
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

	let count = 0;
	let xcsrfToken;

	await page.on('request', async request => {
		if(request.url().includes('/graph') && request.method() === 'POST'){
			xcsrfToken = await request.headers()["x-csrf-token"];
			switch(count){
				case 0:		//	getComments	
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
					count++;
					break;
				default:
					request.abort();
			}
		}else{
			await request.continue()
		}
	})

	let results;
	await page.on('response', async response => {
		// Ignore OPTIONS requests
		if(response.request().method() !== 'POST') return
		if(response.url().includes('/graph')) {
			let data;
			try{
			data = await response.json()
			}catch(err){}

			if(data?.data?.commentable?.comments !== undefined){
				try{
					results = data.data;
//					results ={
//						data: data.data, 
//						responseHeaders: response.headers(),
//						requestHeaders: response.request().headers()
//					}
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
	return results

	}catch(err){}
	finally{
		browser.close(); // ➐ 작업이 완료되면 브라우저 종료
	}
}

(
	//async (targetUrl, commentableId) => {
	async (targetUrl, commentableId) => {
		let endCursor;
		const results = [];

		const firstResult = await getComment(targetUrl, commentableId);
		const howManyMoreLoop = Math.floor(firstResult.commentable.commentsCount / 25)	//	did it once already
		endCursor = firstResult.commentable.comments.pageInfo.endCursor;
		results.push(...firstResult.commentable.comments.edges);

		for(let i=0; i<howManyMoreLoop; i++){
			waitRandom((Math.floor(Math.random()*20) + 40) * 1000);
			const result = await getComment(targetUrl, commentableId, endCursor)
			endCursor = result.commentable.comments.pageInfo.endCursor
			results.push(...result.commentable.comments.edges)
		}

		return results
	}
)()

//https://www.youtube.com/watch?v=WOhtW3KxGHo
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const userAgent = require('user-agents');
const {graphql, buildSchema} = require('graphql');
const axios = require('axios');
const util = require('util');
const {queryList} = require('./queryList');

const baseURL = 'https://www.kickstarter.com';

const job =[
  { mainCategory: 'Arts', subCategory: 'Art', categoryId: '1' },
  { mainCategory: 'Arts', subCategory: 'Dance', categoryId: '6' },
  { mainCategory: 'Arts', subCategory: 'Photography', categoryId: '15' },
  { mainCategory: 'Arts', subCategory: 'Theater', categoryId: '17' },
  {
    mainCategory: 'Comics & Illustration',
    subCategory: 'Comics',
    categoryId: '3'
  },
  {
    mainCategory: 'Comics & Illustration',
    subCategory: 'Illustration',
    categoryId: '22'
  },
  {
    mainCategory: 'Design & Tech',
    subCategory: 'Design',
    categoryId: '7'
  },
  {
    mainCategory: 'Design & Tech',
    subCategory: 'Technology',
    categoryId: '16'
  },
  { mainCategory: 'Film', subCategory: 'Film & Video', categoryId: '11' },
  {
    mainCategory: 'Food & Craft',
    subCategory: 'Crafts',
    categoryId: '26'
  },
  {
    mainCategory: 'Food & Craft',
    subCategory: 'Fashion',
    categoryId: '9'
  },
  { mainCategory: 'Food & Craft', subCategory: 'Food', categoryId: '10' },
  { mainCategory: 'Games', subCategory: 'Games', categoryId: '12' },
  { mainCategory: 'Music', subCategory: 'Music', categoryId: '14' },
  {
    mainCategory: 'Publishing',
    subCategory: 'Journalism',
    categoryId: '13'
  },
  {
    mainCategory: 'Publishing',
    subCategory: 'Publishing',
    categoryId: '18'
  }
]

/**
 * yet unidentified
 */
const woe_id = '0';		//	yet unidentified
/**
 * daily changed
 */
const seed = '2776824'; 	//	daily change
/**
 * a total of 3 params
 *
 * @categoryId
 *
 * 	It is being in global variable.
 *
 * @sort
 * 
 * 	Just put 'magic' in right now. Gotta check it out if it is meaningful.
 *
 * @pageNumber
 *
 * 	1~200
 */
const getEndObject = async (categoryId, sort, pageNumber) => {
	const browser = await puppeteer.launch({executablePath: '/opt/google/chrome/google-chrome',
	//	userDataDir: '/home/sy/.config/google-chrome/Default', 
		args:[
		//`--proxy-server=${proxy[Math.floor(Math.random()*10 % proxy.length)]}`
	], 
		headless: false, }); 
	const page = await browser.newPage();     
	await page.setUserAgent(userAgent.random().toString());

	const url = baseURL + `/discover/advanced?category_id=${categoryId}&woe_id=${woe_id}&sort=${sort}&seed=${seed}&page=${pageNumber}`;

	await page.goto(url, { waitUntil: 'networkidle0', });

	const results = [];

	const rawPprojects = await page.$$('#projects_list > div > div > div');

	for(const rawProject of rawPprojects){

		const link = await page.evaluate(ele => ele.querySelector('div > div > div > div.relative.self-start > a').getAttribute('href'), rawProject);
		const img = await page.evaluate(ele => ele.querySelector('div.relative.self-start > a > img').getAttribute('src'), rawProject);
//		const badge = await page.evaluate(ele => ele.querySelector('div.h30.pt4.px3.mb1px > div > a > h3').textContent, rawProject);
		const title = await page.evaluate(ele => ele.querySelector('div.h30.pt4.px3.mb1px > div > a > h3').textContent, rawProject);
		const comment = await page.evaluate(ele => ele.querySelector('div.h30.pt4.px3.mb1px > div.clamp-5.navy-500.mb3.hover-target > a > p').textContent, rawProject);
		const byWhom = await page.evaluate(ele => ele.querySelector('div.h30.pt4.px3.mb1px > div.type-13.flex > div > a').textContent, rawProject);
		const amountOfFunded = await page.evaluate(ele => ele.querySelector('div.pb3.pt3.px3-sm.px4 > div.ksr-green-700.medium > div:nth-child(1) > span:nth-child(1)').textContent, rawProject);
		const rateOfFunded = await page.evaluate(ele => ele.querySelector('div.pb3.pt3.px3-sm.px4 > div.ksr-green-700.medium > div:nth-child(2) > span:nth-child(1)').textContent, rawProject);
		const daysToGo = await page.evaluate(ele => ele.querySelector('div.pb3.pt3.px3-sm.px4 > div.ksr-green-700.medium > div.type-13.ksr_page_timer.mb3.mr2.dark-grey-500.medium > span.js-num').textContent, rawProject);
		const category = await page.evaluate(ele => ele.querySelector('div.pb3.pt3.px3-sm.px4 > div.ksr-green-700.medium > div.flex > a:nth-child(1)').textContent, rawProject);
		const place = await page.evaluate(ele => ele.querySelector('div.pb3.pt3.px3-sm.px4 > div.ksr-green-700.medium > div.flex > a:nth-child(2)').textContent, rawProject);

		results.push({
			link: link,
			img: img,
			title: title,
			comment: comment,
			byWhom: byWhom,
			amountOfFunded: amountOfFunded,
			rateOfFunded, rateOfFunded,
			daysToGo: daysToGo,
			category: category,
			place: place,
		})
	}

	await browser.close(); // ➐ 작업이 완료되면 브라우저 종료
	return results;
}


const getEndPage = async (url) => {
	const browser = await puppeteer.launch({
		executablePath: '/opt/google/chrome/google-chrome',
		//userDataDir: '/home/sy/.config/google-chrome/Default', 
		args:[
		//	`--proxy-server=http://${proxy[Math.floor(Math.random()*10 % proxy.length)]}`
		], 
		headless: false
	}); 
	const page = await browser.newPage();     
	await page.setViewport({width: 1024, height: 768});


	//await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36');
	await page.setUserAgent(userAgent.random().toString());
const n = 'https://www.kickstarter.com/projects/1906838062/the-world-of-guweiz-the-art-of-gu-zheng-wei/comments';
const n_ = 'https://www.kickstarter.com/projects/zendure/superbase-v-first-plug-and-play-home-energy-storage-system/comments';
const N = 'https://bot.sannysoft.com';
const ip = 'https://www.google.com/search?q=where+is+my+ip&oq=wher&aqs=chrome.0.69i59j69i57j69i61j69i60.809j0j7&sourceid=chrome&ie=UTF-8'
const areyouheadless = 'https://arh.antoinevastel.com/bots/areyouheadless';
const amiunique = 'https://amiunique.org/fp';
	//const res = await page.goto(url+'/comments', { waitUntil: 'networkidle0', });
	
	await page.goto(amiunique, { waitUntil: 'networkidle0', });

//	const repeatCountForCommnetLoadMoreBtn = await page.$eval('#react-project-comments > div.theme--support > div > span', ele => {
//		const arr = ele.textContent.split(' ');
//		const plusOne = Number(arr[3]) % 25 === 0 ? 0 : 1;
//		return Math.floor(Number(arr[3]) / 25) + plusOne -1;
//	})
//
//	for(let i=0; i<repeatCountForCommnetLoadMoreBtn; i++){
//		await page.click('#react-project-comments > div > button');
//		await page.waitForSelector(`#react-project-comments > ul > li:nth-child(${25*(i+1) +1})`);
//	}
//	
//
//	let count = 0;
//	const results = [];
//	const commentEles = await page.$$('#react-project-comments > ul > li');
//	for(const commentEle of commentEles){
//
//		count++;
//		//const name = await page.evaluate(ele => ele.querySelector('div > div.flex.mb3.justify-between > div > div > span.mr2')?.textContent, commentEle);
//		let name = '';
//		let phrase = '';
//		try{
//			name = await page.evaluate(ele => ele.querySelector('div > div.flex.mb3.justify-between > div > div > span.mr2')?.textContent, commentEle);
//			phrase = await page.evaluate(ele => ele.querySelector('div > p')?.textContent, commentEle);
//		}catch(err){
//			console.error(err);
//		}
//
//		results.push({name: name, phrase: phrase, count: count});
//	}

	//await browser.close(); // ➐ 작업이 완료되면 브라우저 종료

//	return results;
}

const doit = async (url) => {
//	const browser = await puppeteer.launch();
	const browser = await puppeteer.launch({
		executablePath: '/opt/google/chrome/google-chrome',
		args:[
		], 
		headless: false
	}); 

const n = 'https://www.kickstarter.com/projects/1906838062/the-world-of-guweiz-the-art-of-gu-zheng-wei/comments';
const n_ = 'https://www.kickstarter.com/projects/zendure/superbase-v-first-plug-and-play-home-energy-storage-system/comments';
const N = 'https://bot.sannysoft.com';
const ip = 'https://www.google.com/search?q=where+is+my+ip&oq=wher&aqs=chrome.0.69i59j69i57j69i61j69i60.809j0j7&sourceid=chrome&ie=UTF-8'
const areyouheadless = 'https://arh.antoinevastel.com/bots/areyouheadless';
const amiunique = 'https://amiunique.org/fp';
	//const res = await page.goto(url+'/comments', { waitUntil: 'networkidle0', });

    try {
        const page = await browser.newPage()
		await page.setUserAgent(userAgent.random().toString());
		//await page.setRequestInterception(true)
        // create a string of repeating '=' equal signs
        // for separation when logging to the console
        const separator = Array(156).join('=')

//		await page.on('request', async request => {
//			const isGraphQL = request.url().includes('/graph')
//			const isPOST = request.method() === 'POST'
//			if (isGraphQL && isPOST) {
//				console.log('\n 🚀 We got one!: ', request.url())
//				await request.respond({
//					status: 200,
//					contentType: 'application/json',
//					body: mockData               
//				})
//			} else {
//				request.continue()
//			}
//		})

//        // Tell Puppeteer what to do with intercepted responses
//        await page.on('response', async response => {
//            // Ignore OPTIONS requests
//            if(response.request().method() !== 'POST') return
//            if(response.url().includes('/graph')) {
//                console.log('\n 🚀 We got one!: ', response.url())
//                const data = await response.json()
//                console.log(separator)
//                //console.table(data)
//                console.table(data);
//
////                console.log(data.data && Object.entries(data.data))
////                console.table(data.data?.project)
//
//                console.log('\nHeaders: \n', response.headers())
//                console.log()
//                console.log(separator)
//            }
//        })
		
        // navigate to a page
        const pageUrl = 'https://spacex-ships.now.sh'
        const response = await page.goto(
            //pageUrl, {waitUntil: 'networkidle0'}
			//'https://ppss.kr', {waitUntil: 'networkidle0'}
			//'https://www.kickstarter.com', {waitUntil: 'networkidle0'}
			n, {waitUntil: 'networkidle0'}
        )
//		const cert = await response.securityDetails()
//		console.log(cert)
	} finally {
        console.log('Closing the browser...')
        await browser.close()
    }

	//return 
}

const doit_ = async (url) => {
//	const browser = await puppeteer.launch();
	const browser = await puppeteer.launch({
		executablePath: '/opt/google/chrome/google-chrome',
		args:[
		], 
		headless: false
	}); 

	//const res = await page.goto(url+'/comments', { waitUntil: 'networkidle0', });
	const n = 'https://www.kickstarter.com/projects/1906838062/the-world-of-guweiz-the-art-of-gu-zheng-wei/comments';
	const n2 = 'https://www.kickstarter.com/projects/1906838062/the-world-of-guweiz-the-art-of-gu-zheng-wei';

	const separator = {
		creator: Array(40).join('Creator_______'), 
		campaign: Array(40).join('Campaign_______'), 
		comments: Array(40).join('Comments_______'), 
		updates: Array(40).join('Updates_______'), 
		viewpost: Array(40).join('ViewPost_______'), 
		freeformpost: Array(40).join('FreeformPost_______'), 
		line: Array(156).join('-')
	}
    try {
        const page = await browser.newPage()
		await page.setUserAgent(userAgent.random().toString());
		await page.setRequestInterception(true)

		let count = 10;
		let xcsrfToken;

		await page.on('request', async request => {
			if(request.url().includes('/graph') && request.method() === 'POST'){
				xcsrfToken = await request.headers()["x-csrf-token"];
				switch(count){
					case 0:		//	getCreator
						await request.continue({
							headers: {
								...request.headers(),
								"x-csrf-token": xcsrfToken,
								'User-Agent': userAgent.random().toString()
							},
							method: 'POST',
							postData: JSON.stringify({
								"query": queryList.getCreator.query,
								"variables": queryList.getCreator.variables 
							}),
						})
						count++;
						break;
					case 1: 	//	getCampaign
						await request.continue({
							headers: {
								...request.headers(),
								"x-csrf-token": xcsrfToken,
								'User-Agent': userAgent.random().toString()
							},
							method: 'POST',
							postData: JSON.stringify({
								"query": queryList.getCampaign.query,
								"variables": queryList.getCampaign.variables 
							}),
						})
						count++;
						break;
					case 2:		//	getUpdates	
						await request.continue({
							headers: {
								...request.headers(),
								"x-csrf-token": xcsrfToken,
								'User-Agent': userAgent.random().toString()
							},
							method: 'POST',
							postData: JSON.stringify({
								"query": queryList.getUpdates.query,
								"variables": queryList.getUpdates.variables 
							}),
						})
						count++;
						break;
					case 10:		//	getComments	
						await request.continue({
							headers: {
								...request.headers(),
								"x-csrf-token": xcsrfToken,
								'User-Agent': userAgent.random().toString()
							},
							method: 'POST',
							postData: JSON.stringify({
								"query": queryList.getComments.query,
								"variables": queryList.getComments.variables 
							}),
						})
						count++;
						break;
					case 511:		//	getViewPost	
						await request.continue({
							headers: {
								...request.headers(),
								"x-csrf-token": xcsrfToken,
								'User-Agent': userAgent.random().toString()
							},
							method: 'POST',
							postData: JSON.stringify({
								"query": queryList.getViewPost.query,
								"variables": queryList.getViewPost.variables 
							}),
						})
						count++;
						break;
					case 512:		//	getFreeformPost	
						await request.continue({
							headers: {
								...request.headers(),
								"x-csrf-token": xcsrfToken,
								'User-Agent': userAgent.random().toString()
							},
							method: 'POST',
							postData: JSON.stringify({
								"query": queryList.getFreeformPost.query,
								"variables": queryList.getFreeformPost.variables 
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

        await page.on('response', async response => {
            // Ignore OPTIONS requests
            if(response.request().method() !== 'POST') return
            if(response.url().includes('/graph')) {
				const save = () => {
					try{
						console.log('entries: ',)
						//console.log(data);
						console.log(util.inspect(Object.entries(data.data), {showHidden: false, depth: null}));
						console.log()
//						console.log('table: ',)
//						console.table(data.data);
						console.log(separator.line)
						console.log(separator.line)
						console.log(separator.line)
						console.log('\nRESPONSE Headers: \n', response.headers())
						console.log('\nREQUEST Headers: \n', response.request().headers())
						console.log(separator.line)
						console.log(separator.line)
						console.log(separator.line)
					}catch(err){
						console.error(err);
					}
				}
            	const data = await response.json()
//				if(data?.data?.project?.creator !== undefined){ 	// got creator
//					console.log(separator.creator)
//					save();
//					return
//				}else if(data?.data?.project?.risks !== undefined){		// got campaign
//					console.log(separator.campaign)
//					save();
//					return
//				}else if(data?.data?.project?.timeline?.totalCount === data?.data?.project?.timeline?.edges?.length +1){		// got updates
//					console.log(separator.updates)
//					save();
//				}

				if(data?.data?.commentable?.comments !== undefined){
					console.log(separator.comments)
					save();
					return
//				}else if(){
//					console.log(separator.viewpost)
//
//				}else if(){
//					console.log(separator.freeformpost)
				}

            }
        })

		const pageUrl = 'https://www.kickstarter.com';
        const response = await page.goto(
            n2, {waitUntil: 'networkidle0'}
        )

//		await page.setRequestInterception(true)
//		page.once('request', interceptedRequest => {
//			interceptedRequest.continue({ method: 'POST', postData: JSON.stringify({hello : "I am kim."}), headers: interceptedRequest.headers })
//		}) 
//		await page.goto(
//			'https://httpbin.org/post'
//		)
//		console.log(await page.content())

//		const xcsrfToken = await page.$$eval('head > meta', eles => {
//			for(let ele of eles){
//				if(ele.getAttribute('name') === 'csrf-token') return ele.getAttribute('content')
//			}
//		});
//		console.log('token: ', xcsrfToken);

//		const cert = await response.securityDetails()
//		console.log(cert)
	} finally {
        console.log('Closing the browser...')
        await browser.close()
    }

	//return 
}

const showMeTheMoney = async () => {

	//const result = await getEndObject(job[0].categoryId, 'magic', 1);
	const result = [];

	for(let i=1; i<2; i++){
		result.push(await getEndObject(job[0].categoryId, 'magic', i))
	}
	console.log(result);

	const finalUrl = result[0][0].link;
	console.log(finalUrl);

	//const comments = await getEndPage('');

	//doit_();
}

showMeTheMoney();

//	not so sure it works or not
//        await page.evaluateOnNewDocument(() => {
//            // Pass webdriver check
//            Object.defineProperty(navigator, 'webdriver', {
//                get: () => false,
//            });
//        });
//
//        await page.evaluateOnNewDocument(() => {
//            // Pass chrome check
//            window.chrome = {
//                runtime: {},
//                // etc.
//            };
//        });
//
//        await page.evaluateOnNewDocument(() => {
//            //Pass notifications check
//            const originalQuery = window.navigator.permissions.query;
//            return window.navigator.permissions.query = (parameters) => (
//                parameters.name === 'notifications' ?
//                    Promise.resolve({ state: Notification.permission }) :
//                    originalQuery(parameters)
//            );
//        });
//
//        await page.evaluateOnNewDocument(() => {
//            // Overwrite the `plugins` property to use a custom getter.
//            Object.defineProperty(navigator, 'plugins', {
//                // This just needs to have `length > 0` for the current test,
//                // but we could mock the plugins too if necessary.
//                get: () => [1, 2, 3, 4, 5],
//            });
//        });
//
//        await page.evaluateOnNewDocument(() => {
//            // Overwrite the `languages` property to use a custom getter.
//            Object.defineProperty(navigator, 'languages', {
//                get: () => ['en-US', 'en'],
//            });
//        });

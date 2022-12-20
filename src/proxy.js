const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const userAgent = require('user-agents');
const {globalVariable} = require('./public/global');
const {numberize} = require('./util/my-util')
const {installMouseHelper} = require('./util/install-mouse-helper');
const {solveCaptchar} = require('./util/solve-captcha');
const {getProxyList} = require('./util/get-proxy-list');

const util = require('util');


const getUpdate = async (url) => {
	const proxyList = await getProxyList();
	const newProxy = `${proxyList[5].https === 'no' ? 'http' : 'https'}=${proxyList[5].ip}:${proxyList[5].port}`;
	const browser = await puppeteer.launch({...globalVariable.browserOptions, args: [`--proxy-server=${newProxy}`]}); 
	//const browser = await puppeteer.launch({...globalVariable.browserOptions}); 
	const page = await browser.newPage();
	console.log(proxyList[5], '\n',`${proxyList[5].https === 'no' ? 'http' : 'https'}=${proxyList[5].ip}:${proxyList[5].port}`);
	await page.setUserAgent(userAgent.random().toString());
	await page.setBypassCSP(true)

	await page.goto(url);




	if(false){
	await solveCaptchar(page);



	// get Post data
	//
	// and ...

	let numberOfComment;
	try{
		numberOfComment = await page.$eval('#comments > div.py3.py7-sm.hide.block-sm > div > div > span', ele => {
			return ele.textContent.split('of')[1];
		})
		numberOfComment = numberize(numberOfComment);
	}catch(err){
		console.log('There is no comments for this update post.');
	}

	if(numberOfComment !== null && numberOfComment > 0) {

		const autoScroll = async () => {
			let scrollHeight = await page.evaluate(() => {
				return document.body.scrollHeight;
			})
			await page.mouse.wheel({deltaY: scrollHeight})
		}

		const numberOfLoadMoreJob = new Array(Math.ceil(numberOfComment /25) -1);
		let count = 1;

		const clickLoadMoreUntilEnd = async () => {
			for(const _ of numberOfLoadMoreJob) {
				await autoScroll();
				await page.click('#comments > div.py3.py7-sm.hide.block-sm > div > button');
				if(count++ < numberOfLoadMoreJob) await page.waitForNavigation({waitUntil: 'networkidle0'})
			}
		}

		clickLoadMoreUntilEnd();
	
	}
	
//	const numberOfScrollJob = new Array(Math.floor(TOTAL_LENGTH /12) +1 -1 -1);	//	전체 페이지 수에서 기본 접속 페이지(1페이지) 한번 빼고, 클릭 페이지(2페이지) 한번 뺀다.
//
//	//	just for iterating
//	const executeAutoScroll = async () => {
//		for(const _ of numberOfScrollJob) {
//			await autoScroll(numberOfScrollJob.length);
//		}
//	}
//	await executeAutoScroll();
//
//	const result = [];
//	const listOf12Projects = await page.$$('#projects_list > div > div');
//	for(project of listOf12Projects){
//		result.push(await page.evaluate(ele => ele.getAttribute('data-project'), project));
//	}
//
//	await browser.close();
//
//	return result
	}
}

(
	async () => {
		const url = 'https://ppss.kr/';
		const url2 = 'https://ipinfo.io/';

		const result = await getUpdate(url2);
		console.log('final return: ', util.inspect(result, {depth: null}));
	}
)()

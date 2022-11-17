const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const userAgent = require('user-agents');
const {globalVariable} = require('./public/global');
const {numberize} = require('./util/my-util')
const {installMouseHelper} = require('./util/install-mouse-helper');
const {solveCaptchar} = require('./util/solve-captcha');

const util = require('util');

const getUpdate = async (url) => {
	const browser = await puppeteer.launch(globalVariable.browserOptions); 
	const page = await browser.newPage();
	await page.setUserAgent(userAgent.random().toString());
	installMouseHelper(page);

	await page.goto(url, {waitUntil: 'networkidle0'});
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

		console.log('count: ', numberOfLoadMoreJob);
		const clickLoadMoreUntilEnd = async () => {
			for(const _ of numberOfLoadMoreJob) {
				await autoScroll();
				await page.click('#comments > div.py3.py7-sm.hide.block-sm > div > button');
				await page.waitForTimeout(5 *1000);
				//if(count++ < numberOfLoadMoreJob) await page.waitForNavigation({waitUntil: 'networkidle0'})
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

(
	async () => {
		const url = 'https://www.kickstarter.com/projects/elanlee/exploding-kittens/posts/2300562';

		const result = await getUpdate(url);
		console.log('final return: ', util.inspect(result, {depth: null}));
	}
)()

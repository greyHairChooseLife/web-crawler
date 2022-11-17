const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const userAgent = require('user-agents');
const {globalVariable} = require('./public/global');
const {installMouseHelper} = require('./util/install-mouse-helper');
const {solveCaptchar} = require('./util/solve-captcha');

const getTargets = async (url) => {
	const browser = await puppeteer.launch(globalVariable.browserOptions); 
	const page = await browser.newPage();
	await page.setUserAgent(userAgent.random().toString());
	installMouseHelper(page);

	await page.goto(url, {waitUntil: 'networkidle0'});
	await solveCaptchar(page);
	
	await page.click('#projects > div.load_more.mt3 > a');
	await page.waitForNavigation({waitUntil: 'networkidle0'});

	const autoScroll = async () => {
		let scrollHeight = await page.evaluate(() => {
			return document.body.scrollHeight;
		})
		await page.mouse.wheel({deltaY: scrollHeight})
		await page.waitForNavigation({waitUntil: 'networkidle0'})
	}

	const TOTAL_LENGTH = await page.$eval('#projects > div.grid-container > h3 > b', ele => {
		const numberize = (str) => {
			return str.split('').reduce((prev, curr) => {
				if(curr.charCodeAt(0) >= 48 && curr.charCodeAt(0) <= 57) return prev+curr
				else return prev
			}, '')
		}

		return numberize(ele.textContent.split(' ')[0])
	});
	const numberOfScrollJob = new Array(Math.floor(TOTAL_LENGTH /12) +1 -1 -1);	//	전체 페이지 수에서 기본 접속 페이지(1페이지) 한번 빼고, 클릭 페이지(2페이지) 한번 뺀다.

	//	just for iterating
	const executeAutoScroll = async () => {
		for(const _ of numberOfScrollJob) {
			await autoScroll(numberOfScrollJob.length);
		}
	}
	await executeAutoScroll();

	const result = [];
	const listOf12Projects = await page.$$('#projects_list > div > div');
	for(project of listOf12Projects){
		result.push(await page.evaluate(ele => ele.getAttribute('data-project'), project));
	}

	await browser.close();

	return result
}

module.exports = {getTargets};

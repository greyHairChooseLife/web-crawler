const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const userAgent = require('user-agents');
const {globalVariable} = require('./public/global');
const {installMouseHelper} = require('./util/install-mouse-helper');
const {solveCaptchar} = require('./util/solve-captcha');

const getTargets = async (subCategoryId) => {
	const browser = await puppeteer.launch(globalVariable.browserOptions); 
	const page = await browser.newPage();
	await page.setUserAgent(userAgent.random().toString());
	installMouseHelper(page);
	await page.authenticate({ username: globalVariable.proxyInfo.name, password: globalVariable.proxyInfo.pw });

	const url = `https://www.kickstarter.com/discover/advanced?category_id=${subCategoryId}&sort=magic&seed=2780996&page=1`;

	try{

		await page.goto(url, {waitUntil: 'networkidle0'});
		await solveCaptchar(page);
		await page.waitForTimeout(globalVariable.randomTime.fifteenSec);
		
		await page.click('#projects > div.load_more.mt3 > a');
		await page.waitForNavigation({waitUntil: 'networkidle0'});
		await page.waitForTimeout(globalVariable.randomTime.fifteenSec);

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
	//	const numberOfScrollJob = new Array(1);	//	전체 페이지 수에서 기본 접속 페이지(1페이지) 한번 빼고, 클릭 페이지(2페이지) 한번 뺀다.

		//	just for iterating
		const executeAutoScroll = async () => {
			for(const _ of numberOfScrollJob) {
				await autoScroll(numberOfScrollJob.length);
				await page.waitForTimeout(globalVariable.randomTime.fifteenSec);
			}
		}
		await executeAutoScroll();

		const result = [];
		const listOf12Projects = await page.$$('#projects_list > div > div');
		for(project of listOf12Projects){
			result.push({
				data: await page.evaluate(ele => ele.getAttribute('data-project'), project),
				isDone: {
					pageData: false,
					updateData: false,
					commentData: false,
				}
			});
		}

		await browser.close();

		return result

	}
	catch(err) {
		console.log('getTargets함수 실행이 실패했습니다.')
		console.log()
		console.error(err)
	}
	finally {
		browser.close();	// 상기 과정에 에러가 발생해도 브라우저는 반드시 종료되도록 한다.
		return results
	}
}

module.exports = {getTargets};



////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
	// TESTING CODE
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
//(
//	async () => {
//		const subCategoryId = 287
//
//		const result = await getTargets(subCategoryId)
//		console.log(result.length, result[0])
//	}
//)()

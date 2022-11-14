const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const userAgent = require('user-agents');

const {globalVariable} = require('./public/global');

const dirName = '/home/sy/kickstarter';
const baseURL = 'https://www.kickstarter.com';

/*
 *	[{name, url, state}, {1}, {2}, ..., {10}, {11}]
 *	
 *	Return an array of 12 contents.
 *
 */
exports.getTargets = async (categoryId, seed, pageNumber) => {
	const browser = await puppeteer.launch({executablePath: globalVariable.browserPath,
	//	userDataDir: '/home/sy/.config/google-chrome/Default', 
		args:[
		//`--proxy-server=${proxy[Math.floor(Math.random()*10 % proxy.length)]}`
	], 
		defaultViewport: {width: 1366, height: 768},
		headless: false, }); 
	const page = await browser.newPage();     
	await page.setUserAgent(userAgent.random().toString());
	const url = baseURL + `/discover/advanced?category_id=${categoryId}&woe_id=0&sort=magic&seed=${seed}&page=${pageNumber}`;
	await page.goto(url, { waitUntil: 'networkidle0', });

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

	const results = [];
	const rawProjects = await page.$$('#projects_list > div > div');

	for(const rawProject of rawProjects){
		const data = await page.evaluate(ele => JSON.parse(ele.getAttribute('data-project')), rawProject);
		results.push({
			name: data.name,
			url: data.urls.web.project,
			state: data.state
		})
	}

	await browser.close();

	return results;
}

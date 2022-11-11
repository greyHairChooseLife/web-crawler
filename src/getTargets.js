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
		headless: false, }); 
	const page = await browser.newPage();     
	await page.setUserAgent(userAgent.random().toString());
	const url = baseURL + `/discover/advanced?category_id=${categoryId}&woe_id=0&sort=magic&seed=${seed}&page=${pageNumber}`;
	await page.goto(url, { waitUntil: 'networkidle0', });

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

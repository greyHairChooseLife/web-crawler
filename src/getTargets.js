const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const userAgent = require('user-agents');

const dirName = '/home/sy/kickstarter';
const baseURL = 'https://www.kickstarter.com';

exports.getTargets = async (categoryId, seed, pageNumber, time) => {
	const browser = await puppeteer.launch({executablePath: '/opt/google/chrome/google-chrome',
	//	userDataDir: '/home/sy/.config/google-chrome/Default', 
		args:[
		//`--proxy-server=${proxy[Math.floor(Math.random()*10 % proxy.length)]}`
	], 
		headless: false, }); 
	const page = await browser.newPage();     
	await page.setUserAgent(userAgent.random().toString());
	const url = baseURL + `/discover/advanced?category_id=${categoryId}&woe_id=0&sort=magic&seed=${seed}&page=${pageNumber}`;
	await page.goto(url, { waitUntil: 'networkidle0', });
//	let newSeed;
//	if(time === 1){
//		await page.reload({ waitUntil: 'networkidle0', });
//		newSeed = await page.url().split('=magic&seed=')[1].split('&')[0];
//		console.log(seed, ', ', newSeed)
//	}

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
//	if(time === 1) return {results: results, newSeed: newSeed}
	return results;
}

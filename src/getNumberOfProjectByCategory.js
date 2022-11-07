const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const userAgent = require('user-agents');

const baseURL = 'https://www.kickstarter.com';

const startingSeed = '233'+Math.floor(Math.random()*10)+Math.floor(Math.random()*10)+Math.floor(Math.random()*10); // not sure this cause problem..

exports.getNumberOfProjectByCategory = async (categoryId) => {
	const browser = await puppeteer.launch({executablePath: '/opt/google/chrome/google-chrome',
	//	userDataDir: '/home/sy/.config/google-chrome/Default', 
		args:[
		//`--proxy-server=${proxy[Math.floor(Math.random()*10 % proxy.length)]}`
	], 
		headless: false, }); 
	const page = await browser.newPage();     
	await page.setUserAgent(userAgent.random().toString());

	const url = baseURL + `/discover/advanced?category_id=${categoryId}&sort=migic&seed=${startingSeed}&page=1`;
	await page.goto(url, { waitUntil: 'networkidle0', });

	const result = await page.$eval('#projects > div.grid-container > h3 > b', ele => ele.textContent);
	const numberOfProject = result.split(' ')[0].substring(1).split('').reduce((prev, curr) => {	//숫자로 변환, 가끔 쉼표가 붙는다.
		if(curr.charCodeAt(0) >= 48 && curr.charCodeAt(0) <= 57) return prev + curr
		else return prev
	}, '')*1;

	await browser.close();

	return numberOfProject;
}

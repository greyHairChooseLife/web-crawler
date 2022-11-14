const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const userAgent = require('user-agents');
const {globalVariable} = require('./public/global');

const baseURL = 'https://www.kickstarter.com';

const startingSeed = '233'+Math.floor(Math.random()*10)+Math.floor(Math.random()*10)+Math.floor(Math.random()*10); // not sure this cause problem..

exports.getNumberOfProjectByCategory = async (categoryId) => {
	const browser = await puppeteer.launch({executablePath: globalVariable.browserPath,
	//	userDataDir: '/home/sy/.config/google-chrome/Default', 
		args:[
		//`--proxy-server=${proxy[Math.floor(Math.random()*10 % proxy.length)]}`
	], 
		defaultViewport: {width: 1366, height: 768},
		headless: false, }); 
	const page = await browser.newPage();     
	await page.setUserAgent(userAgent.random().toString());

	const url = baseURL + `/discover/advanced?category_id=${categoryId}&sort=magic&seed=${startingSeed}&page=1`;
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

	const result = await page.$eval('#projects > div.grid-container > h3 > b', ele => ele.textContent);
	const numberOfProject = result.split(' ')[0].substring(1).split('').reduce((prev, curr) => {	//숫자로 변환, 가끔 쉼표가 붙는다.
		if(curr.charCodeAt(0) >= 48 && curr.charCodeAt(0) <= 57) return prev + curr
		else return prev
	}, '')*1;

	await browser.close();

	return numberOfProject;
}

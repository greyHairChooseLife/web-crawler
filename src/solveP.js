const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const userAgent = require('user-agents');
const {globalVariable} = require('./public/global');

exports.solve = async (url) => {
	const browser = await puppeteer.launch({
		executablePath: globalVariable.browserPath,
		args:[], 
		headless: false, }); 

	const page = await browser.newPage();     
	await page.setUserAgent(userAgent.random().toString());
	await page.setBypassCSP(true)

	await page.goto(url, { waitUntil: 'networkidle0', });

	let clickElement = await page.$('div')
	let clickArea = await clickElement.boundingBox()

	await page.mouse.move(clickArea.x + clickArea.width /2, clickArea.y + clickArea.height / 2)
	await page.mouse.down()
	await page.waitFor(20*1000)
	await page.mouse.up()
	await page.waitFor(18*1000)

	const final = await browser.close();

	return final
}

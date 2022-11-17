const PROXY_FROM = 'https://free-proxy-list.net/'
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const userAgent = require('user-agents');
const {globalVariable} = require('../public/global');

async function getProxyList() {
	const browser = await puppeteer.launch(globalVariable.browserOptions); 
	const page = await browser.newPage();
	await page.setUserAgent(userAgent.random().toString());

	await page.goto(PROXY_FROM, {waitUntil: 'networkidle0'});

	const proxy = [];
	const table = await page.$$('#list > div > div.table-responsive > div > table > tbody > tr');
	for (const raw of table) {
		const https = await page.evaluate(ele => ele.querySelector('td.hx').textContent, raw);
		const ip = await page.evaluate(ele => ele.querySelector('td:nth-child(1)').textContent, raw);
		const port = await page.evaluate(ele => ele.querySelector('td:nth-child(2)').textContent, raw);
		proxy.push({
			https: https, 
			ip: ip, 
			port: port
		})
	}

	await browser.close();

	return proxy
}

module.exports = {getProxyList};

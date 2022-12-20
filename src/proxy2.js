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
	//const newProxy = `${proxyList[5].https === 'no' ? 'http' : 'https'}=${proxyList[5].ip}:${proxyList[5].port}`;	// got a test proxy from free one
	const proxyName = 'sangyeon';
	const proxyPW = 'dc1fef-1a66c2-a9c11c-d84a8b-31b1e5';
	const thisProxy = 'usa.rotating.proxyrack.net:9000'
	const browser = await puppeteer.launch({...globalVariable.browserOptions, args: [`--proxy-server=${thisProxy}`]}); 
	//const browser = await puppeteer.launch({...globalVariable.browserOptions}); 
	const page = await browser.newPage();
	await page.setUserAgent(userAgent.random().toString());
	await page.setBypassCSP(true)
	await page.authenticate({ username: proxyName, password: proxyPW });

	await page.goto(url);

}

(
	async () => {
		const url2 = 'https://ipinfo.io/';
		const url = 'https://www.kickstarter.com/projects/1906838062/the-world-of-guweiz-the-art-of-gu-zheng-wei/comments';

		const result = await getUpdate(url);
		console.log('final return: ', util.inspect(result, {depth: null}));
	}
)()

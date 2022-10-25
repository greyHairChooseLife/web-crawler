const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const userAgent = require('user-agents');
const fs = require('fs');
const util = require('util');
const {queryList} = require('./queryList');

const baseURL = 'https://www.kickstarter.com';

const getComments = async () => {
	const browser = await puppeteer.launch({
		executablePath: '/opt/google/chrome/google-chrome',
		args:[
		], 
		headless: false
	}); 
//https://www.kickstarter.com/projects/1906838062/the-world-of-guweiz-the-art-of-gu-zheng-wei
	const targetUrl = 'https://www.kickstarter.com/projects/coffincomics/brian-pulidos-all-new-hellwitch-forbidden-1';

	const separator = {
		creator: Array(40).join('Creator_______'), 
		campaign: Array(40).join('Campaign_______'), 
		comments: Array(40).join('Comments_______'), 
		updates: Array(40).join('Updates_______'), 
		line: Array(156).join('-')
	}

	const results = [];
    try {
        const page = await browser.newPage()
		await page.setUserAgent(userAgent.random().toString());
		await page.setRequestInterception(true)

		let count = 0;
		let xcsrfToken;

		await page.on('request', async request => {
			if(request.url().includes('/graph') && request.method() === 'POST'){
				xcsrfToken = await request.headers()["x-csrf-token"];
				switch(count){
					case 0:		//	getComments	
						await request.continue({
							headers: {
								...request.headers(),
								"x-csrf-token": xcsrfToken,
								'User-Agent': userAgent.random().toString()
							},
							method: 'POST',
							postData: JSON.stringify({
								"query": queryList.getComments.query,
								"variables": queryList.getComments.variables 
							}),
						})
						count++;
						break;
					default:
						request.abort();
				}
			}else{
				await request.continue()
			}
		})

        await page.on('response', async response => {
            // Ignore OPTIONS requests
            if(response.request().method() !== 'POST') return
            if(response.url().includes('/graph')) {
				const save = () => {
					try{
//						console.log('entries: ',)
//						console.log(util.inspect(Object.entries(data.data), {showHidden: false, depth: null}));
//						console.log(separator.line)
//						console.log(separator.line)
//						console.log(separator.line)
//						console.log('\nRESPONSE Headers: \n', response.headers())
//						console.log('\nREQUEST Headers: \n', response.request().headers())
//						console.log(separator.line)
//						console.log(separator.line)
//						console.log(separator.line)
						results.push({
							data: data.data, 
							responseHeaders: response.headers(),
							requestHeaders: response.request().headers()
						})
					}catch(err){
						console.error(err);
					}
				}
            	const data = await response.json()
				if(data?.data?.commentable?.comments !== undefined){
					save();
					return
				}
            }
        })

        await page.goto(
            targetUrl, {waitUntil: 'networkidle0'}
        )
	} finally {
        await browser.close()
    }
	return results
}

const showMeTheMoney = async () => {
	const result = await getComments();
	//console.log('json: ',  JSON.stringify(result))
	const now = new Date().toLocaleString().replace(/\//g, '_');
	//fs.writeFile(`/home/sy/kickstarter/log/Comments_${now}.json`, JSON.stringify(result), 'utf8', err => console.error(err));
	fs.writeFile(`/home/sy/kickstarter/log/Comments.json`, JSON.stringify(result), 'utf8', err => console.error(err));
}

showMeTheMoney();

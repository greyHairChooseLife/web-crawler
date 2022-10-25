const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const userAgent = require('user-agents');
const fs = require('fs');
const util = require('util');
const {queryList} = require('./queryList');

const baseURL = 'https://www.kickstarter.com';

const getCreatorCampaignUpdates = async () => {
	const browser = await puppeteer.launch({
		executablePath: '/opt/google/chrome/google-chrome',
		args:[
		], 
		headless: false
	}); 
	//const targetUrl = 'https://www.kickstarter.com/projects/coffincomics/brian-pulidos-all-new-hellwitch-forbidden-1';
	const targetUrl = 'https://www.kickstarter.com/projects/isabellearne/magikitty-travel-journal-of-a-witch-cat';

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

		let count = 200;
		let xcsrfToken;

		await page.on('request', async request => {
			if(request.url().includes('/graph') && request.method() === 'POST'){
				xcsrfToken = await request.headers()["x-csrf-token"];
				switch(count){
					case 0:		//	getCreator
						await request.continue({
							headers: {
								...request.headers(),
								"x-csrf-token": xcsrfToken,
								'User-Agent': userAgent.random().toString()
							},
							method: 'POST',
							postData: JSON.stringify({
								"query": queryList.getCreator.query,
								"variables": queryList.getCreator.variables 
							}),
						})
						count++;
						break;
					case 1: 	//	getCampaign
						await request.continue({
							headers: {
								...request.headers(),
								"x-csrf-token": xcsrfToken,
								'User-Agent': userAgent.random().toString()
							},
							method: 'POST',
							postData: JSON.stringify({
								"query": queryList.getCampaign.query,
								"variables": queryList.getCampaign.variables 
							}),
						})
						count++;
						break;
					case 200:		//	getUpdates	
						await request.continue({
							headers: {
								...request.headers(),
								"x-csrf-token": xcsrfToken,
								'User-Agent': userAgent.random().toString()
							},
							method: 'POST',
							postData: JSON.stringify({
								"query": queryList.getUpdates.query,
								"variables": queryList.getUpdates.variables 
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
				if(data?.data?.project?.creator !== undefined){ 	// got creator
					//console.log(separator.creator)
					save();
				}else if(data?.data?.project?.risks !== undefined){		// got campaign
					//console.log(separator.campaign)
					save();
				//}else if(data?.data?.project?.timeline?.totalCount === data?.data?.project?.timeline?.edges?.length +1){		// got updates
				}else{		// got updates
					//console.log(separator.updates)
					save();
				}
            }
        })

		  //"projectSlug": "brian-pulidos-all-new-hellwitch-forbidden-1",
        await page.goto(
            targetUrl, {waitUntil: 'networkidle0'}
        )
	} finally {
        await browser.close()
    }
	return results
}

const showMeTheMoney = async () => {
	const result = await getCreatorCampaignUpdates();
	//console.log('json: ',  JSON.stringify(result))
	const now = new Date().toLocaleString().replace(/\//g, '_');
	//fs.writeFile(`/home/sy/kickstarter/log/CreatorCampaignUpdates_${now}.json`, JSON.stringify(result), 'utf8', err => console.error(err));
	fs.writeFile(`/home/sy/kickstarter/log/CreatorCampaignUpdates.json`, JSON.stringify(result), 'utf8', err => console.error(err));
}

showMeTheMoney();

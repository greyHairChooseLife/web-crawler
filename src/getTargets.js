const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const userAgent = require('user-agents');
const fs = require('fs');
const {categoryInfo} = require('./categoryInfo');

const baseURL = 'https://www.kickstarter.com';

/**
 * yet unidentified
 */
const woe_id = '0';		//	yet unidentified
/**
 * daily changed
 */
const seed = '2776824'; 	//	daily change

/**
 * a total of 3 params
 *
 * @categoryId
 *
 * 	It is being in global variable.
 *
 * @sort
 * 
 * 	Just put 'magic' in right now. Gotta check it out if it is meaningful.
 *
 * @pageNumber
 *
 * 	1~200
 */
const getTargetObject = async (categoryId, sort, pageNumber) => {
	const browser = await puppeteer.launch({executablePath: '/opt/google/chrome/google-chrome',
	//	userDataDir: '/home/sy/.config/google-chrome/Default', 
		args:[
		//`--proxy-server=${proxy[Math.floor(Math.random()*10 % proxy.length)]}`
	], 
		headless: false, }); 
	const page = await browser.newPage();     
	await page.setUserAgent(userAgent.random().toString());

	const url = baseURL + `/discover/advanced?category_id=${categoryId}&woe_id=${woe_id}&sort=${sort}&seed=${seed}&page=${pageNumber}`;

	await page.goto(url, { waitUntil: 'networkidle0', });

	const results = [];

	const rawProjects = await page.$$('#projects_list > div > div > div');

	for(const rawProject of rawProjects){

		const url = await page.evaluate(ele => ele.querySelector('div > div > div > div.relative.self-start > a').getAttribute('href'), rawProject);
		const title = await page.evaluate(ele => ele.querySelector('div.h30.pt4.px3.mb1px > div > a > h3').textContent, rawProject);
//		const thumbnail_img = await page.evaluate(ele => ele.querySelector('div.relative.self-start > a > img').getAttribute('src'), rawProject);
//		const badge = await page.evaluate(ele => ele.querySelector('div.h30.pt4.px3.mb1px > div > a > h3').textContent, rawProject);
//		const subtitle = await page.evaluate(ele => ele.querySelector('div.h30.pt4.px3.mb1px > div.clamp-5.navy-500.mb3.hover-target > a > p').textContent, rawProject);
//		const byWhom = await page.evaluate(ele => ele.querySelector('div.h30.pt4.px3.mb1px > div.type-13.flex > div > a').textContent, rawProject);
//		const amountOfFunded = await page.evaluate(ele => ele.querySelector('div.pb3.pt3.px3-sm.px4 > div.ksr-green-700.medium > div:nth-child(1) > span:nth-child(1)').textContent, rawProject);
//		const rateOfFunded = await page.evaluate(ele => ele.querySelector('div.pb3.pt3.px3-sm.px4 > div.ksr-green-700.medium > div:nth-child(2) > span:nth-child(1)').textContent, rawProject);
//		const daysToGo = await page.evaluate(ele => ele.querySelector('div.pb3.pt3.px3-sm.px4 > div.ksr-green-700.medium > div.type-13.ksr_page_timer.mb3.mr2.dark-grey-500.medium > span.js-num').textContent, rawProject);
//		const category = await page.evaluate(ele => ele.querySelector('div.pb3.pt3.px3-sm.px4 > div.ksr-green-700.medium > div.flex > a:nth-child(1)').textContent, rawProject);
//		const place = await page.evaluate(ele => ele.querySelector('div.pb3.pt3.px3-sm.px4 > div.ksr-green-700.medium > div.flex > a:nth-child(2)').textContent, rawProject);

		results.push({
			url: url,
			title: title,
//			thumbnail_img: thumbnail_img,
//			subtitle: subtitle,
//			byWhom: byWhom,
//			amountOfFunded: amountOfFunded,
//			rateOfFunded, rateOfFunded,
//			daysToGo: daysToGo,
//			category: category,
//			place: place,
		})
	}

	await browser.close(); // ➐ 작업이 완료되면 브라우저 종료
	return results;
}


const showMeTheMoney = async (countPage) => {

	let result = [];
	for(let i=1; i<=countPage; i++){
		//result.push(await getTargetObject(categoryInfo[0].categoryId, 'magice', i))
		const spreadThis = await getTargetObject(categoryInfo[0].categoryId, 'magice', i);
		result = [...result, ...spreadThis];
	}
//	console.log(JSON.stringify(result));

	const now = new Date().toLocaleString().replace(/\//g, '_');
//	fs.mkdir(`/home/sy/kickstarter/log/${now}`, err => console.log(err))
//	fs.writeFile(`/home/sy/kickstarter/log/${now}/targets.json`, JSON.stringify(result), 'utf8', err => console.error(err))


	fs.writeFile(`/home/sy/kickstarter/log/targets.json`, JSON.stringify(result), 'utf8', err => console.error(err));

	//fs.writeFile(`/home/sy/kickstarter/log/targets_${now}.json`, JSON.stringify(result), 'utf8', err => console.error(err));
}

showMeTheMoney(process.argv[2]);

// 필터를 magic말고 다른걸로 하면 값이 바뀌는지 확인 해야 한다. 영향이 있는 변수로 판명되면 이것 또한 파라미터로 받는 방식이 좋을 듯.
// 필터 외에도 categoryId를 어떤 방식으로든 파라미터로 받아오는 것이 좋다. 프로그램의 사용 방법을 어떻게 정하느냐에 달렸다.

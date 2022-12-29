exports.globalVariable = {
	browserOptions: {
		executablePath: '/opt/google/chrome/google-chrome',
        ignoreHTTPSErrors: true,
		args: [
			'--disable-web-security',
			//'--proxy-server=http://smartproxy.crawlbase.com:8012'
//			'--disable-gpu', 
//			'--disable-setuid-sandbox',
//			'--no-sandbox',
//			'--no-zygote'
		],

		defaultViewport: {width: 1366 + Math.floor(Math.random() *50), height: 768 + Math.floor(Math.random() *50)},
		headless: false
	},
	randomTime: {
		fifteenSec: (Math.floor(Math.random() *10) + 10) *1000 /10,		//	15 sec
		halfMin: (Math.floor(Math.random() *10) + 25) *1000 /30,		//	30 sec
		twoMin: (Math.floor(Math.random() *10) + 120) *1000,		//	2  min
		fiveMin: (Math.floor(Math.random() *10) + 300) *1000,		//	5  min
		fifteenMin: (Math.floor(Math.random() *10) + 1500) *1000,	//  15 min
	},
	proxyInfo: {
		name: '',
		pw: '',

	},
	now: () => {return new Date().toLocaleString()},
	motherUrls : [
		'https://www.kickstarter.com/discover/advanced?category_id=1&sort=magic&seed=2781390&page=1',
		'https://www.kickstarter.com/discover/advanced?category_id=3&sort=magic&seed=2781390&page=1',
		'https://www.kickstarter.com/discover/advanced?category_id=26&sort=magic&seed=2781390&page=1',
		'https://www.kickstarter.com/discover/advanced?category_id=6&sort=magic&seed=2781390&page=1',
		'https://www.kickstarter.com/discover/advanced?category_id=7&sort=magic&seed=2781390&page=1',
		'https://www.kickstarter.com/discover/advanced?category_id=9&sort=magic&seed=2781390&page=1',
		'https://www.kickstarter.com/discover/advanced?category_id=11&sort=magic&seed=2781390&page=1',
		'https://www.kickstarter.com/discover/advanced?category_id=10&sort=magic&seed=2781390&page=1',
		'https://www.kickstarter.com/discover/advanced?category_id=12&sort=magic&seed=2781390&page=1',
		'https://www.kickstarter.com/discover/advanced?category_id=13&sort=magic&seed=2781390&page=1',
		'https://www.kickstarter.com/discover/advanced?category_id=14&sort=magic&seed=2781390&page=1',
		'https://www.kickstarter.com/discover/advanced?category_id=15&sort=magic&seed=2781390&page=1',
		'https://www.kickstarter.com/discover/advanced?category_id=18&sort=magic&seed=2781390&page=1',
		'https://www.kickstarter.com/discover/advanced?category_id=16&sort=magic&seed=2781390&page=1',
		'https://www.kickstarter.com/discover/advanced?category_id=17&sort=magic&seed=2781390&page=1'
	]
}

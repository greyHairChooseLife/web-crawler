exports.globalVariable = {
	browserOptions: {
		executablePath: '/opt/google/chrome/google-chrome',
		//args: ['--disable-web-security'],
		args:[], 
		defaultViewport: {width: 1366, height: 768},
		headless: false
	},
	randomTime: {
		fifteenSec: (Math.floor(Math.random() *10) + 10) *1000,		//	15 sec
		halfMin: (Math.floor(Math.random() *10) + 25) *1000,		//	30 sec
		twoMin: (Math.floor(Math.random() *10) + 120) *1000,		//	2  min
		fiveMin: (Math.floor(Math.random() *10) + 300) *1000,		//	5  min
		fifteenMin: (Math.floor(Math.random() *10) + 1500) *1000,	//  15 min
	}
}

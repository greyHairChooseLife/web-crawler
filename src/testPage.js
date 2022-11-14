const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const userAgent = require('user-agents');
const {globalVariable} = require('./public/global');

const live = async (url) => {
	const browser = await puppeteer.launch({executablePath: globalVariable.browserPath,
	//	userDataDir: '/home/sy/.config/google-chrome/Default', 
		args:[
		//`--proxy-server=${proxy[Math.floor(Math.random()*10 % proxy.length)]}`
	], 
		defaultViewport: {width: 1366, height: 768},
		headless: false, }); 
	const page = await browser.newPage();     
	await page.setUserAgent(userAgent.random().toString());
	await page.setBypassCSP(true)

	await page.goto(url, { waitUntil: 'networkidle0', });

	try{
		const fromHeaderAndCreator = await page.$eval('#react-proj', ele => {
			//	data-initial 속성에 필요한 데이터를 로드 해 놓아서 활용한다.
			const dataInitialObj = JSON.parse(ele.getAttribute('data-initial'));

			return dataInitialObj
		});
	}catch(err){

 await page.evaluate(() => {
    (() => {
      const box = document.createElement('div');
      box.classList.add('mouse-helper');
      const styleElement = document.createElement('style');
      styleElement.innerHTML = `
          .mouse-helper {
            pointer-events: none;
            position: absolute;
            z-index: 100000;
            top: 0;
            left: 0;
            width: 20px;
            height: 20px;
            background: rgba(0,0,0,.4);
            border: 1px solid white;
            border-radius: 10px;
            margin-left: -10px;
            margin-top: -10px;
            transition: background .2s, border-radius .2s, border-color .2s;
          }
          .mouse-helper.button-1 {
            transition: none;
            background: rgba(0,0,0,0.9);
          }
          .mouse-helper.button-2 {
            transition: none;
            border-color: rgba(0,0,255,0.9);
          }
          .mouse-helper.button-3 {
            transition: none;
            border-radius: 4px;
          }
          .mouse-helper.button-4 {
            transition: none;
            border-color: rgba(255,0,0,0.9);
          }
          .mouse-helper.button-5 {
            transition: none;
            border-color: rgba(0,255,0,0.9);
          }
          `;
      document.head.appendChild(styleElement);
      document.body.appendChild(box);
      document.addEventListener('mousemove', event => {
        box.style.left = event.pageX + 'px';
        box.style.top = event.pageY + 'px';
        updateButtons(event.buttons);
      }, true);
      document.addEventListener('mousedown', event => {
        updateButtons(event.buttons);
        box.classList.add('button-' + event.which);
      }, true);
      document.addEventListener('mouseup', event => {
        updateButtons(event.buttons);
        box.classList.remove('button-' + event.which);
      }, true);
      function updateButtons(buttons) {
        for (let i = 0; i < 5; i++)
          box.classList.toggle('button-' + i, !!(buttons & (1 << i)));
      }
    })();
  });

		let clickElement = await page.$('#px-captcha')
		let clickArea = await clickElement.boundingBox()
		console.log('got it: ', clickElement, clickArea)
		console.log(clickArea.x + clickArea.width /2, clickArea.y + clickArea.height / 2)

		//await page.mouse.move(clickArea.x + clickArea.width /2, clickArea.y + clickArea.height / 2)
		await page.mouse.move(clickArea.x + clickArea.width /2, 500)
		await page.mouse.down()
		await page.waitForTimeout(10*1000)
		await page.mouse.up()
		await page.waitForTimeout(3*1000)
	}

//	await browser.close(); // ➐ 작업이 완료되면 브라우저 종료
//
//	return fromHeaderAndCreator
}

(
	async () => {
		const url = 'https://www.kickstarter.com/projects/647399795/patella-crescenda-grow-your-own-fresh-super-food-all-year';

		const result = await live(url);
		//return result
	}
)()

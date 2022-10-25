const puppeteer = require('puppeteer');

const baseURL = 'https://www.kickstarter.com';

const getMainCategory = async () => {
	const browser = await puppeteer.launch(); 
	const page = await browser.newPage();     

	await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36');

	await page.goto(baseURL, {
		// ❸ 모든 네트워크 연결이 500ms 이상 유휴 상태가 될 때까지 기다림
		waitUntil: 'networkidle0',
	});

	const result = await page.$$eval('#index-container > div > div > div:nth-child(1) > div > div > div > nav > ul > li > a', eles => {
		return eles.map(ele => {
			return {
				name: ele.textContent,
				queryString: ele.getAttribute('href'),
			}
		})
	});
	await browser.close(); // ➐ 작업이 완료되면 브라우저 종료
	return result;
}

//	왜인지 모르겠으나 오류가 난다. 첫번 째 page.goto()메소드는 정상 작동하지만 두번 째 부터는 0을 반환하거나 무한 로딩된다.
const getSubCategory = async (mainCategory) => {
	const browser = await puppeteer.launch(); 
	let page = await browser.newPage();     
	//await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36');

	const result = [];

	for(let i=0; i<mainCategory.length; i++){
		page = await browser.newPage();     
		await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36');
		console.log(`try count ${i}: `, mainCategory[i].queryString);
		const pageUrl = baseURL + mainCategory[i].queryString;
		await page.goto(pageUrl, {
			waitUntil: 'networkidle0',
		});
		const subResult = await page.$$eval('#index-container > div > div > div:nth-child(2) > div > section > div > a', eles => {
			return eles.map(ele => {
				return {
					subName: ele.textContent,
					url: ele.getAttribute('href')
				}
			})
		})
		result.push(subResult);
	}

	await browser.close(); // ➐ 작업이 완료되면 브라우저 종료

	return result;
}

const getSubCategory_v2 = async (mainCategory) => {
	const browser = await puppeteer.launch(); 
	const page = await browser.newPage();     
	await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36');

	const pageUrl = baseURL + mainCategory.queryString;
	await page.goto(pageUrl, {
		waitUntil: 'networkidle0',
	});
	const result = await page.$$eval('#index-container > div > div > div:nth-child(2) > div > section > div > a', eles => {
		return eles.map(ele => {
			return {
				subName: ele.textContent,
				url: ele.getAttribute('href')
			}
		})
	})

	await browser.close(); // ➐ 작업이 완료되면 브라우저 종료

	return result;
}

const getEndpoint = async (url) => {
	//	크로미움에서만 Load more 버튼이 정상 작동 않는 것인지 확인하기 위해서 google-chrome-stable로 테스트 해 보았으나, 여전히 크로미움이 켜 진다.
//	const browser = await puppeteer.launch({
//		headless: false,
//		executablePath: '/usr/bin/google-chrome-stable'
//	}); 

	const browser = await puppeteer.launch({
		headless: false,
	}); 
	const page = await browser.newPage();     
	await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36');
	await page.goto(url, {
		waitUntil: 'networkidle0',
	});

	//	last trial
	//	1st try
//	await Promise.all([
//		page.waitForNavigation({ waitUntil: 'networkidle0' }),
//		page.click('#projects > div.load_more.mt3 > a')
//	]);

	//	2nd try
//	await page.click('#projects > div.load_more.mt3 > a')
//	await page.waitForTimeout(10000);

	//	3rd try
//	await page.mouse.wheel({deltaY: +1000});
//	await page.click('#projects > div.load_more.mt3 > a');
//	await page.mouse.wheel({deltaY: +1000});
//	await page.waitForSelector('#projects_list > div:nth-child(3)');

	//	4th try
//	await page.click('#projects > div.load_more.mt3 > a');
//	for(let i=3; i<6; i++){
//		console.log('proceed: ', i);
//		const prevScrollHeight = await page.evaluate('document.body.scrollHeight');
//		await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
//		await page.waitForFunction(`document.body.scrollHeight > ${prevScrollHeight}`)
//		await page.waitForSelector(`#projects_list > div:nth-child(${i})`);
//	}
	//	headless: false로 켜지는 크로미움을 눈으로 확인 해 보면 load more 버튼을 클릭하긴 한다.
	//	그러나 왜인지 다음 내용들이 로딩 되지는 않는다...

	const result = page.url();

	//await browser.close(); // ➐ 작업이 완료되면 브라우저 종료

	return result;
}


const showMeTheMoney = async () => {
	const mainCategory = await getMainCategory();

	//const subCategory = await getSubCategory(mainCategory);	//	fail

	const subCategory = [];
//	for(let i=0; i<mainCategory.length; i++){		// temp
	for(let i=0; i<1; i++){
		subCategory.push(await getSubCategory_v2(mainCategory[i]));
	}

	const a_total_of_url = subCategory.reduce((prev, curr) => {return prev += curr.length}, 0);
	console.log(`"There are ${mainCategory.length} main-category, and a total of ${a_total_of_url} sub-category."`)
	console.log('parameter: ', subCategory[0][0].url)

	const finDestination = await getEndpoint(subCategory[0][0].url);
	console.log('go to: ', finDestination);
}

showMeTheMoney();

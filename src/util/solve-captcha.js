async function solveCaptchar(page) {
	let isExecuted = false;
	try {
		let clickElement = await page.$('#px-captcha');

		let clickArea = await clickElement.boundingBox();
		isExecuted = true;
		//
		//await page.mouse.move(clickArea.x + clickArea.width /2, clickArea.y + clickArea.height / 2)
		await page.mouse.move(350, 250);
		await page.mouse.down();
		await page.waitForTimeout(20*1000);
		await page.mouse.up();
		await page.waitForTimeout(10*1000);
		await page.reload({ waitUntil: 'networkidle0', });
	} catch(err) {
	} finally {
		if(isExecuted) console.log('solveCaptcha executed!\nmouse down: 20sec\nmouse up and wait for time: 10sec');
	}
};

module.exports = {solveCaptchar};

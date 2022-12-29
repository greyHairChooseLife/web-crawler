async function solveCaptchar(page, tryCount) {
	return
	if(tryCount !== undefined && tryCount > 10) return		//	10회까지만 시도하자. 실패하면 브라우저 종료로 이어진다.
	if(await page.$('#px-captcha') !== null) {
		if(tryCount === undefined) tryCount = 2;
		else tryCount++;

		const randomNumber = Math.floor(Math.random() *10);

		try {
//			let clickElement = await page.$('#px-captcha');
//
//			let clickArea = await clickElement.boundingBox();
//			isExecuted = true;
			//
			//await page.mouse.move(clickArea.x + clickArea.width /2, clickArea.y + clickArea.height / 2)
			await page.mouse.move(350 + randomNumber, 250 + randomNumber);
			await page.mouse.down();
			await page.waitForTimeout((20 +randomNumber /2) *1000);
			await page.mouse.up();
			await page.waitForTimeout((10 +randomNumber /2) *1000);
			await page.reload({ waitUntil: 'networkidle0', });
		} catch(err) {
		} finally {
			console.log('solveCaptcha executed!\nmouse down: 20sec +random\nmouse up and wait for time: 10sec +random');
			await solveCaptchar(page, tryCount);
		}
	}
};

module.exports = {solveCaptchar};

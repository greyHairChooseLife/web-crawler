async function solveCaptchar(page) {
	try {
		let clickElement = await page.$('#px-captcha')
		let clickArea = await clickElement.boundingBox()

		//await page.mouse.move(clickArea.x + clickArea.width /2, clickArea.y + clickArea.height / 2)
		await page.mouse.move(350, 250)
		await page.mouse.down()
		await page.waitForTimeout(20*1000)
		await page.mouse.up()
		await page.waitForTimeout(10*1000)
		await page.reload({ waitUntil: 'networkidle0', })
	} catch(err) {
		console.log('Captcha solver failed and invoke Error. :(\nGo check it out! Error below: \n')
		console.error(err)
	} finally {
		console.log('solveCaptcha finished!')
	}
};

module.exports = {solveCaptchar};

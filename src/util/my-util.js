function numberize(str) {
	return Number(str.split('').reduce((prev, curr) => {
		if(curr.charCodeAt(0) >= 48 && curr.charCodeAt(0) <= 57) return prev+curr
		else return prev
	}, ''))
}

async function waitTime(randomDelay) {
	new Promise((resolve) => setTimeout(resolve, randomDelay))	//	setTimeout() 함수가 강제로 프로미스를 반환하도록 만들어준다. 원래는 await 못씀.
}


module.exports = {numberize, waitTime};

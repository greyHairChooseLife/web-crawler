const {categoryPool} = require('./categoryPool');
const readline = require('readline');
const rl = readline.createInterface({input: process.stdin, output: process.stdout});

rl.question('카테고리 아이디를 입력 해 주세요: ', async userAnswer => {
	const nested = categoryPool.reduce((prev, curr) => {
		if(curr.mainCategory === userAnswer) prev.push(curr)

		return prev
	}, [])

	console.table(nested)
})

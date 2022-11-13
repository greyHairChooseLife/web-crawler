const {categoryPool} = require('./categoryPool');
const rl = readline.createInterface({input: process.stdin, output: process.stdout});

const nested = categoryPool.reduce((prev, curr) => {
	if(curr.mainCategory === 'Art') prev.push(curr)

	return prev
}, [])

(
	() => {
		rl.
	}
)()
console.log(nested.length)


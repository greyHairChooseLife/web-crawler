const categoryPool = require('./categoryPool').data
//console.log(categoryPool)
const readline = require('readline');
const rl = readline.createInterface({input: process.stdin, output: process.stdout});

const mainCategory = categoryPool
	.map((ele, idx) => {
		return {...ele, id: idx}
	})
	.reduce((prev, curr) => {
		const isAlreadyFound = prev.find(ele => ele['메인 카테고리'] === curr.mainCategory)
		if(!isAlreadyFound) prev.push({'메인 카테고리': curr.mainCategory, '분류번호': curr.id})

		return prev
	}, []);

console.table(mainCategory);

const app = () => {
	rl.question('\n분류 번호를 입력하세요: ', async userAnswer => {

		let selectedMainCategory;
		switch(userAnswer) {
			case '0':
				selectedMainCategory = 'Art'
				break;
			case '13':
				selectedMainCategory = 'Comics'
				break;
			case '18':
				selectedMainCategory = 'Crafts'
				break;
			case '31':
				selectedMainCategory = 'Dance'
				break;
			case '35':
				selectedMainCategory = 'Design'
				break;
			case '42':
				selectedMainCategory = 'Fashion'
				break;
			case '50':
				selectedMainCategory = 'Film&Video'
				break;
			case '69':
				selectedMainCategory = 'Food'
				break;
			case '81':
				selectedMainCategory = 'Games'
				break;
			case '88':
				selectedMainCategory = 'Journalism'
				break;
			case '93':
				selectedMainCategory = 'Music'
				break;
			case '111':
				selectedMainCategory = 'Photography'
				break;
			case '117':
				selectedMainCategory = 'Publishing'
				break;
			case '134':
				selectedMainCategory = 'Technology'
				break;
			case '149':
				selectedMainCategory = 'Theater'
				break;
			default:
				console.log('\n없는 분류번호입니다.\n')
				rl.close();
		}

		const nested = categoryPool
			.reduce((prev, curr) => {
			if(curr.mainCategory === selectedMainCategory) prev.push(curr)

			return prev
			}, [])
			.map(ele => {
				let result = {
					...ele,
					categoryId: Number(ele.categoryId)
				}

				result = {...result, '진행률(%)': ele.numberOfProject !== 0 ? Math.floor(ele.numberOfScraped / ele.numberOfProject *100) : 0}

				if(ele.numberOfProject !== 0 && ele.numberOfScraped !== ele.numberOfProject) result = {...result, '예상 소요시간(h)': Math.floor((ele.numberOfProject - ele.numberOfScraped)*2/60)}

				return result
			})

		if(nested.length !== 0) {
			console.log('\n\n')
			console.table(nested)
			console.log('\n\n')
			console.log('크롤링을 시작하려면 아래와 같이 실행 해 주세요.\n\n\n', new Array(5).join(' '), 'node app.js 위_테이블의_categoryId_번호\n\n', new Array(5).join(' '),'ex) node app.js 35', '\n\n')
			console.log('또는 메인 카테고리를 선택하여 포함된 모든 세부 카테고리를 수집할 수 있습니다.\n\n\n', new Array(5).join(' '), 'node app.js 맨_위_테이블의_분류번호 all\n\n', new Array(5).join(' '),'ex) node app.js 0 all', '\n\n')
		}

		rl.close()
	})
}

app();

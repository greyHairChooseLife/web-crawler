const CATEGORY_POOLS = require('./categoryPool').data;

//	find and match selected category number from total pools
const selectedPool = CATEGORY_POOLS.find(ele => ele.subCategoryID === Number(process.argv[2]));
if(!process.argv[2]) {
	console.table(CATEGORY_POOLS.map(ele => {return {
		main_category: ele.mainCategory,
		sub_category: ele.subCategory,
		sub_category_id: ele.subCategoryID,
	}}));
	console.log('다음 중 하나의 sub_category_id를 입력하세요.');
	console.log('\nex)\tnode checkProgress.js 331\n');
	process.exit(1);
} else if(selectedPool === undefined) {
	console.log('존재하지 않는 서브 카테고리 아이디입니다.');
	process.exit(1);
}

//	get targets
let targets;
try{
	targets = require(`../SCRAPED_RAW_DATA/${selectedPool.subCategory}/targets`).data;
}catch(err) {
	console.log('아직 조사되지 않은 카테고리입니다.')
	process.exit(1);
}

const targetData = targets[process.argv[3]].data;

console.log(JSON.parse(targetData))

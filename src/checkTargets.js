const CATEGORY_POOLS = require('./categoryPool').data;
const fs = require('fs')

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

//	count it

let numberPageData = 0;

for(let fileIdx=0; fileIdx<targets.length; fileIdx++) {
	try {
		fs.readFileSync(`../SCRAPED_RAW_DATA/${selectedPool.subCategory}/${fileIdx}/commentData.js`);
		numberPageData++;
	}catch(err) {
	}
}


console.log('ppp: ', numberPageData);




//const completeCount = targets.reduce((prev, curr) => {
//	if(curr.isDone.pageData && curr.isDone.commentData && curr.isDone.updateData) {
//		prev.page = prev.page+1;
//		prev.comment = prev.comment+1;
//		prev.update = prev.update+1;
//		prev.allDone = prev.allDone+1;
//	} else {
//		if(curr.isDone.pageData) prev.page = prev.page+1;
//		if(curr.isDone.commentData) prev.comment = prev.comment+1;
//		if(curr.isDone.updateData) prev.update = prev.update+1;
//	}
//	return prev
//}, {page: 0, comment: 0, update: 0, allDone: 0})
//
////	extract upcompleted
//
//
//
////	final object to show
//
//const main = {
//	sub_category_id: selectedPool.subCategoryID,
//	main_category: selectedPool.mainCategory,
//	sub_category: selectedPool.subCategory,
//	number_of_project: targets.length,
//	number_of_scraped: completeCount.allDone,
//	totalProgress: Math.floor(completeCount.allDone /targets.length *100) + '%',
//	detailProgress: Math.floor((completeCount.page + completeCount.comment + completeCount.update) /3 /targets.length *100) + '%',
//};
//const detail = {
//	PAGE: completeCount.page,
//	page_progress: Math.floor(completeCount.page /targets.length *100) + '%',
//	COMMENT: completeCount.comment,
//	comment_progress: Math.floor(completeCount.comment /targets.length *100) + '%',
//	UPDATE: completeCount.update,
//	update_progress: Math.floor(completeCount.update /targets.length *100) + '%',
//};
//
//console.log('\nmain')
//console.table([main])
//console.log('\ndetail')
//console.table([detail])
//console.log('\n')

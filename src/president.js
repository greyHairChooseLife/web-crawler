const {crawlSubcategory} = require('./run');


(
	async () => {
		
		const subCategoryId = process.argv[2];

		const roll = new Array(Number(process.argv[3]));

		const [value, range] = process.argv[4].split('of');
		
		let n = 0;
		for (const _ of roll) {
			n++;
			try {
				console.log('[', n, ']번째 시도 입니다...\n\n')
				await crawlSubcategory(subCategoryId, +range, +value);
			}
			catch(err) {
				console.log('[', n, ']번째 시도가 실패했습니다.. :(\n\n')
				console.error(err)
			}
		}

	}
)()

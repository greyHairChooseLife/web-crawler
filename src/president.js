const {crawlSubcategory} = require('./run');


(
	async () => {
		
		const subCategoryId = process.argv[2];

		const roll = new Array(process.argv[3]);
		
		let n = 0;
		for (const _ of roll) {
			n++;
			try {
				console.log('[', n, ']번째 시도 입니다...\n\n')
				await crawlSubcategory(subCategoryId);
			}
			catch(err) {
				console.log('[', n, ']번째 시도가 실패했습니다.. :(\n\n')
				console.error(err)
			}
		}

	}
)()

const {crawlSubcategory} = require('./run');


(
	async () => {
		
		const subCategoryId = process.argv[2];

		const roll = new Array(2);
		
		let n = 1;
		for (const _ of roll) {
			try {
				console.log('[', n++, ']번째 시도 입니다...\n\n')
				await crawlSubcategory(subCategoryId);
			}
			catch(err) {
				console.log('[', n++, ']번째 시도가 실패했습니다.. :(\n\n')
				console.error(err)
			}
		}

	}
)()

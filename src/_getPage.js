const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const userAgent = require('user-agents');
const {globalVariable} = require('./public/global');

const util = require('util');

const now = new Date().toLocaleString();
const waitRandom = (randomDelay) => new Promise((resolve) => setTimeout(resolve, randomDelay))	//	setTimeout() 함수가 강제로 프로미스를 반환하도록 만들어준다. 원래는 await 못씀.
const getRandom = () => {return Math.floor(Math.random() * 20)}


async function fromLiveFailCancel(url) {
	const browser = await puppeteer.launch(globalVariable.browserOptions);
	const page = await browser.newPage();     
	await page.setUserAgent(userAgent.random().toString());
	await page.setBypassCSP(true)

	try{

	//	page.goto
	//	page.goto
	//	page.goto
	await page.goto(url, { waitUntil: 'networkidle0', });

	const fromHeaderAndCreator = await page.$eval('#react-project-header', ele => {
		//	data-initial 속성에 필요한 데이터를 로드 해 놓아서 활용한다.
		const dataInitialObj = JSON.parse(ele.getAttribute('data-initial'));

		const commentable_id = dataInitialObj.project.id;
		const slug = dataInitialObj.project.slug;
		const project_url = dataInitialObj.project.url;
		const project_name = dataInitialObj.project.name;
		const project_description = dataInitialObj.project.description;
		const project_imageURL = dataInitialObj.project.imageUrl;
		const rate_of_funded = dataInitialObj.project.percentFunded;
		const number_of_backers = dataInitialObj.project.backersCount;
		const deadline = dataInitialObj.project.deadlineAt;
		const category = dataInitialObj.project.category.name;
		const location = dataInitialObj.project.location.displayableName;
		const currency_type = dataInitialObj.project.currency;
		const currency_symbol = dataInitialObj.project.goal.symbol;
		const amount_of_goal = dataInitialObj.project.goal.amount;
		const amount_of_pledged = dataInitialObj.project.pledged.amount;
		const project_we_love = dataInitialObj.project.isProjectWeLove;

		const creator_name = dataInitialObj.project.creator.name;
		const creator_location = dataInitialObj.project.creator.location.displayableName;
		const creator_description = dataInitialObj.project.creator.biography;
		const creator_verifiedIdentity = dataInitialObj.project.verifiedIdentity;
		const creator_last_login = dataInitialObj.project.creator.lastLogin;
		const creator_connected_to_facebook = dataInitialObj.project.creator.isFacebookConnected;
		const creator_number_of_created_project = dataInitialObj.project.creator.launchedProjects.totalCount;
		const creator_number_of_backed_project = dataInitialObj.project.creator.backingsCount;
		const creator_number_of_collaborators = dataInitialObj.project.collaborators.edges.length;
		const creator_contents_of_collaborators = dataInitialObj.project.collaborators.edges;
		const creator_number_of_attatched_links = dataInitialObj.project.creator.websites.length;
		const creator_contents_of_attatched_links = dataInitialObj.project.creator.websites;
		const creator_image = dataInitialObj.project.creator.imageUrl;
		const creator_url = dataInitialObj.project.creator.url;

		const days_to_go = ele.querySelector('span.block.type-16.type-28-md.bold.dark-grey-500')?.textContent

		const all_or_nothing = ele.querySelector('div > div.grid-container.flex.flex-column > div.grid-row.order2-md.hide-lg.mb3-md > div > div > p > span.link-soft-black.medium > a')?.textContent === 'All or nothing.' ? true : false;

		return {
			commentable_id: commentable_id,
			slug: slug,
			project_url: project_url,
			project_name: project_name,
			project_description: project_description,
			project_imageURL: project_imageURL,
			rate_of_funded: rate_of_funded,
			number_of_backers: number_of_backers,
			deadline: deadline,
			category: category,
			location: location,
			currency_type: currency_type,
			currency_symbol: currency_symbol,
			amount_of_goal: amount_of_goal,
			amount_of_pledged: amount_of_pledged,
			project_we_love: project_we_love,

			creator_name: creator_name,
			creator_location: creator_location,
			creator_description: creator_description,
			creator_verifiedIdentity: creator_verifiedIdentity,
			creator_last_login: creator_last_login,
			creator_connected_to_facebook: creator_connected_to_facebook,
			creator_number_of_created_project: creator_number_of_created_project,
			creator_number_of_backed_project: creator_number_of_backed_project,
			creator_number_of_collaborators: creator_number_of_collaborators,
			creator_contents_of_collaborators: creator_contents_of_collaborators,
			creator_number_of_attatched_links: creator_number_of_attatched_links,
			creator_contents_of_attatched_links: creator_contents_of_attatched_links,
			creator_image: creator_image,
			creator_url: creator_url,

			days_to_go: days_to_go,
			all_or_nothing: all_or_nothing
		}
	});

	let project_profile_background_imageURL;
	try{
		project_profile_background_imageURL = await page.$eval('#content-wrap > section > div.project-profile__background > div.project-profile__background.js-profile-background-image', ele => {
			const data_ = ele.getAttribute('style');
			return data_.split(`url('`)[1].split(`')`)[0];
		});
	}catch(err){
	}

	let last_updated;
	try{
		last_updated =await page.$eval('#react-project-header > div > div > div.grid-row.order2-md.hide-lg.mb3-md > div > div.flex.items-center.mt4 > span > a', ele => ele.textContent)
	}catch(err){
		console.log('last_updated를 찾을 수 없습니다.');
	}

	//	issue2에 대응하기 위해 outerHTML로 데이터를 가져온다.
	const fromCampaign = await page.$eval('#react-campaign', ele => {
		const page_of_story = ele.querySelector('#story + div.rte__content').outerHTML;
		const page_of_project_budget = ele.querySelector('#project-budget')?.outerHTML;
		const page_of_risks = ele.querySelector('#risks-and-challenges').outerHTML;

		return {
			page_of_story: page_of_story,
			page_of_project_budget: page_of_project_budget,
			page_of_risks: page_of_risks
		}
	});

	const fromOptions = await page.$$('#content-wrap > div.NS_projects__content > section.js-project-content.js-project-description-content.project-content > div > div > div > div.col.col-4.js-rewards-column.max-w62.sticky-rewards > div > div.mobile-hide > div > ol > li');
	const number_of_support_options = fromOptions.length;
	const contents_of_support_options =[];
	for(option of fromOptions){
		contents_of_support_options.push(await page.evaluate(ele => ele.querySelector('div.pledge__info')?.outerHTML, option))
		//	펀딩 옵션에도 제한 수량이 있다. 모두 팔리면 pledge__info클래스를 가진 element는 사라지고 All gone!이라는 textContent만 남는다.
		if(await page.evaluate(ele => ele.querySelector('div.pledge__info')?.outerHTML, option) === undefined) contents_of_support_options.push(await page.evaluate(ele => ele.outerHTML, option))
	}

	let fundingPeriod = {
		start: undefined,
		end: undefined,
		duration: undefined
	}
	try{
		fundingPeriod = await page.$eval('#content-wrap > div.NS_projects__content > section.js-project-content.js-project-description-content.project-content > div > div > div > div.col.col-4.js-rewards-column.max-w62.sticky-rewards > div > div.NS_campaigns__funding_period > p', ele => {
			return {
				start: ele.querySelector('time:nth-child(1)').textContent,
				end: ele.querySelector('time:nth-child(2)').textContent,
				duration: ele.textContent.match(/\(.*\)/)[0].split(' ')[0].slice(1) *1
			}
		})
	}catch(err){}

	const number_of_FAQ = await page.$eval('#faq-emoji', ele => { return ele.querySelector('span') ? ele.querySelector('span')?.textContent : '0'});
	const number_of_updates = await page.$eval('#updates-emoji', ele => { return ele.querySelector('span')?.textContent; });
	const number_of_comments_depth_all = await page.$eval('#comments-emoji', ele => { return ele.querySelector('span')?.textContent; });

	const contents_of_FAQ =[];	// FAQ가 존재하지 않는다면 빈 배열로 남는다.
	if(number_of_FAQ !== '0'){
		// instead of click >> page.goto
		// instead of click >> page.goto
		// instead of click >> page.goto
		await waitRandom((getRandom() + 30) * 1000);
		await page.goto(url+'/faqs', { waitUntil: 'networkidle0', });

		try{
			let clickElement = await page.$('#px-captcha')
			let clickArea = await clickElement.boundingBox()

			//await page.mouse.move(clickArea.x + clickArea.width /2, clickArea.y + clickArea.height / 2)
			await page.mouse.move(350, 250)
			await page.mouse.down()
			await page.waitForTimeout(20*1000)
			await page.mouse.up()
			await page.waitForTimeout(10*1000)
			await page.reload({ waitUntil: 'networkidle0', })
		}catch(err){}

		const fromFAQ = await page.$$('#project-faqs > div > div > div.grid-row.mb6.flex.flex-row-sm.flex-column-reverse > ul > li');
		for(question of fromFAQ){
			contents_of_FAQ.push(await page.evaluate(ele => ele.outerHTML, question))
		}
	}

	let community = {
		top_cities_location_1st: undefined,
		top_cities_number_of_backers_1st: undefined,
		top_cities_location_2st: undefined,
		top_cities_number_of_backers_2st: undefined,
		top_cities_location_3st: undefined,
		top_cities_number_of_backers_3st: undefined,
		top_cities_location_4st: undefined,
		top_cities_number_of_backers_4st: undefined,
		top_cities_location_5st: undefined,
		top_cities_number_of_backers_5st: undefined,
		top_cities_location_6st: undefined,
		top_cities_number_of_backers_6st: undefined,
		top_cities_location_7st: undefined,
		top_cities_number_of_backers_7st: undefined,
		top_cities_location_8st: undefined,
		top_cities_number_of_backers_8st: undefined,
		top_cities_location_9st: undefined,
		top_cities_number_of_backers_9st: undefined,
		top_cities_location_10st: undefined,
		top_cities_number_of_backers_10st: undefined,
		top_countries_location_1st: undefined,
		top_countries_number_of_backers_1st: undefined,
		top_countries_location_2st: undefined,
		top_countries_number_of_backers_2st: undefined,
		top_countries_location_3st: undefined,
		top_countries_number_of_backers_3st: undefined,
		top_countries_location_4st: undefined,
		top_countries_number_of_backers_4st: undefined,
		top_countries_location_5st: undefined,
		top_countries_number_of_backers_5st: undefined,
		top_countries_location_6st: undefined,
		top_countries_number_of_backers_6st: undefined,
		top_countries_location_7st: undefined,
		top_countries_number_of_backers_7st: undefined,
		top_countries_location_8st: undefined,
		top_countries_number_of_backers_8st: undefined,
		top_countries_location_9st: undefined,
		top_countries_number_of_backers_9st: undefined,
		top_countries_location_10st: undefined,
		top_countries_number_of_backers_10st: undefined,
		number_of_new_backers: undefined,
		number_of_returning_backers: undefined
	}

	if(await page.$('#community-emoji') !== null){		//	커뮤니티가 존재하지 않는 경우도 있다.
		// instead of click >> page.goto
		// instead of click >> page.goto
		// instead of click >> page.goto
		await waitRandom((getRandom() + 25) * 1000);
		await page.goto(url+'/community', { waitUntil: 'networkidle0', });

		try{
			let clickElement = await page.$('#px-captcha')
			let clickArea = await clickElement.boundingBox()

			//await page.mouse.move(clickArea.x + clickArea.width /2, clickArea.y + clickArea.height / 2)
			await page.mouse.move(350, 250)
			await page.mouse.down()
			await page.waitForTimeout(20*1000)
			await page.mouse.up()
			await page.waitForTimeout(10*1000)
			await page.reload({ waitUntil: 'networkidle0', })
		}catch(err){}

		if(await page.$('div.community-section__small_community') === null){
			const fromCommunityCities = await page.$$eval('div.community-section__locations_cities > div > div > div', eles => {
				return eles.map(ele => {
					return [
						ele.querySelector('div.left').textContent.split('\n\n\n')[0].substring(2) + ' ' + ele.querySelector('div.left').textContent.split('\n\n\n')[1].slice(0, -2),
						ele.querySelector('div.right').textContent.split(' ')[0].substring(2)
					];
				})
			});
			const fromCommunityCountries = await page.$$eval('div.community-section__locations_countries > div > div > div', eles => {
				return eles.map(ele => {
					return [
						ele.querySelector('div.left').textContent.substring(2).slice(0, -2),
						ele.querySelector('div.right').textContent.split(' ')[0].substring(2)
					];
				})
			});
			const number_of_new_backers = await page.$eval('div.new-backers > div.count', ele => ele.textContent * 1)
			const number_of_returning_backers = await page.$eval('div.existing-backers > div.count', ele => ele.textContent * 1)
			community = {
				top_cities_location_1st: fromCommunityCities[0]?.[0],
				top_cities_number_of_backers_1st: fromCommunityCities[0]?.[1],
				top_cities_location_2st: fromCommunityCities[1]?.[0],
				top_cities_number_of_backers_2st: fromCommunityCities[1]?.[1],
				top_cities_location_3st: fromCommunityCities[2]?.[0],
				top_cities_number_of_backers_3st: fromCommunityCities[2]?.[1],
				top_cities_location_4st: fromCommunityCities[3]?.[0],
				top_cities_number_of_backers_4st: fromCommunityCities[3]?.[1],
				top_cities_location_5st: fromCommunityCities[4]?.[0],
				top_cities_number_of_backers_5st: fromCommunityCities[4]?.[1],
				top_cities_location_6st: fromCommunityCities[5]?.[0],
				top_cities_number_of_backers_6st: fromCommunityCities[5]?.[1],
				top_cities_location_7st: fromCommunityCities[6]?.[0],
				top_cities_number_of_backers_7st: fromCommunityCities[6]?.[1],
				top_cities_location_8st: fromCommunityCities[7]?.[0],
				top_cities_number_of_backers_8st: fromCommunityCities[7]?.[1],
				top_cities_location_9st: fromCommunityCities[8]?.[0],
				top_cities_number_of_backers_9st: fromCommunityCities[8]?.[1],
				top_cities_location_10st: fromCommunityCities[9]?.[0],
				top_cities_number_of_backers_10st: fromCommunityCities[9]?.[1],
				top_countries_location_1st: fromCommunityCountries[0]?.[0],
				top_countries_number_of_backers_1st: fromCommunityCountries[0]?.[1],
				top_countries_location_2st: fromCommunityCountries[1]?.[0],
				top_countries_number_of_backers_2st: fromCommunityCountries[1]?.[1],
				top_countries_location_3st: fromCommunityCountries[2]?.[0],
				top_countries_number_of_backers_3st: fromCommunityCountries[2]?.[1],
				top_countries_location_4st: fromCommunityCountries[3]?.[0],
				top_countries_number_of_backers_4st: fromCommunityCountries[3]?.[1],
				top_countries_location_5st: fromCommunityCountries[4]?.[0],
				top_countries_number_of_backers_5st: fromCommunityCountries[4]?.[1],
				top_countries_location_6st: fromCommunityCountries[5]?.[0],
				top_countries_number_of_backers_6st: fromCommunityCountries[5]?.[1],
				top_countries_location_7st: fromCommunityCountries[6]?.[0],
				top_countries_number_of_backers_7st: fromCommunityCountries[6]?.[1],
				top_countries_location_8st: fromCommunityCountries[7]?.[0],
				top_countries_number_of_backers_8st: fromCommunityCountries[7]?.[1],
				top_countries_location_9st: fromCommunityCountries[8]?.[0],
				top_countries_number_of_backers_9st: fromCommunityCountries[8]?.[1],
				top_countries_location_10st: fromCommunityCountries[9]?.[0],
				top_countries_number_of_backers_10st: fromCommunityCountries[9]?.[1],
				number_of_new_backers: number_of_new_backers,
				number_of_returning_backers:number_of_returning_backers 
			}
		}
	}

	await browser.close(); // ➐ 작업이 완료되면 브라우저 종료

	return {
		createdAt: now,
		...fromHeaderAndCreator,
		...fromCampaign,
		number_of_support_options: number_of_support_options,
		contents_of_support_options: contents_of_support_options,
		number_of_FAQ: number_of_FAQ,
		number_of_updates: number_of_updates,
		number_of_comments_depth_all: number_of_comments_depth_all,
		contents_of_FAQ: contents_of_FAQ,
		...community,
		project_profile_background_imageURL: project_profile_background_imageURL,
		last_updated: last_updated,
		...fundingPeriod,
	}

	}catch(err){}
	finally{
		browser.close(); // ➐ 작업이 완료되면 브라우저 종료
	}

},
	submitted: async (url) => {
		const browser = await puppeteer.launch({executablePath: globalVariable.browserPath,
		//	userDataDir: '/home/sy/.config/google-chrome/Default', 
			args:[
			//`--proxy-server=${proxy[Math.floor(Math.random()*10 % proxy.length)]}`
		], 
		defaultViewport: {width: 1366, height: 768},
			headless: false, }); 
		const page = await browser.newPage();     
		await page.setUserAgent(userAgent.random().toString());
		await page.setRequestInterception(true)
		await page.setBypassCSP(true)

		try{

		let count = 0;
		let xcsrfToken;
		const slugMake = url.split('/');
		const slug = slugMake[slugMake.length-2] + '/' + slugMake[slugMake.length-1];

		await page.on('request', async request => {
			if(request.url().includes('/graph') && request.method() === 'POST'){
				xcsrfToken = await request.headers()["x-csrf-token"];
				switch(count){
					case 0:		//	getComments	
						await request.continue({
							headers: {
								...request.headers(),
								"x-csrf-token": xcsrfToken,
								'User-Agent': userAgent.random().toString()
							},
							method: 'POST',
							postData: JSON.stringify({
								"query": `
									query PrelaunchPage($slug: String!) {
										project(slug: $slug) {
											id
											name
											location {
												discoverUrl
												displayableName
												countryName
												__typename
											}
											state
											description
											url
											imageUrl(width: 1000)
											prelaunchActivated
											isWatched
											watchesCount
											category {
												url
												name
												parentCategory {
													name
													__typename
												}
												__typename
											}
											verifiedIdentity
											creator {
												id
												name
												slug
												hasImage
												imageUrl(width: 48)
												url
												biography
												backingsCount
												isFacebookConnected
												lastLogin
												websites {
													url
													domain
													__typename
												}
												launchedProjects {
													totalCount
													__typename
												}
												location {
													displayableName
													__typename
												}
												__typename
											}
											collaborators {
												edges {
													node {
														name
														url
														imageUrl(width: 48)
														__typename
													}
													title
													__typename
												}
												__typename
											}
											__typename
										}
									}`,
								"variables": {
									"slug": slug
								}
							}),
						})
						count++;
						break;
					default:
						request.abort();
				}
			}else{
				await request.continue()
			}
		})

		let result;
		await page.on('response', async response => {
			// Ignore OPTIONS requests
			if(response.request().method() !== 'POST') return
			if(response.url().includes('/graph')) {
				const data = await response.json()
				try{
					result = {
						project_url: data.data.project.url,
						project_imageURL: data.data.project.imageUrl,
						project_name: data.data.project.name,
						project_description: data.data.project.description,
						category: data.data.project.category.name,
						location: data.data.project.location.displayableName,
						numberOfFollowers: data.data.project.watchesCount,

						creator_name: data.data.project.creator.name,
						creator_location: data.data.project.creator.location.displayableName,
						creator_description: data.data.project.creator.biography,
						creator_verifiedIdentity: data.data.project.verifiedIdentity,
						creator_last_login: data.data.project.creator.lastLogin,
						creator_connected_to_facebook: data.data.project.creator.isFacebookConnected,
						creator_number_of_created_project: data.data.project.creator.launchedProjects.totalCount,
						creator_number_of_backed_project: data.data.project.creator.backingsCount,
						creator_number_of_collaborators: data.data.project.collaborators.edges.length,
						creator_contents_of_collaborators: data.data.project.collaborators.edges,
						creator_number_of_attatched_links: data.data.project.creator.websites.length,
						creator_contents_of_attatched_links: data.data.project.creator.websites,
						creator_image: data.data.project.creator.imageUrl,
						creator_url: data.data.project.creator.url,

						origin: data.data.project
					}
				}catch(err){
					console.error(err);
				}
			}
		})

		await page.goto(url, { waitUntil: 'networkidle0', });

		try{
			let clickElement = await page.$('#px-captcha')
			let clickArea = await clickElement.boundingBox()

			//await page.mouse.move(clickArea.x + clickArea.width /2, clickArea.y + clickArea.height / 2)
			await page.mouse.move(350, 250)
			await page.mouse.down()
			await page.waitForTimeout(20*1000)
			await page.mouse.up()
			await page.waitForTimeout(10*1000)
			await page.reload({ waitUntil: 'networkidle0', })
		}catch(err){}

		await browser.close();
		return {
			createdAt: now,
			...result 
		}

		}catch(err){}
		finally{
			browser.close(); // ➐ 작업이 완료되면 브라우저 종료
		}
	},
	successful: async (url) => {
		const browser = await puppeteer.launch({executablePath: globalVariable.browserPath,
		//	userDataDir: '/home/sy/.config/google-chrome/Default', 
			args:[
			//`--proxy-server=${proxy[Math.floor(Math.random()*10 % proxy.length)]}`
		], 
		defaultViewport: {width: 1366, height: 768},
			headless: false, }); 
		const page = await browser.newPage();     
		await page.setUserAgent(userAgent.random().toString());
		//await page.setRequestInterception(true)
		await page.setBypassCSP(true)

		try{

		const slugMake = url.split('/');
		const slug = slugMake[slugMake.length-2] + '/' + slugMake[slugMake.length-1];

		await page.goto(url, { waitUntil: 'networkidle0', });

		try{
			let clickElement = await page.$('#px-captcha')
			let clickArea = await clickElement.boundingBox()

			//await page.mouse.move(clickArea.x + clickArea.width /2, clickArea.y + clickArea.height / 2)
			await page.mouse.move(350, 250)
			await page.mouse.down()
			await page.waitForTimeout(20*1000)
			await page.mouse.up()
			await page.waitForTimeout(10*1000)
			await page.reload({ waitUntil: 'networkidle0', })
		}catch(err){}

		const fromOptions = await page.$$('#content-wrap > div.NS_projects__content > section.js-project-content.js-project-description-content.project-content > div > div > div > div.col.col-4.js-rewards-column.max-w62.sticky-rewards > div > div.mobile-hide > div > ol > li');
		const number_of_support_options = fromOptions.length;
		const contents_of_support_options =[];
		for(option of fromOptions){
			contents_of_support_options.push(await page.evaluate(ele => ele.querySelector('div.pledge__info')?.outerHTML, option))
			//	펀딩 옵션에도 제한 수량이 있다. 모두 팔리면 pledge__info클래스를 가진 element는 사라지고 All gone!이라는 textContent만 남는다.
			if(await page.evaluate(ele => ele.querySelector('div.pledge__info')?.outerHTML, option) === undefined) contents_of_support_options.push(await page.evaluate(ele => ele.outerHTML, option))
		}

		let fundingPeriod = {
			start: undefined,
			end: undefined,
			duration: undefined
		}
		try{
			fundingPeriod = await page.$eval('#content-wrap > div.NS_projects__content > section.js-project-content.js-project-description-content.project-content > div > div > div > div.col.col-4.js-rewards-column.max-w62.sticky-rewards > div > div.NS_campaigns__funding_period > p', ele => {
				return {
					start: ele.querySelector('time:nth-child(1)').textContent,
					end: ele.querySelector('time:nth-child(2)').textContent,
					duration: ele.textContent.match(/\(.*\)/)[0].split(' ')[0].slice(1) *1
				}
			})
		}catch(err){}

		const fromCampaign = await page.$eval('#react-campaign', ele => {
			const page_of_story = ele.querySelector('#story + div.rte__content').outerHTML;
			const page_of_project_budget = ele.querySelector('#project-budget')?.outerHTML;
			const page_of_risks = ele.querySelector('#risks-and-challenges').outerHTML;

			return {
				page_of_story: page_of_story,
				page_of_project_budget: page_of_project_budget,
				page_of_risks: page_of_risks
			}
		});

		const dataCampaign = await page.$eval('#react-campaign-nav', ele => {
			const data_ = ele.getAttribute('data-campaign');
			const data = JSON.parse(data_);
			return {
				commentable_id: JSON.parse(data.watchingProjectData).project_id,
				number_of_FAQ: data.projectFAQsCount,
				number_of_updates: data.updateCount,
				number_of_comments_depth_all: data.commentsCount,
			}
		})
		const project_description = await page.$eval('#content-wrap > section > div.project-profile__content > div.grid-container.pb3.pb10-sm > div > div.grid-col-12.grid-col-4-lg > div.NS_project_profiles__blurb > div.project-profile__blurb.editable-field > span > span', ele => ele.textContent.substr(1, ele.textContent.length-2));

		let project_profile_background_imageURL;
		try{
			project_profile_background_imageURL = await page.$eval('#content-wrap > section > div.project-profile__background > div.project-profile__background.js-profile-background-image', ele => {
				const data_ = ele.getAttribute('style');
				return data_.split(`url('`)[1].split(`')`)[0];
			});
		}catch(err){
		}

		const project_imageURL = await page.$eval('#content-wrap > section > div.project-profile__content > div.grid-container.pb3.pb10-sm > div > div.grid-col-12.grid-col-8-lg > div > div > div > img', ele => ele.getAttribute('src'))

		let last_updated;
		try{
			last_updated = await page.$eval('#last-updated-post-link > time', ele => ele.textContent)
		}
		catch(err){
			last_updated = await page.$eval('#last-updated-link > time', ele => ele.textContent)
		}

		const project_name = await page.$eval('#content-wrap > section > div.project-profile__content > div.NS_project_profile__title > h2 > span > a', ele => ele.textContent.substring(1).slice(0, -1));

		const bodyHeader = await page.$eval('#content-wrap > div.NS_projects__content > section.js-project-content.js-project-description-content.project-content > div > div > div > div.col.col-8.description-container > div > div.row', ele => {

			const pledgedOrigin = ele.querySelector('div.mb3 > h3 > span').textContent;
			const spliter = pledgedOrigin.split('').reduce((prev, curr) => {
				if(['$', '¢', '€', '£', '¥', '₩'].find(ele => ele === curr) !== undefined) return curr
				else return prev
			}, undefined)
			const goal = ele.querySelector('div.mb3 > div > span.money').textContent;
			const backers = ele.querySelector('div.mb0 > h3').textContent;

			const numberize = (str) => {
				return str.split('').reduce((prev, curr) => {
					if(curr.charCodeAt(0) >= 48 && curr.charCodeAt(0) <= 57) return prev+curr
					else return prev
				}, '')
			}

			let project_we_love = false;
			let location;
			let category;
			const leftGroup = [
				ele.querySelector('div.col.col-8.py3 > div > div > a:nth-child(1)')?.textContent.substring(1).slice(0, -1),
				ele.querySelector('div.col.col-8.py3 > div > div > a:nth-child(2)')?.textContent.substring(1).slice(0, -1),
				ele.querySelector('div.col.col-8.py3 > div > div > a:nth-child(3)')?.textContent.substring(1).slice(0, -1),
			]
			if(leftGroup[2] === undefined){
				location = leftGroup[0];
				category = leftGroup[1];
			}else{
				project_we_love = true;
				location = leftGroup[1];
				category = leftGroup[2];
			}

			let amount_of_goal = numberize(goal); 
			let amount_of_pledged = numberize(pledgedOrigin); 
			let rate_of_funded = Math.floor(amount_of_pledged/amount_of_goal *100); 

			let currency_type = undefined; 
			let currency_symbol = undefined; 
			if(spliter !== undefined){
				currency_type = pledgedOrigin.split(spliter)[0] === '' ? 'US' : pledgedOrigin.split(spliter)[0];
				currency_symbol = spliter;
			}

			return {
				pledgedOrigin: pledgedOrigin,
				currency_type: currency_type,
				currency_symbol: currency_symbol,
				amount_of_goal: amount_of_goal,
				amount_of_pledged: amount_of_pledged,
				rate_of_funded: rate_of_funded,

				number_of_backers: backers.substring(1).slice(0, -1),		
				project_we_love: project_we_love,
				category: category,
				location: location
			}
		});
			
		let community = {
			top_cities_location_1st: undefined,
			top_cities_number_of_backers_1st: undefined,
			top_cities_location_2st: undefined,
			top_cities_number_of_backers_2st: undefined,
			top_cities_location_3st: undefined,
			top_cities_number_of_backers_3st: undefined,
			top_cities_location_4st: undefined,
			top_cities_number_of_backers_4st: undefined,
			top_cities_location_5st: undefined,
			top_cities_number_of_backers_5st: undefined,
			top_cities_location_6st: undefined,
			top_cities_number_of_backers_6st: undefined,
			top_cities_location_7st: undefined,
			top_cities_number_of_backers_7st: undefined,
			top_cities_location_8st: undefined,
			top_cities_number_of_backers_8st: undefined,
			top_cities_location_9st: undefined,
			top_cities_number_of_backers_9st: undefined,
			top_cities_location_10st: undefined,
			top_cities_number_of_backers_10st: undefined,
			top_countries_location_1st: undefined,
			top_countries_number_of_backers_1st: undefined,
			top_countries_location_2st: undefined,
			top_countries_number_of_backers_2st: undefined,
			top_countries_location_3st: undefined,
			top_countries_number_of_backers_3st: undefined,
			top_countries_location_4st: undefined,
			top_countries_number_of_backers_4st: undefined,
			top_countries_location_5st: undefined,
			top_countries_number_of_backers_5st: undefined,
			top_countries_location_6st: undefined,
			top_countries_number_of_backers_6st: undefined,
			top_countries_location_7st: undefined,
			top_countries_number_of_backers_7st: undefined,
			top_countries_location_8st: undefined,
			top_countries_number_of_backers_8st: undefined,
			top_countries_location_9st: undefined,
			top_countries_number_of_backers_9st: undefined,
			top_countries_location_10st: undefined,
			top_countries_number_of_backers_10st: undefined,
			number_of_new_backers: undefined,
			number_of_returning_backers: undefined
		}

		const contents_of_FAQ =[];	// FAQ가 존재하지 않는다면 빈 배열로 남는다.
		if(dataCampaign.number_of_FAQ !== 0){
			// instead of click >> page.goto
			// instead of click >> page.goto
			// instead of click >> page.goto
			await waitRandom((getRandom() + 30) * 1000);
			await page.goto(url+'/faqs', { waitUntil: 'networkidle0', });

			try{
				let clickElement = await page.$('#px-captcha')
				let clickArea = await clickElement.boundingBox()

				//await page.mouse.move(clickArea.x + clickArea.width /2, clickArea.y + clickArea.height / 2)
				await page.mouse.move(350, 250)
				await page.mouse.down()
				await page.waitForTimeout(20*1000)
				await page.mouse.up()
				await page.waitForTimeout(10*1000)
				await page.reload({ waitUntil: 'networkidle0', })
			}catch(err){}

			const fromFAQ = await page.$$('#project-faqs > div > div > div.grid-row.mb6.flex.flex-row-sm.flex-column-reverse > ul > li');
			for(question of fromFAQ){
				contents_of_FAQ.push(await page.evaluate(ele => ele.outerHTML, question))
			}
		}

		if(await page.$('#community-emoji') !== null){		//	커뮤니티가 존재하지 않는 경우도 있다.
			// instead of click >> page.goto
			// instead of click >> page.goto
			// instead of click >> page.goto
			await waitRandom((getRandom() + 35) * 1000);
			await page.goto(url+'/community', { waitUntil: 'networkidle0', });

			try{
				let clickElement = await page.$('#px-captcha')
				let clickArea = await clickElement.boundingBox()

				//await page.mouse.move(clickArea.x + clickArea.width /2, clickArea.y + clickArea.height / 2)
				await page.mouse.move(350, 250)
				await page.mouse.down()
				await page.waitForTimeout(20*1000)
				await page.mouse.up()
				await page.waitForTimeout(10*1000)
				await page.reload({ waitUntil: 'networkidle0', })
			}catch(err){}

			if(await page.$('div.community-section__small_community') === null){
				const fromCommunityCities = await page.$$eval('div.community-section__locations_cities > div > div > div', eles => {
					return eles.map(ele => {
						return [
							ele.querySelector('div.left').textContent.split('\n\n\n')[0].substring(2) + ' ' + ele.querySelector('div.left').textContent.split('\n\n\n')[1].slice(0, -2),
							ele.querySelector('div.right').textContent.split(' ')[0].substring(2)
						];
					})
				});
				const fromCommunityCountries = await page.$$eval('div.community-section__locations_countries > div > div > div', eles => {
					return eles.map(ele => {
						return [
							ele.querySelector('div.left').textContent.substring(2).slice(0, -2),
							ele.querySelector('div.right').textContent.split(' ')[0].substring(2)
						];
					})
				});
				const number_of_new_backers = await page.$eval('div.new-backers > div.count', ele => ele.textContent * 1)
				const number_of_returning_backers = await page.$eval('div.existing-backers > div.count', ele => ele.textContent * 1)
				community = {
					top_cities_location_1st: fromCommunityCities[0]?.[0],
					top_cities_number_of_backers_1st: fromCommunityCities[0]?.[1],
					top_cities_location_2st: fromCommunityCities[1]?.[0],
					top_cities_number_of_backers_2st: fromCommunityCities[1]?.[1],
					top_cities_location_3st: fromCommunityCities[2]?.[0],
					top_cities_number_of_backers_3st: fromCommunityCities[2]?.[1],
					top_cities_location_4st: fromCommunityCities[3]?.[0],
					top_cities_number_of_backers_4st: fromCommunityCities[3]?.[1],
					top_cities_location_5st: fromCommunityCities[4]?.[0],
					top_cities_number_of_backers_5st: fromCommunityCities[4]?.[1],
					top_cities_location_6st: fromCommunityCities[5]?.[0],
					top_cities_number_of_backers_6st: fromCommunityCities[5]?.[1],
					top_cities_location_7st: fromCommunityCities[6]?.[0],
					top_cities_number_of_backers_7st: fromCommunityCities[6]?.[1],
					top_cities_location_8st: fromCommunityCities[7]?.[0],
					top_cities_number_of_backers_8st: fromCommunityCities[7]?.[1],
					top_cities_location_9st: fromCommunityCities[8]?.[0],
					top_cities_number_of_backers_9st: fromCommunityCities[8]?.[1],
					top_cities_location_10st: fromCommunityCities[9]?.[0],
					top_cities_number_of_backers_10st: fromCommunityCities[9]?.[1],
					top_countries_location_1st: fromCommunityCountries[0]?.[0],
					top_countries_number_of_backers_1st: fromCommunityCountries[0]?.[1],
					top_countries_location_2st: fromCommunityCountries[1]?.[0],
					top_countries_number_of_backers_2st: fromCommunityCountries[1]?.[1],
					top_countries_location_3st: fromCommunityCountries[2]?.[0],
					top_countries_number_of_backers_3st: fromCommunityCountries[2]?.[1],
					top_countries_location_4st: fromCommunityCountries[3]?.[0],
					top_countries_number_of_backers_4st: fromCommunityCountries[3]?.[1],
					top_countries_location_5st: fromCommunityCountries[4]?.[0],
					top_countries_number_of_backers_5st: fromCommunityCountries[4]?.[1],
					top_countries_location_6st: fromCommunityCountries[5]?.[0],
					top_countries_number_of_backers_6st: fromCommunityCountries[5]?.[1],
					top_countries_location_7st: fromCommunityCountries[6]?.[0],
					top_countries_number_of_backers_7st: fromCommunityCountries[6]?.[1],
					top_countries_location_8st: fromCommunityCountries[7]?.[0],
					top_countries_number_of_backers_8st: fromCommunityCountries[7]?.[1],
					top_countries_location_9st: fromCommunityCountries[8]?.[0],
					top_countries_number_of_backers_9st: fromCommunityCountries[8]?.[1],
					top_countries_location_10st: fromCommunityCountries[9]?.[0],
					top_countries_number_of_backers_10st: fromCommunityCountries[9]?.[1],
					number_of_new_backers: number_of_new_backers,
					number_of_returning_backers:number_of_returning_backers 
				}
			}

		}

		await browser.close();

		let creatorGraphQL = await getCreatorData(slug, url);

		return {
			createdAt: now,
			slug: slug,
			project_url: url,
			number_of_support_options: number_of_support_options,
			contents_of_support_options: contents_of_support_options,
			...fromCampaign,
			...dataCampaign,
			contents_of_FAQ: contents_of_FAQ,
			project_description: project_description,
			project_profile_background_imageURL, project_profile_background_imageURL,
			project_imageURL: project_imageURL,
			deadline: undefined,
			project_name: project_name,
			...bodyHeader,
			...community,
			...fundingPeriod,
			last_updated: last_updated,

			creator_name: creatorGraphQL.creator.name,
			creator_location: creatorGraphQL.creator.location.displayableName,
			creator_description: creatorGraphQL.creator.biography,
			creator_verifiedIdentity: creatorGraphQL.verifiedIdentity,
			creator_last_login: creatorGraphQL.creator.lastLogin,
			creator_connected_to_facebook: creatorGraphQL.creator.isFacebookConnected,
			creator_number_of_created_project: creatorGraphQL.creator.launchedProjects.totalCount,
			creator_number_of_backed_project: creatorGraphQL.creator.backingsCount,
			creator_number_of_collaborators: creatorGraphQL.collaborators.edges.length,
			creator_contents_of_collaborators: creatorGraphQL.collaborators.edges,
			creator_number_of_attatched_links: creatorGraphQL.creator.websites.length,
			creator_contents_of_attatched_links: creatorGraphQL.creator.websites,
			creator_image: creatorGraphQL.creator.imageUrl,
			creator_url: creatorGraphQL.creator.url,
		} 

		}catch(err){}
		finally{
			browser.close(); // ➐ 작업이 완료되면 브라우저 종료
		}
	},
};

const getCreatorData = async (slug, url) => {
	const browser = await puppeteer.launch({executablePath: globalVariable.browserPath,
	//	userDataDir: '/home/sy/.config/google-chrome/Default', 
		args:[
		//`--proxy-server=${proxy[Math.floor(Math.random()*10 % proxy.length)]}`
	], 
		defaultViewport: {width: 1366, height: 768},
		headless: false, }); 
	const page = await browser.newPage();     
	await page.setUserAgent(userAgent.random().toString());
	await page.setRequestInterception(true)
	await page.setBypassCSP(true)

	try{

	let xcsrfToken;

	await page.on('request', async request => {
		if(request.url().includes('/graph') && request.method() === 'POST'){
			xcsrfToken = await request.headers()["x-csrf-token"];
			await request.continue({
				headers: {
					...request.headers(),
					"x-csrf-token": xcsrfToken,
					'User-Agent': userAgent.random().toString()
				},
				method: 'POST',
				postData: JSON.stringify({
					"query": `
						query CreatorSection($slug: String!) {
						  project(slug: $slug) {
							id
							verifiedIdentity
							creator {
							  id
							  name
							  imageUrl(width: 100)
							  url
							  lastLogin
							  biography
							  isFacebookConnected
							  allowsFollows
							  backingsCount
							  location {
								displayableName
							  }
							  launchedProjects {
								totalCount
							  }
							  websites {
								url
								domain
							  }
							}
							collaborators {
							  edges {
								node {
								  name
								  imageUrl(width: 200)
								  url
								}
								title
							  }
							}
						  }
						}`,
					"variables": {
						"slug": slug
					}
				}),
			})
		}else{
			await request.continue()
		}
	})

	let results = [];
	await page.on('response', async response => {
		// Ignore OPTIONS requests
		if(response.request().method() !== 'POST') return
		if(response.url().includes('/graph')) {
			let data;
			try{
				data = await response.json();
				results.push(data);
			}catch(err){
				console.log('res intercepted but failed to get res.josn()')
			}
		}
	})

	await page.goto(url, { waitUntil: 'networkidle0', });

	try{
		let clickElement = await page.$('#px-captcha')
		let clickArea = await clickElement.boundingBox()

		//await page.mouse.move(clickArea.x + clickArea.width /2, clickArea.y + clickArea.height / 2)
		await page.mouse.move(350, 250)
		await page.mouse.down()
		await page.waitForTimeout(20*1000)
		await page.mouse.up()
		await page.waitForTimeout(10*1000)
		await page.reload({ waitUntil: 'networkidle0', })
	}catch(err){}

	let creatorData;
	results.forEach(ele => {
		if(ele?.data?.project !== undefined) creatorData = ele.data.project
	})

	await browser.close();
	return creatorData;

	}catch(err){}
	finally{
		browser.close(); // ➐ 작업이 완료되면 브라우저 종료
	}
}



//(
//	async () => {
//		const url = `https://www.kickstarter.com/projects/print3dhandsome/jobox`
//		const a = await getPage.liveOrFailOrCancel(url);
//
//		//const a = await getCreatorData(slug)
//		console.log(util.inspect(a, {depth: null}));
//
//	}
//)()

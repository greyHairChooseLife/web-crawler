const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const userAgent = require('user-agents');
const util = require('util');
const fs = require('fs');

const baseURL = 'https://www.kickstarter.com';

const getPageInfo = async (categoryId, sort, pageNumber) => {
	const browser = await puppeteer.launch({executablePath: '/opt/google/chrome/google-chrome',
	//	userDataDir: '/home/sy/.config/google-chrome/Default', 
		args:[
		//`--proxy-server=${proxy[Math.floor(Math.random()*10 % proxy.length)]}`
	], 
		headless: false, }); 
	const page = await browser.newPage();     
	await page.setUserAgent(userAgent.random().toString());
	await page.setBypassCSP(true)

	const url = 'https://www.kickstarter.com/projects/isabellearne/magikitty-travel-journal-of-a-witch-cat'
	const url2 = 'https://www.kickstarter.com/projects/twelvenine/warm-and-cozy-pins-twelve-nine'
	//	page.goto
	//	page.goto
	//	page.goto
	await page.goto(url, { waitUntil: 'networkidle0', });

	const fromHeaderAndCreator = await page.$eval('#react-project-header', ele => {
		//	data-initial 속성에 필요한 데이터를 로드 해 놓아서 활용한다.
		const dataInitialObj = JSON.parse(ele.getAttribute('data-initial'));

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

		const days_to_go = ele.querySelector('span.block.type-16.type-28-md.bold.dark-grey-500').textContent

		return {
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

			days_to_go: days_to_go
		}
	});

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
		contents_of_support_options.push(await page.evaluate(ele => ele.querySelector('div.pledge__info').outerHTML, option))
	}

	const number_of_FAQ = await page.$eval('#faq-emoji', ele => { return ele.querySelector('span') ? ele.querySelector('span')?.textContent : '0'});
	const number_of_updates = await page.$eval('#updates-emoji', ele => { return ele.querySelector('span')?.textContent; });
	const number_of_comments_depth_all = await page.$eval('#comments-emoji', ele => { return ele.querySelector('span')?.textContent; });

	// instead of click >> page.goto
	// instead of click >> page.goto
	// instead of click >> page.goto
	await page.goto(url+'/faqs', { waitUntil: 'networkidle0', });

	const fromFAQ = await page.$$('#project-faqs > div > div > div.grid-row.mb6.flex.flex-row-sm.flex-column-reverse > ul');
	const contents_of_FAQ =[];	// FAQ가 존재하지 않는다면 빈 배열로 남는다.
	for(question of fromFAQ){
		contents_of_FAQ.push(await page.evaluate(ele => ele.querySelector('li')?.outerHTML, question))
	}

	// instead of click >> page.goto
	// instead of click >> page.goto
	// instead of click >> page.goto
	await page.goto(url+'/community', { waitUntil: 'networkidle0', });

	let isSmallCommunitiy = await page.$('div.community-section__small_community') === null ? false : true;
	let communitiy;
	if(isSmallCommunitiy){
		communitiy = {
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
	}else{
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

		communitiy = {
			top_cities_location_1st: fromCommunityCities[0][0],
			top_cities_number_of_backers_1st: fromCommunityCities[0][1],
			top_cities_location_2st: fromCommunityCities[1][0],
			top_cities_number_of_backers_2st: fromCommunityCities[1][1],
			top_cities_location_3st: fromCommunityCities[2][0],
			top_cities_number_of_backers_3st: fromCommunityCities[2][1],
			top_cities_location_4st: fromCommunityCities[3][0],
			top_cities_number_of_backers_4st: fromCommunityCities[3][1],
			top_cities_location_5st: fromCommunityCities[4][0],
			top_cities_number_of_backers_5st: fromCommunityCities[4][1],
			top_cities_location_6st: fromCommunityCities[5][0],
			top_cities_number_of_backers_6st: fromCommunityCities[5][1],
			top_cities_location_7st: fromCommunityCities[6][0],
			top_cities_number_of_backers_7st: fromCommunityCities[6][1],
			top_cities_location_8st: fromCommunityCities[7][0],
			top_cities_number_of_backers_8st: fromCommunityCities[7][1],
			top_cities_location_9st: fromCommunityCities[8][0],
			top_cities_number_of_backers_9st: fromCommunityCities[8][1],
			top_cities_location_10st: fromCommunityCities[9][0],
			top_cities_number_of_backers_10st: fromCommunityCities[9][1],
			top_countries_location_1st: fromCommunityCountries[0][0],
			top_countries_number_of_backers_1st: fromCommunityCountries[0][1],
			top_countries_location_2st: fromCommunityCountries[1][0],
			top_countries_number_of_backers_2st: fromCommunityCountries[1][1],
			top_countries_location_3st: fromCommunityCountries[2][0],
			top_countries_number_of_backers_3st: fromCommunityCountries[2][1],
			top_countries_location_4st: fromCommunityCountries[3][0],
			top_countries_number_of_backers_4st: fromCommunityCountries[3][1],
			top_countries_location_5st: fromCommunityCountries[4][0],
			top_countries_number_of_backers_5st: fromCommunityCountries[4][1],
			top_countries_location_6st: fromCommunityCountries[5][0],
			top_countries_number_of_backers_6st: fromCommunityCountries[5][1],
			top_countries_location_7st: fromCommunityCountries[6][0],
			top_countries_number_of_backers_7st: fromCommunityCountries[6][1],
			top_countries_location_8st: fromCommunityCountries[7][0],
			top_countries_number_of_backers_8st: fromCommunityCountries[7][1],
			top_countries_location_9st: fromCommunityCountries[8][0],
			top_countries_number_of_backers_9st: fromCommunityCountries[8][1],
			top_countries_location_10st: fromCommunityCountries[9][0],
			top_countries_number_of_backers_10st: fromCommunityCountries[9][1],
			number_of_new_backers: number_of_new_backers,
			number_of_returning_backers:number_of_returning_backers 
		}
	}

	const results = {
		...fromHeaderAndCreator,
		...fromCampaign,
		number_of_support_options: number_of_support_options,
		contents_of_support_options: contents_of_support_options,
		number_of_FAQ: number_of_FAQ,
		number_of_updates: number_of_updates,
		number_of_comments_depth_all: number_of_comments_depth_all,
		contents_of_FAQ: contents_of_FAQ,
		...communitiy
	}


	await browser.close(); // ➐ 작업이 완료되면 브라우저 종료
	return results;
}



const showMeTheMoney = async () => {
	const result = await getPageInfo();
	
	const now = new Date().toLocaleString().replace(/\//g, '_');
	fs.writeFile(`/home/sy/kickstarter/log/page.json`, JSON.stringify({created_at: now, ...result}), 'utf8', err => console.error(err));
}

showMeTheMoney();


const excel = require('exceljs');
const cheerio = require('cheerio');
const util = require('util');
const {categoryPool} = require('./categoryPool');
const {targets} = require('./targets/Ceramics');

// Make new workbook and sheet, set columns
const workbook = new excel.Workbook();
const sheet1 = workbook.addWorksheet('sheet1');
const makeColumns = () => {
	const fromThumbnailWithHeader = ['project_url', 'project_name', 'project_description', 'rate_of_funded', 'deadline', 'days_to_go', 'all_or_nothing', 'category', 'location', 'pledgedOrigin', 'currency_type', 'currency_symbol', 'amount_of_pledged', 'funding_goal', 'number_of_backers', 'project_we_love(T/F)', 'project_imageURL', 'project_profile_background_imageURL'];
	const fromCreator = ['creator_name', 'creator_location', 'creator_description', 'creator_image', 'creator_url', 'creator_verifiedIdentity', 'creator_last_login', 'creator_connected_to_facebook(T/F)', 'creator_number_of_created_project', 'creator_number_of_backed_project', 'creator_number_of_collaborators', 'creator_contents_of_collaborators', 'creator_number_of_attatched_links', 'creator_contents_of_attatched_links'];
	const fromCampaign = ['page_of_story', 'page_of_project_budget', 'page_of_risks'];
	const fromSupport = ['number_of_support_options', 'contents_of_support_options'];
	const fromFAQ = ['number_of_FAQ', 'contents_of_FAQ'];
	const fromUpdates = ['number_of_updates', 'contents_of_updates'];
	const fromComments = ['number_of_comments_depth_1', 'number_of_comments_depth_all', 'contents_of_comments'];
	const fromCommunitiy = [
		'top_cities_location_1st', 'top_cities_number_of_backers_1st',
		'top_cities_location_2st', 'top_cities_number_of_backers_2st',
		'top_cities_location_3st', 'top_cities_number_of_backers_3st',
		'top_cities_location_4st', 'top_cities_number_of_backers_4st',
		'top_cities_location_5st', 'top_cities_number_of_backers_5st',
		'top_cities_location_6st', 'top_cities_number_of_backers_6st',
		'top_cities_location_7st', 'top_cities_number_of_backers_7st',
		'top_cities_location_8st', 'top_cities_number_of_backers_8st',
		'top_cities_location_9st', 'top_cities_number_of_backers_9st',
		'top_cities_location_10st', 'top_cities_number_of_backers_10st',
		'top_countries_location_1st', 'top_countries_number_of_backers_1st',
		'top_countries_location_2st', 'top_countries_number_of_backers_2st',
		'top_countries_location_3st', 'top_countries_number_of_backers_3st',
		'top_countries_location_4st', 'top_countries_number_of_backers_4st',
		'top_countries_location_5st', 'top_countries_number_of_backers_5st',
		'top_countries_location_6st', 'top_countries_number_of_backers_6st',
		'top_countries_location_7st', 'top_countries_number_of_backers_7st',
		'top_countries_location_8st', 'top_countries_number_of_backers_8st',
		'top_countries_location_9st', 'top_countries_number_of_backers_9st',
		'top_countries_location_10st', 'top_countries_number_of_backers_10st',
		'number_of_new_backers', 'number_of_returning_backers'
	]

	const fromStory = ['story_text', 'story_links', 'story_images', 'story_videos']
	const fromRisk = ['risk_text', 'risk_links', 'risk_images', 'risk_videos']


	const all = ['created_at', 'state', ...fromThumbnailWithHeader, ...fromCreator, ...fromCampaign, ...fromSupport, ...fromFAQ, ...fromUpdates, ...fromComments, ...fromCommunitiy, ...fromStory, ...fromRisk];
	return all.map(ele => {
		return {header: ele, key: ele}
	})
};
sheet1.columns = [
	...makeColumns()
]

// load data >> form and save into data variable

let data;

for(let i=0; i<533; i++){
	let fromPage = undefined;
	let fromUpdates = undefined;
	let fromComments = undefined;
	try{
		fromPage = require(`../log/Ceramics/${i}/pageData.js`).data;
	}catch(err){}
	try{
		fromUpdates = require(`../log/Ceramics/${i}/updatesData.js`).data;
	}catch(err){}
	try{
		fromComments = require(`../log/Ceramics/${i}/commentsData.js`).data;
	}catch(err){}

	const r = {
		p: fromPage,
		u: fromUpdates,
		c: fromComments
	}

	if(targets[i].state !== 'submitted'){
		const getTextContentExcludeFigureElement = (html) => {
			const storyDom = cheerio.load(html)
			storyDom('figure').remove();
			return storyDom.text().replace(/\n\n\n/g,'');		// trim <br>
		}

		const getLinks = (html) => {
			const storyDom = cheerio.load(html)
			const hrefArray = storyDom('a').map((ele, idx) => storyDom(idx).attr('href')).toArray()
			const textArray = storyDom('a').map((ele, idx) => storyDom(idx).text().replace(/\n/g,'')).toArray()
			const result = [];
			for(let i=0; i<hrefArray.length; i++){
				result.push({
					href: hrefArray[i],
					text: textArray[i]
				})
			}
			return result
		}

		const getImages = (html) => {
			const storyDom = cheerio.load(html)
			const srcArray = storyDom('figure > img').map((ele, idx) => storyDom(idx).attr('src')).toArray();
			const figcaptionArray = storyDom('figure > figcaption').map((ele, idx) => storyDom(idx).text()).toArray();
			const result = [];
			for(let i=0; i<srcArray.length; i++){
				result.push({
					src: srcArray[i],
					figcaption: figcaptionArray[i]
				})
			}
			return result
		}

		const getVideos = (html) => {
			const storyDom = cheerio.load(html)
			const urlArray = storyDom('div.video-player').map((ele, idx) => storyDom(idx).attr('data-video-url')).toArray();
			const thumbnailImageArray = storyDom('div.video-player').map((ele, idx) => storyDom(idx).attr('data-image')).toArray();
			const result = [];
			for(let i=0; i<urlArray.length; i++){
				result.push({
					url: urlArray[i],
					thumbnailImage: thumbnailImageArray[i]
				})
			}
			return result
		}

		const parsedStory = {
			storyText: getTextContentExcludeFigureElement(r.p.page_of_story), 
			storyLinks: getLinks(r.p.page_of_story),
			storyImages: getImages(r.p.page_of_story),
			storyVideos: getVideos(r.p.page_of_story),
		}
		const parsedRisk = {
			riskText: getTextContentExcludeFigureElement(r.p.page_of_risks), 
			riskLinks: getLinks(r.p.page_of_risks),
			riskImages: getImages(r.p.page_of_risks),
			riskVideos: getVideos(r.p.page_of_risks),
		}

		const grapUpdate = () => {
			const updates = [];
			let i=0;
			while(i<r.u.length){
				if(r.u[i].node.type === 'update'){
					updates.push(r.u[i].node.data)
				}
				i++
			}
			return updates;
		}


		data = [
			{
				created_at: r.p.created_at,
				state: targets[i].state,
				project_url: r.p.project_url,
				project_name: r.p.project_name,
				project_description: r.p.project_description,
				rate_of_funded: r.p.rate_of_funded,
				deadline: r.p.deadline,
				days_to_go: r.p.days_to_go,
				all_or_nothing: r.p.all_or_nothing,
				category: r.p.category,
				location: r.p.location,
				pledgedOrigin: r.p?.pledgedOrigin,
				currency_type: r.p.currency_type,
				currency_symbol: r.p.currency_symbol,
				amount_of_pledged: r.p.amount_of_pledged,
				funding_goal: r.p.amount_of_goal,
				number_of_backers: r.p.number_of_backers,
				'project_we_love(T/F)': r.p.project_we_love,
				project_imageURL: r.p.project_imageURL,
				creator_name: r.p.creator_name,
				creator_location: r.p.creator_location,
				creator_description: r.p.creator_description,
				creator_verifiedIdentity: r.p.creator_verifiedIdentity,
				creator_last_login: r.p.creator_last_login,
				'creator_connected_to_facebook(T/F)': r.p.creator_connected_to_facebook,
				creator_number_of_created_project: r.p.creator_number_of_created_project,
				creator_number_of_backed_project: r.p.creator_number_of_backed_project,
				creator_number_of_collaborators: r.p.creator_number_of_collaborators,
				creator_contents_of_collaborators: r.p.creator_contents_of_collaborators,
				creator_number_of_attatched_links: r.p.creator_number_of_attatched_links,
				creator_contents_of_attatched_links: r.p.creator_contents_of_attatched_links,
				creator_image: r.p.creator_image,
				creator_url: r.p.creator_url,
				page_of_story: r.p.page_of_story,
				page_of_project_budget: r.p.page_of_project_budget,
				page_of_risks: r.p.page_of_risks,
				story_text: parsedStory.storyText,
				story_links: parsedStory.storyLinks,
				story_images: parsedStory.storyImages,
				story_videos: parsedStory.storyVideos,
				risk_text: parsedRisk.riskText,
				risk_links: parsedRisk.riskLinks,
				risk_images: parsedRisk.riskImages,
				risk_videos: parsedRisk.riskVideos,
				number_of_support_options: r.p.number_of_support_options,
				contents_of_support_options: r.p.contents_of_support_options,
				number_of_FAQ: r.p.number_of_FAQ,
				contents_of_FAQ: r.p.contents_of_FAQ,
				number_of_updates: r.p.number_of_updates,
				contents_of_updates: grapUpdate(),		//	issue
				number_of_comments_depth_all: r.p.number_of_comments_depth_all,
				number_of_comments_depth_1: r.c?.commentsCount,		//	issue
				contents_of_comments: r.c?.comments?.edges,		//	issue
				top_cities_location_1st: r.p.top_cities_location_1st,
				top_cities_number_of_backers_1st: r.p.top_cities_number_of_backers_1st,
				top_cities_location_2st: r.p.top_cities_location_2st,
				top_cities_number_of_backers_2st: r.p.top_cities_number_of_backers_2st,
				top_cities_location_3st: r.p.top_cities_location_3st,
				top_cities_number_of_backers_3st: r.p.top_cities_number_of_backers_3st,
				top_cities_location_4st: r.p.top_cities_location_4st,
				top_cities_number_of_backers_4st: r.p.top_cities_number_of_backers_4st,
				top_cities_location_5st: r.p.top_cities_location_5st,
				top_cities_number_of_backers_5st: r.p.top_cities_number_of_backers_5st,
				top_cities_location_6st: r.p.top_cities_location_6st,
				top_cities_number_of_backers_6st: r.p.top_cities_number_of_backers_6st,
				top_cities_location_7st: r.p.top_cities_location_7st,
				top_cities_number_of_backers_7st: r.p.top_cities_number_of_backers_7st,
				top_cities_location_8st: r.p.top_cities_location_8st,
				top_cities_number_of_backers_8st: r.p.top_cities_number_of_backers_8st,
				top_cities_location_9st: r.p.top_cities_location_9st,
				top_cities_number_of_backers_9st: r.p.top_cities_number_of_backers_9st,
				top_cities_location_10st: r.p.top_cities_location_10st,
				top_cities_number_of_backers_10st: r.p.top_cities_number_of_backers_10st,
				top_countries_location_1st: r.p.top_countries_location_1st,
				top_countries_number_of_backers_1st: r.p.top_countries_number_of_backers_1st,
				top_countries_location_2st: r.p.top_countries_location_2st,
				top_countries_number_of_backers_2st: r.p.top_countries_number_of_backers_2st,
				top_countries_location_3st: r.p.top_countries_location_3st,
				top_countries_number_of_backers_3st: r.p.top_countries_number_of_backers_3st,
				top_countries_location_4st: r.p.top_countries_location_4st,
				top_countries_number_of_backers_4st: r.p.top_countries_number_of_backers_4st,
				top_countries_location_5st: r.p.top_countries_location_5st,
				top_countries_number_of_backers_5st: r.p.top_countries_number_of_backers_5st,
				top_countries_location_6st: r.p.top_countries_location_6st,
				top_countries_number_of_backers_6st: r.p.top_countries_number_of_backers_6st,
				top_countries_location_7st: r.p.top_countries_location_7st,
				top_countries_number_of_backers_7st: r.p.top_countries_number_of_backers_7st,
				top_countries_location_8st: r.p.top_countries_location_8st,
				top_countries_number_of_backers_8st: r.p.top_countries_number_of_backers_8st,
				top_countries_location_9st: r.p.top_countries_location_9st,
				top_countries_number_of_backers_9st: r.p.top_countries_number_of_backers_9st,
				top_countries_location_10st: r.p.top_countries_location_10st,
				top_countries_number_of_backers_10st: r.p.top_countries_number_of_backers_10st,
				number_of_new_backers: r.p.number_of_new_backers,
				number_of_returning_backers: r.p.number_of_returning_backers,
				project_profile_background_imageURL: r.p?.project_profile_background_imageURL,
			}
		];
	}else{
		data = [{
			created_at: undefined,
			state: targets[i].state,
			project_url: r.p.project_url,
			project_imageURL: r.p.project_imageURL,
			project_name: r.p.project_name,
			project_description: r.p.project_description,
			category: r.p.category,
			location: r.p.location,
			
			creator_name: r.p.creator_name,
			creator_location: r.p.creator_location,
			creator_description: r.p.creator_description,
			creator_verifiedIdentity: r.p.creator_verifiedIdentity,
			creator_last_login: r.p.creator_last_login,
			creator_connected_to_facebook: r.p.creator_connected_to_facebook,
			creator_number_of_created_project: r.p.creator_number_of_created_project,
			creator_number_of_backed_project: r.p.creator_number_of_backed_project,
			creator_number_of_collaborators: r.p.creator_number_of_collaborators,
			creator_contents_of_collaborators: r.p.creator_contents_of_collaborators,
			creator_number_of_attatched_links: r.p.creator_number_of_attatched_links,
			creator_contents_of_attatched_links: r.p.creator_contents_of_attatched_links,
			creator_image: r.p.creator_image,
			creator_url: r.p.creator_url,
		}]
	}


	sheet1.addRows(data);
}

workbook.xlsx.writeFile('../log/excel.xlsx');


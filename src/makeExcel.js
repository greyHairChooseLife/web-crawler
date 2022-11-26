const excel = require('exceljs');
const cheerio = require('cheerio');
const util = require('util');
const fs = require('fs');

// 
// Make new workbook and sheet, set columns
// 
const workbook = new excel.Workbook();
const sheet1 = workbook.addWorksheet('sheet1');
const makeColumns = () => {

	const fromFile = [
		'created_at_page',
		'created_at_update',
		'created_at_comment',
	]

	const fromTargetInfo = [
		'project_state',
		'project_url',
		'project_category',
		'project_name',
		'project_description',
		'project_location',
		'project_img',
		'deadline',

		'currency',
		'currency_symbol',
		'pledged',
		'goal',
		'percent_funded',
		'backers_count',

		'staff_pick',
	]

	const fromCampaignGraph = [
	//	'origin',
	//	'story',
		'risk',
	]

	const fromStory = [
		'story_text',
		'story_links',
		'story_links_count',
		'story_images',
		'story_images_count',
		'story_videos',
		'story_videos_count'
	]

	const fromCreator = [
		'creator_name',
		'creator_location',
		'creator_biography',
		'creator_image',
		'creator_url',
		'creator_verified_identity',
		'creator_last_login',
		'creator_is_facebook_connected',
		'creator_number_of_launched_projects',
		'creator_number_of_backing_projects',
		'creator_contents_of_collaborators', 
		'creator_contents_of_websites'
	]

	const fromFAQ = [
		'contents_of_FAQ'
	];

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

	const fromEtc = [
		'shown_number_of_FAQ',
		'shown_number_of_updates',
		'shown_number_of_comments',
		//'days_to_go',	
		'all_or_nothing',
	]

	const fromOptions = [
		'contents_of_support_options',
	]

	const finishedOnly = [
		'funding_period_start',
		'funding_period_end',
		'funding_period_duration',
		'last_updated'
	]

	const submittedOnly = [
		'number_of_followers'
	]

	const fromUpdates = [
		//'contents_of_updates'
		'update_1_title',
		'update_1_publishedAt',
		'update_1_authorName',
		'update_1_authorRole',
		'update_1_likesCount',
		'update_1_commentsCount',
		'update_1_body_text',
		'update_1_body_img',
		'update_2_title',
		'update_2_publishedAt',
		'update_2_authorName',
		'update_2_authorRole',
		'update_2_likesCount',
		'update_2_commentsCount',
		'update_2_body_text',
		'update_2_body_img',
		'update_3_title',
		'update_3_publishedAt',
		'update_3_authorName',
		'update_3_authorRole',
		'update_3_likesCount',
		'update_3_commentsCount',
		'update_3_body_text',
		'update_3_body_img',
		'update_4_title',
		'update_4_publishedAt',
		'update_4_authorName',
		'update_4_authorRole',
		'update_4_likesCount',
		'update_4_commentsCount',
		'update_4_body_text',
		'update_4_body_img',
		'update_5_title',
		'update_5_publishedAt',
		'update_5_authorName',
		'update_5_authorRole',
		'update_5_likesCount',
		'update_5_commentsCount',
		'update_5_body_text',
		'update_5_body_img',
	];

	const fromComments = [
		//'contents_of_comments'
		'comment_1_name',
		'comment_1_desc',
		'comment_2_name',
		'comment_2_desc',
		'comment_3_name',
		'comment_3_desc',
		'comment_4_name',
		'comment_4_desc',
		'comment_5_name',
		'comment_5_desc',
		'comment_6_name',
		'comment_6_desc',
		'comment_7_name',
		'comment_7_desc',
		'comment_8_name',
		'comment_8_desc',
		'comment_9_name',
		'comment_9_desc',
		'comment_10_name',
		'comment_10_desc',
	];

	const allColumns = [
		...fromFile,
		...fromTargetInfo,
		...fromCampaignGraph,
		...fromStory,
		...fromCreator,
		...fromFAQ,
		...fromCommunitiy,
		...fromEtc,
		...fromOptions,
		...finishedOnly,
		...submittedOnly,
		...fromUpdates,
		...fromComments,
	];

	return allColumns.map(ele => {
		return {header: ele, key: ele}
	})
};

sheet1.columns = [
	...makeColumns()
]

const targets = require('../SCRAPED_RAW_DATA/3D Printing/targets').data;

let targetIdx = -1;
for (const target of targets) {
	targetIdx++;
//	if(target.isDone.pageData === false ||
	if(target.isDone.pageData === false
//		target.isDone.updateData === false ||
//		target.isDone.commentData === false
	) continue;

	const rawData = readFiles(targetIdx);

	const createdAt = {
		created_at_page: rawData.pageData.createdAt,
		created_at_update: rawData?.updateData?.createdAt,
		created_at_comment: rawData?.commentData?.createdAt,
	}

	let _ = rawData.targetData;
	const targetData = {
		project_state: _.state,
		project_url: _.urls.web.project,
		project_category: _.category.name,
		project_name: _.name,
		project_description: _.blurb,
		project_location: _.location.country + ', ' + _.location.displayable_name,
		project_img: _.photo.full,
		deadline: _.deadline,

		currency: _.currency,
		currency_symbol: _.currency_symbol,
		pledged: _.pledged,
		goal: _.goal,
		percent_funded: _.percent_funded,
		backers_count: _.backers_count,

		staff_pick: _.staff_pick,
	}

	_ = rawData.pageData.data;
	let pageData;
	if(targetData.project_state !== 'submitted' && targetData.project_state !== 'started') {
		pageData = {
			story_text: getTextContentExcludeFigureElement(_.fromCampaignGraph.story),
			story_links: getLinks(_.fromCampaignGraph.story),
			story_links_count: getLinks(_.fromCampaignGraph.story).length,
			story_images: getImages(_.fromCampaignGraph.story),
			story_images_count: getImages(_.fromCampaignGraph.story).length,
			story_videos: getVideos(_.fromCampaignGraph.story),
			story_videos_count: getVideos(_.fromCampaignGraph.story).length,

			risk: _.fromCampaignGraph.risks,

			creator_name: _.creatorName,
			creator_location: _.creatorLocation,
			creator_biography: _.creatorBiography,
			creator_image: _.creatorImage,
			creator_url: _.creatorUrl,
			creator_verified_identity: _.creatorVerifiedIdentity,
			creator_last_login: _.creatorLastLogin,
			creator_is_facebook_connected: _.creatorIsFacebookConnected,
			creator_number_of_launched_projects: _.creatorNumberOfLauncedProjects.totalCount,
			creator_number_of_backing_projects: _.creatorNumberOfBackingProjects,
			creator_contents_of_collaborators: _.creatorContentsOfCollaborators,
			creator_contents_of_websites: _.creatorContentsOfWebsites,

			contents_of_FAQ: _.contentsOfFAQ,

			top_cities_location_1st: _.topCityL1,
			top_cities_number_of_backers_1st: _.topCityB1,
			top_cities_location_2st: _.topCityL2,
			top_cities_number_of_backers_2st: _.topCityB2,
			top_cities_location_3st: _.topCityL3,
			top_cities_number_of_backers_3st: _.topCityB3,
			top_cities_location_4st: _.topCityL4,
			top_cities_number_of_backers_4st: _.topCityB4,
			top_cities_location_5st: _.topCityL5,
			top_cities_number_of_backers_5st: _.topCityB5,
			top_cities_location_6st: _.topCityL6,
			top_cities_number_of_backers_6st: _.topCityB6,
			top_cities_location_7st: _.topCityL7,
			top_cities_number_of_backers_7st: _.topCityB7,
			top_cities_location_8st: _.topCityL8,
			top_cities_number_of_backers_8st: _.topCityB8,
			top_cities_location_9st: _.topCityL9,
			top_cities_number_of_backers_9st: _.topCityB9,
			top_cities_location_10st: _.topCityL10,
			top_cities_number_of_backers_10st: _.topCityB10,

			top_countries_location_1st: _.topCTRYL1,
			top_countries_number_of_backers_1st: _.topCTRYB1,
			top_countries_location_2st: _.topCTRYL2,
			top_countries_number_of_backers_2st: _.topCTRYB2,
			top_countries_location_3st: _.topCTRYL3,
			top_countries_number_of_backers_3st: _.topCTRYB3,
			top_countries_location_4st: _.topCTRYL4,
			top_countries_number_of_backers_4st: _.topCTRYB4,
			top_countries_location_5st: _.topCTRYL5,
			top_countries_number_of_backers_5st: _.topCTRYB5,
			top_countries_location_6st: _.topCTRYL6,
			top_countries_number_of_backers_6st: _.topCTRYB6,
			top_countries_location_7st: _.topCTRYL7,
			top_countries_number_of_backers_7st: _.topCTRYB7,
			top_countries_location_8st: _.topCTRYL8,
			top_countries_number_of_backers_8st: _.topCTRYB8,
			top_countries_location_9st: _.topCTRYL9,
			top_countries_number_of_backers_9st: _.topCTRYB9,
			top_countries_location_10st: _.topCTRYL10,
			top_countries_number_of_backers_10st: _.topCTRYB10,
			number_of_new_backers: _.number_of_new_backers,
			number_of_returning_backers: _.number_of_returning_backers,

			shown_number_of_FAQ: _.shownNumberOfFAQ,
			shown_number_of_updates: _.shownNumberOfUpdates,
			shown_number_of_comments: _.shownNumberOfComments,
			//days_to_go: _.
			all_or_nothing: _.allOrNothing,

			contents_of_support_options: _.contentsOfSupportOptions,

			funding_period_start: _.start,
			funding_period_end: _.end,
			funding_period_duration: _.duration,
			last_updated: _.lastUpdated,
		}
	} else {
		pageData = {
			creator_name: _.creator.name,
			creator_location: _.creator.location.displayableName,
			creator_biography: _.creator.biography,
			creator_image: _.creator.imageUrl,
			creator_url: _.creator.url,
			creator_verified_identity: _.verifiedIdentity,
			creator_last_login: _.creator.lastLogin,
			creator_is_facebook_connected: _.creator.isFacebookConnected,
			creator_number_of_launched_projects: _.creator.launchedProjects.totalCount,
			creator_number_of_backing_projects: _.creator.backingsCount,
			creator_contents_of_collaborators: _.collaborators,
			creator_contents_of_websites: _.creator.websites,

			number_of_followers: _.watchesCount
		}
	}

	_ = rawData.commentData?.data?.[0]?.commentable?.comments?.edges;
	const commentData = {
		'comment_1_name': _?.[0]?.node?.author?.name,
		'comment_1_desc': _?.[0]?.node?.body,
		'comment_2_name': _?.[1]?.node?.author?.name,
		'comment_2_desc': _?.[1]?.node?.body,
		'comment_3_name': _?.[2]?.node?.author?.name,
		'comment_3_desc': _?.[2]?.node?.body,
		'comment_4_name': _?.[3]?.node?.author?.name,
		'comment_4_desc': _?.[3]?.node?.body,
		'comment_5_name': _?.[4]?.node?.author?.name,
		'comment_5_desc': _?.[4]?.node?.body,
		'comment_6_name': _?.[5]?.node?.author?.name,
		'comment_6_desc': _?.[5]?.node?.body,
		'comment_7_name': _?.[6]?.node?.author?.name,
		'comment_7_desc': _?.[6]?.node?.body,
		'comment_8_name': _?.[7]?.node?.author?.name,
		'comment_8_desc': _?.[7]?.node?.body,
		'comment_9_name': _?.[8]?.node?.author?.name,
		'comment_9_desc': _?.[8]?.node?.body,
		'comment_10_name': _?.[9]?.node?.author?.name,
		'comment_10_desc': _?.[9]?.node?.body,
	}

	_ = rawData.updateData?.data;
	const updateData = {
		update_1_title: _?.[0]?.node?.data?.title,
		update_1_publishedAt: _?.[0]?.node?.data?.publishedAt,
		update_1_authorName: _?.[0]?.node?.data?.author?.name,
		update_1_authorRole: _?.[0]?.node?.data?.authorRole,
		update_1_likesCount: _?.[0]?.node?.data?.likesCount,
		update_1_commentsCount: _?.[0]?.node?.data?.commentsCount,
		update_1_body_text: getTextContentExcludeFigureElement(_?.[0]?.node?.data?.body),
		update_1_body_img: getImages(_?.[0]?.node?.data?.body),

		update_2_title: _?.[1]?.node?.data?.title,
		update_2_publishedAt: _?.[1]?.node?.data?.publishedAt,
		update_2_authorName: _?.[1]?.node?.data?.author?.name,
		update_2_authorRole: _?.[1]?.node?.data?.authorRole,
		update_2_likesCount: _?.[1]?.node?.data?.likesCount,
		update_2_commentsCount: _?.[1]?.node?.data?.commentsCount,
		update_2_body_text: getTextContentExcludeFigureElement(_?.[1]?.node?.data?.body),
		update_2_body_img: getImages(_?.[1]?.node?.data?.body),

		update_3_title: _?.[2]?.node?.data?.title,
		update_3_publishedAt: _?.[2]?.node?.data?.publishedAt,
		update_3_authorName: _?.[2]?.node?.data?.author?.name,
		update_3_authorRole: _?.[2]?.node?.data?.authorRole,
		update_3_likesCount: _?.[2]?.node?.data?.likesCount,
		update_3_commentsCount: _?.[2]?.node?.data?.commentsCount,
		update_3_body_text: getTextContentExcludeFigureElement(_?.[2]?.node?.data?.body),
		update_3_body_img: getImages(_?.[2]?.node?.data?.body),

		update_4_title: _?.[3]?.node?.data?.title,
		update_4_publishedAt: _?.[3]?.node?.data?.publishedAt,
		update_4_authorName: _?.[3]?.node?.data?.author?.name,
		update_4_authorRole: _?.[3]?.node?.data?.authorRole,
		update_4_likesCount: _?.[3]?.node?.data?.likesCount,
		update_4_commentsCount: _?.[3]?.node?.data?.commentsCount,
		update_4_body_text: getTextContentExcludeFigureElement(_?.[3]?.node?.data?.body),
		update_4_body_img: getImages(_?.[3]?.node?.data?.body),

		update_5_title: _?.[4]?.node?.data?.title,
		update_5_publishedAt: _?.[4]?.node?.data?.publishedAt,
		update_5_authorName: _?.[4]?.node?.data?.author?.name,
		update_5_authorRole: _?.[4]?.node?.data?.authorRole,
		update_5_likesCount: _?.[4]?.node?.data?.likesCount,
		update_5_commentsCount: _?.[4]?.node?.data?.commentsCount,
		update_5_body_text: getTextContentExcludeFigureElement(_?.[4]?.node?.data?.body),
		update_5_body_img: getImages(_?.[4]?.node?.data?.body),
	}


//	_ = rawData.subCommentData;
//	const subCommentData = []
//
	
//	if(targetIdx === 0) console.log(pageData)

	const data = [{...createdAt, ...targetData, ...pageData, ...commentData, ...updateData}];
	sheet1.addRows(data)
}

workbook.xlsx.writeFile('../SCRAPED_RAW_DATA/3D Printing/excel.xlsx');

function readFiles(targetIdx) {

	const targetData = require(`../SCRAPED_RAW_DATA/3D Printing/${targetIdx}/targetData`).data

	const pageData = require(`../SCRAPED_RAW_DATA/3D Printing/${targetIdx}/pageData`).data

	let commentData = [];
	try{
		commentData = require(`../SCRAPED_RAW_DATA/3D Printing/${targetIdx}/commentData`).data
	}catch(err){}

	let updateData = []; 
	try{
		updateData = require(`../SCRAPED_RAW_DATA/3D Printing/${targetIdx}/updateData`).data
	}catch(err){}

	const subCommentData = [];
	try{
		subCommentData.push(require(`../SCRAPED_RAW_DATA/3D Printing/${targetIdx}/subCommentData_0`).data)
		subCommentData.push(require(`../SCRAPED_RAW_DATA/3D Printing/${targetIdx}/subCommentData_1`).data)
	}catch(err){
	}
	
	return {
		targetData: targetData,
		pageData: pageData,
		commentData: commentData,
		updateData: updateData,
		subCommentData: subCommentData
	}
}

function getTextContentExcludeFigureElement(html) {
	if(html === undefined || html === null) return undefined;

	const storyDom = cheerio.load(html)
	storyDom('figure').remove();
	return storyDom.text().replace(/\n\n\n/g,'');		// trim <br>
}

function getLinks(html) {
	if(html === undefined || html === null) return undefined;

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

function getImages(html) {
	if(html === undefined || html === null) return undefined;

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

function getVideos(html) {
	if(html === undefined || html === null) return undefined;

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

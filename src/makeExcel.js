const excel = require('exceljs');
const cheerio = require('cheerio');
const util = require('util');
const fs = require('fs');
const TOTAL_CATEGORY_POOLS = require('./categoryPool').data;

const POOL = TOTAL_CATEGORY_POOLS.find(ele => ele.subCategoryID === Number(process.argv[2]));

if(POOL === undefined) {
	console.log('존재하지 않는 서브 카테고리 아이디입니다.');
	process.exit(1);
}

//////////////////////////////////////////////////// Make new workbook and sheet, set columns
//////////////////////////////////////////////////// Make new workbook and sheet, set columns
//////////////////////////////////////////////////// Make new workbook and sheet, set columns
const workbookPage = new excel.Workbook();
const sheet1Page = workbookPage.addWorksheet('sheet1');

const workbookComment = new excel.Workbook();
const sheet1Comment = workbookComment.addWorksheet('sheet1');

const workbookUpdate = new excel.Workbook();
const sheet1Update = workbookUpdate.addWorksheet('sheet1');

const workbookUpdateComment = new excel.Workbook();
const sheet1UpdateComment = workbookUpdateComment.addWorksheet('sheet1');

////////////////////////////////////////////////////	set columns
////////////////////////////////////////////////////	set columns
////////////////////////////////////////////////////	set columns
const makePageColumns = () => {

	const fromFile = [
		'scraped_at',
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

	return [
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
	];
};
sheet1Page.columns = makePageColumns()
	.map(ele => ({header: ele, key: ele}));

sheet1Comment.columns = [
	'scraped_at',
	'project_url',
	'name',
	'date',
	'label',			//	author_role
	'content',
	'reply_name',
	'reply_date',
	'reply_label',
	'reply_content',
].map(ele => ({header: ele, key: ele}));

sheet1Update.columns = [
	'scraped_at',
	'project_url',

	'order',
	'type',
	'published_at',

	'title',
	'author_name',
	'author_role',
	'likes_count',
	'comments_count',
	'text',
	'links',
	'links_count',
	'imgs',
	'imgs_count',
	'videos',
	'videos_count'
].map(ele => ({header: ele, key: ele}));

sheet1UpdateComment.columns = [
	'scraped_at',
	'project_url',
	'update_number',
	'name',
	'date',
	'label',			//	author_role
	'content',
	'reply_name',
	'reply_date',
	'reply_label',
	'reply_content',
].map(ele => ({header: ele, key: ele}));

////////////////////////////////////////////////////	get total targets
////////////////////////////////////////////////////	get total targets
////////////////////////////////////////////////////	get total targets
const totolTarget = require(`../SCRAPED_RAW_DATA/${POOL.subCategory}/targets`).data;

////////////////////////////////////////////////////	iterate all targets to add raw each
////////////////////////////////////////////////////	iterate all targets to add raw each
////////////////////////////////////////////////////	iterate all targets to add raw each
let targetIdx = -1;
for (const target of totolTarget) {
	targetIdx++;

	if(target.isDone.pageData === false	||			//	pageData 수집이 완료되지 않은 target은 거른다.
		target.isDone.commentData === false	||		//	commentData 수집이 완료되지 않은 target은 거른다.
		target.isDone.updateData === false			//	updateData 수집이 완료되지 않은 target은 거른다.
	) continue;

	const [rawTargetData, rawPageData, rawCommentData, rawUpdateData, rawUpdateCommentData] = readFiles(targetIdx);

	const project_url = rawTargetData.urls.web.project.split('?')[0];

	let _;

	//	TARGET	
	//	TARGET	
	//	TARGET	
	_ = rawTargetData;
	const targetDataPairs = {
		project_state: _.state,
		project_url: project_url,
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
		percent_funded: _.state === 'live' ? _.percent_funded : _.pledged /_.goal *100,		//	percent_funded property might be shown on live type project
		backers_count: _.backers_count,

		staff_pick: _.staff_pick,
	}

	//	PAGE
	//	PAGE
	//	PAGE
	_ = rawPageData.data;
	let pageDataPairs;

//	console.log(project_url)
//	console.log(doo(_.contentsOfSupportOptions[_.contentsOfSupportOptions.length-1]))
//	break;
//
	if(targetDataPairs.project_state !== 'submitted' && targetDataPairs.project_state !== 'started') {
		pageDataPairs = {
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
			creator_number_of_launched_projects: targetDataPairs.project_state === 'successful' ? _.creatorNumberOfLauncedProjects : _.creatorNumberOfLauncedProjects.totalCount,
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
		if(_.contentsOfFAQ.length > 0) {
			console.log(project_url)
			console.log(doo(_.contentsOfFAQ[0]))
			break;
		}
	} else {
		pageDataPairs = {
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

	const pageRow = [{scraped_at: rawPageData.createdAt, ...targetDataPairs, ...pageDataPairs}];
	sheet1Page.addRows(pageRow);

	
	//	COMMENT
	//	COMMENT
	//	COMMENT
	if(rawCommentData !== undefined) {
		for (const group of rawCommentData.data) {

			for (const {
				node: forehead,				//	원댓글
				node: {
					replies: {
						nodes: replies		//	대댓글
					}
				}
			} of group.commentable.comments.edges) {

				const commentDataPairs = {
					name: forehead.author?.name,				//	탈퇴한 사용자의 경우 author가 null이 된다. 그래서 옵셔널 체이닝 걸어준다.
					date: forehead.createdAt,
					label: forehead.authorBadges?.join(', '),
					content: forehead.body,
					reply_name: replies[0]?.author?.name,		//	탈퇴한 사용자의 경우 author가 null이 된다. 그래서 옵셔널 체이닝 걸어준다.
					reply_date: replies[0]?.createdAt,
					reply_label: replies[0]?.authorBadges?.join(', '),
					reply_content: replies[0]?.body,
				}

				const commentRow = [{scraped_at: rawCommentData.createdAt, project_url: project_url, ...commentDataPairs}];
				sheet1Comment.addRows(commentRow);
			}
		}
	}


	if(rawUpdateData !== undefined) {
	//	UPDATE	
	//	UPDATE	
	//	UPDATE	
		let order = 1;
		for (const {node: each} of rawUpdateData.data.reverse()) {

			const updateDataPairs = {
				order: order++,
				type: each.type,
				published_at: each.timestamp,

				title: each.data.title,
				author_name: each.data.author?.name,
				author_role: each.data.authorRole,
				likes_count: each.data.likesCount,
				comments_count: each.data.commentsCount,
				text: getTextContentExcludeFigureElement(each.data.body),
				links: getLinks(each.data.body),
				links_count: getLinks(each.data.body)?.length,
				imgs: getImages(each.data.body),
				imgs_count: getImages(each.data.body)?.length,
				videos: getVideos(each.data.body),
				videos_count: getVideos(each.data.body)?.length,
			}

			const updateRow = [{scraped_at: rawUpdateData.createdAt, project_url: project_url, ...updateDataPairs}];
			sheet1Update.addRows(updateRow);
		}

	//	UPDATE COMMENT	
	//	UPDATE COMMENT	
	//	UPDATE COMMENT	
		order = 0;
		for (const groups of rawUpdateCommentData.reverse()) {
			order++;
			if(Array.isArray(groups)) continue;		//	댓글이 없는 update는 빈 배열인 updateCommentData를 가지고 있다.

			const scraped_at = groups.createdAt;

			for (const {
				commentable: {
					comments: {
						edges
					}
				}
			} of groups.data) {

				for (const {
					node: forehead,
					node: {
						replies: {
							nodes: replies
						}
					}
				} of edges) {

					const updateCommentDataPairs = {
						order: order,

						name: forehead.author?.name,				//	탈퇴한 사용자의 경우 author가 null이 된다. 그래서 옵셔널 체이닝 걸어준다.
						date: forehead.createdAt,
						label: forehead.authorBadges?.join(', '),
						content: forehead.body,
						reply_name: replies[0]?.author?.name,		//	탈퇴한 사용자의 경우 author가 null이 된다. 그래서 옵셔널 체이닝 걸어준다.
						reply_date: replies[0]?.createdAt,
						reply_label: replies[0]?.authorBadges?.join(', '),
						reply_content: replies[0]?.body,
					}

					const updateCommentRow = [{scraped_at: scraped_at, project_url: project_url, ...updateCommentDataPairs}];
					sheet1UpdateComment.addRows(updateCommentRow);
				}
			}
		}
	}
}

workbookPage.xlsx.writeFile(`../SCRAPED_RAW_DATA/${POOL.subCategory}/page.xlsx`);
workbookComment.xlsx.writeFile(`../SCRAPED_RAW_DATA/${POOL.subCategory}/comments.xlsx`);
workbookUpdate.xlsx.writeFile(`../SCRAPED_RAW_DATA/${POOL.subCategory}/updates.xlsx`);
workbookUpdateComment.xlsx.writeFile(`../SCRAPED_RAW_DATA/${POOL.subCategory}/update_comments.xlsx`);



function readFiles(targetIdx) {
	const baseDir = `../SCRAPED_RAW_DATA/${POOL.subCategory}/${targetIdx}`;

	const targetData = require(baseDir +'/targetData').data;

	const pageData = require(baseDir +'/pageData').data;

	let commentData;
	try { commentData = require(baseDir +'/commentData').data; }
	catch(err){}

	let updateData;
	try{ updateData = require(baseDir +'/updateData').data; }
	catch(err){}

	let subCommentData
	if(updateData !== undefined) {
		subCommentData = [];
		for(let i = 0; i <updateData.data.length; i++)
			subCommentData.push(require(baseDir +'/subCommentData_' +i).data)
	}
	
	return [
		targetData,
		pageData,
		commentData,
		updateData,
		subCommentData,
	]
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

function doo(html) {
	if(html === undefined || html === null) return undefined;

	const storyDom = cheerio.load(html)

	return storyDom.html()
}

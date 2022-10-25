const excel = require('exceljs');
const util = require('util');

const fromPage = require('../log/page.js');
const fromUpdates = require('../log/CreatorCampaignUpdates.js');
const fromComments = require('../log/Comments.js');
const r = {
	p: fromPage,
	u: fromUpdates[0].data.project.timeline.edges,	// array
	c: fromComments[0].data.commentable
}


const workbook = new excel.Workbook();

const sheet1 = workbook.addWorksheet('sheet1');

const makeColumns = () => {
	const fromThumbnailWithHeader = ['project_url', 'project_name', 'project_description', 'rate_of_funded', 'deadline', 'days_to_go', 'category', 'location', 'currency_type', 'currency_symbol', 'amount_of_pledged', 'funding_goal', 'number_of_backers', 'project_we_love(T/F)', 'project_imageURL'];
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

	const all = [...fromThumbnailWithHeader, ...fromCreator, ...fromCampaign, ...fromSupport, ...fromFAQ, ...fromUpdates, ...fromComments, ...fromCommunitiy];
	return all.map(ele => {
		return {header: ele, key: ele}
	})
};

sheet1.columns = [
	...makeColumns()
]

//console.log(util.inspect(r.c.comments.edges, {depth: null}))
//console.log(typeof JSONdata.page, typeof JSONdata.updates, typeof JSONdata.comments)

const data = [
	{
		project_url: r.p.project_name,
		project_name: r.p.project_name,
		project_description: r.p.project_description,
		rate_of_funded: r.p.rate_of_funded,
		deadline: r.p.deadline,
		days_to_go: r.p.days_to_go,
		category: r.p.category,
		location: r.p.location,
		currency_type: r.p.currency_type,
		currency_symbol: r.p.currency_symbol,
		amount_of_pledged: r.p.amount_of_pledged,
		funding_goal: r.p.funding_goal,
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
		number_of_support_options: r.p.number_of_support_options,
		contents_of_support_options: r.p.contents_of_support_options,
		number_of_FAQ: r.p.number_of_FAQ,
		contents_of_FAQ: r.p.contents_of_FAQ,
		number_of_updates: r.p.number_of_updates,
		contents_of_updates: r.u[0].node.data,		//	issue
		number_of_comments_depth_all: r.p.number_of_comments_depth_all,
		number_of_comments_depth_1: r.c.commentsCount,		//	issue
		contents_of_comments: r.c.comments.edges,		//	issue
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
		number_of_returning_backers: r.p.number_of_returning_backers
	}
];

sheet1.addRows(data);

workbook.xlsx.writeFile('../log/excel.xlsx');


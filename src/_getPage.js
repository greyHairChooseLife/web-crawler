const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const userAgent = require('user-agents');
const {globalVariable} = require('./public/global');
const {solveCaptchar} = require('./util/solve-captcha');
const {numberize} = require('./util/my-util');

const util = require('util');

//async function grepLiveSuccessFailCancel(url, isSuccessfulProject, slugFromTargetData) {
async function grepLiveSuccessFailCancel(url, projectState, slugFromTargetData) {
	const browser = await puppeteer.launch(globalVariable.browserOptions);
	const page = await browser.newPage();     
	await page.setUserAgent(userAgent.random().toString());
	await page.setBypassCSP(true)
	await page.authenticate({ username: globalVariable.proxyInfo.name, password: globalVariable.proxyInfo.pw });

	try {

		let fromCampaignGraph;
		await page.on('response', async response => {
			// Ignore OPTIONS requests
			if(response.request().method() !== 'POST') return
			if(response.url().includes('/graph')) {
				let data;
				try{
					data = await response.json()
				}catch(err){
					return
				}

				if(data === undefined || data[0]?.data?.project?.story === undefined) return
				else fromCampaignGraph = data[0].data.project;
			}
		})

		await page.goto(url, { waitUntil: 'networkidle0', });
		await solveCaptchar(page);

		//	check and update state 
		//	state can be changed as time goes by
		if(projectState === 'live') {
			const presentState = await page.$eval('#react-project-header', ele => {
				return JSON.parse(ele.getAttribute('data-initial')).project.state
			})

			projectState = presentState.toLowerCase();
		}

		let creatorData;
		//if(!isSuccessfulProject) {
		if(projectState !== 'successful') {
			creatorData = await page.$eval('#react-project-header', ele => {
				const dataInitialObj = JSON.parse(ele.getAttribute('data-initial'));	//	data-initial 속성에 필요한 데이터를 로드 해 놓아서 활용한다.

				return {
					creatorName: dataInitialObj.project.creator.name,
					creatorLocation: dataInitialObj.project.creator.location.displayableName,
					creatorBiography: dataInitialObj.project.creator.biography,
					creatorImage: dataInitialObj.project.creator.imageUrl,
					creatorUrl: dataInitialObj.project.creator.url,
					creatorVerifiedIdentity: dataInitialObj.project.verifiedIdentity,
					creatorLastLogin: dataInitialObj.project.creator.lastLogin,
					creatorIsFacebookConnected: dataInitialObj.project.creator.isFacebookConnected,
					creatorNumberOfLauncedProjects: dataInitialObj.project.creator.launchedProjects,
					creatorNumberOfBackingProjects: dataInitialObj.project.creator.backingsCount,
					creatorContentsOfCollaborators: dataInitialObj.project.collaborators.edges,
					creatorContentsOfWebsites: dataInitialObj.project.creator.websites,
				}
			});
		} else {
			await page.waitForTimeout(globalVariable.randomTime.fifteenSec);
			data_ = await getCreatorData(url, slugFromTargetData);
			creatorData = {
				creatorName: data_.creator.name,
				creatorLocation: data_.creator.location.displayableName,
				creatorBiography: data_.creator.biography,
				creatorImage: data_.creator.imageUrl,
				creatorUrl: data_.creator.url,
				creatorVerifiedIdentity: data_.verifiedIdentity,
				creatorLastLogin: data_.creator.lastLogin,
				creatorIsFacebookConnected: data_.creator.isFacebookConnected,
				creatorNumberOfLauncedProjects: data_.creator.launchedProjects.totalCount,
				creatorNumberOfBackingProjects: data_.creator.backingsCount,
				creatorContentsOfCollaborators: data_.collaborators.edges,
				creatorContentsOfWebsites: data_.creator.websites,
			}
		}

		let allOrNothing;
		//	live 프로젝트에만 존재하는 요소
		if(projectState === 'live') {
			allOrNothing = await page.$eval('#react-project-header > div > div.grid-container.flex.flex-column > div.grid-row.order2-md.hide-lg.mb3-md > div > div > p > span.link-soft-black.medium > a', ele => {
				if(ele.textContent === 'All or nothing.') return true
				return false
			})
		}

		let lastUpdated;
		//	successful, failed, canceled 프로젝트에만 존재하는 요소
		if(projectState === 'successful') {
			lastUpdated = await page.$eval('#content-wrap > section > div.project-profile__content > div.grid-container.pb3.pb10-sm > div > div.grid-col-12.grid-col-4-lg > div.NS_campaigns__spotlight_stats > div > div > span:nth-child(2) > a > time', ele => {
				return ele.textContent
			})
		}
		else if(projectState !== 'live') {
			lastUpdated = await page.$eval('#react-project-header > div > div > div.grid-row.order2-md.hide-lg.mb3-md > div > div.flex.items-center.mt4 > span > a', ele => {
				return ele.textContent
			})
		}

		const contentsOfSupportOptions =[];
		const optionsList = await page.$$('#content-wrap > div.NS_projects__content > section.js-project-content.js-project-description-content.project-content > div > div > div > div.col.col-4.js-rewards-column.max-w62.sticky-rewards > div > div.mobile-hide > div > ol > li');
		for(option of optionsList){
			contentsOfSupportOptions.push(await page.evaluate(ele => ele?.querySelector('div.pledge__info')?.outerHTML, option))
			//	펀딩 옵션에도 제한 수량이 있다. 모두 팔리면 pledge__info클래스를 가진 element는 사라지고 All gone!이라는 textContent만 남는다.
			if(await page.evaluate(ele => ele.querySelector('div.pledge__info')?.outerHTML, option) === undefined) contentsOfSupportOptions.push(await page.evaluate(ele => ele?.outerHTML, option))
		}

		let fundingPeriod = {
			start: undefined,
			end: undefined,
			duration: undefined
		};
		if(projectState !== 'live') {
			fundingPeriod = await page.$eval('#content-wrap > div.NS_projects__content > section.js-project-content.js-project-description-content.project-content > div > div > div > div.col.col-4.js-rewards-column.max-w62.sticky-rewards > div > div.NS_campaigns__funding_period > p', ele => {
				return {
//					start: ele.querySelector('time:nth-child(1)')?.textContent,
//					end: ele.querySelector('time:nth-child(2)')?.textContent,
//					duration: ele.textContent?.match(/\(.*\)/)[0]?.split(' ')[0]?.slice(1) *1
					start: ele.querySelector('time:nth-child(1)').textContent,
					end: ele.querySelector('time:nth-child(2)').textContent,
					duration: ele.textContent.match(/\(.*\)/)[0].split(' ')[0].slice(1) *1
				}
			})
		}

		const countingDataPot = await page.$('#react-campaign-nav');
		if(countingDataPot === null) throw new Error('#react-campaign-nav를 찾을 수 없습니다.')
		const shownNumberOfFAQ = await page.evaluate(ele => JSON.parse(ele.getAttribute('data-campaign')).projectFAQsCount, countingDataPot);
		const shownNumberOfUpdates = await page.evaluate(ele => JSON.parse(ele.getAttribute('data-campaign')).updateCount, countingDataPot);
		const shownNumberOfComments = await page.evaluate(ele => JSON.parse(ele.getAttribute('data-campaign')).commentsCount, countingDataPot);

		const contentsOfFAQ =[];	// FAQ가 존재하지 않는다면 빈 배열로 남는다.
		if(shownNumberOfFAQ !== 0){
			const page2 = await browser.newPage();     
			await page2.goto(url+'/faqs', { waitUntil: 'networkidle0', });
			await solveCaptchar(page2);

			const listOfFAQ = await page2.$$('#project-faqs > div > div > div.grid-row.mb6.flex.flex-row-sm.flex-column-reverse > ul > li');
			for(eachFAQ of listOfFAQ){
				contentsOfFAQ.push(await page2.evaluate(ele => ele.outerHTML, eachFAQ))
			}
		}

		let community = {};			//	커뮤니티가 존재하지 않는 경우도 있다.
		if(await page.$('#community-emoji') !== null){		
			const page3 = await browser.newPage();     
			await page3.goto(url+'/community', { waitUntil: 'networkidle0', });
			await solveCaptchar(page3);

			if(await page3.$('div.community-section__small_community') === null){
				const fromCommunityCities = await page3.$$eval('div.community-section__locations_cities > div > div > div', eles => {
					return eles.map(ele => {
						return [
							ele.querySelector('div.left').textContent.split('\n\n\n')[0].substring(2) + ' ' + ele.querySelector('div.left').textContent.split('\n\n\n')[1].slice(0, -2),
							ele.querySelector('div.right').textContent.split(' ')[0].substring(2)
						];
					})
				});
				const fromCommunityCountries = await page3.$$eval('div.community-section__locations_countries > div > div > div', eles => {
					return eles.map(ele => {
						return [
							ele.querySelector('div.left').textContent.substring(2).slice(0, -2),
							ele.querySelector('div.right').textContent.split(' ')[0].substring(2)
						];
					})
				});
				const numberOfNewBackers = await page3.$eval('div.new-backers > div.count', ele => {
					function numberize(str) {
						return Number(str.split('').reduce((prev, curr) => {
							if(curr.charCodeAt(0) >= 48 && curr.charCodeAt(0) <= 57) return prev+curr
							else return prev
						}, ''))
					}

					return numberize(ele.textContent) * 1
				});
				const numberOfReturningBackers = await page3.$eval('div.existing-backers > div.count', ele => {
					function numberize(str) {
						return Number(str.split('').reduce((prev, curr) => {
							if(curr.charCodeAt(0) >= 48 && curr.charCodeAt(0) <= 57) return prev+curr
							else return prev
						}, ''))
					}

					return numberize(ele.textContent) * 1
				});
				community = {
					topCityL1: fromCommunityCities[0]?.[0],
					topCityB1: fromCommunityCities[0]?.[1],
					topCityL2: fromCommunityCities[1]?.[0],
					topCityB2: fromCommunityCities[1]?.[1],
					topCityL3: fromCommunityCities[2]?.[0],
					topCityB3: fromCommunityCities[2]?.[1],
					topCityL4: fromCommunityCities[3]?.[0],
					topCityB4: fromCommunityCities[3]?.[1],
					topCityL5: fromCommunityCities[4]?.[0],
					topCityB5: fromCommunityCities[4]?.[1],
					topCityL6: fromCommunityCities[5]?.[0],
					topCityB6: fromCommunityCities[5]?.[1],
					topCityL7: fromCommunityCities[6]?.[0],
					topCityB7: fromCommunityCities[6]?.[1],
					topCityL8: fromCommunityCities[7]?.[0],
					topCityB8: fromCommunityCities[7]?.[1],
					topCityL9: fromCommunityCities[8]?.[0],
					topCityB9: fromCommunityCities[8]?.[1],
					topCityL10: fromCommunityCities[9]?.[0],
					topCityB10: fromCommunityCities[9]?.[1],

					topCTRYL1: fromCommunityCountries[0]?.[0],
					topCTRYB1: fromCommunityCountries[0]?.[1],
					topCTRYL2: fromCommunityCountries[1]?.[0],
					topCTRYB2: fromCommunityCountries[1]?.[1],
					topCTRYL3: fromCommunityCountries[2]?.[0],
					topCTRYB3: fromCommunityCountries[2]?.[1],
					topCTRYL4: fromCommunityCountries[3]?.[0],
					topCTRYB4: fromCommunityCountries[3]?.[1],
					topCTRYL5: fromCommunityCountries[4]?.[0],
					topCTRYB5: fromCommunityCountries[4]?.[1],
					topCTRYL6: fromCommunityCountries[5]?.[0],
					topCTRYB6: fromCommunityCountries[5]?.[1],
					topCTRYL7: fromCommunityCountries[6]?.[0],
					topCTRYB7: fromCommunityCountries[6]?.[1],
					topCTRYL8: fromCommunityCountries[7]?.[0],
					topCTRYB8: fromCommunityCountries[7]?.[1],
					topCTRYL9: fromCommunityCountries[8]?.[0],
					topCTRYB9: fromCommunityCountries[8]?.[1],
					topCTRYL10: fromCommunityCountries[9]?.[0],
					topCTRYB10: fromCommunityCountries[9]?.[1],

					number_of_new_backers: numberOfNewBackers,
					number_of_returning_backers: numberOfReturningBackers 
				}
			}
		}

		await browser.close(); // ➐ 작업이 완료되면 브라우저 종료

		return {
			commentableID: fromCampaignGraph.id,
			fromCampaignGraph: fromCampaignGraph,
			...creatorData,
			allOrNothing: allOrNothing,
			lastUpdated: lastUpdated,
			contentsOfSupportOptions: contentsOfSupportOptions,
			...fundingPeriod,
			shownNumberOfUpdates: shownNumberOfUpdates,
			shownNumberOfComments: shownNumberOfComments,
			shownNumberOfFAQ: shownNumberOfFAQ,
			contentsOfFAQ: contentsOfFAQ,
			...community,
		}
	}
	catch(err) {
		console.log('getPage함수 실행이 실패했습니다.')
		console.log()
		console.error(err)
	}
	finally {
		browser.close();	// 상기 과정에 에러가 발생해도 브라우저는 반드시 종료되도록 한다.
	}
}

//	SELF DESCRIPTING FUNCTION
//	
//	위의 본 함수에서 successful 타입의 프로젝트의 경우, creator정보를 페이지 내부에서 얻을 수 없다. 그 부분을 메꿔주는 역 함수.
const getCreatorData = async (url, slug) => {
	const browser = await puppeteer.launch(globalVariable.browserOptions);
	const page = await browser.newPage();     
	await page.setUserAgent(userAgent.random().toString());
	await page.setBypassCSP(true)
	await page.setRequestInterception(true)
	await page.authenticate({ username: globalVariable.proxyInfo.name, password: globalVariable.proxyInfo.pw });

	try {
		let isVirgin = true;	//	한번이면 족하다.
		await page.on('request', async request => {
			if(!isVirgin) {
				await request.continue();
				return;
			}
			if(request.url().includes('/graph') && request.method() === 'POST'){
				const xcsrfToken = await request.headers()["x-csrf-token"];
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
				isVirgin = false;
			} 
			else {
				await request.continue()
			}
		})

		let result;
		await page.on('response', async response => {
			// Ignore OPTIONS requests
			if(response.request().method() !== 'POST') return
			if(response.url().includes('/graph')) {
				let data;
				try{
					data = await response.json()
				}catch(err){
					return
				}
				if(data?.data?.project?.creator?.name !== undefined) result = data.data.project;
			}
		})

		await page.goto(url, { waitUntil: 'networkidle0', });
		await solveCaptchar(page);

		await browser.close();

		return result;
	}
	catch(err) {
		console.log('getPage함수 내에서 실행한 getCreatorData함수의  실행이 실패했습니다.')
		console.log()
		console.error(err)
	}
	finally {
		browser.close(); // 상기 과정에 에러가 발생해도 브라우저는 반드시 종료되도록 한다.
	}
}


async function grepSubmitStart(url) {
	const browser = await puppeteer.launch(globalVariable.browserOptions);
	const page = await browser.newPage();     
	await page.setUserAgent(userAgent.random().toString());
	await page.setBypassCSP(true)

	try {
		let result;
		await page.on('response', async response => {
			// Ignore OPTIONS requests
			if(response.request().method() !== 'POST') return
			if(response.url().includes('/graph')) {
				let data;
				try{
					data = await response.json()
				}catch(err){
					return
				}

				if(data[0]?.data?.project !== undefined) result = data[0]?.data?.project;
			}
		})

		await page.goto(url, { waitUntil: 'networkidle0', });
		await solveCaptchar(page);

		await browser.close();

		return result
	} 
	catch(err) {
		console.log('getPage함수 실행이 실패했습니다.')
		console.log()
		console.error(err)
	}
	finally {
		browser.close();	// 상기 과정에 에러가 발생해도 브라우저는 반드시 종료되도록 한다.
	}
}


module.exports = {grepLiveSuccessFailCancel, grepSubmitStart};


////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
	// TESTING CODE
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
//
//(
//	async () => {
//		const live_url = `https://www.kickstarter.com/projects/print3dhandsome/jobox`;
//		const successful_url = `https://www.kickstarter.com/projects/mayku/formbox-a-desktop-vacuum-former-that-makes-beautif`;
//		const submitted_url = `https://www.kickstarter.com/projects/valueselect/mirth-pop-cd`;
//		const canceled_url = 'https://www.kickstarter.com/projects/1012285011/hand-painted-mugs-that-will-make-you-smile-loveina';
//		const slug = 'formbox-a-desktop-vacuum-former-that-makes-beautif';
//
//		const a = await grepLiveSuccessFailCancel(canceled_url, 'canceled', slug);
//		//const a = await grepSubmitStart('https://www.kickstarter.com/projects/valueselect/mirth-pop-cd', true, slug);
//
//		//const a = await getCreatorData(slug)
//		console.log(util.inspect(a, {depth: null}));
//
//	}
//)()

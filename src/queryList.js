exports.queryList = {
	getCreator: {
		operationName: null,
		query: `
			query CreatorSection($slug: String!) {
			  me {
				id
				name
			  }
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
			}
		`,
		variables: {
		  "slug": "coffincomics/brian-pulidos-all-new-hellwitch-forbidden-1"
		}
	},

	getCampaign: {
		operationName: 'Campaign',
		query: `
			query Campaign($slug: String!) {
			  project(slug: $slug) {
				id
				isSharingProjectBudget
				risks
				story(assetWidth: 680)
				currency
				spreadsheet {
				  displayMode
				  public
				  url
				  data {
					name
					value
					phase
					rowNum
					__typename
				  }
				  dataLastUpdatedAt
				  __typename
				}
				environmentalCommitments {
				  id
				  commitmentCategory
				  description
				  __typename
				}
				__typename
			  }
			}
		`,
		variables: {
		  "slug": "coffincomics/brian-pulidos-all-new-hellwitch-forbidden-1"
		}
	},

	getComments: {
		operationName: null,
		query: `
			query ($commentableId: ID!, $nextCursor: String, $previousCursor: String, $replyCursor: String, $first: Int, $last: Int) {
			  commentable: node(id: $commentableId) {
				id
				... on Project {
				  url
				  __typename
				}
				... on Commentable {
				  canComment
				  canCommentSansRestrictions
				  commentsCount
				  projectRelayId
				  canUserRequestUpdate
				  comments(first: $first, last: $last, after: $nextCursor, before: $previousCursor) {
					edges {
					  node {
						...CommentInfo
						...CommentReplies
						__typename
					  }
					  __typename
					}
					pageInfo {
					  startCursor
					  hasNextPage
					  hasPreviousPage
					  endCursor
					  __typename
					}
					__typename
				  }
				  __typename
				}
				__typename
			  }
			  me {
				id
				name
				imageUrl(width: 200)
				isKsrAdmin
				url
				userRestrictions {
				  restriction
				  releaseAt
				  __typename
				}
				__typename
			  }
			}

			fragment CommentInfo on Comment {
			  id
			  body
			  createdAt
			  parentId
			  author {
				id
				imageUrl(width: 200)
				name
				url
				__typename
			  }
			  removedPerGuidelines
			  authorBadges
			  canReport
			  canDelete
			  canPin
			  hasFlaggings
			  deletedAuthor
			  deleted
			  sustained
			  pinnedAt
			  authorCanceledPledge
			  authorBacking {
				backingUrl
				id
				__typename
			  }
			  __typename
			}

			fragment CommentReplies on Comment {
			  replies(last: 3, before: $replyCursor) {
				totalCount
				nodes {
				  ...CommentInfo
				  __typename
				}
				pageInfo {
				  startCursor
				  hasPreviousPage
				  __typename
				}
				__typename
			  }
			  __typename
			}
		`,
		variables: {
		  "commentableId": "UHJvamVjdC0xMDYxMDUxMzU2",
		  "nextCursor": null,
		  "previousCursor": null,
		  "replyCursor": null,
		  "first": 25,
		  "last": null
		}
//		variables: {
//		  "commentableId": "UHJvamVjdC01NzE2NDgwNjM=",
//		  "nextCursor": null,
//		  "previousCursor": null,
//		  "replyCursor": null,
//		  "first": null,
//		  "last": 40
//		}
	},
	
	getUpdates: {
		operationName: 'PostsFeed',
		query: `
			query PostsFeed($projectSlug: String!, $cursor: String) {
			  me {
				id
				isKsrAdmin
				__typename
			  }
			  project(slug: $projectSlug) {
				id
				slug
				state
				canUserRequestUpdate
				timeline(first: 10, after: $cursor) {
				  totalCount
				  pageInfo {
					hasNextPage
					endCursor
					__typename
				  }
				  edges {
					node {
					  type
					  timestamp
					  data {
						... on Project {
						  goal {
							currency
							amount
							__typename
						  }
						  pledged {
							currency
							amount
							__typename
						  }
						  backersCount
						  __typename
						}
						... on Postable {
						  id
						  type
						  title
						  publishedAt
						  pinnedAt
						  number
						  actions {
							read
							pin
							__typename
						  }
						  author {
							name
							imageUrl(width: 120)
							__typename
						  }
						  authorRole
						  isPublic
						  likesCount
						  ... on CreatorInterview {
							commentsCount(withReplies: true)
							answers {
							  nodes {
								id
								body
								question {
								  id
								  body
								  __typename
								}
								__typename
							  }
							  __typename
							}
							__typename
						  }
						  ... on FreeformPost {
							commentsCount(withReplies: true)
							body
							nativeImages {
							  id
							  url
							  __typename
							}
							__typename
						  }
						  __typename
						}
						__typename
					  }
					  __typename
					}
					__typename
				  }
				  __typename
				}
				__typename
			  }
			}
		`,
		variables: {
		  "projectSlug": "magikitty-travel-journal-of-a-witch-cat",
		  "cursor": null
		}
	},

	getViewPost: {
		operationName: 'ViewPost',
		query: `
			query ViewPost($id: ID!) {
			  me {
				id
				isKsrAdmin
				__typename
			  }
			  post(id: $id) {
				id
				type
				title
				publishedAt
				pinnedAt
				number
				actions {
				  publish
				  destroy
				  update
				  read
				  edit
				  pin
				  __typename
				}
				author {
				  name
				  imageUrl(width: 120)
				  __typename
				}
				authorRole
				project {
				  state
				  __typename
				}
				isPublic
				isLiked
				likesCount
				... on CreatorInterview {
				  commentsCount(withReplies: true)
				  __typename
				}
				... on FreeformPost {
				  commentsCount(withReplies: true)
				  __typename
				}
				timeLeftToEdit
				nextPost {
				  id
				  __typename
				}
				previousPost {
				  id
				  __typename
				}
				__typename
			  }
			}
		`,
		variables: {
		  "id": "3640629"
		}
	},

	getFreeformPost: {
		operationName: 'FreeformPost',
		query: `
			query FreeformPost($id: ID!) {
			  post(id: $id) {
				id
				... on FreeformPost {
				  body
				  nativeImages {
					id
					url
					__typename
				  }
				  __typename
				}
				__typename
			  }
			}
		`,
		variables: {
		  "id": "3640629"
		}
	},

	no_2: {
		operationName: 'FetchProjectSignalAndWatchStatus',
		query: `
			query FetchProjectSignalAndWatchStatus($pid: Int) {
			  project(pid: $pid) {
				...project
				__typename
			  }
			  me {
				...user
				__typename
			  }
			}

			fragment project on Project {
			  id
			  pid
			  isDisliked
			  isLiked
			  isWatched
			  isWatchable
			  isLaunched
			  __typename
			}

			fragment user on User {
			  id
			  uid
			  canSeeConfirmWatchModal
			  canSeeConfirmSignalModal
			  isEmailVerified
			  __typename
			}
		`,
		variables: {
		  "pid": 1658907685
		}
	},

	no_3: {
		operationName: null,
		query: `
			query($slug: String!) {
			  project(slug: $slug) {
				creator {
				  isFollowing
				}
				backing {
				  backer {
					isKsrAdmin
					location {
					  country
					  id
					}
				  }
				  amount {
					amount
					currency
					symbol
				  }
				  processing
				}
				isWatched
				isWatchable
				fxRate
				friends {
				  nodes {
					name
					imageUrl(width: 200)
				  }
				}
			  }
			  me {
				id
				chosenCurrency
				canSeeConfirmWatchModal
				imageUrl(width: 120)
				name
			  }
			}
		`,
		variables: {
		  "slug": "571648063"
		}
	},

	getWeAlsoRecommend: {
		operationName: null,
		query: `
			query($currentProjectPid: Int!, $currentProjectPidString: String!) {
			  projects(recommended: true, first: 4, excludePids: [$currentProjectPid], seed: $currentProjectPid, similarToPid: $currentProjectPidString, state: LIVE) {
				nodes {
				  id
				  pid
				  name
				  url
				  percentFunded
				  description
				  creator {
					name
					url
				  }
				  isWatched
				  isLiked
				  isDisliked
				  isLaunched
				  isWatchable
				  image {
					url(width: 300)
				  }
				}
			  }
			}
		`,
		variables: {
		  "currentProjectPid": 571648063,
		  "currentProjectPidString": "571648063"
		}
	},

//	getProjectId: {
//		operationName: 
//		query: `
//		`,
//		variables: 
//	},
//
}

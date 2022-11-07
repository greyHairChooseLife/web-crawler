const m =  [
  {
    name: 'Arts',
    queryString: '/arts?ref=section-homepage-nav-click-arts'
  },
  {
    name: 'Comics & Illustration',
    queryString: '/comics-illustration?ref=section-homepage-nav-click-comics-illustration'
  },
  {
    name: 'Design & Tech',
    queryString: '/design-tech?ref=section-homepage-nav-click-design-tech'
  },
  {
    name: 'Film',
    queryString: '/film?ref=section-homepage-nav-click-film'
  },
  {
    name: 'Food & Craft',
    queryString: '/food-craft?ref=section-homepage-nav-click-food-craft'
  },
  {
    name: 'Games',
    queryString: '/games?ref=section-homepage-nav-click-games'
  },
  {
    name: 'Music',
    queryString: '/music?ref=section-homepage-nav-click-music'
  },
  {
    name: 'Publishing',
    queryString: '/publishing?ref=section-homepage-nav-click-publishing'
  }
]

const s = [
  [
    {
      subName: 'Explore Art',
      url: 'https://www.kickstarter.com/discover/categories/art'
    },
    {
      subName: 'Explore Dance',
      url: 'https://www.kickstarter.com/discover/categories/dance'
    },
    {
      subName: 'Explore Photography',
      url: 'https://www.kickstarter.com/discover/categories/photography'
    },
    {
      subName: 'Explore Theater',
      url: 'https://www.kickstarter.com/discover/categories/theater'
    }
  ],
  [
    {
      subName: 'Explore Comics',
      url: 'https://www.kickstarter.com/discover/categories/comics'
    },
    {
      subName: 'Explore Illustration',
      url: 'https://www.kickstarter.com/discover/categories/art/illustration'
    }
  ],
  [
    {
      subName: 'Explore Design',
      url: 'https://www.kickstarter.com/discover/categories/design'
    },
    {
      subName: 'Explore Technology',
      url: 'https://www.kickstarter.com/discover/categories/technology'
    }
  ],
  [
    {
      subName: 'Explore Film & Video',
      url: 'https://www.kickstarter.com/discover/categories/film%20&%20video'
    }
  ],
  [
    {
      subName: 'Explore Crafts',
      url: 'https://www.kickstarter.com/discover/categories/crafts'
    },
    {
      subName: 'Explore Fashion',
      url: 'https://www.kickstarter.com/discover/categories/fashion'
    },
    {
      subName: 'Explore Food',
      url: 'https://www.kickstarter.com/discover/categories/food'
    }
  ],
  [
    {
      subName: 'Explore Games',
      url: 'https://www.kickstarter.com/discover/categories/games'
    }
  ],
  [
    {
      subName: 'Explore Music',
      url: 'https://www.kickstarter.com/discover/categories/music'
    }
  ],
  [
    {
      subName: 'Explore Journalism',
      url: 'https://www.kickstarter.com/discover/categories/journalism'
    },
    {
      subName: 'Explore Publishing',
      url: 'https://www.kickstarter.com/discover/categories/publishing'
    }
  ]
]

const sum = [];
for(let i=0; i<m.length; i++){
	for(let j=0; j<s[i].length; j++){
		sum.push({
			mainCategory: m[i].name,
			subCategory: s[i][j].subName.substring(8),
			categoryId: '',
		})
	}
}

console.log(sum);

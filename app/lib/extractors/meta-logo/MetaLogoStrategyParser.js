class MetaLogoStrategyParser {
	document;

	constructor(document) {
		this.document = document;
	}

	getExtractors() {
		return {
			'meta': (node) => {
				return node.getAttribute('content');
			},
			'link': (node) => {
				return node.getAttribute('href');
			},
			'json': (node) => {
				return JSON.parse(node.innerHTML).logo;
			},
			'twitter': (node) => {
				let twitterUrl = 'https://twitter.com/' + node.getAttribute('content');
				return {strategy: 'twitter-logo', url: twitterUrl};
			},
			'facebook': (node) => {
				// if multiple: take first only 131666743524308,131666743524308
				let id = node.getAttribute('content').split(',')[0],
					fbUrl = 'https://fb.com/' + id;
				return {strategy: 'facebook-logo', url: fbUrl};
			}
		};
	}

	getQueries() {
		return [
			// images
			{type: 'meta/property=og:image', query: 'meta[property="og:image"]', weight: 1, extractor: 'meta'},
			{type: 'meta/property=og:image:url', query: 'meta[property="og:image:url"]', weight: 1, extractor: 'meta'},
			{type: 'meta/property=og:image:secure-url', query: 'meta[property="og:image:secure_url"]', weight: 1, extractor: 'meta'},
			{type: 'meta/content=logo', query: 'meta[content="logo"]', weight: 2, extractor: 'meta'},
			{type: 'meta/content=image', query: 'meta[content="image"]', weight: 1, extractor: 'meta'},
			{type: 'meta/itemprop=logo', query: 'meta[itemprop="logo"]', weight: 2, extractor: 'meta'},
			{type: 'meta/itemprop=image', query: 'meta[itemprop="image"]', weight: 1, extractor: 'meta'},
			{type: 'meta/name=msapplication-TileImage', query: 'meta[name="msapplication-TileImage"]', weight: 1.5, extractor: 'meta'},
			{type: 'meta/name=msapplication-TileImage', query: 'meta[name^="msapplication-square"]', weight: 1.5, extractor: 'meta'},
			{type: 'link/rel=logo', query: 'link[rel="logo"]', weight: 2, extractor: 'link'},
			{type: 'link/rel=icon', query: 'link[rel="icon"]', weight: 1.5, extractor: 'link'},
			{type: 'link/rel=shortcut-icon', query: 'link[rel="shortcut-icon"]', weight: 2, extractor: 'link'},
			{type: 'link/rel=shortcut icon', query: 'link[rel="shortcut icon"]', weight: 2, extractor: 'link'},
			{type: 'link/rel=fluid-icon', query: 'link[rel="fluid-icon"]', weight: 2, extractor: 'link'},
			{type: 'link/rel=apple-touch-icon', query: 'link[rel="apple-touch-icon"]', weight: 1.5, extractor: 'link'},
			{type: 'link/rel=apple-touch-icon-precomposed', query: 'link[rel="apple-touch-icon-precomposed"]', weight: 1.5, extractor: 'link'},
			{type: 'link/rel=mask-icon', query: 'link[rel="mask-icon"]', weight: 1.5, extractor: 'link'},
			{type: 'meta/property=twitter:image', query: 'meta[property="twitter:image"]', weight: 1, extractor: 'meta'},
			{type: 'meta/name=twitter:image', query: 'meta[name="twitter:image"]', weight: 1, extractor: 'meta'},

			// socials
			{type: 'meta/name=twitter:creator', query: 'meta[name^="twitter:creator"]', weight: 1.5, extractor: 'twitter'},
			{type: 'meta/property=twitter:creator', query: 'meta[property^="twitter:creator"]', weight: 1.5, extractor: 'twitter'},
			{type: 'meta/name=twitter:site', query: 'meta[name^="twitter:site"]', weight: 1.5, extractor: 'twitter'},
			{type: 'meta/property=twitter:site', query: 'meta[property^="twitter:site"]', weight: 1.5, extractor: 'twitter'},
			{type: 'meta/name=twitter:account_id', query: 'meta[name="twitter:account_id"]', weight: 1.5, extractor: 'twitter'},
			{type: 'meta/property=twitter:account_id', query: 'meta[property="twitter:account_id"]', weight: 1.5, extractor: 'twitter'},
			{type: 'meta/name=fb:page_id', query: 'meta[name="fb:page_id"]', weight: 1.5, extractor: 'facebook'},
			{type: 'meta/property=fb:page_id', query: 'meta[property="fb:page_id"]', weight: 1.5, extractor: 'facebook'},
			{type: 'meta/name=fb:pages', query: 'meta[name="fb:pages"]', weight: 1.5, extractor: 'facebook'},
			{type: 'meta/property=fb:pages', query: 'meta[property="fb:pages"]', weight: 1.5, extractor: 'facebook'},

			// json ld
			{type: 'script/type=json', query: 'script[type="application/ld+json"]', weight: 2, extractor: 'json'}
		];
	}

	getRefiners() {
		return [
			{name: 'containsWordLogo', regex: /logo/i, force: 2},
			{name: 'containsWordBrand', regex: /brand/i, force: 1.5},
			{name: 'containsWordRetina', regex: /retina/i, force: 1.5},
			{name: 'containsLogoDimensions', regex: /([0-4][0-9][0-9]|500)x([0-4][0-9][0-9]|500)/i, force: 1.5},
			{name: 'isFavicon', regex: /(favicon|\.ico)/i, force: .25},
			{name: 'containsWordBanner', regex: /banner/i, force: .25}
		];
	}

	parse() {

		let matches = [];
		let queries = this.getQueries();
		let extractors = this.getExtractors();
		let refiners = this.getRefiners();
		let makeUrlAbsolute = (url) => {
			var tempImg = document.createElement("img");
			tempImg.src = url;
			return tempImg.src;
		};

		// collect matches
		queries.forEach((iq) => {

			let nodes = document.querySelectorAll(iq.query);

			nodes.forEach(async (node) => {

				let result = extractors[iq.extractor](node);

				if (result !== null && typeof result === 'object') {
					result. weight = iq.weight;
					matches.push(result);
				} else if (result !== null && result !== undefined) {
					matches.push({src: makeUrlAbsolute(result), weight: iq.weight});
				}

			});
		});


		// refine weight
		matches.forEach((match) => {

			refiners.forEach((adjuster) => {

				if (match.src && match.src.match(adjuster.regex)) {
					match.weight *= adjuster.force;
				}
			});
		});

		// remove duplicate sub-strategies
		let distinctMatches = Array.from(new Set(matches.map(JSON.stringify))).map(JSON.parse);

		return distinctMatches.sort((a, b) => {
			return b.weight - a.weight;
		});
	}
}

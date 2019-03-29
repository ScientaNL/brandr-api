class PageParser {

	getExtractors() {
		return {
			'meta': function (node) {
				return node.getAttribute('content');
			},
			'link': function (node) {
				return node.getAttribute('href');
			},
			'json': function (node) {
				return JSON.parse(node.innerHTML).logo;
			}
		};
	}

	getQueries() {
		return [
			{type: 'meta/property=og:image', query: 'meta[property="og:image"]', weight: 1, extractor: 'meta'},
			{type: 'meta/property=og:image:url', query: 'meta[property="og:image:url"]', weight: 1, extractor: 'meta'},
			{
				type: 'meta/property=og:image:secure-url',
				query: 'meta[property="og:image:secure_url"]',
				weight: 1,
				extractor: 'meta'
			},
			{type: 'meta/name=twitter:image', query: 'meta[name="twitter:image"]', weight: 1, extractor: 'meta'},
			{type: 'meta/content=logo', query: 'meta[content="logo"]', weight: 2, extractor: 'meta'},
			{type: 'meta/content=image', query: 'meta[content="image"]', weight: 1, extractor: 'meta'},
			{type: 'meta/itemprop=logo', query: 'meta[itemprop="logo"]', weight: 2, extractor: 'meta'},
			{type: 'meta/itemprop=image', query: 'meta[itemprop="image"]', weight: 1, extractor: 'meta'},
			{
				type: 'meta/name=msapplication-TileImage',
				query: 'meta[name="msapplication-TileImage"]',
				weight: 1.5,
				extractor: 'meta'
			},
			{
				type: 'meta/name=msapplication-TileImage',
				query: 'meta[name^="msapplication-square"]',
				weight: 1.5,
				extractor: 'meta'
			},
			{type: 'link/rel=logo', query: 'link[rel="logo"]', weight: 2, extractor: 'link'},
			{type: 'link/rel=shortcut-icon', query: 'link[rel="shortcut-icon"]', weight: 1.5, extractor: 'link'},
			{type: 'link/rel=shortcut-icon', query: 'link[rel="shortcut icon"]', weight: 1.5, extractor: 'link'},
			{type: 'link/rel=fluid-icon', query: 'link[rel="fluid-icon"]', weight: 2, extractor: 'link'},
			{type: 'link/rel=apple-touch-icon', query: 'link[rel="apple-touch-icon"]', weight: 2, extractor: 'link'},
			{
				type: 'link/rel=apple-touch-icon-precomposed',
				query: 'link[rel="apple-touch-icon-precomposed"]',
				weight: 2,
				extractor: 'link'
			},
			{type: 'script/type=json', query: 'script[type="application/ld+json"]', weight: 2, extractor: 'json'}
		];
	}

	getRefiners() {
		return [
			{name: 'containsWordLogo', regex: /logo/i, force: 2},
			{name: 'containsWordBrand', regex: /brand/i, force: 1.5},
			{name: 'containsWordRetina', regex: /retina/i, force: 1.5},
			{name: 'containsWordFavicon', regex: /favicon/i, force: .5},
			{name: 'containsWordBanner', regex: /banner/i, force: .25},
		];
	}

	parse() {

		let matches = [];
		let queries = this.getQueries();
		let extractors = this.getExtractors();
		let refiners = this.getRefiners();
		let makeUrlAbsolute = function (url) {
			var tempImg = document.createElement("img");
			tempImg.src = url;
			return tempImg.src;
		};

		// collect matches
		queries.forEach(function (iq) {

			let nodes = document.querySelectorAll(iq.query);

			nodes.forEach(function (node) {

				let value = extractors[iq.extractor](node);

				if (value !== null && value !== undefined) {
					matches.push({value: makeUrlAbsolute(value), weight: iq.weight, type: iq.type});
				}

			});
		});


		// refine weight
		matches.forEach(function (match) {

			refiners.forEach(function (adjuster) {

				if (adjuster.regex.test(match.url)) {

					match.weight *= adjuster.force;
				}
			});
		});


		return {
			matches: matches.sort(function (a, b) {
				return b.weight - a.weight;
			})
		}
	}
}

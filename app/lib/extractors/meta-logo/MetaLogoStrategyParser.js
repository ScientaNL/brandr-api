class MetaLogoStrategyParser extends AbstractMetaExtractorParser {
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
			}
		};
	}

	getQueries() {
		return [
			// images
			{type: 'meta/property=og:image', query: 'meta[property="og:image"]', weight: .4, extractor: 'meta'},
			{type: 'meta/property=og:image:url', query: 'meta[property="og:image:url"]', weight: .4, extractor: 'meta'},
			{type: 'meta/property=og:image:secure-url', query: 'meta[property="og:image:secure_url"]', weight: .4, extractor: 'meta'},
			{type: 'meta/content=logo', query: 'meta[content="logo"]', weight: 1, extractor: 'meta'},
			{type: 'meta/content=image', query: 'meta[content="image"]', weight: .75, extractor: 'meta'},
			{type: 'meta/itemprop=logo', query: 'meta[itemprop="logo"]', weight: 1, extractor: 'meta'},
			{type: 'meta/itemprop=image', query: 'meta[itemprop="image"]', weight: .75, extractor: 'meta'},
			{type: 'meta/name=msapplication-TileImage', query: 'meta[name="msapplication-TileImage"]', weight: .8, extractor: 'meta'},
			{type: 'meta/name=msapplication-TileImage', query: 'meta[name^="msapplication-square"]', weight: .8, extractor: 'meta'},
			{type: 'link/rel=logo', query: 'link[rel="logo"]', weight: .8, extractor: 'link'},
			{type: 'link/rel=icon', query: 'link[rel="icon"]', weight: .6, extractor: 'link'},
			{type: 'link/rel=shortcut-icon', query: 'link[rel="shortcut-icon"]', weight: .75, extractor: 'link'},
			{type: 'link/rel=shortcut icon', query: 'link[rel="shortcut icon"]', weight: .75, extractor: 'link'},
			{type: 'link/rel=fluid-icon', query: 'link[rel="fluid-icon"]', weight: .75, extractor: 'link'},
			{type: 'link/rel=apple-touch-icon', query: 'link[rel="apple-touch-icon"]', weight: .75, extractor: 'link'},
			{type: 'link/rel=apple-touch-icon-precomposed', query: 'link[rel="apple-touch-icon-precomposed"]', weight: .75, extractor: 'link'},
			{type: 'link/rel=mask-icon', query: 'link[rel="mask-icon"]', weight: .75, extractor: 'link'},

			// json ld
			// {type: 'script/type=json', query: 'script[type="application/ld+json"]', weight: 2, extractor: 'json'}
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
}

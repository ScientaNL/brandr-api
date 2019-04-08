class FacebookLogoStrategyParser extends AbstractMetaExtractorParser {

	getExtractors() {
		return {
			'facebook': (node) => {
				// if multiple: take first only 131666743524308,131666743524308
				let id = ('' + node.getAttribute('content').split(',')[0]).trim();

				if(id) {
					return {id: id};
				} else {
					return null;
				}
			}
		};
	}

	getQueries() {
		return [
			// images
			{type: 'meta/name=fb:page_id', query: 'meta[name="fb:page_id"]', weight: 1.5, extractor: 'facebook'},
			{type: 'meta/property=fb:page_id', query: 'meta[property="fb:page_id"]', weight: 1.5, extractor: 'facebook'},
			{type: 'meta/name=fb:pages', query: 'meta[name="fb:pages"]', weight: 1.5, extractor: 'facebook'},
			{type: 'meta/property=fb:pages', query: 'meta[property="fb:pages"]', weight: 1.5, extractor: 'facebook'},
		];
	}
}

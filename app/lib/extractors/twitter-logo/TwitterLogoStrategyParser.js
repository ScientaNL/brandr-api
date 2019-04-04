class TwitterLogoStrategyParser extends AbstractMetaExtractorParser {
	getExtractors() {
		return {
			'twitter': (node) => {
				let id = node.getAttribute('content');
				if (id[0] === '@') {
					id = id.substring(1);
				}

				return {id: id};
			}
		};
	}

	getQueries() {
		return [
			{type: 'meta/name=twitter:creator', query: 'meta[name^="twitter:creator"]', weight: 1.5, extractor: 'twitter'},
			{type: 'meta/property=twitter:creator', query: 'meta[property^="twitter:creator"]', weight: 1.5, extractor: 'twitter'},
			{type: 'meta/name=twitter:site', query: 'meta[name^="twitter:site"]', weight: 1.5, extractor: 'twitter'},
			{type: 'meta/property=twitter:site', query: 'meta[property^="twitter:site"]', weight: 1.5, extractor: 'twitter'},
			{type: 'meta/name=twitter:account_id', query: 'meta[name="twitter:account_id"]', weight: 1.5, extractor: 'twitter'},
			{type: 'meta/property=twitter:account_id', query: 'meta[property="twitter:account_id"]', weight: 1.5, extractor: 'twitter'}
		];
	}
}

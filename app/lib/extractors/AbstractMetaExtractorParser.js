class AbstractMetaExtractorParser {
	document;

	constructor(document) {
		this.document = document;
	}

	getExtractors() {
		return {};
	}

	getQueries() {
		return [];
	}

	getRefiners() {
		return [];
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
					result.weight = iq.weight;
					matches.push(result);
				} else if (result !== null && result !== undefined) {
					matches.push({
						src: makeUrlAbsolute(result),
						weight: iq.weight,
					});
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

		matches.sort((a, b) => {
			return b.weight - a.weight;
		});

		return matches;
	}
}

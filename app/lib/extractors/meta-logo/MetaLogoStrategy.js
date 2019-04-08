const AbstractStrategy = require('../AbstractStrategy');

class MetaLogoStrategy extends AbstractStrategy
{
	static getId() {
		return 'meta-logo';
	}

	getParserFilesToInject() {
		return [
			__dirname + "/../AbstractMetaExtractorParser.js",
			__dirname + "/MetaLogoStrategyParser.js"
		];
	}

	/**
	 * This method is executed in the context of the Headless Chrome Browser
	 * @returns {Array}
	 */
	parsePage () {
		let parser = new MetaLogoStrategyParser(document);
		return parser.parse();
	};

	async processParserResult(parserResult) {

		let images = [];
		for(let result of parserResult) {
			if(!result.src) {
				continue;
			}

			let definition = await this.processDownload(result.src,	result.weight);

			if(definition) {
				images.push((definition));
			}
		}

		return images;
	}
}

module.exports = MetaLogoStrategy;

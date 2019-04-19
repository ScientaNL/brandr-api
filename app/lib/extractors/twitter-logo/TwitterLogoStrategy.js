const AbstractStrategy = require('../AbstractStrategy');

class TwitterLogoStrategy extends AbstractStrategy
{
	static getId() {
		return 'twitter-logo';
	}

	getParserFilesToInject() {
		return [
			__dirname + "/../AbstractMetaExtractorParser.js",
			__dirname + "/TwitterLogoStrategyParser.js"
		];
	}

	/**
	 * This method is executed in the context of the Headless Chrome Browser
	 * @returns {Array}
	 */
	parsePage () {
		let parser = new TwitterLogoStrategyParser(document);
		return parser.parse();
	};

	async processParserResult(parserResult) {

		let images = [];
		for(let result of parserResult) {
			if(!result.id) {
				continue;
			}

			let definition = await this.processDownload(
				`https://twitter.com/${result.id}/profile_image?size=original`,
				result.weight
			);

			// Twitter logo can also resolve to default profile logo, ignore the egg ;-) (Which is not an egg anymore)
			if(definition && definition.origin.indexOf("default_profile") === -1) {
				images.push((definition));
			}
		}

		return images;
	}
}

module.exports = TwitterLogoStrategy;

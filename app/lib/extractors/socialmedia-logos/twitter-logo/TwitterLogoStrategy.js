const AbstractStrategy = require('../../AbstractStrategy');

class TwitterLogoStrategy extends AbstractStrategy
{
	getId() {
		return 'twitter-logo';
	}

	getParserFilesToInject() {
		return [__dirname + "/TwitterLogoStrategyParser.js"];
	}

	/**
	 * This method is executed in the context of the Headless Chrome Browser
	 * @returns {Array}
	 */
	parsePage () {
		let parser = new FacebookLogoStrategyParser(document);
		return parser.parse();
	};

	async processParserResult(parserResult) {
		return parserResult.matches;
	}
}

module.exports = TwitterLogoStrategy;

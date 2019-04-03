const AbstractStrategy = require('../../AbstractStrategy');

class FacebookLogoStrategy extends AbstractStrategy
{
	getId() {
		return 'facebook-logo';
	}

	getParserFilesToInject() {
		return [__dirname + "/FacebookLogoStrategyParser.js"];
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

module.exports = FacebookLogoStrategy;

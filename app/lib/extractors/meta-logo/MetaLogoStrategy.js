const AbstractStrategy = require('../AbstractStrategy');

class MetaLogoStrategy extends AbstractStrategy
{
	getId() {
		return 'meta-logo';
	}

	getParserFilesToInject() {
		return [__dirname + "/MetaLogoStrategyParser.js"];
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
		return parserResult.matches;
	}
}

module.exports = MetaLogoStrategy;

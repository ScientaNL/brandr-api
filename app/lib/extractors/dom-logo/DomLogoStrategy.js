const AbstractStrategy = require('../AbstractStrategy');

class DomLogoStrategy extends AbstractStrategy
{
	getId() {
		return 'dom-logo';
	}

	getParserFilesToInject() {
		return [__dirname + "/DOMLogoStrategyParser.js"];
	}

	/**
	 * This method is executed in the context of the Headless Chrome Browser
	 * @returns {Array}
	 */
	parsePage () {
		let parser = new DOMLogoStrategyParser(document);
		return parser.parse();
	};

	async processParserResult(parserResult) {
		return parserResult;
	}
}

module.exports = DomLogoStrategy;

const AbstractStrategy = require('../AbstractStrategy');

class StyleColorsStrategy extends AbstractStrategy
{
	getId() {
		return 'style-colors';
	}

	getParserFilesToInject() {
		return [__dirname + "/StyleColorsStrategyParser.js"];
	}

	/**
	 * This method is executed in the context of the Headless Chrome Browser
	 * @returns {Array}
	 */
	parsePage () {
		let parser = new StyleColorsStrategyParser();
		return parser.parse();
	};


	async processParserResult(parserResult) {
		return parserResult;
	}
}

module.exports = StyleColorsStrategy;

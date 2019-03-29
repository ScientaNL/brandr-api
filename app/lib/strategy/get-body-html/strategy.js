const AbstractStrategy = require('../abstract-strategy');

class Strategy extends AbstractStrategy
{
	getId() {
		return 'getBodyHtml';
	}

	getParserFilesToInject() {
		return [
			this.getDefaultParserToInject(__dirname)
		];
	}

	async processParserResult(parserResult) {
		return parserResult.content;
	}
}

module.exports = Strategy;

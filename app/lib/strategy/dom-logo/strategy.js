const AbstractStrategy = require('../abstract-strategy');

class Strategy extends AbstractStrategy
{
	getId() {
		return 'dom-logo';
	}

	getParserFilesToInject() {
		return [
			this.getDefaultParserToInject(__dirname)
		];
	}

	async processParserResult(parserResult) {
		return parserResult;
	}
}

module.exports = Strategy;

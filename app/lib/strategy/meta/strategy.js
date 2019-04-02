const AbstractStrategy = require('../abstract-strategy');

class Strategy extends AbstractStrategy
{
	getId() {
		return 'meta';
	}

	getParserFilesToInject() {
		return [
			this.getDefaultParserToInject(__dirname)
		];
	}

	async processParserResult(parserResult) {
		return parserResult.matches;
	}
}

module.exports = Strategy;

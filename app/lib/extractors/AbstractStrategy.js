const path = require('path');

class AbstractStrategy
{
	getId() {
		throw new Error(`Please implement getId method in strategy`);
	}

	getParserFilesToInject() {
		throw new Error(`Please implement getParserFilesToInject method in strategy`);
	}

	parsePage () {
		throw new Error(`Please implement parsePage method in strategy`);
	};

	async handlePage(uri, page) {
		let result = await page.evaluate(this.parsePage);

		return await this.processParserResult(result);
	}

	async processParserResult(parserResult) {
		return parserResult;
	}
}

module.exports = AbstractStrategy;

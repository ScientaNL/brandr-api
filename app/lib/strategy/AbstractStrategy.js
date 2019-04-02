const path = require('path');

class AbstractStrategy
{
	getId() {
		return undefined;
	}

	async handlePage(uri, page) {
		this.processingUri = uri;
		let result = await page.evaluate(this.parsePage);
		this.processingUri = null;
		return await this.processParserResult(result);
	}

	getParserFilesToInject() {
		throw new Error(`Please implement getParserFilesToInject method in strategy`);
	}

	parsePage () {
		throw new Error(`Please implement parsePage method in strategy`);
	};

	async processParserResult(parserResult) {
		return parserResult;
	}
}

module.exports = AbstractStrategy;

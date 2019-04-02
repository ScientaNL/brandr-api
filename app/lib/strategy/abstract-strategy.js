const path = require('path');

class AbstractStrategy
{
	constructor() {
		this.processingUri = null;
	}

	getId() {
		return undefined;
	}

	getProcessingUri() {
		return this.processingUri;
	}

	getDefaultParserToInject(strategyDir) {
		return path.relative( process.cwd(), path.join(strategyDir, '/page-parser.js'));
	}

	async handlePage(uri, page) {
		this.processingUri = uri;
		let result = await page.evaluate(this.parsePage);
		this.processingUri = null;
		return await this.processParserResult(result);
	}

	parsePage () {
		let parser = new PageParser(document);
		return parser.parse();
	};

	async processParserResult(parserResult) {
		return parserResult;
	}
}

module.exports = AbstractStrategy;

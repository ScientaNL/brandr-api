const puppeteer = require('puppeteer');
const GetBodyHtml = require('./strategy/get-body-html/strategy');

class Extractor
{
	constructor() {
		this.strategies = [];
		this.registerStrategy(new GetBodyHtml());
	}

	registerStrategy(strategyInstance) {
		this.strategies.push(strategyInstance);
	}

	async runStrategies(uri) {
		const browser = await puppeteer.launch({args: ['--no-sandbox']});
		const page = await browser.newPage();
		await page.setBypassCSP(true);
		await page.goto(uri, {timeout: 10000, waitUntil: 'load'});

		let results = {};
		for (let strategy of this.strategies) {
			for (let filePath of strategy.getParserFilesToInject()) {
				await page.addScriptTag({path: filePath});
			}
			results[strategy.getId()] = await strategy.handlePage(uri, page);
		}

		await browser.close();
		return results;
	}
}

module.exports = Extractor;

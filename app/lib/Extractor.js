const puppeteer = require('puppeteer');
const debug = require('debug')('extractor');
debug.log = console.log.bind(console);

const MetaLogoStrategy = require('./strategy/meta-logo/MetaLogoStrategy');
const StyleColorsStrategy = require('./strategy/style-colors/StyleColorsStrategy');
const DomLogoStrategy = require('./strategy/dom-logo/DomLogoStrategy');

class Extractor
{
	constructor() {
		this.strategies = [];

		this.registerStrategy(new DomLogoStrategy());
		this.registerStrategy(new MetaLogoStrategy());
		this.registerStrategy(new StyleColorsStrategy());
	}

	registerStrategy(strategyInstance) {
		this.strategies.push(strategyInstance);
	}

	async configurePage(page) {
		await page.setBypassCSP(true);

		page.on('console', this.pageConsole);
		page.on('pageerror', this.pageError);
		page.on('response', this.pageResponse);
		page.on('requestfailed', this.pageRequestFailed);
	}

	async runStrategies(uri) {
		const browser = await puppeteer.launch({args: ['--no-sandbox']});
		const page = await browser.newPage();
		await this.configurePage(page);
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

	pageConsole(msg) {
		debug('page-console:', msg.text());
	}

	pageError(error) {
		debug('page-error:', error.message);
	}

	pageResponse(response) {
		debug('page-response:', response.status(), response.url());
	}

	pageRequestFailed(request) {
		debug('page-requestfailed:', request.failure().errorText, request.url());
	}
}

module.exports = Extractor;

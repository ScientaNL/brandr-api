const puppeteer = require('puppeteer');
const debug = require('debug')('extractor');
debug.log = console.log.bind(console);

const MetaLogoStrategy = require('./extractors/meta-logo/MetaLogoStrategy');
const StyleColorsStrategy = require('./extractors/style-colors/StyleColorsStrategy');
const DomLogoStrategy = require('./extractors/dom-logo/DomLogoStrategy');

const LogoAggregator = require('./aggregators/LogoAggregator');
const SelectionAggregator = require('./aggregators/SelectionAggregator');

class Extractor
{
	constructor() {
		this.browserPromise = null;
		this.extractGroups = {};

		this.registerExtractGroup(
			'logo',
			[new DomLogoStrategy(), new MetaLogoStrategy()],
			new LogoAggregator()
		);

		this.registerExtractGroup(
			'color',
			[new StyleColorsStrategy()],
			new SelectionAggregator(["style-colors"])
		);
	}

	registerExtractGroup(name, extractors, aggregator) {
		this.extractGroups[name] = {
			extractors: extractors,
			aggregator: aggregator
		};
	}

	async configurePage(page) {
		await page.setBypassCSP(true);

		page.on('console', this.pageConsole);
		page.on('pageerror', this.pageError);
		page.on('response', this.pageResponse);
		page.on('requestfailed', this.pageRequestFailed);
	}

	async runStrategies(uri) {
		const browser = await this.getBrowser();

		const page = await browser.newPage();
		await this.configurePage(page);

		await page.goto(uri, {timeout: 10000, waitUntil: 'load'});

		let results = {};
		for (let groupName in this.extractGroups) {
			if(this.extractGroups.hasOwnProperty(groupName) === false) {
				continue;
			}

			let group = this.extractGroups[groupName];
			let groupResult = {};

			for(let extractor of group.extractors) {
				for (let filePath of extractor.getParserFilesToInject()) {
					await page.addScriptTag({path: filePath});
				}

				groupResult[extractor.getId()] = await extractor.handlePage(uri, page);
			}

			results[groupName] = group.aggregator.aggregate(groupResult);
		}

		await page.close();

		return results;
	}

	async getBrowser()
	{
		if(this.browserPromise) {
			return this.browserPromise;
		}

		return this.browserPromise = puppeteer.launch({
			args: ['--no-sandbox'],
			defaultViewport: {
				width: 1920,
				height: 1080
			}
		});
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

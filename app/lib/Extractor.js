const debug = require('debug')('extractor');
debug.log = console.log.bind(console);

const Navigator = require('./Navigator');

const MetaLogoStrategy = require('./extractors/meta-logo/MetaLogoStrategy');
const StyleColorsStrategy = require('./extractors/style-colors/StyleColorsStrategy');

const DomLogoStrategy = require('./extractors/dom-logo/DomLogoStrategy');
const LogoAggregator = require('./aggregators/LogoAggregator');
const SelectionAggregator = require('./aggregators/SelectionAggregator');

class Extractor
{
	constructor(storagePath, host) {
		this.extractGroups = {};
		this.navigator = new Navigator();

		this.registerExtractGroup(
			'logo',
			[new DomLogoStrategy(), new MetaLogoStrategy()],
			new LogoAggregator(storagePath, host)
		);

		this.registerExtractGroup(
			'color',
			[new StyleColorsStrategy()],
			new SelectionAggregator(["style-colors"])
		);
	}

	async init(settings) {
		if (settings.useBlockList) {
			this.navigator.initBlockList();
		}
	}

	async getInfo() {
		let navInfo = await this.navigator.getInfo();
		return {
			puppeteer: navInfo
		}
	}

	registerExtractGroup(name, extractors, aggregator) {
		this.extractGroups[name] = {
			extractors: extractors,
			aggregator: aggregator
		}
	}

	async extract(uri) {
		debug('extracting:', uri);
		const page = await this.navigator.newPage(uri);

		let results = {};
		for (let groupName in this.extractGroups) {
			if (this.extractGroups.hasOwnProperty(groupName) === false) {
				continue;
			}

			let group = this.extractGroups[groupName];
			results[groupName] = await group.aggregator.aggregate(
				await this.runExtractors(group.extractors, page, uri)
			);
		}

		if (!page.isClosed()) {
			await page.close();
		}

		return results;
	}

	async extractNewPage(uri, extractors) {
		if (!uri || extractors.length < 1) {
			return null;
		}

		debug('sub-extracting:', uri);
		const page = await this.navigator.newPage(uri);

		let result = await this.runExtractors(extractors, page, uri);

		if (!page.isClosed()) {
			await page.close();
		}

		return result;
	}

	async runExtractors(extractors, page, uri) {
		let result = {},
			newPageExtractor = async (uri, extractors) => {
				return await this.extractNewPage(uri, extractors)
			};

		for (let extractor of extractors) {
			for (let filePath of extractor.getParserFilesToInject()) {
				await page.addScriptTag({path: filePath});
			}
			result[extractor.getId()] = await extractor.handlePage(uri, page, newPageExtractor);
		}
		return result;
	}
}

module.exports = Extractor;

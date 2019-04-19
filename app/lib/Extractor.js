const debug = require('debug')('extractor');
debug.log = console.log.bind(console);

const Navigator = require('./Navigator');

const path = require("path");

const MetaLogoStrategy = require('./extractors/meta-logo/MetaLogoStrategy');
const StyleColorsStrategy = require('./extractors/style-colors/StyleColorsStrategy');

const DomLogoStrategy = require('./extractors/dom-logo/DomLogoStrategy');
const FacebookLogoStrategy = require('./extractors/facebook-logo/FacebookLogoStrategy');
const TwitterLogoStrategy = require('./extractors/twitter-logo/TwitterLogoStrategy');

const Pipeline = require('./pipeline/Pipeline');
const ArrayMerger = require('./pipeline/ArrayMerger');
const ArrayWeighSort = require('./pipeline/ArrayWeighSort');
const ArrayUnique = require('./pipeline/ArrayUnique');
const ArraySlice = require('./pipeline/ArraySlice');
const StoreLogo = require('./pipeline/StoreLogo');
const LogoColorAggregator = require('./pipeline/LogoColorAggregator');
const NthIndex = require('./pipeline/NthIndex');

class Extractor
{
	constructor(storagePath, host) {
		this.extractors = {};
		this.pipelines = [];
		this.navigator = new Navigator();

		this.registerExtractor(new DomLogoStrategy());
		this.registerExtractor(new MetaLogoStrategy());
		this.registerExtractor(new FacebookLogoStrategy());
		this.registerExtractor(new TwitterLogoStrategy());

		this.registerExtractor(new StyleColorsStrategy());

		this.registerPipeline(new Pipeline('logo', [
			new ArrayMerger([
				DomLogoStrategy.getId(),
				MetaLogoStrategy.getId(),
				FacebookLogoStrategy.getId(),
				TwitterLogoStrategy.getId()
			]),
			new ArrayWeighSort(),
			new ArrayUnique(),
			new ArraySlice(0, 3),
			new StoreLogo(storagePath, host),
		]));

		this.registerPipeline(new Pipeline('dom-logo', [
			new ArrayMerger([DomLogoStrategy.getId()]),
			new ArrayWeighSort(),
			new ArrayUnique(),
			new ArraySlice(0, 1),
			new StoreLogo(storagePath, host),
			new NthIndex(0)
		]));

		this.registerPipeline(new Pipeline('social-logo', [
			new ArrayMerger([FacebookLogoStrategy.getId(), TwitterLogoStrategy.getId()]),
			new ArrayWeighSort(),
			new ArrayUnique(),
			new ArraySlice(0, 1),
			new StoreLogo(storagePath, host),
			new NthIndex(0)
		]));

		this.registerPipeline(new Pipeline('meta-logo', [
			new ArrayMerger([MetaLogoStrategy.getId()]),
			new ArrayWeighSort(),
			new ArrayUnique(),
			new ArraySlice(0, 1),
			new StoreLogo(storagePath, host),
			new NthIndex(0)
		]));

		this.registerPipeline(new Pipeline('site-style', [
			new ArrayMerger([StyleColorsStrategy.getId()])
		]));

		// this.registerPipeline(new Pipeline('logo-color', [
		// 	new ArrayMerger([
		// 		DomLogoStrategy.getId(),
		// 		MetaLogoStrategy.getId(),
		// 		FacebookLogoStrategy.getId(),
		// 		TwitterLogoStrategy.getId()
		// 	]),
		// 	new ArrayWeighSort(),
		// 	new ArrayUnique(),
		// 	new LogoColorAggregator(4)
		// ]));
	}

	registerExtractor(extractor) {
		this.extractors[extractor.constructor.getId()] = extractor;
	}

	registerPipeline(pipeline) {
		this.pipelines.push(pipeline);
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

	async extract(uri) {
		debug('extracting:', uri);

		console.time("pageLoad");
		const result = await this.navigator.newPage(uri);
		const page = result.page;
		const cdp = result.cdp;
		console.timeEnd("pageLoad");

		console.time("extractors");
		let extractions = await this.runExtractors(page, cdp);
		console.timeEnd("extractors");

		if (!page.isClosed()) {
			await page.close();
		}

		console.time("pipelines");
		let results = {};
		for(let pipeline of this.pipelines) {
			let pipelineResult = await pipeline.process(extractions);
			results = {...results, ...pipelineResult};
		}
		console.timeEnd("pipelines");

		return results;
	}

	async runExtractors(page, cdp) {

		let results = {};
		let addedScripts = [];
		for (let groupName in this.extractors) {
			if (this.extractors.hasOwnProperty(groupName) === false) {
				continue;
			}

			let extractor = this.extractors[groupName];

			for (let filePath of extractor.getParserFilesToInject()) {
				filePath = path.resolve(filePath);

				if(addedScripts.indexOf(filePath) === -1) {
					await page.addScriptTag({path: filePath});
					addedScripts.push(filePath);
				}
			}

			results[groupName] = await extractor.handlePage(page, cdp);
		}

		return results;
	}
}

module.exports = Extractor;

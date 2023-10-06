import debugPackage from 'debug';
import Navigator from './Navigator.js';
import MetaLogoStrategy from './extractors/meta-logo/MetaLogoStrategy.js';
import StyleColorsStrategy from './extractors/style-colors/StyleColorsStrategy.js';
import DomLogoStrategy from './extractors/dom-logo/DomLogoStrategy.js';
import FacebookLogoStrategy from './extractors/facebook-logo/FacebookLogoStrategy.js';
import TwitterLogoStrategy from './extractors/twitter-logo/TwitterLogoStrategy.js';
import Pipeline from './pipeline/Pipeline.js';
import ArrayMerger from './pipeline/ArrayMerger.js';
import ArrayWeighSort from './pipeline/ArrayWeighSort.js';
import ArrayUnique from './pipeline/ArrayUnique.js';
import ArraySlice from './pipeline/ArraySlice.js';
import StoreLogo from './pipeline/StoreLogo.js';
import NthIndex from './pipeline/NthIndex.js';

const debug = debugPackage('extractor');
debug.log = console.log.bind(console);

export default class Extractor {
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
				TwitterLogoStrategy.getId(),
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
			new NthIndex(0),
		]));

		this.registerPipeline(new Pipeline('social-logo', [
			new ArrayMerger([FacebookLogoStrategy.getId(), TwitterLogoStrategy.getId()]),
			new ArrayWeighSort(),
			new ArrayUnique(),
			new ArraySlice(0, 1),
			new StoreLogo(storagePath, host),
			new NthIndex(0),
		]));

		this.registerPipeline(new Pipeline('meta-logo', [
			new ArrayMerger([MetaLogoStrategy.getId()]),
			new ArrayWeighSort(),
			new ArrayUnique(),
			new ArraySlice(0, 1),
			new StoreLogo(storagePath, host),
			new NthIndex(0),
		]));

		this.registerPipeline(new Pipeline('site-style', [
			new ArrayMerger([StyleColorsStrategy.getId()]),
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
			await this.navigator.initBlockList();
		}
	}

	async getInfo() {
		let navInfo = await this.navigator.getInfo();
		return {
			puppeteer: navInfo,
		};
	}

	async extract(uri) {
		debug('extracting:', uri);

		let timeNewPage = `${new Date()} [STATS] loaded page in`;
		console.time(timeNewPage);
		const {
			page,
			cdp,
		} = await this.navigator.newPage(uri);
		console.timeEnd(timeNewPage);

		const timeRunExtractors = `${new Date()} [STATS] ran extractor in`;
		console.time(timeRunExtractors);
		let extractions = await this.runExtractors(page, cdp);
		console.timeEnd(timeRunExtractors);

		if (!page.isClosed()) {
			await page.close();
		}

		let timePipelineProcesses = `${new Date()} [STATS] ran pipeline processes in`;
		console.time(timePipelineProcesses);
		let results = {};
		for (let pipeline of this.pipelines) {
			let pipelineResult = await pipeline.process(extractions);
			results = {...results, ...pipelineResult};
		}
		console.timeEnd(timePipelineProcesses);

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
				if (addedScripts.indexOf(filePath) === -1) {
					await page.addScriptTag({path: filePath});
					addedScripts.push(filePath);
				}
			}

			results[groupName] = await extractor.handlePage(page, cdp);
		}

		return results;
	}
}

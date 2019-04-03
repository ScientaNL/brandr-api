const AbstractStrategy = require('../AbstractStrategy');
const TwitterLogoStrategy = require('./twitter-logo/TwitterLogoStrategy');
const FacebookLogoStrategy = require('./facebook-logo/FacebookLogoStrategy');

class MetaLogoStrategy extends AbstractStrategy
{
	constructor() {
		super();
		this.subStrategies = {
			"twitter-logo": new TwitterLogoStrategy(),
			"facebook-logo": new FacebookLogoStrategy()
		}
	}

	getId() {
		return 'meta-logo';
	}

	getParserFilesToInject() {
		return [__dirname + "/MetaLogoStrategyParser.js"];
	}

	/**
	 * This method is executed in the context of the Headless Chrome Browser
	 * @returns {Array}
	 */
	parsePage () {
		let parser = new MetaLogoStrategyParser(document);
		return parser.parse();
	};

	async processParserResult(parserResult, newPageExtractor) {
		let result = {
			meta: [],
			sub: {}
		};

		for (const match of parserResult) {
			if (match.strategy && this.subStrategies[match.strategy]) {
				let subStrategy = this.subStrategies[match.strategy];
				let subId = subStrategy.getId();
				let res = await newPageExtractor(match.url, [subStrategy]);
				result.sub[subId] = res[subId];
			} else {
				result.meta = match;
			}
		}
		return result;
	}
}

module.exports = MetaLogoStrategy;

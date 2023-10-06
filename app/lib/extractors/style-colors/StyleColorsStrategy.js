import AbstractStrategy from '../AbstractStrategy.js';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default class StyleColorsStrategy extends AbstractStrategy {
	static getId() {
		return 'style-colors';
	}

	getParserFilesToInject() {
		return [dirname + "/StyleColorsStrategyParser.js"];
	}

	/**
	 * This method is executed in the context of the Headless Chrome Browser
	 * @returns {Array}
	 */
	parsePage() {
		let parser = new StyleColorsStrategyParser();
		return parser.parse();
	};


	async processParserResult(parserResult) {
		return parserResult;
	}
}

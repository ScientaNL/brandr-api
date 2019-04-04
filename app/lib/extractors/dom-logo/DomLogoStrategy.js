const AbstractStrategy = require('../AbstractStrategy');

class DomLogoStrategy extends AbstractStrategy
{
	getId() {
		return 'dom-logo';
	}

	getParserFilesToInject() {
		return [__dirname + "/DOMLogoStrategyParser.js"];
	}

	/**
	 * This method is executed in the context of the Headless Chrome Browser
	 * @returns {Array}
	 */
	parsePage () {
		let parser = new DOMLogoStrategyParser(document);
		return parser.parse();
	};

	async processParserResult(parserResult) {

		let images = [];
		for(let logo of parserResult) {
			try {
				let imgDefinition = await this.downloadLogo(logo);

				if(imgDefinition) {

					images.push({
						buffer: imgDefinition.buffer,
						extension: imgDefinition.extension,
						weight: logo.weight,
						origin: imgDefinition.origin
					});
				}
			} catch(e) {
				console.log(e);
			}
		}

		return images;
	}

	async downloadLogo(logo) {

		switch(logo.logo.type) {
			case "file":
				return this.downloadFile(logo.logo.src);
			case "svg":
				return this.parseSvg(logo.logo.svg);
		}
	}
}

module.exports = DomLogoStrategy;

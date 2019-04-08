const AbstractStrategy = require('../AbstractStrategy');

class DomLogoStrategy extends AbstractStrategy
{
	static getId() {
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
				let imageDefinition = await this.downloadLogo(logo);

				if(imageDefinition) {
					let weight = this.weighLogo(logo, imageDefinition);

					images.push({
						buffer: imageDefinition.buffer,
						hash: this.getBufferHash(imageDefinition.buffer),
						extension: imageDefinition.extension,
						weight: weight,
						origin: imageDefinition.origin
					});
				}
			} catch(e) {
				console.error(e);
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

	weighLogo(logo, imageDefinition) {

		let weight = logo.weight;

		if(imageDefinition.extension === "svg") {
			weight *= 1.3;
		}

		return weight;
	}
}

module.exports = DomLogoStrategy;

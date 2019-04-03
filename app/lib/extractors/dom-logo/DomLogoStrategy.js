const AbstractStrategy = require('../AbstractStrategy');
const fetch = require('node-fetch');
const imageType = require('image-type');
const isSvg = require('is-svg');

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

		let image = [];
		for(let logo of parserResult) {
			try {
				let buffer = await this.downloadLogo(logo, root);

				if(buffer) {
					image.push(buffer);
				}
			} catch(e) {
				console.log(e);
			}
		}

		return image;
	}

	async downloadLogo(logo) {

		switch(logo.logo.type) {
			case "file":
				return this.downloadFile(logo.logo.src);
			case "svg":
				return this.parseSvg(logo.logo.svg);
		}

		return logo;
	}

	async downloadFile(src) {

		let buffer;
		if(src.match(/data:image\/[a-zA-Z0-9+]*?;base64,/)) {
			let data = src.split(",", 2)[1] || "";
			buffer = Buffer.from(data, 'base64');
		} else {
			const response = await fetch(src);
			buffer = await response.buffer();
		}

		const imageInfo = imageType(buffer);

		let extension;

		let result = {
			buffer: buffer,
			extension: null
		};

		if(imageInfo) {
			switch(imageInfo.ext) {
				case "jpg":
				case "png":
				case "gif":
					result.extension = imageInfo.ext;
					break;
				default:
					return null;
			}
		} else if(isSvg(buffer) === true) {
			result.extension = "svg";
		} else {
			return null;
		}

		return result;
	}

	async parseSvg(svg) {
		let buffer = Buffer.from(svg);

		if(isSvg(buffer) === true) {
			return {
				buffer: buffer,
				extension: "svg"
			};
		} else {
			return null;
		}
	}
}

module.exports = DomLogoStrategy;

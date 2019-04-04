const fetch = require('node-fetch');
const imageType = require('image-type');
const isSvg = require('is-svg');

class AbstractStrategy
{
	getId() {
		throw new Error(`Please implement getId method in strategy`);
	}

	getParserFilesToInject() {
		throw new Error(`Please implement getParserFilesToInject method in strategy`);
	}

	parsePage () {
		throw new Error(`Please implement parsePage method in strategy`);
	};

	async handlePage(uri, page, newPageExtractor) {
		let result = await page.evaluate(this.parsePage);
		return await this.processParserResult(result, newPageExtractor);
	}

	async processParserResult(parserResult, newPageExtractor) {
		return parserResult;
	}

	async downloadFile(src) {

		let result = {
			buffer: null,
			extension: null,
			origin: null,
		};

		if(src.match(/data:image\/[a-zA-Z0-9+]*?;base64,/)) {
			let data = src.split(",", 2)[1] || "";

			result.buffer = Buffer.from(data, 'base64');
			result.origin = "[inline]";
		} else {
			const response = await fetch(src);

			result.buffer = await response.buffer();
			result.origin = src;
		}

		// console.log(src);

		const imageInfo = imageType(result.buffer);

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
		} else if(isSvg(result.buffer) === true) {
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
				extension: "svg",
				origin: "[inline]"
			};
		} else {
			return null;
		}
	}

	async processDownload(url, weight) {

		try {
			let imgDefinition = await this.downloadFile(url);

			if(!imgDefinition) {
				return null;
			}

			return {
				buffer: imgDefinition.buffer,
				extension: imgDefinition.extension,
				origin: imgDefinition.origin,
				weight: weight
			};
		} catch(e) {
			console.log(e);

			return null;
		}

	}
}

module.exports = AbstractStrategy;

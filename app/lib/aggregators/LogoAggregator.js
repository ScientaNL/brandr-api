const hasha = require('hasha');
const fs = require('fs');

class LogoAggregator {

	constructor(storagePath, host) {
		this.storagePath = storagePath;
		this.host = host;
	}

	async aggregate(data) {

		let result = {};
		for(let strategy in data) {
			result[strategy] = await this.aggregateDomLogo(data[strategy]);
		}
		
		return result;
	}

	async aggregateDomLogo(data) {
		if (!data[0]) {
			return null;
		}

		//For testing Use one logo to test with
		let logo = data[0];

		let hash = hasha(logo.buffer, {algorithm: 'md5'});
		let filename = `${hash}.${logo.extension}`;

		await fs.promises.writeFile(`${this.storagePath}/${filename}`, logo.buffer);

		return `${this.host}/${filename}`;
	}
}

module.exports = LogoAggregator;


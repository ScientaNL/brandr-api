const hasha = require('hasha');
const fs = require('fs');

class LogoAggregator {

	constructor(storagePath, host) {
		this.storagePath = storagePath;
		this.host = host;
	}

	async aggregate(data) {
		if (data['dom-logo']) {
			data['dom-logo'] = await this.aggregateDomLogo(data['dom-logo']);
		}
		return data;
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


const fs = require('fs');

class BestLogoMatchAggregator {

	constructor(matches, storagePath, host) {
		this.matches = matches;
		this.storagePath = storagePath;
		this.host = host;
	}

	async process(data) {
		data = data.slice(0, this.matches);

		let result = [];
		for(let logo of data) {
			result.push(await this.storeLogo(logo));
		}

		return result;
	}

	async storeLogo(logo) {
		let filename = `${logo.hash}.${logo.extension}`;

		await fs.promises.writeFile(`${this.storagePath}/${filename}`, logo.buffer);

		return `${this.host}/${filename}`;
	}
}

module.exports = BestLogoMatchAggregator;


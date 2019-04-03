const hasha = require('hasha');
const fs = require('fs');

class LogoAggregator {

	constructor() {

	}

	async aggregate(data) {
		if(!data['dom-logo'] || !data['dom-logo'][0]) {
			return null;
		}

		//For testing Use one logo to test with
		let logo = data['dom-logo'][0];

		let hash = hasha(logo.buffer, {algorithm: 'md5'});
		let filename =  `${hash}.${logo.extension}`;
		await fs.promises.writeFile(`/test/${filename}`, logo.buffer);

		return `http://10.10.11.231:1337/${filename}`;
	}
}

module.exports = LogoAggregator;


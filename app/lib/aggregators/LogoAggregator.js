const hasha = require('hasha');
const fs = require('fs');

class LogoAggregator {

	constructor(storagePath, host) {
		this.storagePath = storagePath;
		this.host = host;
	}

	async aggregate(data) {

		let matches = this.combineStrategies(data);
		this.weighMatches(matches);

		matches.sort((a,b) => b.weight - a.weight);
		matches = matches.slice(0,3);

		let result = {guesses: []};
		for(let logo of matches) {
			result.guesses.push(await this.storeLogo(logo));
		}

		for(let strategy in data) {
			if(data.hasOwnProperty(strategy) === false) {
				continue;
			}

			let logos = data[strategy];
			logos.sort((a,b) => b.weight - a.weight);

			if(logos.length <= 0) {
				continue;
			}

			result[strategy] = await this.storeLogo(logos[0]);
		}
		
		return result;
	}

	combineStrategies(data) {
		let matches = [];
		for(let strategy in data) {
			if(data.hasOwnProperty(strategy) === true) {
				matches = [...matches, ...data[strategy]];
			}
		}

		return matches;
	}

	weighMatches(matches) {
		for(let match of matches) {
			if(match.extension === "svg") {
				match.weight *= 1.3;
			}
		}
	}

	async storeLogo(logo) {
		let hash = hasha(logo.buffer, {algorithm: 'md5'});
		let filename = `${hash}.${logo.extension}`;

		await fs.promises.writeFile(`${this.storagePath}/${filename}`, logo.buffer);

		return `${this.host}/${filename}`;
	}
}

module.exports = LogoAggregator;


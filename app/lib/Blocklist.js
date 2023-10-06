import fs from 'fs';
import readline from 'readline';
import debugPackage from 'debug';

const debug = debugPackage('blocklist');
debug.log = console.log.bind(console);

export default class Blocklist {
	constructor() {
		this.domains = {};
		this.fileTypes = {
			//video
			"3g2": true,
			"3gp": true,
			"avi": true,
			"flv": true,
			"h264": true,
			"m4v": true,
			"mkv": true,
			"mov": true,
			"mp4": true,
			"mpg": true,
			"mpeg": true,
			"swf": true,
			"vob": true,
			"wmv": true,
			//audio
			"aif": true,
			"cda": true,
			"mid": true,
			"midi": true,
			"mp3": true,
			"mpa": true,
			"ogg": true,
			"wav": true,
			"wma": true,
			"wpl": true,
		};
	}

	blockHost(hostName) {
		if (!hostName) {
			return false;
		}
		let parts = hostName.split('.');
		if (parts.length < 3) {
			return this.domains[hostName];
		}

		let domainGuess = parts.slice(-2)
			.join('.');
		if (this.domains[domainGuess]) {
			return true;
		}

		for (let suffix in this.multiPartSuffixes) {
			if (hostName.substr(suffix.length * -1) === suffix) {
				return true;
			}
		}

		return false;
	}

	blockExtension(fileExt) {
		if (!fileExt) {
			return false;
		}
		return this.fileTypes[fileExt];
	}

	blockUrl(urlString) {
		return this.fileTypes[fileExt];
	}

	async loadHosts() {
		let readLines = function (file, lineHandler) {
			const reader = readline.createInterface({
				input: fs.createReadStream(file, {encoding: 'utf8'}),
				crlfDelay: Infinity,
			});

			reader.on('line', lineHandler);

			return new Promise(resolve => reader.on('close', resolve));
		};

		debug('domains-reading:', '/app/resources/hosts-blocklist/domains.txt');

		let domains = {};
		let multiPartSuffixes = {};
		let domainCount = 0;
		await readLines('/app/resources/hosts-blocklist/domains.txt', line => {
			if (line[0] === '#') {
				return;
			}
			let parts = line.split('/');
			if (parts.length === 3 && parts[2] === '0.0.0.0') {
				let domain = parts[1];
				domains[domain] = true;
				domainCount++;
				let domainParts = domain.split('.');
				if (domainParts.length > 2) {
					multiPartSuffixes[domain] = domainParts.length;
				}
			}
		});

		this.domains = domains;
		this.multiPartSuffixes = multiPartSuffixes;
		debug('domains-read:', domainCount);
	}
}

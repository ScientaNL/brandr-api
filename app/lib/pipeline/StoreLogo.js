const fs = require('fs');

class StoreLogo {

	constructor(storagePath, host) {
		this.storagePath = storagePath;
		this.host = host;
	}

	async process(data) {
		let result = [];
		for(let logo of data) {
			result.push(await this.storeLogo(logo));
		}

		return result;
	}

	async storeLogo(logo) {
		let filename = `${logo.hash}.${logo.extension}`;
		let imagePath = `${this.storagePath}/${filename}`;
		let imageEndpoint = `${this.host}/${filename}`;

		await fs.promises.writeFile(imagePath, logo.buffer);

		return new StoredImage(logo, imagePath, imageEndpoint);
	}
}

class StoredImage {

	constructor(logo, imagePath, imageEndpoint) {
		this.logo = logo;
		this.imagePath = imagePath;
		this.imageEndpoint = imageEndpoint;
	}

	toJSON() {
		return this.imageEndpoint;
	}
}

module.exports = StoreLogo;


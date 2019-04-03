class TwitterLogoStrategyParser {
	document;

	constructor(document) {
		this.document = document;
	}

	parse() {
		let src, node = document.querySelectorAll('.ProfileAvatar-image')[0];

		if (node !== undefined) {
			src = node.getAttribute('src'); // a > div > img

			return {
				matches: [{src: src, type: 'twitter-logo'}]
			};
		}

		return null;
	}
}

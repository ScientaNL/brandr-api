class FacebookLogoStrategyParser {
	document;

	constructor(document) {
		this.document = document;
	}

	parse() {
		let src, node = document.querySelectorAll('a[aria-label="Profile picture"]')[0];

		if (node !== undefined) {
			src = node.childNodes[0].childNodes[0].getAttribute('src'); // a > div > img

			return [{src: src, type: 'facebook-logo'}];
		}

		return null;
	}
}

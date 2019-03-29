class GetBodyHtml
{
	constructor() {
		this.processingUri = null;
	}

	getId() {
		return 'getBodyHtml';
	}

	async handlePage(uri, page)
	{
		this.processingUri = uri;
		let result = await page.evaluate(this.handlePageDOM);
		this.processingUri = null;
		return result;
	}

	handlePageDOM () {
		return {
			domain: document.domain,
			content: document.body.innerHTML
		};
	};
}

module.exports = GetBodyHtml;

class PageParser
{
	parse()
	{
		return {
			domain: document.domain,
			content: document.body.innerHTML
		}
	}
}

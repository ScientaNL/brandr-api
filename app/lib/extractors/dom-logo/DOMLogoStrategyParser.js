class DOMLogoStrategyParser {
	document;

	minWeight = .5;

	loggingEnabled = false;

	siteRoot = "";

	documentClientRect = null;

	static inlineSvgMarker = 0;

	weighingStrategies = [
		(data, element, weight) => { // Do I tell you I am indeed a logo?
			if(element.getAttribute("itemprop") === "logo") {
				weight += 1;
				this.log(`Because I have an itemprop, I added 1 now counting ${weight}`);
			}

			return weight;
		},
		(data, element, weight) => { // Am I part of a link?
			let siteRoot = (this.document.location.origin + this.document.location.pathname).replace(/\/$/g, "");
			let cursor = element;
			let linkFactor = .24;
			do {
				if (cursor.tagName === "A" && cursor.href) {
					let href = cursor.href.replace(/\/$/g, "");

					if (href === this.siteRoot) {
						weight += linkFactor * 3;
						this.log(`Because I am part of a link, I added ${linkFactor} now counting ${weight}`);
					}
				}

				if (this.hasLogoClass(cursor) === true) {
					weight += linkFactor;
					this.log(`Because I have a logo class, I added ${linkFactor} now counting ${weight}`);
				}

				if(('' + cursor.getAttribute("id")).toLowerCase() ===  "logo") {
					weight += linkFactor * 6;
					this.log(`Because I have a logo id, I added ${linkFactor*6} now counting ${weight}`);
				} else if(('' + cursor.getAttribute("id")).toLowerCase().indexOf("logo") !==  -1) {
					weight += linkFactor * 1.5;
					this.log(`Because ID contains logo, I added ${linkFactor} now counting ${weight}`);
				}

				cursor = cursor.parentElement;
			} while (cursor && (linkFactor = linkFactor - .08) > 0);

			return weight;
		},
		(data, element, weight) => { // Do I have the word logo in my url?
			if(!data.src) {
				return weight;
			}

			let urlParts = data.src.toLowerCase().split("/");
			urlParts = urlParts.slice(3).reverse(); //Strip the protocol and domain

			let wordInUrlFactor = .5;
			for (let part of urlParts) {
				if (part.indexOf("logo") !== -1) {
					let factor = Math.max(0, wordInUrlFactor);
					weight += factor;

					this.log(`Because I found logo word in url, I added ${factor} now counting ${weight}`);
				}

				wordInUrlFactor = wordInUrlFactor - .25;
			}

			return weight;
		},
		(data, element, weight) => { // How high am I positioned?

			let boundingClientRect = element.getBoundingClientRect();

			if (boundingClientRect.top < 150) {
				weight += .35;
				this.log(`Because I am very abovy. I added .25 now counting ${weight}`);
			}

			if(boundingClientRect.left > 0 && boundingClientRect.right < this.documentClientRect.right) {
				let factor = .4 * (1 - element.getBoundingClientRect().left / this.documentClientRect.right);
				weight += factor;
				this.log(`Because I appreciate a logo on the left (LTR). I added ${factor} now counting ${weight}`);
			}

			return weight;
		},
		(data, element, weight) => { // Do I name myself a logo?
			let alt = ('' + element.getAttribute("alt")).toLowerCase();
			let title = ('' + element.getAttribute("alt")).toLowerCase();

			if (alt.indexOf("logo") !== -1 || title.indexOf("logo") !== -1) {
				weight += .15;
				this.log(`Because I have a logo alt or title. I added .15 now counting ${weight}`);
			}

			let siteName = this.getWebsiteName();
			if(siteName && (alt.indexOf(siteName) !== -1 || title.indexOf(siteName) !== -1)) {
				weight += .2;
				this.log(`Because there is in my alt or title the deduced website name is found. I added .2 now counting ${weight}`);
			}

			return weight;
		},
		(data, element, weight) => { //Maybe I'm too small to be a logo?
			let boundingRect = element.getBoundingClientRect();

			if(boundingRect.width < 16 || boundingRect.height < 16) {
				weight = 0 ;
				this.log(`Too small. I hard reset now counting ${weight}`);
			} else if(boundingRect.width < 24 && boundingRect.height < 24) {
				weight -= .4;
				this.log(`Too a bit tiny. removed .4. now counting ${weight}`);
			}

			return weight;
		},
		(data, element, weight) => { //Reside I in a HEADER, NAV element or maybe I am a nice cookie consent image?
			let header = false;
			let nav = false;
			let cookie = false;

			for(let parent of DOMLogoStrategyParser.getElementParents(element)) {
				if(parent === this.document.body) { // Don't use the body
					break;
				}

				if(header === false && parent.tagName.toLowerCase() === "header") {
					weight += .15;
					header = true;
					this.log(`I reside in a header. adding .15. now counting ${weight}`);
				} else if(nav === false && parent.tagName.toLowerCase() === "nav") {
					weight += .1;
					this.log(`I reside in a nav. adding .1 now. counting ${weight}`);
					nav = true;
				} else if(cookie === false) {
					// Could it be an annoying cookie consent message?
					if(('' + parent.getAttribute("class") + parent.getAttribute("id")).toLowerCase().indexOf("cookie") !== -1) {
						weight -= .15;
						cookie = true;
						this.log(`Maybe, I reside in a cookie consent message. removing .15. now counting ${weight}`);
					}
				}
			}

			return weight;
		},
		(data, element, weight) => { //My image is named after the title
			if(!data.src) {
				return weight;
			}

			let titlePart = this.document.title.split(/[|.:\-,_]/)[0].toLowerCase().trim();

			let urlParts = data.src.toLowerCase().split("/");
			urlParts = urlParts.slice(3).reverse(); //Strip the protocol and domain

			if(urlParts[0] && urlParts[0].indexOf(titlePart) !== -1) { //We have a title match
				weight += .15;
				this.log(`My title contains a part of the leading site title. adding .15 now counting ${weight}`);
			}

			return weight;
		},
		(data, element, weight) => { //Am i a sprite?
			if(!data.src) {
				return weight;
			}

			let url = data.src.toLowerCase().split("/").slice(3).join("/");

			if(url.indexOf("sprite") !== -1) {
				weight -= .5;
				this.log(`Url contains the word sprite. Subtracting .5. now counting ${weight}`);
			}

			return weight;
		},

	];

	constructor(document) {
		this.document = document;

		this.siteRoot = (this.document.location.origin + this.document.location.pathname).replace(/\/$/g, "");
		this.documentClientRect = this.document.body.getBoundingClientRect();
	}

	parse() {
		let treeWalker = this.createTreeWalker(this.document.body);
		let items = [];
		while (treeWalker.nextNode()) {
			items = [...items, ...this.parseElement(treeWalker.currentNode)];
		}

		// Sort and loop keeping only the highest score per source, if a source might occur multiple times
		items.sort((a, b) => {
			return b.weight - a.weight;
		});

		let uniqueLogos = {};
		for(let logo of items) {
			let key = JSON.stringify(logo.data);
			if(!uniqueLogos[key]) {
				uniqueLogos[key] = logo;
			}
		}

		let logos = [];
		for(let logo of Object.values(uniqueLogos)) {
			if(logo.weight < this.minWeight) {
				continue;
			}

			let logoBoundingClientRect = logo.element.getBoundingClientRect();

			logos.push({
				logo: logo.data,
				dimensions: {
					width: logoBoundingClientRect.width,
					height: logoBoundingClientRect.height
				},
				weight: logo.weight
			});
		}

		return logos;
	}

	createTreeWalker(element) {
		return document.createTreeWalker(
			element,
			NodeFilter.SHOW_ELEMENT,
			{
				acceptNode: function (node) {
					return NodeFilter.FILTER_ACCEPT;
				}
			},
			false
		);
	}

	parseElement(element) {

		let logos = [];
		if (element.tagName.toLowerCase() === "img") { // Image
			logos = [...logos, ...this.parseImage(element)];

		} else if (element.tagName.toLowerCase() === "svg") { // SVG
			logos = [...logos, ...this.parseSVG(element)];

		} else if (element.tagName.toLowerCase() === "object" && element.getAttribute("type")) { // Image in object
			logos = [...logos, ...this.parseImageObject(element)];

		} else if (this.hasLogoClass(element)) {

			// Check if the current element not only has a logo class, but has an image as background
			logos = [...logos, ...this.parseComputedStyles(element)];

			// It could be that the current logo-classed element is not the logo itself, but a child could be the logo
			let logoClassSubtreeWalker = this.createTreeWalker(element);
			while (logoClassSubtreeWalker.nextNode()) {
				logos = [...logos, ...this.parseComputedStyles(logoClassSubtreeWalker.currentNode)];
			}
		} else if(this.hasLogoBackground(element)) { // No logo class? Try image file names
			logos = [...logos, ...this.parseComputedStyles(element)];

		} else if(element.tagName.toLowerCase() === "a" && element.href.replace(/\/$/g, "") === this.siteRoot) { // Are we a link to home? Be desperate to resolve images

			logos = [...logos, ...this.parseComputedStyles(element)];

			let logoClassSubtreeWalker = this.createTreeWalker(element);
			while (logoClassSubtreeWalker.nextNode()) {
				logos = [...logos, ...this.parseComputedStyles(logoClassSubtreeWalker.currentNode)];
			}
		}

		return logos;
	}

	parseImage(element) {
		let logos = [];

		let src = '' + element.currentSrc;
		let srcset = element.srcset;

		if (srcset) {
			let srcsetItems = {
				x: {},
				w: {},
			};

			for (let match of srcset.matchAll(/(.*?)\s*?(\d+)(x|w)(?:,\s*?|$)/ig)) {
				srcsetItems[match[3]][parseInt(match[2])] = match[1].trim();
			}

			for (let descriptor in srcsetItems) {
				let maxItem = Math.max(...Object.keys(srcsetItems[descriptor]));
				if (maxItem !== -Infinity) {
					logos.push(
						this.createLogoMatch(
							{type: 'file', src: this.convertUrlToAbsolute(srcsetItems[descriptor][maxItem])},
							element,
							.3
						)
					);
				}
			}
		} else if (src.match(/^data:image\/(?:png|jpg|gif|webp);base64,/i)) {
			logos.push(
				this.createLogoMatch(
					{type: 'file', src: src},
					element,
					.2
				)
			);
		} else if(src) {
			logos.push(
				this.createLogoMatch(
					{type: 'file', src: this.convertUrlToAbsolute(src)},
					element,
					.2
				)
			);
		}

		return logos;
	}

	parseSVG(element) {

		// Check if the current SVG is a subset of an SVG image.
		for(let parent of DOMLogoStrategyParser.getElementParents(element)) {
			if(parent.tagName.toLowerCase() === "svg") {
				return [];
			}
		}

		let containedImages = element.querySelectorAll(":scope > image[*|href]");

		if(containedImages.length > 0) {
			let logos = [];

			containedImages.forEach((image) => logos = [...logos, ...this.parseSVGImage(image, element)]);

			return logos;
		} else {
			return this.parseInlineSVG(element);
		}
	}
	
	parseInlineSVG(element) {
		let boundingClientRect = element.getBoundingClientRect();
		let marker = "svg-mark-for-download-" + DOMLogoStrategyParser.inlineSvgMarker++;

		element.classList.add(marker);
		element.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
		element.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
		element.setAttribute("width", boundingClientRect.width);
		element.setAttribute("height", boundingClientRect.height);

		return [this.createLogoMatch(
			{type: 'svg', marker: marker},
			element,
			.2
		)];
	}

	parseSVGImage(imageElement, hostElement) {
		let src = imageElement.getAttribute("xlink:href") || imageElement.getAttribute("href");

		if(src) {
			return [this.createLogoMatch(
				{type: 'file', src: this.convertUrlToAbsolute(src)},
				hostElement,
				.2
			)];
		} else {
			return [];
		}
	}

	parseImageObject(element) {
		let type = element.getAttribute("type");
		let acceptedTypes = ["image/svg+xml", "image/png"];
		let data = element.getAttribute("data");

		if(acceptedTypes.indexOf(type) === -1 || !data) {
			return [];
		}

		return [this.createLogoMatch(
			{type: 'file', src: this.convertUrlToAbsolute(data)},
			element,
			.2
		)];
	}

	parseComputedStyles(element) {
		let matches = [];
		let weightFactor = 0;
		for (let url of this.getBackgroundImageUrls(element)) {

			if (url.indexOf("data:image/svg+xml;") === 0) {
				if (url.indexOf("data:image/svg+xml;base64,") === 0) {
					try {
						matches.push(
							this.createLogoMatch(
								{type: 'svg', svg: atob(url.substr(26).trim())},
								element,
								weightFactor
							)
						);
					} catch (e) {}
				} else if (url.match(/data:image\/svg\+xml;charset.*?,/)) {
					let data = url.split(",", 2)[1] || "";

					matches.push(
						this.createLogoMatch(
							{type: 'svg', svg: decodeURIComponent(data)},
							element,
							weightFactor
						)
					);
				}
			} else {
				matches.push(
					this.createLogoMatch(
						{type: 'file', src: url},
						element,
						weightFactor
					)
				);
			}

			weightFactor = weightFactor - .25;
		}

		return matches;
	}

	hasLogoClass(element) {
		for (let cssClass of element.classList) {
			cssClass = cssClass.toLowerCase();
			if (cssClass.indexOf("logo") !== -1) {
				return true;
			}
		}

		return false;
	}

	hasLogoBackground(element) {
		for (let url of this.getBackgroundImageUrls(element)) {
			if(url.toLowerCase().indexOf("logo") !== -1) {
				return true;
			}
		}

		return false;
	}

	createLogoMatch(data, element, weight) {
		return {
			element: element,
			data: data,
			weight: this.calculateWeight(data, element, weight)
		};
	}

	convertUrlToAbsolute(url) {
		if (url.indexOf("http") === 0 || url.indexOf("//") === 0) {
			return url;
		} else {
			let tempImg = this.document.createElement("img");
			tempImg.src = url;

			return tempImg.src;
		}
	}

	calculateWeight(data, element, weight) {

		this.loggingEnabled && console.group(`Weighing %s`, JSON.stringify(data).substr(0, 150));
		this.log(`starting with ${weight}`);

		for(let strategy of this.weighingStrategies) {
			weight = strategy(data, element, weight);
		}

		this.loggingEnabled && console.groupEnd();

		return weight;
	}

	static getElementParents(cursor) {
		// cursor = cursor.parentElement;
		let parents = [];

		while(cursor = cursor.parentElement) {
			parents.push(cursor);
		}

		return parents;
	}

	log(message) {
		if(this.loggingEnabled === true) {
			console.log(message);
		}
	}

	getBackgroundImageUrls(element) {

		let urls = [];
		for(let pseudoElt of [null, ":before", ":after"]) {
			let cssDeclaration = this.document.defaultView.getComputedStyle(element, pseudoElt);

			for(let property of ["background-image", "content"]) {
				if(pseudoElt === null && property === "content") {
					continue;
				}

				let backgroundImage = cssDeclaration.getPropertyValue(property);

				for (let match of backgroundImage.matchAll(/url\(['"]?(.*?)['"]?\)/ig)) {
					urls.push(match[1]);
				}
			}
		}

		return urls;
	}

	getWebsiteName() {
		let selectors = [
			"head > meta[name=author]",
			// "head > meta[name=description]",
			"head > meta[property='og:title']",
			// "meta[property='og:description']",
			"head > meta[property='og:site_name']",
			"head > title",
			// "h1"
		];

		let splitText = (text) => {
			return ('' + text).split(/[|.:\-,_\s]/).filter((word) => !!word.trim());
		};

		let words = [];
		for(let node of this.document.querySelectorAll(selectors.join(","))) {
			switch(node.tagName.toLowerCase()) {
				case "meta":
					words = [...words, ...splitText('' + node.getAttribute("content"))];
					break;
				case "title":
				case "h1":
					words = [...words, ...splitText('' + node.innerText)];
					break;
			}
		}

		// Take the site root into the equation
		words = [...words, ...splitText(this.siteRoot)];

		let wordCountMap = {};

		for(let word of words) {
			word = word.toLowerCase();
			if(!wordCountMap[word]) {
				wordCountMap[word] = 0;
			}

			wordCountMap[word]++;
		}

		let mostUsedWord = "", highestCount = 1; //One word is no word
		for(let word in wordCountMap) {
			if(wordCountMap.hasOwnProperty(word) === false) {
				continue;
			}

			let wordCount = wordCountMap[word];
			if(wordCount > highestCount) {
				mostUsedWord = word;
				highestCount = wordCount;
			}
		}

		return mostUsedWord;
	}
}

// console.clear();
// console.log((new DOMLogoStrategyParser(document)).parse());

class DomLogoImage {
	document;

	minWeight = .5;

	loggingEnabled = false;

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

					if (href === siteRoot) {
						weight += linkFactor;
						this.log(`Because I am part of a link, I added ${linkFactor} now counting ${weight}`);
					}
				}

				if (this.hasLogoClass(cursor) === true) {
					weight += linkFactor;
					this.log(`Because I have a logo class, I added ${linkFactor} now counting ${weight}`);
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
			if (element.getBoundingClientRect().top < 150) {
				weight += .35;
				this.log(`Because I am very abovy. I added .25 now counting ${weight}`);
			}

			return weight;
		},
		(data, element, weight) => { // Do I name myself a logo?
			let alt = '' + element.getAttribute("alt");
			let title = '' + element.getAttribute("alt");

			if (alt.toLowerCase().indexOf("logo") !== -1 || title.toLowerCase().indexOf("logo") !== -1) {
				weight += .15;
				this.log(`Because i have a logo alt or title. I added .15 now counting ${weight}`);
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

			for(let parent of DomLogoImage.getElementParents(element)) {
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

	];

	constructor(document) {
		this.document = document;
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

			logos.push({
				logo: logo.data,
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
		} else if(this.hasLogoBackground(element)) {
			logos = [...logos, ...this.parseComputedStyles(element)];
		}

		return logos;
	}

	parseImage(element) {
		let logos = [];

		let src = '' + element.src;
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
		} else if (src.match(/^data:image\/(?:png|jpg|gif);base64,/i)) {
			logos.push(
				this.createLogoMatch(
					{type: 'base64', src: src},
					element,
					.2
				)
			);
		} else {
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
		for(let parent of DomLogoImage.getElementParents(element)) {
			if(parent.tagName.toLowerCase() === "svg") {
				return [];
			}
		}

		this.inlineSvgUses(element);

		return [this.createLogoMatch(
			{type: 'svg', svg: element.outerHTML},
			element,
			.2
		)];
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
			matches.push(
				this.createLogoMatch(
					{type: 'file', src: url},
					element,
					weightFactor
				)
			);
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

		if(data.src) {
			data.src = data.src.replace("logo-extractor", "dinges-extractor"); //Even voor nu
		}

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

	inlineSvgUses(element) {
		let treeWalker = this.createTreeWalker(element);

		// Could be all of https://www.w3.org/TR/SVG11/styling.html#SVGStylingProperties
		let stylingProperties = ["fill", "stroke"];

		while(treeWalker.nextNode()) {
			let curElm = treeWalker.currentNode;
			let tagName = curElm.tagName.toLowerCase();

			if(tagName === "use") { //Add symbol to current svg
				let id = "";
				if(curElm.getAttribute("href")) {
					id = curElm.getAttribute("href");
				} else if(curElm.getAttribute("xlink:href")) {
					id = curElm.getAttribute("xlink:href")
				} else {
					continue;
				}

				if(id.indexOf("#") === 0) {
					let symbolElm = this.document.getElementById(id.substr(1));
					element.appendChild(symbolElm);
				}
			} else {
				let cssDelaration = this.document.defaultView.getComputedStyle(curElm);

				for(let property of stylingProperties) {
					curElm.style[property] =  cssDelaration.getPropertyValue(property);
				}
			}
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
}

console.clear();

let strategy = new DomLogoImage(document);

setTimeout(() => {
	console.time("a");
	var iets = strategy.parse();
	console.timeEnd("a");

	for(let iet of iets) {
		console.log(iet); break;
	}

	if(iets[0].logo.svg) {
		document.body.innerHTML = iets[0].logo.svg;
	} else if(iets[0].logo.src) {
		document.write(`<html><img src="${iets[0].logo.src}" /></html>`);
	}
}, 1);


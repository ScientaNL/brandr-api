// inlineSvgUses(element) {
	// 	let treeWalker = this.createTreeWalker(element);
	//
	// 	// Inline uses
	// 	let uses = [];
	// 	while(treeWalker.nextNode()) {
	// 		let curElm = treeWalker.currentNode;
	// 		let tagName = curElm.tagName.toLowerCase();
	//
	// 		if(tagName === "use") {
	// 			let id = "";
	// 			if(curElm.getAttribute("href")) {
	// 				id = curElm.getAttribute("href");
	// 			} else if(curElm.getAttribute("xlink:href")) {
	// 				id = curElm.getAttribute("xlink:href")
	// 			}
	//
	// 			if(id.indexOf("#") !== 0) {
	// 				continue;
	// 			}
	//
	// 			let symbolElm = this.document.getElementById(id.substr(1));
	// 			let containerElm = this.document.createElement("svg");
	//
	// 			for(let attr of curElm.getAttributeNames()) {
	// 				if(["xlink:href", "href", "id"].indexOf(attr) !== -1) {
	// 					continue;
	// 				}
	//
	// 				containerElm.setAttribute(attr, curElm.getAttribute(attr));
	// 			}
	//
	// 			let viewBox = symbolElm.getAttribute("viewBox");
	// 			if(viewBox) {
	// 				containerElm.setAttribute("viewBox", viewBox);
	// 			}
	//
	// 			containerElm.innerHTML = symbolElm.innerHTML;
	// 			curElm.parentElement.insertBefore(containerElm, curElm);
	//
	// 			uses.push(curElm);
	// 		}
	// 	}
	//
	// 	for(let use of uses) {
	// 		use.parentElement.removeChild(use);
	// 	}
	//
	// 	//Inline styles
	// 	treeWalker = this.createTreeWalker(element);
	//
	// 	// Could be all of https://www.w3.org/TR/SVG11/styling.html#SVGStylingProperties
	// 	let stylingProperties = ["fill", "stroke"];
	//
	// 	while(treeWalker.nextNode()) {
	// 		let curElm = treeWalker.currentNode;
	// 		let tagName = curElm.tagName.toLowerCase();
	//
	// 		if(tagName !== "g" && tagName !== "svg" && tagName !== "symbol") {
	// 			let cssDelaration = this.document.defaultView.getComputedStyle(curElm);
	//
	// 			for(let property of stylingProperties) {
	// 				console.log(curElm, property);
	// 				curElm.style[property] =  cssDelaration.getPropertyValue(property);
	// 			}
	// 		}
	// 	}
	// }

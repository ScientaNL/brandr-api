import AbstractStrategy from '../AbstractStrategy.js';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default class DomLogoStrategy extends AbstractStrategy {
	static getId() {
		return 'dom-logo';
	}

	getParserFilesToInject() {
		return [
			path.normalize(dirname + '/DomLogoStrategyParser.js')
		];
	}

	async handlePage(page, cdp) {
		let result = await page.evaluate(() => {
			const parser = new DomLogoStrategyParser(document);
			return parser.parse();
		});

		let inlineSVGs = result.filter((logo) => logo.logo.type === "svg" && logo.logo.marker);
		for (let inlineSVG of inlineSVGs) {
			inlineSVG.logo.svg = await this.retrieveInlineSVG(cdp, inlineSVG.logo.marker);
			delete inlineSVG.logo.marker;
		}

		return await this.processParserResult(result);
	}

	async processParserResult(parserResult) {

		let images = [];
		for (let logo of parserResult) {
			try {
				let imageDefinition = await this.downloadLogo(logo);

				if (imageDefinition) {
					let weight = this.weighLogo(logo, imageDefinition);

					// if(imageDefinition.origin === "https://www.pearle.nl/is-bin/intershop.static/WFS/org-nl_pearle-Site/-/nl_NL/images/branding.png") {
					console.log(imageDefinition.origin, weight);
					// }

					images.push({
						buffer: imageDefinition.buffer,
						hash: this.getBufferHash(imageDefinition.buffer),
						extension: imageDefinition.extension,
						weight: weight,
						origin: imageDefinition.origin,
					});
				}
			} catch (e) {
				console.error(e);
			}
		}

		return images;
	}

	async downloadLogo(logo) {

		switch (logo.logo.type) {
			case "file":
				return this.downloadFile(logo.logo.src);
			case "svg":
				return this.parseSvg(logo.logo.svg);
		}
	}

	weighLogo(logo, imageDefinition) {

		let weight = logo.weight;

		if (imageDefinition.extension === "svg") {
			weight *= 1.3;
		}

		return weight;
	}

	async retrieveInlineSVG(cdp, marker) {
		let document = await cdp.send('DOM.getDocument', {depth: 1});
		let nodeId = (await cdp.send('DOM.querySelector', {
			nodeId: document.root.nodeId,
			selector: `.${marker}`,
		})).nodeId;
		let node = (await cdp.send('DOM.describeNode', {
			nodeId: nodeId,
			depth: -1,
			pierce: true,
		})).node;

		let svg = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n'
			+ '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n'
			+ await this.traverseSvg(cdp, node);

		return svg;
	}

	async traverseSvg(cdp, node) {

		let remoteObject = await cdp.send('DOM.resolveNode', {backendNodeId: node.backendNodeId});
		let nodeId = (await cdp.send('DOM.requestNode', {
			objectId: remoteObject.object.objectId,
			depth: -1,
		})).nodeId;

		if (node.nodeType === 1) {
			await this.inlineStyle(cdp, node, nodeId);
		}

		let outerHTML = (await cdp.send('DOM.getOuterHTML', {backendNodeId: node.backendNodeId})).outerHTML;

		if (node.nodeName === "use" && node.shadowRoots && node.shadowRoots.length === 1) {
			return await this.traverseSvg(cdp, node.shadowRoots[0]);
		} else if (node.children) {
			for (let child of node.children) {

				let childOuterHTML = (await cdp.send('DOM.getOuterHTML', {backendNodeId: child.backendNodeId})).outerHTML;
				let returnedChildOuterHtml = await this.traverseSvg(cdp, child);

				outerHTML = outerHTML.replace(childOuterHTML, returnedChildOuterHtml);
			}
		}

		return outerHTML;
	}

	async inlineStyle(cdp, node, nodeId) {
		let propertiesToInline = ["fill", "fill-opacity", "fill-rule", "marker", "marker-start", "marker-mid", "marker-end", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-miterlimit", "stroke-opacity", "stroke-width", "text-rendering", "alignment-baseline", "baseline-shift", "dominant-baseline", "glyph-orientation-horizontal", "glyph-orientation-vertical", "kerning", "stop-color", "stop-opacity"];

		let computedStyles = (await cdp.send('CSS.getComputedStyleForNode', {nodeId: nodeId})).computedStyle;
		let styleValues = [];
		for (let computedStyle of computedStyles) {
			if (propertiesToInline.indexOf(computedStyle.name) !== -1) {
				styleValues.push(`${computedStyle.name}: ${computedStyle.value}`);
			}
		}

		await cdp.send('DOM.setAttributeValue', {
			nodeId: nodeId,
			name: "style",
			value: styleValues.join("; "),
		});
	}
}

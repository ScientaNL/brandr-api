class PageParser {
	cutoff = .1;
	grayDev = 4;
	colorCount = {
		'colors': {},
		'grays': {}
	};
	typeWeight = {
		'links-color': 1,
		'links-backgroundColor': 1,
		'buttons-color': 1,
		'buttons-backgroundColor': 30,
		'headers-color': 10,
		'header-color': 20
	};

	typeSelectors = {
		'links': [
			{selector: '.active > a, .active > * > a', weight: 50, styles: ['color', 'backgroundColor']},
			{selector: 'header a', weight: 10, styles: ['color', 'backgroundColor']}
		],
		'buttons': [
			{
				selector: [
					'header button',
					'header [class*="button"]',
					'header [class*="btn"]',
					'header input [type="button"]',
					'header input [type="submit"]',
				].join(','),
				weight: 20, styles: ['color', 'backgroundColor']
			},
			{
				selector: [
					'button',
					'[class*="button"]',
					'[class*="btn"]',
					'input [type="button"]',
					'input [type="submit"]',
				].join(','),
				weight: 10, styles: ['color', 'backgroundColor']
			}
		],
		'header': [
			{selector: 'header [role="banner"]', weight: 1, styles: ['backgroundColor']},
		],
		'headers': [
			{selector: 'h1', weight: 40, styles: ['color']},
			{selector: 'h1 *', weight: 10, styles: ['color']},
			{selector: 'h2', weight: 20, styles: ['color']},
			{selector: 'h2 *', weight: 5, styles: ['color']},
			{selector: 'h3', weight: 10, styles: ['color']}
		]
	};

	parse() {

		for (let type in this.typeSelectors) {
			for (let selector of this.typeSelectors[type]) {
				let items = document.querySelectorAll(selector.selector);
				for (let item of items) {
					let computed = window.getComputedStyle(item);
					for (let style of selector.styles) {
						this.colorCounted(type + '-' + style, computed[style], selector.weight);
					}
				}
			}
		}

		let styleTypes = 0;
		//filter and normalize
		for (let colorType in this.colorCount) {
			//sort
			let sortable = [];

			for (let styleType in this.colorCount[colorType]) {
				styleTypes++;
				let weight = this.typeWeight[styleType];

				let total = 0;
				let newColors = {};
				for (let color in this.colorCount[colorType][styleType]) {
					if (newColors.hasOwnProperty(color)) {
						newColors[color] += this.colorCount[colorType][styleType][color] * weight;
					} else {
						newColors[color] = this.colorCount[colorType][styleType][color] * weight;
					}
					total += this.colorCount[colorType][styleType][color] * weight;
				}

				for (let color in newColors) {
					let newColor = newColors[color] / total;
					this.colorCount[colorType][color] = this.colorCount[colorType].hasOwnProperty(color)
						? this.colorCount[colorType][color] + newColor
						: newColor;
				}

				delete this.colorCount[colorType][styleType];

			}

			for (let color in this.colorCount[colorType]) {
				sortable.push([color, this.colorCount[colorType][color] / styleTypes])
			}

			sortable = sortable.sort(function (a, b) {
				return b[1] - a[1];
			});

			let top = sortable.slice(0, 3);

			this.colorCount[colorType] = [];
			for (let result of top) {
				if (result[1] > this.cutoff) {
					this.colorCount[colorType].push(result[0]);
				}
			}
		}

		return this.colorCount;

	}

	colorCounted(type, color, value) {
		color = this.removeAlpha(color);
		let colorType = this.isGray(color) ? 'grays' : 'colors';
		let counter = this.colorCount[colorType][type] || {};
		counter[color] ? counter[color] += value : counter[color] = value;
		this.colorCount[colorType][type] = counter;
	}

	removeAlpha(color) {
		let testColor = color.substring(color.indexOf('(') + 1, color.indexOf(')'));
		let rgb = testColor.split(',', 3);
		return "rgb(" + rgb.join(',') + ")";
	}

	isGray(color) {
		let testColor = color.substring(color.indexOf('(') + 1, color.indexOf(')'));
		let rgb = testColor.split(',', 3);
		let avg = (+rgb[0] + +rgb[1] + +rgb[2]) / 3;
		for (let c of rgb) {
			if (Math.abs(avg - c) > this.grayDev) {
				return false;
			}
		}
		return true;
	}

}

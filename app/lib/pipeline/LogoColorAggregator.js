import Vibrant from 'node-vibrant';
import { Swatch } from '@vibrant/color';
import DeltaE from 'delta-e';

export default class LogoColorAggregator {

	constructor(matches, storagePath, host) {
		this.matches = matches;
	}

	async process(data) {
		data = data.slice(0, this.matches);

		let swatches = [];
		for (let logo of data) {
			if (logo.extension !== "svg") {
				swatches = swatches.concat(await this.getLogoSwatches(logo.buffer));
			}
		}

		swatches.sort((a, b) => b.getPopulation() - a.getPopulation());

		let aggregatedSwatches = [];
		for (let swatch of swatches) {
			if (this.isGray(swatch.getRgb()) === true) {
				continue;
			}

			let colorLab = this.RGBArrayToLABObject(swatch.getRgb());

			let hasSimilar = false;
			for (let i = 0, u = aggregatedSwatches.length; i < u; i++) {
				let aggregatedSwatch = aggregatedSwatches[i];

				let aggregatedLAB = this.RGBArrayToLABObject(aggregatedSwatch.getRgb());

				if (DeltaE.getDeltaE00(aggregatedLAB, colorLab) <= 3) {
					aggregatedSwatches[i] = new Swatch(
						aggregatedSwatch.getRgb(),
						aggregatedSwatch.getPopulation() + swatch.getPopulation(),
					);

					hasSimilar = true;
				}
			}

			if (hasSimilar === false) {
				aggregatedSwatches.push(swatch);
			}
		}

		swatches.sort((a, b) => b.getPopulation() - a.getPopulation());

		let output = [];
		for (let swatch of aggregatedSwatches) {
			let rgb = swatch.getRgb();
			output.push(`rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`);
		}

		return output.slice(0, this.matches);
	}

	async getLogoSwatches(buffer) {
		let palette = await Vibrant.from(buffer)
			.getSwatches();

		let colors = [];
		for (let id in palette) {
			let color = palette[id];
			if (color.getPopulation() < 32) {
				continue;
			}

			colors.push(color);
		}

		return colors;
	}

	isGray(rgb) {

		const mean = (data) => {
			const sum = data.reduce(function (sum, value) {
				return sum + value;
			}, 0);

			return sum / data.length;
		};

		const rgbMean = mean(rgb);

		const squareDiffs = rgb.map((value) => {
			const diff = value - rgbMean;
			return diff * diff;
		});

		return Math.sqrt(mean(squareDiffs)) < 10;
	}

	RGBArrayToLABObject(rgb) {
		let r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, x, y, z;

		r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
		g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
		b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
		x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
		y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
		z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
		x = (x > 0.008856) ? Math.pow(x, 1 / 3) : (7.787 * x) + 16 / 116;
		y = (y > 0.008856) ? Math.pow(y, 1 / 3) : (7.787 * y) + 16 / 116;
		z = (z > 0.008856) ? Math.pow(z, 1 / 3) : (7.787 * z) + 16 / 116;

		return {
			L: (116 * y) - 16,
			A: 500 * (x - y),
			B: 200 * (y - z),
		};
	}
}

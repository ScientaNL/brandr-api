export default class ArrayMerger {

	constructor(keys) {
		this.keys = keys;
	}

	process(data) {

		let result = [];
		for (let key of this.keys) {
			if (data.hasOwnProperty(key) === false) {
				continue;
			}

			result = result.concat(result, data[key]);
		}

		return result;
	}
}

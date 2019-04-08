class ArrayUnique {

	async process(data) {
		let result = {};
		for(let item of data) {
			if(result.hasOwnProperty(item.hash) === false) {
				result[item.hash] = item;
			}
		}

		return Object.values(result);
	}
}

module.exports = ArrayUnique;

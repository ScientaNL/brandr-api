class ArrayWeighSort {

	async process(data) {
		data = data.slice();
		data.sort((a,b) => b.weight - a.weight);

		return data;
	}
}

module.exports = ArrayWeighSort;

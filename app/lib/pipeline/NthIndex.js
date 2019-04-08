class NthIndex {

	constructor(index) {
		this.index = index;
	}

	async process(data) {
		return data[this.index] ? data[this.index] : null;
	}
}

module.exports = NthIndex;

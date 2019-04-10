const fs = require('fs');

class ArraySlice {

	constructor(start, number) {
		this.start = start;
		this.number =  number;
	}

	async process(data) {
		return data.slice(this.start, this.number);
	}
}

module.exports = ArraySlice;


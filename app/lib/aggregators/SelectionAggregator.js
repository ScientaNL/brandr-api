class SelectionAggregator {
	constructor(selection) {
		this.selection = selection;
	}

	aggregate(data) {

		let result = {};
		for(let item of this.selection) {
			if(!data[item]) {
				continue;
			}

			let extractorData = data[item];

			for(let key in extractorData) {
				if(extractorData.hasOwnProperty(key) === true) {
					result[key] = extractorData[key];
				}
			}
		}

		return result;
	}
}

module.exports = SelectionAggregator;

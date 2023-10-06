export default class Pipeline {

	constructor(name, items) {
		this.name = name;
		this.items = items;
	}

	async process(data) {
		for (let item of this.items) {
			data = await item.process(data);
		}

		let result = {};
		result[this.name] = data;
		return result;
	}
}

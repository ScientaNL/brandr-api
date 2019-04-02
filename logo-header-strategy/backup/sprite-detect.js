(data, element, weight) => { //Maybe I am a sprite?
	if(!data.src) {
		return weight;
	} else if(weight < .5) { // Don't even bother with images with a low weight
		return weight
	}

	let imgElm = new Image();
	let hostElmDimensions = element.getBoundingClientRect();

	imgElm.src = data.src;
	if (imgElm.naturalWidth > 1 && imgElm.naturalHeight > 1 && hostElmDimensions.width > 1 && hostElmDimensions.height > 1) {
		let imgRatio = imgElm.naturalHeight / imgElm.naturalWidth;
		let elmRatio = hostElmDimensions.height / hostElmDimensions.width;

		// What is the ratio between the two ratios? ;-)
		let ratioDiff = Math.min(imgRatio, elmRatio) / Math.max(imgRatio, elmRatio);
		weight = Math.min(imgRatio, elmRatio) / Math.max(imgRatio, elmRatio) * weight;

		this.log(`Because I think I am a sprite multiplying the weight with ${ratioDiff}. now counting ${weight}`);
	} else {
		this.log(`Pas desprite`);
	}

	return weight;
}

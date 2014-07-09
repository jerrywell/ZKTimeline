/**
* Here's the mold file , a mold means a HTML struct that the widget really presented.
* yep, we build html in Javascript , that make it more clear and powerful.
*/
function (out) {
	
	//Here you call the "this" means the widget instance. (@see ImageSlider.js)

	var zcls = this.getZclass(),
		uuid = this.uuid,
		viewportSize = this._viewportSize,
		hideSideBar = viewportSize >= this.nChildren;
		
	//The this.domAttrs_() means it will prepare some dom attributes,
	//like the pseudo code below
	/*
		class="${zcls} ${this.getSclass()}" id="${uuid}"
	*/

	out.push('<div ', this.domAttrs_(), '>');
	
	// add previous
	out.push('<div class="', zcls, '-previous" id="', uuid, '-previous" ' + (hideSideBar ? 'style="display:none"' : '') + '></div>');
	
	// add content
	out.push('<div class="', zcls, '-content" id="', uuid, '-content" style="width:' + (viewportSize * this._imageWidth) + 'px">');
		
	// frame, which is used in contain all images inside content
	out.push('<div class="', zcls, '-cave" id="', uuid, '-cave">');
	
	// render images
	for (var w = this.firstChild; w; w = w.nextSibling){
		out.push('<div class="', zcls, '-outer">');
		w.redraw(out);
		out.push('</div>');
	}
		
	// add next
	out.push('</div></div>', '<div class="', zcls, '-next" id="', uuid, '-next" ' + (hideSideBar ? 'style="display:none"' : '') + '></div>');
	
	out.push('</div>');

}
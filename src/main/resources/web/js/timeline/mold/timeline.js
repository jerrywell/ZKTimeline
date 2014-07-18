/**
* Here's the mold file , a mold means a HTML struct that the widget really presented.
* yep, we build html in Javascript , that make it more clear and powerful.
*/
function (out) {

	//Here you call the "this" means the widget instance. (@see Timeline.js)

	var zcls = this.getZclass(),
		uuid = this.uuid;

	//The this.domAttrs_() means it will prepare some dom attributes,
	//like the pseudo code below
	/*
		class="${zcls} ${this.getSclass()}" id="${uuid}"
	*/
	out.push('<div ', this.domAttrs_(), '>');
	
		out.push('<div class="', zcls, '-content" id="', uuid, '-content" ' + '>');
			out.push('<div class="', zcls, '-content-inside" id="', uuid, '-content-inside">');
				out.push('<div class="', zcls, '-content-cave" id="', uuid, '-content-cave">');
				
				for (var w = this.timelineEvents; w; w = w.nextSibling){
					out.push('<div class="', zcls, '-outer">');
					w.redraw(out);
					out.push('</div>');
				}
				
				out.push('</div>');
				out.push('<div class="', zcls, '-small-facet" id="', uuid, '-small-facet"></div>');
				out.push('<div class="', zcls, '-main-facet" id="', uuid, '-main-facet"></div>');
				out.push('<div class="', zcls, '-large-facet" id="', uuid, '-large-facet"></div>');
			out.push('</div>');
		out.push('</div>');
		
//		out.push('<div class="', zcls, '-background" id="', uuid, '-background" ' + '>');
//			out.push('<div class="', zcls, '-indicator" id="', uuid, '-indicator" ' + '></div>');
//			out.push('<div class="', zcls, '-line" id="', uuid, '-line" ' + '></div>');
//		out.push('</div>');
	
	out.push('</div>');
}
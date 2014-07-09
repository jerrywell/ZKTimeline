
imageslider.ImageSlider = zk.$extends(zul.Widget, {
	_scrollIndex: 0,			
	_viewportSize: 3,			
	_selectedIndex:	-1,		
	_imageWidth: 200,			
	
	_doubleBorderWidth: 4,
	_shouldResize: false,
	
	
	
	$define: {
		
		scrollIndex: function() { 
			if(this.desktop) {
				this.updateScroll_();
			}
		},

		viewportSize: function() { 
			
			if(this.desktop) {
				this.updateContent_();
				this.updateArrow_();
			}
		},
		
		imageWidth: function() { 
			
			if(this.desktop) {
				jq(this).height(this._imageWidth);
				this.updateContent_();
				this.updateCave_();
				this.updatePhotos_();
				this.updateScroll_();
			}
		}
	},
	
	getSelectedIndex: function() {return this._selectedIndex;},
	setSelectedIndex: function(val, target) {
		var prevIndex = this._selectedIndex,
			index = this._selectedIndex = val;
		
		if(this.desktop) {
			var scrollIndex = this._scrollIndex,
				viewportSize = this._viewportSize;
			
			if(index != -1){
				this.updateFocus_(prevIndex, this.getChildAt(index));
				
				if(index < scrollIndex) {
					this.setScrollIndex(index);
				} else if(index > (scrollIndex + viewportSize - 1)) {
					this.setScrollIndex(index - viewportSize + 1);
				}
			}
			
			
		}
	},
	
	bind_: function () {
		
		this.$supers(imageslider.ImageSlider,'bind_', arguments);
	
		this.domListen_(this.$n("next"), "onClick", "_doNextClick")
			.domListen_(this.$n("previous"), "onClick", "_doPreviousClick");
		
		zWatch.listen({onResponse: this});
		
		
	},
	
	
	unbind_: function () {
	
		
		
		
		
		this.domUnlisten_(this.$n("next"), "onClick", "_doNextClick")
			.domUnlisten_(this.$n("previous"), "onClick", "_doPreviousClick");

		zWatch.unlisten({onResponse: this});
		this.$supers(imageslider.ImageSlider,'unbind_', arguments);
	},
	
	
	onResponse: function () {
		if (this._shouldResize) {
			this.updateCave_();
			this.updateArrow_();
			this._shouldResize = false;
		}
	},

	insertChildHTML_: function(child, before, desktop) {
		
		var outer = jq(this.encloseChildHTML_(child));
		
		if (before)
			jq(before).before(outer);
		else
			jq(this.$n('cave')).append(outer);

		this._resetImageSize(outer, this._imageWidth);
		this._shouldResize = true;
						
		child.bind(desktop);
	},
	
	encloseChildHTML_: function(child) {
		var out = [];
		out.push('<div class="' + this.getZclass() + '-outer">');
		child.redraw(out);
		out.push('</div>');
		return out.join('');
	},
	
	removeChildHTML_: function(child) {
		var outer = jq(child).parent();
		
		
		this.$supers(imageslider.ImageSlider,'removeChildHTML_', arguments);
		
		outer.remove();
		this._shouldResize = true;
	}, 
	
	doSelect_: function(evt) {
		var target = evt.target,
			index = -1,
			prevSelectedIndex = this._selectedIndex;
				
		if(target.$instanceof(zul.wgt.Image)) {
			
			
			index = target.getChildIndex();
			
			if(index != prevSelectedIndex) {
				this.updateFocus_(prevSelectedIndex, target);
				this._selectedIndex = index;
				this.fire("onSelect", {index: index});
			}
		}
		
		this.$supers('doSelect_', arguments);
	},
	
	getCaveNode: function () {
		return this.$n('cave');
	},
	
	_doNextClick: function(evt) {
		if(this._scrollIndex < (this.nChildren - this._viewportSize)) {
			this.setScrollIndex(this._scrollIndex + 1);
			this.updateScroll_();
		}
	},
	
	_doPreviousClick: function(evt) {
		if(this._scrollIndex > 0) {
			this.setScrollIndex(this._scrollIndex - 1);
			this.updateScroll_();
		}
	},
	
	_resetImageSize: function(photo, imageWidth) {
			jq(photo).width(imageWidth).height(imageWidth);
	},
	
	
	updateFocus_: function(prevSelectedIndex, target) {
		var imageWidth = this._imageWidth,
			doubleBorderSize = this._doubleBorderWidth;
			
		
		if(prevSelectedIndex != -1) {
			jq(this.getChildAt(prevSelectedIndex)).parent().removeClass('z-imageslider-focus').css({
				width: imageWidth,
				height: imageWidth
			});
		}
				
		
		if(target) {
			jq(target).parent().addClass('z-imageslider-focus').css({
				width: imageWidth - doubleBorderSize,
				height: imageWidth - doubleBorderSize
			});
		}	
	},
	
	updateContent_: function() {
		var width = this._imageWidth * this._viewportSize;
		
		jq(this.$n('content')).width(width).height(this._imageWidth);
		
	},
	
	updateArrow_: function() {
		if(this._viewportSize >= this.nChildren) {
			this.setScrollIndex(0);
			jq(this.$n('previous')).hide();
			jq(this.$n('next')).hide();
		} else {
			jq(this.$n('previous')).show();
			jq(this.$n('next')).show();
		}
		
	},
	
	updateCave_: function() {
		var nChildren = this.nChildren,
			scrollIndex = this._scrollIndex,
			viewportSize = this._viewportSize;
		
		jq(this.$n('cave')).width((this.nChildren + 1)  * (this._imageWidth + 1));
		if(scrollIndex > 0 && nChildren < scrollIndex + viewportSize){
			this.setScrollIndex(nChildren - viewportSize);
		}
	},
	
	updatePhotos_: function() {
		var imageWidth = this._imageWidth,
			focusedImageWidth = imageWidth - this._doubleBorderWidth,
			selectedIndex = this._selectedIndex,
			index = -1;
		
		for(var photo = this.firstChild; photo; photo = photo.nextSibling) {
			index++;
			if(index == selectedIndex) {
				this._resetImageSize((jq(photo).parent()), focusedImageWidth);
			} else
				this._resetImageSize(jq(photo).parent(), imageWidth);
		}
	},
	
	updateScroll_: function() {	
		jq(this.$n('content')).animate({scrollLeft: this._scrollIndex * this._imageWidth});
	},
	
	getZclass: function () {
		return this._zclass != null ? this._zclass: "z-imageslider";
	}
});
/**
 *
 * Base naming rule:
 * The stuff start with "_" means private , end with "_" means protect ,
 * others mean public.
 *
 * All the member field should be private.
 *
 * Life cycle: (It's very important to know when we bind the event)
 * A widget will do this by order :
 * 1. $init
 * 2. set attributes (setters)
 * 3. rendering mold (@see mold/imageslider.js )
 * 4. call bind_ to bind the event to dom .
 *
 * this.deskop will be assigned after super bind_ is called,
 * so we use it to determine whether we need to update view
 * manually in setter or not.
 * If this.desktop exist , means it's after mold rendering.
 *
 */
imageslider.ImageSlider = zk.$extends(zul.Widget, {
	_scrollIndex: 0,			// used to locate slide position. UNAVAILABLE when _viewportSize >= size of photos.
	_viewportSize: 3,			// default 3 for contains three visible photos.
	_selectedIndex:	-1,		// used to record which photo is being selected.
	_imageWidth: 200,			// default 200 for each photo element.
	
	_doubleBorderWidth: 4,
	_shouldResize: false,
	
	/**
	 * Don't use array/object as a member field, it's a restriction for ZK object,
	 * it will work like a static , share with all the same Widget class instance.
	 *
	 * if you really need this , assign it in bind_ method to prevent any trouble.
	 *
	 * TODO:check array or object , must be one of them ...I forgot. -_- by Tony
	 */
	
	$define: {
		/**
		 * The member in $define means that it has its own setter/getter.
		 * (It's a coding sugar.)
		 *
		 * If you don't get this ,
		 * you could see the comment below for another way to do this.
		 *
		 * It's more clear.
		 *
		 */
		scrollIndex: function() { //this function will be called after setScrollIndex() .
			if(this.desktop) {
				this.updateScroll_();
			}
		},

		viewportSize: function() { //this function will be called after setViewportSize() .
			
			if(this.desktop) {
				this.updateContent_();
				this.updateArrow_();
			}
		},
		
		imageWidth: function() { //this function will be called after setImageWidth() .
			
			if(this.desktop) {
				jq(this).height(this._imageWidth);
				this.updateContent_();
				this.updateCave_();
				this.updatePhotos_();
				this.updateScroll_();
			}
		}
	},
	/**
	 * If you don't like the way in $define ,
	 * you could do the setter/getter by yourself here.
	 *
	 * Like the example below, they are the same as we mentioned in $define section.
	 */
	getSelectedIndex: function() {return this._selectedIndex;},
	setSelectedIndex: function(val, target) {
		var prevIndex = this._selectedIndex,
			index = this._selectedIndex = val;
		
		if(this.desktop) {
			var scrollIndex = this._scrollIndex,
				viewportSize = this._viewportSize;
			
			if(index != -1){
				this.updateFocus_(prevIndex, this.getChildAt(index));
				/*
				 * calculate scrollIndex for this new selected index
				 */
				if(index < scrollIndex) {
					this.setScrollIndex(index);
				} else if(index > (scrollIndex + viewportSize - 1)) {
					this.setScrollIndex(index - viewportSize + 1);
				}
			}
			
			
		}
	},
	
	bind_: function () {
		/**
		 * For widget lifecycle , the super bind_ should be called
		 * as FIRST STATEMENT in the function.
		 * DONT'T forget to call supers in bind_ , or you will get error.
		 */
		this.$supers(imageslider.ImageSlider,'bind_', arguments);
	
		this.domListen_(this.$n("next"), "onClick", "_doNextClick")
			.domListen_(this.$n("previous"), "onClick", "_doPreviousClick");
		
		zWatch.listen({onResponse: this});
		//A example for domListen_ , REMEMBER to do domUnlisten in unbind_.
		//this.domListen_(this.$n("cave"), "onClick", "_doItemsClick");
	},
	/*
		A example for domListen_ listener.
	*/
	/*
	_doItemsClick: function (evt) {
		alert("item click event fired");
	},
	*/
	unbind_: function () {
	
		// A example for domUnlisten_ , should be paired with bind_
		// this.domUnlisten_(this.$n("cave"), "onClick", "_doItemsClick");
		
		/*
		* For widget lifecycle , the super unbind_ should be called
		* as LAST STATEMENT in the function.
		*/
		this.domUnlisten_(this.$n("next"), "onClick", "_doNextClick")
			.domUnlisten_(this.$n("previous"), "onClick", "_doPreviousClick");

		zWatch.unlisten({onResponse: this});
		this.$supers(imageslider.ImageSlider,'unbind_', arguments);
	},
	/*
		widget event, more detail 
		please refer to http://books.zkoss.org/wiki/ZK%20Client-side%20Reference/Notifications
	 */
	
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
		
		// call super's removeChildHTML_ to do whatever
		this.$supers(imageslider.ImageSlider,'removeChildHTML_', arguments);
		
		outer.remove();
		this._shouldResize = true;
	}, 
	
	doSelect_: function(evt) {
		var target = evt.target,
			index = -1,
			prevSelectedIndex = this._selectedIndex;
				
		if(target.$instanceof(zul.wgt.Image)) {
			
			// get index
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
	
	// target is optional
	updateFocus_: function(prevSelectedIndex, target) {
		var imageWidth = this._imageWidth,
			doubleBorderSize = this._doubleBorderWidth;
			
		// recover previous selected image size
		if(prevSelectedIndex != -1) {
			jq(this.getChildAt(prevSelectedIndex)).parent().removeClass('z-imageslider-focus').css({
				width: imageWidth,
				height: imageWidth
			});
		}
				
		// set css
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
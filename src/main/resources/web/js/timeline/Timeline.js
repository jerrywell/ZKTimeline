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
 * 3. rendering mold (@see mold/timeline.js )
 * 4. call bind_ to bind the event to dom .
 *
 * this.deskop will be assigned after super bind_ is called,
 * so we use it to determine whether we need to update view
 * manually in setter or not.
 * If this.desktop exist , means it's after mold rendering.
 *
 */

timeline.Timeline = zk.$extends(zul.Widget, {
	_timelineItems: [],
	_pivot: null,
	_period: (604800000/7) * 180,
	_minDateBound: new Date('2014/1/1').getTime(),
	_maxDateBound: new Date('2014/12/31').getTime(),
	_yearFormat: "yyyy",
	_monthFormat: "yyyy/MM",
	_dayFormat: "MM/dd",
	_hourFormat: "hh:mm",
	_minuteFormat: "hh:mm",
	_secondFormat: "hh:mm:ss",
	_millisecondFormat: "ss.SS",
	_selectedItem: null,
	
	_multiply:5,
	_realLeftBound: -1,
	_realRightBound: -1,
	_itemsIndexBegin: -1,
	_itemsIndexEnd: -1,
	_pxPerMs: -1,
	_addedItemQueue:[],
	_removedItemQueue: [],
	_slider: null,
	_processedLeftBound: Number.MAX_VALUE,
	_processedRightBound: Number.MIN_VALUE,
	_updateFlag: {},
	_$selectedItem: null,
	_contentHeight: null,
	_widthPerWord: 20,
	
	_dateSelState: 0,
	_dateSelStates: {
		nothing: 0,
		moveIn: 1,
		start: 2,
		stop: 3
	},
	_selX: 0,
	_selPrevX: 0,
	_selWidth: 0,
	_leftCursor: null,
	
	_year: 0,
	_month: 1,
	_day: 2,
	_hour: 3,
	_minute: 4,
	_second: 5,
	_millisecond: 6,
	_unit: [
		365 * 24 * 60 * 60 * 1000,
		30 * 24 * 60 * 60 * 1000,
		24 * 60 * 60 * 1000,
		60 * 60 * 1000,
		60 * 1000,
		1000,
		1
	],
	_steps: {
		rebuildFacet: "1",
		updateFacet: "2",
		rebuildItem: "3",
		updateItem: "4",
		refeshInside: "5",
		updateItem: "6",
		gotoTime: "7",
		updateGroupView: "8",
		updateItemAndFacet: "9",
		updateProperties: "10",
		updatePropertiesWithoutPivot: "11"
	},
	
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
		maxDateBound: function() {
			if(this.desktop) {
				var opts = {};
				opts[this._steps.updateProperties] = true;
				opts[this._steps.updateItemAndFacet] = true;
				jq.extend(this._updateFlag, opts);
			}
		},
		
		minDateBound: function() {
			if(this.desktop) {
				var updateFlag = this._updateFlag;
				updateFlag[this._steps.updateProperties] = true;
				updateFlag[this._steps.updateItemAndFacet] = true;
			}
		},
		
		timelineItems: null,
		
		pivot: function() {
			if(this.desktop) {
				var updateFlag = this._updateFlag;
				updateFlag[this._steps.updateProperties] = true;
				updateFlag[this._steps.gotoTime] = true;
				updateFlag[this._steps.updateItemAndFacet] = true;
			}
		},
		
		period: function() {
			if(this.desktop) {
				var updateFlag = this._updateFlag;
				updateFlag[this._steps.updateProperties] = true;
				updateFlag[this._steps.refeshInside] = true;
				updateFlag[this._steps.rebuildFacet] = true;
				updateFlag[this._steps.rebuildItem] = true;
				updateFlag[this._steps.gotoTime] = true;
				updateFlag[this._steps.updateItemAndFacet] = true;
			}
		},

		selectedItem: function() {
			this._selectItem(this._selectedItem);
		}
	},
	/**
	 * If you don't like the way in $define ,
	 * you could do the setter/getter by yourself here.
	 *
	 * Like the example below, they are the same as we mentioned in $define section.
	 */
	setAddedItem: function(val) {
		if(this.desktop) {
			var updateFlag = this._updateFlag;
			updateFlag[this._steps.updateItem] = true;
			this._addedItemQueue.push(val);
		}
	},
	setRemovedItem: function(val) {
		if(this.desktop) {
			var updateFlag = this._updateFlag;
			updateFlag[this._steps.updateItem] = true;
			this._removedItemQueue.push(val);
		}
	},
	/*
	getText:function(){ return this._text; },
	setText:function(val){
		this._text = val;
		if(this.desktop){
		//update the UI here.
		}
	},
	*/
	
	/*
	 * self method
	 */
	calculate: function() {
		var updateFlag = {};
		jq.extend(updateFlag, this._updateFlag);
		this._updateFlag = {};
		
		if(updateFlag[this._steps.updateItem])
			this.handleItemsUpdate();
		
		if(updateFlag[this._steps.updateProperties])
			this._refreshProperties(this._pivot);
		
		if(updateFlag[this._steps.updatePropertiesWithoutPivot])
			this._refreshProperties();
		
		if(updateFlag[this._steps.refeshInside])
			this.calculateInsideWidth();
		
		cb = jq.proxy(function() {
			if(updateFlag[this._steps.rebuildFacet] && updateFlag[this._steps.rebuildItem]) {
				this._processedLeftBound = this._realRightBound;
				this._processedRightBound = this._realLeftBound;
				this._updateItemAndFacet(true);
				if(this._selectedItem) this._selectItem(this._selectedItem);
			}
			
			if(updateFlag[this._steps.updateItemAndFacet]) {
				this._updateItemAndFacet();
			}
		}, this);
		
		if(updateFlag[this._steps.gotoTime])
			this.gotoTime(this._pivot, cb);
		else
			cb();
	},
	cleanFacet: function() {
		jq('.' + this.$s('facet')).remove();
	},
	cleanItem: function() {
		jq('.' + this.$s('content-cave') + ' > *').remove();
	},
	cleanItemPeriod: function() {
		jq('.' + this.$s('small-facet') + ' > *').remove();
	},
	buildFacet: function() {
		this._buildFacet(this._getFacetMainLevel(), this.$n('main-facet'));
	},
	calculateInsideWidth: function() {
		var period = this._maxDateBound - this._minDateBound,
			periodRatio = period / this._period,
			width = jq(this).width(),
			innerWidth = periodRatio < 1 ? width : Math.ceil(periodRatio * width);
		jq(this.$n('content-inside')).width(innerWidth);
	},
	renderItem: function() {
		var boundary = this._calculateRenderBoundary(),
			realLeftBound = boundary.leftBound,
			realRightBound = boundary.rightBound,
			items = this._timelineItems,
			out = [],
			periodOut = [];
			cave = this.$n('content-cave'),
			periodCave = this.$n('small-facet'),
			minDateBound = this._minDateBound,
			pxPerMs = this._pxPerMs;
			
		this._sortItems(items);
		
		// find indexBegin and indexEnd to render in boundary
		for(var i=0, length=items.length; i < length; i++) {
			if(items[i].startDate >= boundary.leftBound) {
				var item;
				while((item = items[i++]) && item.startDate <= boundary.rightBound) {
					var left = 'left:' + this._getPxDistance(minDateBound, item.startDate, pxPerMs) + 'px;';
					this._itemOut(out, item, left);
					this._itemPeriodOut(periodOut, item, left + ((item.stopDate) ? 
							'width:' + this._getPxDistance(item.startDate, item.stopDate, pxPerMs) + 'px;' : ''));
				}
				break;
			}
		}
		
		if(cave && out.length > 0)
			jq(cave).append(out.join(''));
		if(periodCave && periodOut.length > 0)
			jq(periodCave).append(periodOut.join(''));
		
		return out;
	},
	
	updateItemGroup: function(itemIds) {
		var groupIndexes = null,
			groupIndex = null,
			items = this._timelineItems;
		
		this._sortItems(items);
		groupIndexes = this._buildGroupIndexes(
				items, Math.floor(jq(this.$n('content-cave')).height() / jq('.' + this.$s('item')).eq(0).height()));
		if(groupIndexes.length > 0) groupIndex = groupIndexes.shift();
		
		while(groupIndex) {
			this._buildItemGroup(items, groupIndex.begin, groupIndex.end);
			groupIndex = groupIndexes.shift();
		}
	},
	
	handleItemsUpdate: function() {
		var addedQueue = this._addedItemQueue,
			removedQueue = this._removedItemQueue,
			items = this._timelineItems,
			processedLeftBound = this._processedLeftBound,
			processedRightBound = this._processedRightBound,
			i = 0,
			length = addedQueue.length,
			item,
			out = [],
			cacheMap = {},
			minDateBound = this._minDateBound,
			pxPerMs = this._pxPerMs;
		
		for(;i < length; i++) {
			item = addedQueue[i];
			if(item.startDate >= processedLeftBound && item.startDate <= processedRightBound)
				this._itemOut(out, item, 
					'left:' + this._getPxDistance(minDateBound, item.startDate, pxPerMs) + 'px');
			items.push(item);
		}
		
		for(i = 0, length = removedQueue.length; i < length; i++) {
			item = removedQueue[i];
			if(item.startDate >= processedLeftBound && item.startDate <= processedRightBound)
				jq('#' + this.uuid + '-item-' + item.objectId).remove();
			cacheMap[item.objectId] = true;
		}
		
		for(i = items.length - 1; i--;) {
			item = items[i];
			if(cacheMap[item.objectId])
				items.splice(i, 1);
		}
		
		if(out.length > 0)
			jq(this.$n('content-cave')).append(out.join(''));
		
		this._addedItemQueue = [];
		this._removedItemQueue = [];
	},
	
	gotoTime: function(time, cb) {
		var scrollLeft = this._getPxDistance(time - (this._period / 2), this._minDateBound, this._pxPerMs),
			width = jq(this.$n('content')).width(),
			insideWidth = jq(this.$n('content-inside')).width(),
			safeLeftBound = insideWidth - width,
			self = this;
		
		if(scrollLeft > safeLeftBound)
			scrollLeft = safeLeftBound; 
		
		jq(this.$n('content')).animate({
			scrollLeft: scrollLeft
		},{
			duration: zk(this).getAnimationSpeed(200),
			complete: cb
		});
	},
	
	updateItemPosition: function() {
		var boundary = this._calculateRenderBoundary(),
			realLeftBound = boundary.leftBound,
			realRightBound = boundary.rightBound,
			items = this._timelineItems,
			height = this._addItemMargin(jq('.' + this.$s('item')).eq(0).outerHeight()),
			$cave = jq(this.$n('content-cave')),
			caveHeight = $cave.height(), 
			bandSize = Math.floor(caveHeight / height),
			bands = [],
			best = Number.MAX_VALUE,
			groupIndexes,
			groupIndex,
			begin,
			end;
		
		this._sortItems(items);
		groupIndexes = this._buildGroupIndexes(
				items, Math.floor(jq(this.$n('content-cave')).height() / height));
		groupIndex = groupIndexes.shift();
		
		for(var i = 0; i < bandSize; i++)
			bands.push([]);
		
		for(var i = 0, length = items.length; i < length; i++) {
			var item = items[i],
				startDate = item.startDate;
			
			if(startDate >= realLeftBound && startDate < realRightBound) {
				if(groupIndex && i == (begin = groupIndex.begin)) {
					var count = 0,
						totalHeight = 0,
						doms = [],
						$sample = jq('#' + this.uuid + '-item-' + item.objectId), 
						left = $sample.css('left'),
						$up = jq('<div class="' + this.$s('item-up') + ' ' + this.$s('group-disabled')
								+ '" style="left:' + left + ';top:0px"></div>')
								.appendTo($cave),
						arrowHeight = $up.height(),
						$down,
						last;
					
					totalHeight += $up.height();
					
					for(end = groupIndex.end; begin < end; begin++) {
						var style = {'top': ((height * ++count) - arrowHeight) + 'px'};
						if(totalHeight + height > caveHeight) {
							style.display = 'none';
							if(!$down) {
								last = count - 1;
								$down = jq('<div class="' + this.$s('item-down') 
											+ '" style="left:' + left + ';top:' 
											+ ((height * count) - arrowHeight) + 'px"></div>')
							}
						}
						item = items[begin];
						doms.push(jq('#' + this.uuid + '-item-' + item.objectId).css(style));
						totalHeight += height;
					}
					
					$up.data({
						'doms': doms,
						'up': $up,
						'down': $down,
						'first': 0,
						'last': last
					}).bind('click', jq.proxy(this._onItemUp, this))
						.bind('mouseover', jq.proxy(this._onItemUpDownOver, this))
						.bind('mouseout', jq.proxy(this._onItemUpDownOut, this));
					$cave.append($down.data({
						'up': $up,
						'down': $down
					}).bind('click', jq.proxy(this._onItemDown, this))
						.bind('mouseover', jq.proxy(this._onItemUpDownOver, this))
						.bind('mouseout', jq.proxy(this._onItemUpDownOut, this)));
					
					groupIndex = groupIndexes.shift();
					i = end - 1;
				} else {
					
					for(var j = 0; j < bandSize; j++) {
						var band = bands[j],
							ele = band[band.length - 1],
							startDate = ele ? ele.startDate : Number.MIN_VALUE;
						if(startDate < best) {
							best = startDate;
							bestIdx = j;
						}
					}
					
					jq('#' + this.uuid + '-item-' + item.objectId).css('top', height * bestIdx + 'px');
					bands[bestIdx].push(item);
					best = Number.MAX_VALUE
				}
			}
		}
	},
	
	_buildItemGroup: function(sortedItems, beginIndex, endIndex) {
		var parent = jq('<div class="' + this.$s('group') + '"></div>');
		for(; beginIndex < endIndex; beginIndex++)
			jq('#' + this.uuid + '-item-' + sortdItems[beginIndex].objectId).detache().appendTo(parent);
		parent.appendTo(jq('.' + this.$n('content-cave')));
	},
	
	_buildGroupIndexes: function(sortedItems, bandSize) {
		var arr = [],
			i = 1,
			length = sortedItems.length,
			lastTime = sortedItems[0].startDate,
			count = 1;
		
		for(; i < length; i++) {
			var item = sortedItems[i],
				startDate = item.startDate;
			if(startDate == lastTime)
				count++;
			else {
				if(count > bandSize)
					arr.push({begin: i - count, end: i});
				count = 0;
			}
			lastTime = startDate;
		}
		
		return arr;
	},
	
	_sortItems: function(items) {
		items.sort(function(e1, e2) {
			var startDate1 = e1.startDate,
				startDate2 = e2.startDate;
			
			if(startDate1 == startDate2)
				return e1.objectId - e2.objectId;
			else
				return startDate1 - startDate2;
		});
	},
	
	_itemOut: function(out, item, style) {
		out.push('<div id="' + this.uuid + '-item-' + item.objectId + '" class="' + this.$s('item') + '"'); 
		if(style)
			out.push(' style="' + style + '"');
		out.push('>' + item.title + '</div>')
	},
	_itemPeriodOut: function(out, item, style) {
		out.push('<div id="' + this.uuid + '-item-period-' + item.objectId + '" class="' + this.$s('item-period') + '"'); 
		if(style)
			out.push(' style="' + style + '"');
		out.push('></div>')
	},
	_refreshProperties: function(pivot) {
		var pxPerMs = this._pxPerMs = jq(this).width() / this._period,
			minDateBound = this._minDateBound,
			maxDateBound = this._maxDateBound,
			halfPeriod = this._period / 2,
			center = pivot || (this.$n('content').scrollLeft/pxPerMs) + minDateBound,
			leftBound = center - halfPeriod,
			rightBound = center + halfPeriod,
			multiply = this._multiply,
			period = this._period,
			mLeftBound = leftBound - (period * (multiply - 1)),
			mRightBound = rightBound + (period * (multiply - 1)),
			facetHeight = jq(this.$n('main-facet')).height() 
				+ jq(this.$n('small-facet')).height() + jq(this.$n('large-facet')).height();
				
		jq(this.$n('content-cave')).height(jq(this).height() - facetHeight);
		this._realLeftBound = mLeftBound < minDateBound ? minDateBound : mLeftBound;
		this._realRightBound = mRightBound > maxDateBound ? maxDateBound : mRightBound;
	},
	
	_addItemMargin: function(height) {
		return height + 5;
	},
	
	_buildFacet: function(unitLevel, cave) {
		var unit = this._unit[unitLevel],
			pxPerMs = this._pxPerMs,
			pxPerUnit = pxPerMs * unit,
			minDateBound = this._minDateBound,

			boundary = this._calculateRenderBoundary(),
			leftBound = boundary.leftBound,
			rightBound = boundary.rightBound,
			
			facet = this._getNextFacet(leftBound, unitLevel, true),
			format = this._getFormat(unitLevel),
			calendar = new zk.fmt.Calendar(),
			formatLength = format.length * this._widthPerWord,
			prevLeft = 0,
			currentLength = 0,
			out = [];
						
		for (; facet < rightBound ; facet = this._getNextFacet(facet, unitLevel)) {
			var left = this._getPxDistance(minDateBound, facet, pxPerMs);
			currentLength += left - prevLeft;
			prevLeft = left;
			if(currentLength > formatLength) {
				out.push('<div class="' + this.$s('facet') + '" style="left:' 
						+ left + 'px">' + calendar.formatDate(new Date(facet), format));
				out.push('</div>');
				currentLength = 0;
			}
		}
		
		if(out.length > 0)
			jq(cave).append(out.join(''));
	},
	_getFacetMainLevel: function() {
		// from year to second
		var unit = this._unit,
			period = this._period,
			i = 0,
			length = unit.length - 1;
		
		for(; i < length; i++)
			if(period / (unit[i]*2) >= 1)
				return i;
		return this._millisecond;
	},
	_getNextFacet: function(startDate, unit, includeSelf) {
		var facetTime = new Date(startDate),
			facetTimeArr = [];
		switch(unit + 1) {
			case 1:
				facetTime.setMonth(0);
			case 2:
				facetTime.setDate(1);
			case 3: 
				facetTime.setHours(0);
			case 4: 
				facetTime.setMinutes(0);
			case 5: 
				facetTime.setSeconds(0);
			case 6: 
				facetTime.setMilliseconds(0);
		}
		if(includeSelf && facetTime.getTime() == startDate)
			return startDate;
	
		facetTimeArr = [facetTime.getFullYear(), facetTime.getMonth(), facetTime.getDate(),
			facetTime.getHours(), facetTime.getMinutes(), facetTime.getSeconds(), facetTime.getMilliseconds()];
		facetTimeArr[unit] = facetTimeArr[unit] + 1;
		return new Date(facetTimeArr[0], facetTimeArr[1], facetTimeArr[2], facetTimeArr[3], facetTimeArr[4], facetTimeArr[5], facetTimeArr[6]).getTime();
	},
	_getPxDistance: function(t1, t2, pxPerMs) {
		if(t1 instanceof Date) t1 = t1.getTime();
		if(t2 instanceof Date) t2 = t2.getTime();
		return Math.abs(t1 - t2) * pxPerMs;
	},
	_getFormat: function(unitLevel) {
		switch(unitLevel) {
			case this._year: return this._yearFormat;
			case this._month: return this._monthFormat;
			case this._day: return this._dayFormat;
			case this._hour: return this._hourFormat;
			case this._minute: return this._minuteFormat;
			case this._second: return this._secondFormat;
			case this._millisecond: return this._millisecondFormat;
		}
	},
	_getItemByObjectId: function(oid) {
		var items = this._timelineItems,
			length = items.length - 1,
			item;
		
		for(; item = items[length--];)
			if(item.objectId == oid)
				return item;
	},
	_selectItem: function(item, $item) {
		var $prev = this._$selectedItem,
			selectedClass = this.$s('selected'),
			oid = item.objectId;
		
		if(!$item) $item = jq('#' + this.uuid + '-item-' + oid);
		this._$selectedItem = $item;
		if($prev) {
			jq('#' + $prev.attr('id').replace('item', 'item-period')).removeClass(selectedClass);
			$prev.removeClass(selectedClass);
		}
		
		$item.addClass(selectedClass);
		jq('#' + this.uuid + '-item-period-' + oid).addClass(selectedClass);
	},
	_calculateRenderBoundary: function() {
		var realLeftBound = this._realLeftBound,
			realRightBound = this._realRightBound,
			processedLeftBound = this._processedLeftBound,
			processedRightBound = this._processedRightBound,
			leftBound = realLeftBound < processedLeftBound ? realLeftBound : processedRightBound,
			rightBound = realRightBound > processedRightBound ? realRightBound : processedLeftBound;
					
		return {
			leftBound: leftBound,
			rightBound: rightBound
		};
	},
	_updateItemAndFacet: function(cleanBeforeBuild) {
		if(cleanBeforeBuild) {
			this.cleanFacet();
			this.cleanItem();
			this.cleanItemPeriod();
		}
		this.renderItem();
		this.updateItemPosition();
		this.buildFacet();
		if(this._realLeftBound < this._processedLeftBound)
			this._processedLeftBound = this._realLeftBound;
		if(this._realRightBound > this._processedRightBound)
			this._processedRightBound = this._realRightBound;
	},
	
	bind_: function () {
		/**
		 * For widget lifecycle , the super bind_ should be called
		 * as FIRST STATEMENT in the function.
		 * DONT'T forget to call supers in bind_ , or you will get error.
		 */
		this.$supers(timeline.Timeline,'bind_', arguments);
		this.domListen_(this.$n("content"), "onScroll", "_onScrolling");
		this.domListen_(this.$n("main-facet"), "onMouseDown", "_onDateSelectStart");
		this.domListen_(this.$n("main-facet"), "onMouseUp", "_onDateSelectStop");
		this.domListen_(this.$n("main-facet"), "onMouseMove", "_onDateSelectMove");
		this.domListen_(this.$n("main-facet"), "onMouseLeave", "_onDateSelectOut");
		zWatch.listen({
			onSize: this, 
			onResponse: this
		});
		this._slider = new (this._timelineScroller(this, jq(this.$n()), jq(this.$n('content')))).init(); 
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
		this._slider.destroy();
		zWatch.unlisten({
			onSize: this, 
			onResponse: this
		});
		this.domUnlisten_(this.$n("main-facet"), "onMouseLeave", "_onDateSelectOut");
		this.domUnlisten_(this.$n("main-facet"), "onMouseMove", "_onDateSelectMove");
		this.domUnlisten_(this.$n("main-facet"), "onMouseUp", "_onDateSelectStop");
		this.domUnlisten_(this.$n("main-facet"), "onMouseDown", "_onDateSelectStart");
		this.domUnlisten_(this.$n("content"), "onScroll", "_onScrolling");
		this.$supers(timeline.Timeline,'unbind_', arguments);
	},
	/*
		widget event, more detail 
		please refer to http://books.zkoss.org/wiki/ZK%20Client-side%20Reference/Notifications
	 */
	_onScroll: function(evt) {
		var updateFlag = this._updateFlag;
		updateFlag[this._steps.updatePropertiesWithoutPivot] = true;
		updateFlag[this._steps.updateItemAndFacet] = true;
		this.calculate();
	},
	_onScrolling: function(evt) {
		//console.log('in scrolling...');
	},
	_onDateSelectMove: function(event) {
		var states = this._dateSelStates,
			state = this._dateSelState,
			pageX = event.pageX;
		if(state == states.nothing) {
			var offsetX = pageX - jq(event.target).offset().left + this.$n('content').scrollLeft;
			this._leftCursor = jq('<div class="' + this.$s('left-cursor') + '" style="left:' + 
					offsetX + 'px"></div>').appendTo(jq(this.$n('main-facet')))[0];
			this._dateSelState = states.moveIn;
			this._selX = offsetX;
			this._selPrevX = pageX;
		} else if (state == states.moveIn) {
			var val = this._selPrevX - pageX;
			this._leftCursor.style.left = (this._selX = (this._selX - val)) + 'px';
			this._selPrevX = pageX;
		} else if (state == states.start) {
			var val = this._selPrevX - pageX,
				width = this._selWidth - val;
			
			if(width < 0)
				this._leftCursor.style.left = (this._selX - val) + 'px';
			
			this._leftCursor.style.width = Math.abs(width) + 'px';
		}
	},
	_onDateSelectOut: function(event, removeAll) {
		var states = this._dateSelStates,
			state = this._dateSelState;
			
		if(removeAll || state != states.stop) {
			this._dateSelState = states.nothing;
			this._leftCursor.style.width = 0 + 'px';
			this._selX = this._selPrevX = this._selWidth = 0;
			jq(this._leftCursor).remove();
			this._leftCursor = null;
		}
	},
	_onDateSelectStart: function(event) {
		var states = this._dateSelStates,
			state = this._dateSelState;
		
		if(state == states.stop) {
			this._onDateSelectOut(event, true);
			this._onDateSelectMove(event);
			state = this._dateSelState;
		}
		
		if(state == states.moveIn) {
			this._dateSelState = states.start;
			this._leftCursor.style.width = this._selWidth + 'px';
		}
			
		
		event.domEvent.preventDefault();
		event.domEvent.stopPropagation();
		return false;
	},
	_onDateSelectStop: function(event) {
		var states = this._dateSelStates,
			state = this._dateSelState;
		
		if(state == states.start) {
			this._dateSelState = states.stop;
			
			var startTime = Math.round(zk.parseInt(this._leftCursor.style.left) / this._pxPerMs),
				stopTime = Math.round(zk.parseInt(this._leftCursor.style.width) / this._pxPerMs) + startTime;
			
			this.fire('onPeriodSelect', {startTime: startTime, stopTime: stopTime});
		}
		
		event.domEvent.preventDefault();
		event.domEvent.stopPropagation();
		return false;
	},
	_onItemUpDownOver: function(event) {
		var $up = jq(event.target).data('up'),
			$down = $up.data('down'),
			doms = $up.data('doms'),
			$dom,
			className = this.$s('group-hover');
		
		$up.addClass(className);
		$down.addClass(className);
		for(var i = 0; $dom = doms[i++];)
			$dom.addClass(className);
	},
	_onItemUpDownOut: function(event) {
		var $up = jq(event.target).data('up'),
			$down = $up.data('down'),
			doms = $up.data('doms'),
			$dom,
			className = this.$s('group-hover');
		
		$up.removeClass(className);
		$down.removeClass(className);
		for(var i = 0; $dom = doms[i++];)
			$dom.removeClass(className);
	},
	_onItemDown: function(event) {
		var $down = jq(event.target),
			$up = $down.data('up'),
			first = $up.data('first'),
			last = $up.data('last'),
			doms = $up.data('doms'),
			length = doms.length;
		
		if(last == length)
			return;

		var height = this._addItemMargin(doms[0].outerHeight());
		first++; last++;
		for(var i = 0; i < length; i++) {
			var $dom = doms[i];
			$dom.css('top', jq.px(zk.parseInt($dom.css('top')) - height));
			if(i == first - 1)
				$dom.hide();
			else if(i == last - 1)
				$dom.show();
		}
		
		if(last == length) 
			$down.addClass(this.$s('group-disabled'));
		if(first > 0)
			$up.removeClass(this.$s('group-disabled'));
		
		$up.data({
			'first': first,
			'last': last
		});
	},
	_onItemUp: function(event) {
		var $up = jq(event.target),
			$down = $up.data('down'),
			first = $up.data('first'),
			last = $up.data('last'),
			doms = $up.data('doms'),
			length = doms.length;
		
		if(first == 0)
			return;
	
		var height = this._addItemMargin(doms[0].outerHeight());
		first--; last--;
		for(var i = 0; i < length; i++) {
			var $dom = doms[i];
			$dom.css('top', jq.px(zk.parseInt($dom.css('top')) + height));
			if(i == first)
				$dom.show();
			else if(i == last)
				$dom.hide();
		}
		
		if(last < length) 
			$down.removeClass(this.$s('group-disabled'));
		if(first == 0)
			$up.addClass(this.$s('group-disabled'));
		
		$up.data({
			'first': first,
			'last': last
		});
	},
	onResponse: function () {
		this.calculate();
	},
	onSize: function() {
		this.$supers('onSize', arguments);
		
//		var updateFlag = this._updateFlag;
//		updateFlag[this._steps.updateProperties] = true;
//		updateFlag[this._steps.gotoTime] = true;
//		updateFlag[this._steps.updateItemAndFacet] = true;
		var updateFlag = this._updateFlag;
		updateFlag[this._steps.updateProperties] = true;
		updateFlag[this._steps.refeshInside] = true;
		updateFlag[this._steps.rebuildFacet] = true;
		updateFlag[this._steps.rebuildItem] = true;
		updateFlag[this._steps.gotoTime] = true;
		updateFlag[this._steps.updateItemAndFacet] = true;
		this.calculate();
	},
	doClick_: function (evt) {
		var $target = jq(evt.domTarget);
		
		if($target.hasClass(this.$s('item'))) {
			var oid = zk.parseInt($target.attr('id').split('-')[2]),
				items = this._timelineItems,
				item = this._selectedItem = this._getItemByObjectId(oid);
			
			this.fire('onItemSelect', {objectId: oid});
			this._selectItem(item, $target);
			this.gotoTime(this._pivot = item.startDate);
		}
		this.$super('doClick_', evt, true);//the super doClick_ should be called
	},
	
	_timelineScroller: function TimelineScroller(wgt, $dragPane, $target) {
		var dragging = false,
			pageX = 0,
			targetX = 0, 
			minDistance = 40,
			friction = 1,
			target = $target.get(0),
			$content = jq(wgt.$n('content')),
			$insideContent = jq(wgt.$n('content-inside')),
			beginEvent,
			startTracking = function(event) {
				var pageX1 = event.pageX,
					scrollLeft = target.scrollLeft + pageX - pageX1;
				
				pageX = pageX1;
				
				if(scrollLeft < 0 || scrollLeft + $content.width() > $insideContent.width())
					return;
				
				target.scrollLeft = scrollLeft;
			},
			stopTracking = function(event) {
				if(dragging) {
					event.preventDefault();
					event.stopPropagation();
					$dragPane.unbind('mousemove');
					dragging = false;
					doMomentum(beginEvent, event);
					beginEvent = null;
					return false;
				}
				return true;
			},
			doMomentum = function(event1, event2) {
				if(!(event1 && event2)) return;
				var x1 = event1.pageX,
					t1 = event1.timeStamp,
					x2 = event2.pageX,
					t2 = event2.timeStamp,

					// Deltas
					dX = x2 - x1,
					dMs = Math.max(t2 - t1, 1),

					// Speeds
					speedX = -Math.max(Math.min(dX/dMs, 1), -1),

					// Distance moved (Euclidean distance)
					distance = Math.pow(x1-x2, 2);
				if (distance > minDistance) {
					// Momentum
					var lastStepTime = new Date(),
						limitStep = 100,
						lastLeft = -1,
						currentStep = limitStep,
						interval = setInterval(function(){
							if(currentStep -- == 0) {
								clearInterval(interval);
								wgt._onScroll.apply(wgt, event2);
								return;
							}
							speedX *= (currentStep / 100);

							var now = new Date(),
								stepDuration = now.getTime() - lastStepTime.getTime(),
								newLeft = (target.scrollLeft + (speedX * stepDuration / friction));

							lastStepTime = now;
							if(newLeft < 0) 
								newLeft = 0;
							else if(newLeft + $content.width() > $insideContent.width()) {
								newLeft = $insideContent.width() - $content.width();
							}
							
							if(lastLeft != newLeft)
								target.scrollLeft = lastLeft = newLeft
						}, Math.abs(speedX) * 2000 / 100);
				}
			};

		return {
			init: function() {
				$dragPane.bind('mousedown', function(event) {
					if(!dragging) {
						beginEvent = event;
						dragging = true;
						pageX = event.pageX;
						targetX = $target.offset().left;
						$dragPane.bind('mousemove', startTracking);
						event.preventDefault();
						event.stopPropagation();
						return false;
					}
				}).bind('mouseup', stopTracking).bind('mouseleave', function(event) {
					event.preventDefault();
					if(dragging)
						stopTracking(event);
				});
				return this;
			},
			destroy: function() {
				$dragPane.unbind('mousedown mouseup mouseleave');
				return this;
			}
		};
	}
});
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
	_timelineEvents: [],
	_pivot: null,
	_period: (604800000/7) * 365,
	_minDateBound: new Date('2014/1/1').getTime(),
	_maxDateBound: new Date('2014/12/31').getTime(),
	
	_multiply: 2,
	_dirtyLevel: 4,
	_realLeftBound: -1,
	_realRightBound: -1,
	_eventsIndexBegin: -1,
	_eventsIndexEnd: -1,
	_pxPerMs: -1,
	_timelineEventQueue:[],
	
	_yearFormat: "yyyy",
	_monthFormat: "MM",
	_dayFormat: "dd",
	_hourFormat: "hh",
	_minuteFormat: "mm",
	_secondFormat: "ss",
	_millisecondFormat: "SS",
	
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
				this._dirtyLevel = 1;
			}
		},
		
		minDateBound: function() {
			if(this.desktop) {
				this._dirtyLevel = 1;
			}
		},
		
		timelineEvents: function() {
			if(this.desktop) {
				//updated UI here.
			}
		},
		
		pivot: function() {
			if(this.desktop) {
				//updated UI here.
			}
		},
		
		period: function() {
			if(this.desktop) {
				this._dirtyLevel = 4;
			}
		}
		
	},
	/**
	 * If you don't like the way in $define ,
	 * you could do the setter/getter by yourself here.
	 *
	 * Like the example below, they are the same as we mentioned in $define section.
	 */
	setTimelineEvent: function(val) {
		this._timelineEventQueue.push(val);
		this._dirtyLevel = 2;
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
		var level = this._dirtyLevel;
		
		if(!this._dirtyLevel)
			return;
		
		this._refreshProperties();
		
		switch(level) {
			case 4: 
				this.cleanFacet();
				this.buildFacet();
				this.calculateInsideWidth();
			case 3:
				this.cleanEvent();
				this.renderEvent(null, this.$n('content-cave'));
			case 2:
				this.handleEventsUpdate();
			case 1:
				break;
		}
		
		this._dirtyLevel = 0;
	},
	cleanFacet: function() {
		jq('.' + this.$s('facet')).remove();
	},
	cleanEvent: function() {
		jq('.' + this.$s('event')).remove();
	},
	buildFacet: function() {
		var mainUnitLevel = this._getFacetMainLevel(),
			largeUnitLevel = mainUnitLevel - 1;
		
		this._buildFacet(mainUnitLevel, this.$n('main-facet'));
		if(largeUnitLevel >= this._year)
			this._buildFacet(largeUnitLevel, this.$n('large-facet'));
	},
	calculateInsideWidth: function() {
		var period = this._maxDateBound - this._minDateBound,
			periodRatio = period / this._period,
			width = jq(this).width(),
			innerWidth = periodRatio < 1 ? width : Math.ceil(periodRatio * width);
		jq(this.$n('content-inside')).width(innerWidth);
	},
	renderEvent: function(out, cave) {
		var indexBegin,
			indexEnd,
			lastIndexBegin = this._eventsIndexBegin,
			lastIndexEnd = this._eventsIndexEnd,
			realLeftBound = this._realLeftBound,
			realRightBound = this._realRightBound,
			events = this._timelineEvents;
		
		out = out || [];
		
		// find indexBegin and indexEnd to render in boundary
		events.sort(function(e1, e2) {
			var startDate1 = e1.startDate,
				startDate2 = e2.startDate;
			
			if(startDate1 == startDate2)
				return e1.objectId - e2.objectId;
			else
				return startDate1 - startDate2;
		});
		for(var i=0, length=events.length; i < length; i++) {
			var event = events[i],
				startDate = event.startDate;
			if(startDate >= realLeftBound) {
				indexBegin = i;
				for(; i < length && startDate < realRightBound; i++) {
					var event = events[i];
						startDate = event.startDate;
					this._eventOut(out, event);
				}
				indexEnd = i - 1;
			}
				
		}
		
		if(cave)
			jq(cave).append(out.join(''));
		
		return out;
	},
	handleEventsUpdate: function() {
		var queue = this._timelineEventQueue,
			events = this._timelineEvents,
			realLeftBound = this._realLeftBound,
			realRightBound = this._realRightBound,
			i = 0,
			length = queue.length,
			event,
			out = [];
		
		for(;i < length; i++) {
			event = queue[i];
			if(event.startDate >= realLeftBound && event.stopDate <= realRightBound)
				this._eventOut(out, event);
			events.push(event);
		}
		
		if(out.length > 0)
			jq(this.$n('content-cave')).append(out.join(''));
		
		this._timelineEventQueue = [];
	},
	_eventOut: function(out, event) {
//		console.log(this._pxPerMs, new Date(event.startDate), new Date(this._minDateBound));
		var left = this._getPxDistance(this._minDateBound, event.startDate, this._pxPerMs);
		out.push('<div id="' + this.uuid + '-event-' + event.objectId 
				+ '" class="' + this.$s('event') + '" style="left:');
		out.push(left + 'px">' + event.title + '</div>')
	},
	_refreshProperties: function() {
		var minDateBound = this._minDateBound,
			maxDateBound = this._maxDateBound,
			halfPeriod = this._period / 2,
			pivot = this._pivot.getTime(),
			leftBound = pivot - halfPeriod,
			rightBound = pivot + halfPeriod,
			multiply = this._multiply,
			period = this._period,
			mLeftBound = leftBound - (period * (multiply - 1)),
			mRightBound = rightBound + (period * (multiply - 1));
		
		this._realLeftBound = mLeftBound < minDateBound ? minDateBound : mLeftBound;
		this._realRightBound = mRightBound > maxDateBound ? maxDateBound : mRightBound;
		this._pxPerMs = jq(this).width() / this._period;
	},
	
	_buildFacet: function(unitLevel, cave) {
		var unit = this._unit[unitLevel],
			pxPerMs = this._pxPerMs,
			pxPerUnit = pxPerMs * unit,
			realLeftBound = this._realLeftBound,
			realRightBound = this._realRightBound,
			minDateBound = this._minDateBound,

			facet = this._getNextFacet(realLeftBound, unitLevel, true),
			
			format = this._getFormat(unitLevel),
			calendar = new zk.fmt.Calendar(),
			out = [];
		
		for (; facet < realRightBound ; facet = this._getNextFacet(facet, unitLevel)) {
			var left = this._getPxDistance(minDateBound, facet, pxPerMs);
			out.push('<div class="' + this.$s('facet') + '" style="left:' 
					+ left + 'px">' + calendar.formatDate(new Date(facet), format));
//			console.log(calendar.formatDate(new Date(facet), format));
			out.push('</div>');
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
	_getNextFacet: function(startTime, unit, includeSelf) {
		var facetTime = new Date(startTime),
			facetTimeArr = [];
		
		switch(unit + 1) {
			case 1:
				facetTime.setMonth(1);
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
		
		if(includeSelf && facetTime.getTime() == startTime)
			return startTime;
	
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
	
	bind_: function () {
		/**
		 * For widget lifecycle , the super bind_ should be called
		 * as FIRST STATEMENT in the function.
		 * DONT'T forget to call supers in bind_ , or you will get error.
		 */
		this.$supers(timeline.Timeline,'bind_', arguments);
		zWatch.listen({
			onSize: this, 
			onResponse: this
		});
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
		zWatch.unlisten({
			onSize: this, 
			onResponse: this
		});
		this.$supers(timeline.Timeline,'unbind_', arguments);
	},
	/*
		widget event, more detail 
		please refer to http://books.zkoss.org/wiki/ZK%20Client-side%20Reference/Notifications
	 */
	onResponse: function () {
//		console.log('in response...');
		if(this._dirtyLevel) {
			this.calculate();
		}
	},
	onSize: function() {
//		this.$supers('onSize', arguments);
		console.log('in onSize...');
		this.calculate();
	},
	doClick_: function (evt) {
		this.$super('doClick_', evt, true);//the super doClick_ should be called
		this.fire('onFoo', {foo: 'myData'});
	},
	
	getZclass: function () {
		return this._zclass != null ? this._zclass: "z-timeline";
	}
});
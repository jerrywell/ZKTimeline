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
	_period: (604800000/7) * 1,
	_minDateBound: new Date('2010/1/1'),
	_maxDateBound: new Date('2020/12/31'),
	
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
	
	$init: function() {
		this.$supers('$init', arguments);
		console.log('test in init...');
		this.listen({
			onAfterSize: this
		});
	},
	
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
			console.log('test');
			if(this.desktop) {
				//updated UI here.
			}
		},
		
		minDateBound: function() {
			console.log('test');
			if(this.desktop) {
				//updated UI here.
			}
		},
		
		timelineEvents: function() {
			console.log('test');
			if(this.desktop) {
				//updated UI here.
			}
		},
		
		timelineEvent: function() {
			if(this.desktop) {
				//updated UI here.
			}
		},
		
		pivot: function() {
			console.log('test');
			if(this.desktop) {
				//updated UI here.
			}
		},
		
		
	},
	/**
	 * If you don't like the way in $define ,
	 * you could do the setter/getter by yourself here.
	 *
	 * Like the example below, they are the same as we mentioned in $define section.
	 */
	setTimelineEvent: function(val) {
		_timelineEvents.push(val);
		addTimelineEvent(val);
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
	_recalculate: function() {
		this._calculateInsideWidth();
		this._buildMainFacet();
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
		var mod = startTime % unit, 
			unitTime = Math.floor(startTime / unit) * unit;

		if(includeSelf && mod == 0)
			return unitTime;
		return unitTime + unit;
	},
	_getPxDistance: function(t1, t2) {
		
	},
	_buildMainFacet: function() {
		var unitIndex = this._getFacetMainLevel(),
			unit = this._unit[unitIndex],
			pxPerMs = jq(this).width() / this._period,
			pxPerUnit = pxPerMs * unit,
			getNextFacet = this._getNextFacet,
			facet = getNextFacet(this._maxDateBound.getTime(), unit, true);
		
		console.log(this._maxDateBound.getTime(), facet, getNextFacet(facet, unit));
	},
	_calculateInsideWidth: function() {
		var period = this._maxDateBound.getTime() - this._minDateBound.getTime(),
			periodRatio = period / this._period,
			width = jq(this).width(),
			innerWidth = periodRatio < 1 ? width : Math.ceil(periodRatio * width);
		jq(this.$n('content-inside')).width(innerWidth);
	},
	
	
	
	bind_: function () {
		/**
		 * For widget lifecycle , the super bind_ should be called
		 * as FIRST STATEMENT in the function.
		 * DONT'T forget to call supers in bind_ , or you will get error.
		 */
		this.$supers(timeline.Timeline,'bind_', arguments);
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
		this.$supers(timeline.Timeline,'unbind_', arguments);
	},
	/*
		widget event, more detail 
		please refer to http://books.zkoss.org/wiki/ZK%20Client-side%20Reference/Notifications
	 */
	onSize: function(evt) {
		this.$supers('onSize', arguments);
		this._recalculate();
	},
	doClick_: function (evt) {
		this.$super('doClick_', evt, true);//the super doClick_ should be called
		this.fire('onFoo', {foo: 'myData'});
	},
	
	getZclass: function () {
		return this._zclass != null ? this._zclass: "z-timeline";
	}
});
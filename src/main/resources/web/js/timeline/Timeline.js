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

function TimelineSlide(wgt, $dragPane, $target) {
	if(!$target) $target = $dragPane;
	var dragging = false,
		PageX = 0,
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
			$dragPane.unbind('mousemove');
			dragging = false;
			doMomentum(beginEvent, event);
			beginEvent = null;
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

						//console.log(newLeft, target.scrollLeft, speedX, currentStep);

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
					a = event;
					$dragPane.bind('mousemove', startTracking);
				}
				event.preventDefault();
				
			}).bind('mouseup', stopTracking).bind('mouseleave', function(event) {
				if(dragging)
					stopTracking(event);
			});
			return this;
		},
		destroy: function() {
			$dragPane.unbind('mousedown mouseup');
			return this;
		}
	};
}

timeline.Timeline = zk.$extends(zul.Widget, {
	_timelineEvents: [],
	_pivot: null,
	_period: (604800000/7) * 365,
	_minDateBound: new Date('2014/1/1').getTime(),
	_maxDateBound: new Date('2014/12/31').getTime(),
	_yearFormat: "yyyy",
	_monthFormat: "MM",
	_dayFormat: "dd",
	_hourFormat: "hh",
	_minuteFormat: "mm",
	_secondFormat: "ss",
	_millisecondFormat: "SS",
	
	_multiply: 2,
	_dirtyLevel: 4,
	_realLeftBound: -1,
	_realRightBound: -1,
	_eventsIndexBegin: -1,
	_eventsIndexEnd: -1,
	_pxPerMs: -1,
	_timelineEventQueue:[],
	_slider: null,
	_processedLeftBound: Number.MAX_VALUE,
	_processedRightBound: Number.MIN_VALUE,
	
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
				this._processedLeftBound = Number.MAX_VALUE;
				this._processedRightBound = Number.MIN_VALUE;
				this.cleanFacet();
				this.buildFacet();
				this.calculateInsideWidth();
			case 3:
				this.cleanEvent();
				this.renderEvent(null, this.$n('content-cave'));
			case 2:
				this.handleEventsUpdate();
			case 1:
				//this.gotoTime(this._pivot);
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
			largeUnitLevel = mainUnitLevel - 1,
			processedLeftBound = this._processedLeftBound,
			processedRightBound = this._processedRightBound;
		
		this._buildFacet(mainUnitLevel, this.$n('main-facet'));
		if(largeUnitLevel >= this._year)
			this._buildFacet(largeUnitLevel, this.$n('large-facet'));
		
		if(this._realLeftBound < this._processedLeftBound)
			this._processedLeftBound = this._realLeftBound;
		else if(this._realRightBound > this._processedRightBound)
			this._processedRightBound = this._realRightBound;
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
	refreshEventAndFacet: function() {
		var mainUnitLevel = this._getFacetMainLevel(),
			largeUnitLevel = mainUnitLevel - 1,
			processedLeftBound = this._processedLeftBound,
			processedRightBound = this._processedRightBound;
		
		// render event
		this.renderEvent(null, this.$n('content-cave'));
		
		// build facet
		this._buildFacet(mainUnitLevel, this.$n('main-facet'));
		if(largeUnitLevel >= this._year)
			this._buildFacet(largeUnitLevel, this.$n('large-facet'));
		
		// located processed area
		if(this._realLeftBound < this._processedLeftBound)
			this._processedLeftBound = this._realLeftBound;
		else if(this._realRightBound > this._processedRightBound)
			this._processedRightBound = this._realRightBound;
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
	
	gotoTime: function(time) {
		var scrollLeft = this._getPxDistance(time - (this._period / 2), this._minDateBound, this._pxPerMs),
			width = jq(this.$n('content')).width(),
			insideWidth = jq(this.$n('content-inside')).width(),
			safeLeftBound = insideWidth - width,
			self = this;
		
		if(scrollLeft > safeLeftBound)
			scrollLeft = safeLeftBound; 
		
		this._dirtyLevel = 1;
		
		jq(this.$n('content')).animate({
			scrollLeft: scrollLeft
		},{
			duration: zk(this).getAnimationSpeed(500),
			complete: function() {
				self.refreshEventAndFacet.apply(self);
			}
		});
	},
	_eventOut: function(out, event) {
		var left = this._getPxDistance(this._minDateBound, event.startDate, this._pxPerMs);
		out.push('<div id="' + this.uuid + '-event-' + event.objectId 
				+ '" class="' + this.$s('event') + '" style="left:');
		out.push(left + 'px">' + event.title + '</div>')
	},
	_refreshProperties: function() {
		var pxPerMs = this._pxPerMs = jq(this).width() / this._period,
			minDateBound = this._minDateBound,
			maxDateBound = this._maxDateBound,
			halfPeriod = this._period / 2,
//			pivot = this._pivot.getTime(),
			pivot = (this.$n('content').scrollLeft),
			leftBound = pivot - halfPeriod,
			rightBound = pivot + halfPeriod,
			multiply = this._multiply,
			period = this._period,
			mLeftBound = leftBound - (period * (multiply - 1)),
			mRightBound = rightBound + (period * (multiply - 1));
		
		//console.log(leftBound, mLeftBound, minDateBound, this._realLeftBound);
		//console.log(new Date(leftBound), new Date(mLeftBound), new Date(minDateBound), new Date(this._realLeftBound));
		this._realLeftBound = mLeftBound < minDateBound ? minDateBound : mLeftBound;
		this._realRightBound = mRightBound > maxDateBound ? maxDateBound : mRightBound;
	},
	
	_buildFacet: function(unitLevel, cave) {
		var unit = this._unit[unitLevel],
			pxPerMs = this._pxPerMs,
			pxPerUnit = pxPerMs * unit,
			minDateBound = this._minDateBound,

			realLeftBound = this._realLeftBound,
			realRightBound = this._realRightBound,
			processedLeftBound = this._processedLeftBound,
			processedRightBound = this._processedRightBound,
			leftBound = realLeftBound < processedLeftBound ? realLeftBound : processedRightBound,
			rightBound = realRightBound > processedRightBound ? realRightBound : processedLeftBound,
			
			facet = this._getNextFacet(leftBound, unitLevel, true),
			format = this._getFormat(unitLevel),
			calendar = new zk.fmt.Calendar(),
			out = [];
			
		//console.log('facet:', new Date(facet));
		
		for (; facet < rightBound ; facet = this._getNextFacet(facet, unitLevel)) {
			//console.log('facet:', new Date(facet));
			var left = this._getPxDistance(minDateBound, facet, pxPerMs);
			out.push('<div class="' + this.$s('facet') + '" style="left:' 
					+ left + 'px">' + calendar.formatDate(new Date(facet), format));
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
		this.domListen_(this.$n("content"), "onScroll", "_onScrolling");
		zWatch.listen({
			onSize: this, 
			onResponse: this
		});
		this._slider = new TimelineSlide(this, jq(this.$n()), jq(this.$n('content'))).init(); 
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
		this.domUnlisten_(this.$n("content"), "onScroll", "_onScrolling");
		this.$supers(timeline.Timeline,'unbind_', arguments);
	},
	/*
		widget event, more detail 
		please refer to http://books.zkoss.org/wiki/ZK%20Client-side%20Reference/Notifications
	 */
	_onScroll: function(evt) {
		//console.log('in scroll...');
		this._dirtyLevel = 4;
		this.calculate();
		this.fire('onFoo', {foo: 'myData'});
	},
	_onScrolling: function(evt) {
		//console.log('in scrolling...');
	},
	onResponse: function () {
		if(this._dirtyLevel) {
			this.calculate();
		}
	},
	onSize: function() {
//		this.$supers('onSize', arguments);
		//console.log('in onSize...');
		this.calculate();
	},
	doClick_: function (evt) {
		//console.dir(evt);
		//if(jq(evt.domTarget).hasClass(this.$s('event')))
			//console.log('click event');
		//else
			//console.log('timeline click');
//		this.$super('doClick_', evt, true);//the super doClick_ should be called
//		this.fire('onFoo', {foo: 'myData'});
	}
});
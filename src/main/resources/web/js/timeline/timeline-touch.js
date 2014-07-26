
/* timeline-touch.js

	Purpose:
		
	Description:
		
	History:
		Tue, Jul 26, 2014 10:25:27 AM, Created by jerrychen

Copyright (C) 2012 Potix Corporation. All Rights Reserved.
*/
(function () {
	var _xTimeline = {};
	zk.override(timeline.Timeline.prototype, _xTimeline, {
		_timelineScroller: function TimelineScroller(wgt, $dragPane, $target) {
			var dragging = false,
				pageX = 0,
				targetX = 0, 
				minDistance = 40,
				friction = 1,
				target = $target.get(0),
				$content = jq(wgt.$n('content')),
				$insideContent = jq(wgt.$n('content-inside')),
				beginX,
				beginTimeStamp,
				beginEvent,
				startTracking = function(event) {
					if(dragging) {
						var pageX1 = event.originalEvent.touches[0].pageX,
							scrollLeft = target.scrollLeft + pageX - pageX1;
		
						pageX = pageX1;
						
						if(scrollLeft < 0 || scrollLeft + $content.width() > $insideContent.width())
							return;
						
						target.scrollLeft = scrollLeft;
						event.preventDefault();
						event.stopPropagation();
					}
				},
				stopTracking = function(event) {
					if(dragging) {
						$dragPane.unbind('touchmove');
						dragging = false;
						doMomentum(beginEvent, event);
						beginEvent = null;
					}
				},
				doMomentum = function(event1, event2) {
					
					var x1 = beginX,
						t1 = beginTimeStamp,
						x2 = pageX,
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
					$dragPane.bind('touchstart', function(event) {
						wgt.fire('onTest', {test: 'test'});
						if(!dragging) {
							dragging = true;
							beginX = pageX = event.originalEvent.touches[0].pageX;
							beginTimeStamp = event.timeStamp;
							targetX = $target.offset().left;
							$dragPane.bind('touchmove', startTracking);
							//event.preventDefault();
						}
						event.stopPropagation();
					}).bind('touchend', stopTracking).bind('touchcancel', function(event) {
//						wgt.fire('onItemSelect', {objectId: 11111});
						if(dragging) 
							stopTracking(event);
					});
					return this;
				},
				destroy: function() {
					$dragPane.unbind('touchstart touchend touchcancel');
					return this;
				}
			};
		}
	});
})();
package org.zkoss.zk.timeline;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.zkoss.lang.Objects;
import org.zkoss.zk.au.AuRequest;
import org.zkoss.zk.ui.event.Event;
import org.zkoss.zk.ui.event.Events;
import org.zkoss.zul.impl.XulElement;

public class Timeline extends XulElement {

	static {
		//addClientEvent(Timeline.class, "onFoo", 0);
	}
	
	/*
	 * about timeline navigation
	 */
	private Date _maxDateBound;
	private Date _minDateBound;
	// pivot is always in the middle of navigation
	private Date _pivot = new Date();
	// 7 * 24 * 60 * 60 * 1000, 7 days in unit millisecond
	private long _period = 604800000L;
	private List<TimelineEvent> _timelineEvents;
	private List<String> _facets;
	private TimeUnit unit = TimeUnit.DAY;
	private String _format;
	
	public Timeline(){
		SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy/MM/dd");
		try {
			_minDateBound = dateFormat.parse("2010/1/1");
			_maxDateBound = dateFormat.parse("2020/12/31");
		} catch (ParseException e) {
			e.printStackTrace();
		}
		_timelineEvents = new ArrayList<TimelineEvent>();
		setWidth("1000px");
		setHeight("200px");
	}
	
	/*
	 * getter and setter
	 */
	
	public void setTimelineEvents(List<TimelineEvent> timelineEvents) {
		if(!Objects.equals(_timelineEvents, timelineEvents)){	
			this._timelineEvents = timelineEvents;
			smartUpdate("timelineEvents", _timelineEvents);
		}
	}
	
	public List<TimelineEvent> getTimelineEvents() {
		return _timelineEvents;
	}
	
	public Date getMaxDateBound() {
		return _maxDateBound;
	}

	public void setMaxDateBound(Date maxDateBound) {
		if(!Objects.equals(_maxDateBound, maxDateBound)){	
			this._maxDateBound = maxDateBound;
			smartUpdate("maxDateBound", _maxDateBound);
		}
	}

	public Date getMinDateBound() {
		return _minDateBound;
	}

	public void setMinDateBound(Date minDateBound) {
		if(!Objects.equals(_minDateBound, minDateBound)){	
			this._minDateBound = minDateBound;
			smartUpdate("minDateBound", _minDateBound);
		}
	}

	public Date getPivot() {
		return _pivot;
	}

	public void setPivot(Date pivot) {
		if(!Objects.equals(_pivot, pivot)){	
			this._pivot = pivot;
			smartUpdate("pivot", _pivot);
		}
	}

	public long getPeriod() {
		return _period;
	}

	public void setPeriod(long period) {
		if(!Objects.equals(_period, period)){	
			this._period = period;
			smartUpdate("period", _period);
		}
	}
	
	public String getFormat() {
		return _format;
	}

	public void setFormat(String format) {
		if(!Objects.equals(_format, format)){	
			this._format = format;
			smartUpdate("format", _format);
		}
	}

	/*
	 * self method
	 */
	
	public void addTimelineEvent(TimelineEvent event) {
		_timelineEvents.add(event);
		smartUpdate("timelineEvent", event);
	}
	
	/*
	 * component method
	 */
	
	protected void renderProperties(org.zkoss.zk.ui.sys.ContentRenderer renderer)
	throws java.io.IOException {
		super.renderProperties(renderer);

		render(renderer, "maxDateBound", _maxDateBound);
		render(renderer, "minDateBound", _minDateBound);
		
		if(_period != 604800000L)
			render(renderer, "period", _period);
		
		render(renderer, "pivot", _pivot);
		
		if(_timelineEvents.size() != 0)
			render(renderer, "timelineEvents", _timelineEvents);
		
	}
	
	public void service(AuRequest request, boolean everError) {
		final String cmd = request.getCommand();
		final Map data = request.getData();
		
		if (cmd.equals("onFoo")) {
			final String foo = (String)data.get("foo");
			System.out.println("do onFoo, data:" + foo);
			Events.postEvent(Event.getEvent(request));
		} else
			super.service(request, everError);
	}

	/**
	 * The default zclass is "z-timeline"
	 */
	public String getZclass() {
		return (this._zclass != null ? this._zclass : "z-timeline");
	}
	
	/*
	 * inner class
	 */
	public enum TimeUnit{
		YEAR, MONTH, DAY, HOUR, MINUTE, SECOND, MILLISECOND
	}
}


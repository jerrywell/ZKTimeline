package org.zkoss.zk.timeline;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.zkoss.lang.Objects;
import org.zkoss.zk.au.AuRequest;
import org.zkoss.zk.ui.Component;
import org.zkoss.zk.ui.event.Event;
import org.zkoss.zk.ui.event.Events;
import org.zkoss.zul.impl.XulElement;

public class Timeline extends XulElement {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	static {
		addClientEvent(Timeline.class, "onItemSelect", CE_IMPORTANT);
	}
	
	/*
	 * about timeline navigation
	 */
	private long _maxDateBound;
	private long _minDateBound;
	// pivot is always in the middle of navigation
	private long _pivot;
	// 7 * 24 * 60 * 60 * 1000, 7 days in unit millisecond
	private long _period = 604800000L/7 * 365;
	private List<TimelineItem> _timelineItems;
	
	/*
	 * about timeline event
	 */
	private int _eventObjectId = 0;
	
	private String _yearFormat = "yyyy";
	private String _monthFormat = "MM";
	private String _dayFormat = "dd";
	private String _hourFormat = "hh";
	private String _minuteFormat = "hh:mm";
	private String _secondFormat = "ss";
	private String _millisecondFormat = "SS";
	
	public Timeline(){
		SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy/MM/dd");
		try {
			_minDateBound = dateFormat.parse("2014/1/1").getTime();
			_maxDateBound = dateFormat.parse("2014/12/31").getTime();
		} catch (ParseException e) {
			e.printStackTrace();
		}
		_timelineItems = new ArrayList<TimelineItem>();
		setHeight("200px");
	}
	
	/*
	 * getter and setter
	 */
	
	public long getMaxDateBound() {
		return _maxDateBound;
	}

	public void setMaxDateBound(long maxDateBound) {
		if(!Objects.equals(_maxDateBound, maxDateBound)){	
			this._maxDateBound = maxDateBound;
			smartUpdate("maxDateBound", _maxDateBound);
		}
	}

	public long getMinDateBound() {
		return _minDateBound;
	}

	public void setMinDateBound(long minDateBound) {
		if(!Objects.equals(_minDateBound, minDateBound)){	
			this._minDateBound = minDateBound;
			smartUpdate("minDateBound", _minDateBound);
		}
	}

	public Date getPivot() {
		return new Date(_pivot);
	}

	public void setPivot(Date pivot) {
		this._pivot = pivot.getTime();
		smartUpdate("pivot", _pivot);
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
	
	public String getYearFormat() {
		return _yearFormat;
	}

	public void setYearFormat(String yearFormat) {
		if(!Objects.equals(_yearFormat, yearFormat)){	
			this._yearFormat = yearFormat;
			smartUpdate("yearFormat", _yearFormat);
		}
	}
	
	public String getMonthFormat() {
		return _monthFormat;
	}

	public void setMonthFormat(String monthFormat) {
		if(!Objects.equals(_monthFormat, monthFormat)){	
			this._monthFormat = monthFormat;
			smartUpdate("monthFormat", _monthFormat);
		}
	}
	
	public String getDayFormat() {
		return _monthFormat;
	}

	public void setDayFormat(String dayFormat) {
		if(!Objects.equals(_dayFormat, dayFormat)){	
			this._dayFormat = dayFormat;
			smartUpdate("dayFormat", _dayFormat);
		}
	}
	
	public String getHourFormat() {
		return _hourFormat;
	}

	public void setHourFormat(String hourFormat) {
		if(!Objects.equals(_hourFormat, hourFormat)){	
			this._hourFormat = hourFormat;
			smartUpdate("hourFormat", _hourFormat);
		}
	}
	
	public String getMinuteFormat() {
		return _minuteFormat;
	}

	public void setMinuteFormat(String minuteFormat) {
		if(!Objects.equals(_minuteFormat, minuteFormat)){	
			this._minuteFormat = minuteFormat;
			smartUpdate("minuteFormat", _minuteFormat);
		}
	}
	
	public String getSecondFormat() {
		return _secondFormat;
	}

	public void setSecondFormat(String secondFormat) {
		if(!Objects.equals(_secondFormat, secondFormat)){	
			this._secondFormat = secondFormat;
			smartUpdate("secondFormat", _secondFormat);
		}
	}
	
	public String getmillisecondFormat() {
		return _millisecondFormat;
	}

	public void setMillisecondFormat(String millisecondFormat) {
		if(!Objects.equals(_millisecondFormat, millisecondFormat)){	
			this._millisecondFormat = millisecondFormat;
			smartUpdate("millisecondFormat", _millisecondFormat);
		}
	}

	/*
	 * self method
	 */
	
	public void addTimelineItem(TimelineItem item) {
		item.setObjectId(++_eventObjectId);
		_timelineItems.add(item);
		smartUpdate("addedItem", item);
	}
	
	public boolean removeTimelineItem(TimelineItem item) {
		if(_timelineItems.remove(item)) {
			smartUpdate("removedItem", item);
			return true;
		}else
			return false;
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
		
		if(_timelineItems.size() != 0)
			render(renderer, "timelineItems", _timelineItems);
		
		if(!_yearFormat.equals("yyyy")) render(renderer, "yearFormat", _yearFormat);
		if(!_monthFormat.equals("MM")) render(renderer, "monthFormat", _monthFormat);
		if(!_dayFormat.equals("dd")) render(renderer, "dayFormat", _dayFormat);
		if(!_hourFormat.equals("hh")) render(renderer, "hourFormat", _hourFormat);
		if(!_minuteFormat.equals("mm")) render(renderer, "minuteFormat", _minuteFormat);
		if(!_secondFormat.equals("ss")) render(renderer, "secondFormat", _secondFormat);
		if(!_millisecondFormat.equals("SS")) render(renderer, "millisecondFormat", _millisecondFormat);
		
	}
	
	public void service(AuRequest request, boolean everError) {
		final String cmd = request.getCommand();
		final Map data = request.getData();
		
		if (cmd.equals("onItemSelect")) {
			final int oid = (Integer) data.get("objectId");
			TimelineEvent event = new TimelineEvent("onItemSelect", this);
			for (TimelineItem item : _timelineItems) {
				if(item.getObjectId() == oid) {
					event.setSelectedItem(item);
					break;
				}
			}
			Events.postEvent(event);
			System.out.println("do onItemSelect, data:" + event);
		} else
			super.service(request, everError);
	}
	
	public class TimelineEvent extends Event{
		private static final long serialVersionUID = 1L;
		private TimelineItem selectedItem;

		public TimelineEvent(String name) {
			super(name);
		}

		public TimelineEvent(String name, Component target) {
			super(name, target);
		}
		
		public TimelineItem getSelectedItem() {
			return selectedItem;
		}

		public void setSelectedItem(TimelineItem selectedItem) {
			this.selectedItem = selectedItem;
		}
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
	
	class DefaultRenderer implements Renderer<TimelineItem>{

		public long getStartDate(TimelineItem t) {
			return t.getStartDate().getTime();
		}

		public long getStopDate(TimelineItem t) {
			return t.getStopDate().getTime();
		}

		public int getObjectId(TimelineItem t) {
			return t.getObjectId();
		}

		public String getHTMLHead(TimelineItem t) {
			return "<div ";
		}
		
		public String getHTMLTail(TimelineItem t) {
			return ">" + t.getTitle() + "</div>";
		}
	};
}


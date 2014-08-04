package org.zkoss.zk.timeline;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;

import org.zkoss.calendar.Calendars;
import org.zkoss.calendar.api.CalendarEvent;
import org.zkoss.calendar.api.CalendarModel;
import org.zkoss.calendar.api.DateFormatter;
import org.zkoss.calendar.event.CalendarDataEvent;
import org.zkoss.calendar.event.CalendarDataListener;
import org.zkoss.calendar.impl.Util;
import org.zkoss.json.JSONObject;
import org.zkoss.lang.Objects;
import org.zkoss.util.Locales;
import org.zkoss.zk.au.AuRequest;
import org.zkoss.zk.au.out.AuSetAttribute;
import org.zkoss.zk.ui.Component;
import org.zkoss.zk.ui.event.Event;
import org.zkoss.zk.ui.event.Events;
import org.zkoss.zul.impl.XulElement;

public class Timeline extends XulElement {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private static final String ATTR_ON_ADD_EVENT_RESPONSE = "org.zkoss.calendar.Calendars.onAddEventResponse";
	private static final String ATTR_ON_REMOVE_EVENT_RESPONSE = "org.zkoss.calendar.Calendars.onRemoveEventResponse";
	private static final String ATTR_ON_MODIFY_EVENT_RESPONSE = "org.zkoss.calendar.Calendars.onModifyEventResponse";
	private static final String ATTR_ON_INIT_POSTED = "org.zkoss.calendar.Calendars.onInitLaterPosted";	
	
	static {
		addClientEvent(Timeline.class, "onItemSelect", CE_IMPORTANT);
		addClientEvent(Timeline.class, "onPeriodSelect", CE_IMPORTANT);
		addClientEvent(Timeline.class, "onTest", CE_IMPORTANT);
	}
	
	/*
	 * about timeline navigation
	 */
	private long _maxDateBound;
	private long _minDateBound;
	// pivot is always in the middle of navigation
	private long _pivot;
	// 7 * 24 * 60 * 60 * 1000, 7 days in unit millisecond
	private long _period = 604800000L/7 * 180;
	private List<TimelineItem> _timelineItems;
	private TimelineItem _selectedItem;
	private CalendarModel _model;
	private transient CalendarDataListener _dataListener;
	private Map<Object, Object> _ids;
	private List<CalendarEvent> _addEvtList, _mdyEvtList, _rmEvtList;
	
	/*
	 * about timeline event
	 */
	private int _eventObjectId = 0;
	
	private String _yearFormat = "yyyy";
	private String _monthFormat = "yyyy/MM";
	private String _dayFormat = "MM/dd";
	private String _hourFormat = "hh:mm";
	private String _minuteFormat = "hh:mm";
	private String _secondFormat = "hh:mm:ss";
	private String _millisecondFormat = "ss.SS";
	
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
		_pivot = pivot.getTime();
		smartUpdate("pivot", _pivot);
	}

	public long getPeriod() {
		return _period;
	}

	public void setPeriod(long period) {
		if(!Objects.equals(_period, period)){	
			_period = period;
			smartUpdate("period", _period);
		}
	}
	
	public String getYearFormat() {
		return _yearFormat;
	}

	public void setYearFormat(String yearFormat) {
		if(!Objects.equals(_yearFormat, yearFormat)){	
			_yearFormat = yearFormat;
			smartUpdate("yearFormat", _yearFormat);
		}
	}
	
	public String getMonthFormat() {
		return _monthFormat;
	}

	public void setMonthFormat(String monthFormat) {
		if(!Objects.equals(_monthFormat, monthFormat)){	
			_monthFormat = monthFormat;
			smartUpdate("monthFormat", _monthFormat);
		}
	}
	
	public String getDayFormat() {
		return _monthFormat;
	}

	public void setDayFormat(String dayFormat) {
		if(!Objects.equals(_dayFormat, dayFormat)){	
			_dayFormat = dayFormat;
			smartUpdate("dayFormat", _dayFormat);
		}
	}
	
	public String getHourFormat() {
		return _hourFormat;
	}

	public void setHourFormat(String hourFormat) {
		if(!Objects.equals(_hourFormat, hourFormat)){	
			_hourFormat = hourFormat;
			smartUpdate("hourFormat", _hourFormat);
		}
	}
	
	public String getMinuteFormat() {
		return _minuteFormat;
	}

	public void setMinuteFormat(String minuteFormat) {
		if(!Objects.equals(_minuteFormat, minuteFormat)){	
			_minuteFormat = minuteFormat;
			smartUpdate("minuteFormat", _minuteFormat);
		}
	}
	
	public String getSecondFormat() {
		return _secondFormat;
	}

	public void setSecondFormat(String secondFormat) {
		if(!Objects.equals(_secondFormat, secondFormat)){	
			_secondFormat = secondFormat;
			smartUpdate("secondFormat", _secondFormat);
		}
	}
	
	public String getmillisecondFormat() {
		return _millisecondFormat;
	}
	
	public void setMillisecondFormat(String millisecondFormat) {
		if(!Objects.equals(_millisecondFormat, millisecondFormat)){	
			_millisecondFormat = millisecondFormat;
			smartUpdate("millisecondFormat", _millisecondFormat);
		}
	}
	
	public void setSelectedItem(TimelineItem item) {
		if(!Objects.equals(_selectedItem, item)){	
			_selectedItem = item;
			setPivot(item.getStartDate());
			smartUpdate("_selectedItem", item);
		}
	}
	
	public TimelineItem getSelectedItem() {
		return _selectedItem;
	}
	
	/**
	 * Returns the calendar model.
	 */
	public CalendarModel getModel() {
		return _model;
	}	

	/**
	 * Sets the calendar model.
	 */
	public void setModel(CalendarModel model) {
		if (model != null) {
			if (_model != model) {
				if (_model != null) {
					_model.removeCalendarDataListener(_dataListener);
				}
				_model = model;
				initDataListener();
			}
		} else if (_model != null) {
			_model.removeCalendarDataListener(_dataListener);
			_model = null;
		}
		reSendEventGroup();
	}

	/*
	 * self method
	 */
	
	/** Initializes _dataListener and register the listener to the model
	 */
	private void initDataListener() {
		if (_dataListener == null)
			_dataListener = new CalendarDataListener() {
				public void onChange(CalendarDataEvent event) {
					CalendarEvent ce = event.getCalendarEvent();
					if (ce == null) {	// if large scope change, such as clearAll
						reSendEventGroup();
						return;
					}
					switch (event.getType()) {
					case CalendarDataEvent.INTERVAL_ADDED:
						addCalendarEvent(event.getCalendarEvent());			
						break;
					case CalendarDataEvent.INTERVAL_REMOVED:				
						removeCalendarEvent(event.getCalendarEvent());			
						break;
					case CalendarDataEvent.CONTENTS_CHANGED:	
						modifyCalendarEvent(event.getCalendarEvent());			
					}
				}
			};

		_model.addCalendarDataListener(_dataListener);
	}
	
	public void onAddDayEventResponse() {
		removeAttribute(ATTR_ON_ADD_EVENT_RESPONSE);
		response("addEvent" + getUuid(), new AuSetAttribute(this,"addDayEvent",renderDayEvent(this, _addEvtList)));
	}
	
	public void onRemoveDayEventResponse() {
		removeAttribute(ATTR_ON_REMOVE_EVENT_RESPONSE);
		response("removeEvent" + getUuid(), new AuSetAttribute(this,"removeDayEvent",renderDayEvent(this, _rmEvtList)));
	}
	
	public void onModifyDayEventResponse() {
		removeAttribute(ATTR_ON_MODIFY_EVENT_RESPONSE);
		response("modifyEvent" + getUuid(), new AuSetAttribute(this,"modifyDayEvent",renderDayEvent(this, _mdyEvtList)));
	}
	
	public String renderDayEvent(Timeline timeline, Collection<CalendarEvent> collection) {
//		final StringBuffer sb = new StringBuffer().append('[');
//		Date beginDate = calendars.getBeginDate();
//		_sdfKey.setTimeZone(calendars.getDefaultTimeZone());
//		for (Iterator<CalendarEvent> it = collection.iterator(); it.hasNext();) {
//			CalendarEvent ce = it.next();
//			appendEventByJSON(sb, calendars, key, ce);
//		}		
//		int len = sb.length();
//		collection.clear();
//		return sb.replace(len - 1, len, "]").toString();
		return "[\"title\":\"aaaa\"]";
	}
	
	protected void reSendEventGroup() {
		if (getAttribute(ATTR_ON_INIT_POSTED) == null) {
			setAttribute(ATTR_ON_INIT_POSTED, Boolean.TRUE);
			Events.postEvent(-10100, "onInitRender", this, null);
		}
	}

	private void addCalendarEvent(CalendarEvent ce) {
		if (ce == null) return;
		if (_addEvtList == null)
			_addEvtList = new LinkedList<CalendarEvent>();
		_addEvtList.add(ce);
		if (getAttribute(ATTR_ON_ADD_EVENT_RESPONSE) == null) {
			setAttribute(ATTR_ON_ADD_EVENT_RESPONSE, Boolean.TRUE);
			Events.postEvent(-20000, "onAddDayEventResponse", this, null);
		}
	}

	private void removeCalendarEvent(CalendarEvent ce) {
		if (ce == null) return;
		if (_mdyEvtList == null)
			_mdyEvtList = new LinkedList<CalendarEvent>();
		_mdyEvtList.add(ce);
		if (getAttribute(ATTR_ON_MODIFY_EVENT_RESPONSE) == null) {
			setAttribute(ATTR_ON_MODIFY_EVENT_RESPONSE, Boolean.TRUE);
			Events.postEvent(-20000, "onModifyDayEventResponse", this, null);
		}
	}

	private void modifyCalendarEvent(CalendarEvent ce) {
		if (ce == null) return;
		if (_mdyEvtList == null)
			_mdyEvtList = new LinkedList<CalendarEvent>();
		_mdyEvtList.add(ce);
		if (getAttribute(ATTR_ON_MODIFY_EVENT_RESPONSE) == null) {
			setAttribute(ATTR_ON_MODIFY_EVENT_RESPONSE, Boolean.TRUE);
			Events.postEvent(-20000, "onModifyDayEventResponse", this, null);
		}
	}


	private static void appendEventByJSON(StringBuffer sb, Calendars calendars, String key, CalendarEvent ce) {
		DateFormatter df = calendars.getDateFormatter();
		Locale locale = Locales.getCurrent();
		TimeZone timezone = calendars.getDefaultTimeZone();
		String title = Util.createEventTitle(df, locale, timezone, ce);

		JSONObject json = new JSONObject();
		json.put("id", calendars.getCalendarEventId(ce));
//		json.put("title", calendars.isEscapeXML() ? escapeXML(title) : title); //ZKCAL-33: title should also escapeXML
//		json.put("content", calendars.isEscapeXML() ? escapeXML(ce.getContent()): ce.getContent());
//		json.put("beginDate", String.valueOf(getDSTTime(timezone, ce.getBeginDate())));
//		json.put("endDate", String.valueOf(getDSTTime(timezone ,ce.getEndDate())));

		sb.append(json.toString()).append(",");
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
		
		if(_selectedItem != null)
			render(renderer, "selectedItem", _selectedItem);
		
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
		} else if (cmd.equals("onTest")) {
			System.out.println("do onTest, data:" + data.get("test1") + ", " +data.get("test2") + ", " + data.get("test3") + ", " + data.get("test4"));
		} else if (cmd.equals("onPeriodSelect")) {
			final long startTime = (Long) data.get("startTime");
			final long stopTime = (Long) data.get("stopTime");
			TimelineEvent event = new TimelineEvent("onPeriodSelect", this);
			event.setStartTime(startTime);
			event.setStopTime(stopTime);
			Events.postEvent(event);
		}else
			super.service(request, everError);
	}
	
	public class TimelineEvent extends Event{
		private static final long serialVersionUID = 1L;
		private TimelineItem selectedItem;
		private long startTime;
		private long stopTime;

		public TimelineEvent(String name) {
			super(name);
		}

		public TimelineEvent(String name, Component target) {
			super(name, target);
		}
		
		public TimelineItem getSelectedItem() {
			return selectedItem;
		}

		void setSelectedItem(TimelineItem selectedItem) {
			this.selectedItem = selectedItem;
		}
		
		public long getStartTime() {
			return startTime;
		}

		void setStartTime(long startTime) {
			this.startTime = startTime;
		}

		public long getStopTime() {
			return stopTime;
		}

		void setStopTime(long stopTime) {
			this.stopTime = stopTime;
		}
		
		public Date getStartDate() {
			return new Date(startTime);
		}
		
		public Date getStopDate() {
			return new Date(stopTime);
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


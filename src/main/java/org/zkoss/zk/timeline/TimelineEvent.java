package org.zkoss.zk.timeline;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;

import org.zkoss.json.JSONAware;
import org.zkoss.json.JSONs;
import org.zkoss.zul.impl.XulElement;

public class TimelineEvent implements JSONAware {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private int objectId;
	private long startDate = -1;
	private long stopDate = -1;
	private String title;
	
	public int getObjectId() {
		return objectId;
	}
	public void setObjectId(int objectId) {
		this.objectId = objectId;
	}
	public Date getStartDate() {
		return new Date(startDate);
	}
	public void setStartDate(Date startDate) {
		this.startDate = startDate.getTime();
	}
	public Date getStopDate() {
		return new Date(stopDate);
	}
	public void setStopDate(Date stopDate) {
		this.stopDate = stopDate.getTime();
	}
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	
	public String toJSONString() {
		return "{\"objectId\":\"" + objectId + "\",\"title\":\"" + title + "\",\"startDate\":" + startDate + "" 
				+ (stopDate != -1 ? ",\"stopDate\":" + stopDate + "" : "")
				+ "}";
	}
	
	public class TimelineEvents{
		List<TimelineEvent> events;
		Comparator<TimelineEvent> comp = new Comparator<TimelineEvent>() {
			public int compare(TimelineEvent e1, TimelineEvent e2) {
				if(e1.getStartDate().equals(e2.getStartDate()))
					return e1.getObjectId() - e2.getObjectId();
				return e1.getStartDate().compareTo(e2.getStartDate());
			}
		};
		
		public TimelineEvents() {
			events = new ArrayList<TimelineEvent>();
		}
		
		public int add(TimelineEvent event) {
			int index = getInsertedIndex(event);
			events.add(index, event);
			return index;
		}
		
		public int remove(TimelineEvent event) {
			int index = getInsertedIndex(event);
			if(index > -1) {
				events.remove(index);
				return index;
			}
			return -1;
		}
		
		public int replace(TimelineEvent event) {
			int index = Collections.binarySearch(events, event, new Comparator<TimelineEvent>() {
				public int compare(TimelineEvent e1, TimelineEvent e2) {
					return e1.getObjectId() - e2.getObjectId();
				}
			});
			if(index > -1) {
				events.
				return index;
			}
			return -1;
		}
		
		private int getInsertedIndex(TimelineEvent event) {
			return - Collections.binarySearch(events, event, comp) + 1;
		}
	}
}


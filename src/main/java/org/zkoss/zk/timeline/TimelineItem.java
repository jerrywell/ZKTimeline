package org.zkoss.zk.timeline;

import java.util.Date;
import org.zkoss.json.JSONAware;

public class TimelineItem implements JSONAware {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	
	private int objectId;
	private long startDate = -1;
	private long stopDate = -1;
	private String title;
	
	int getObjectId() {
		return objectId;
	}
	void setObjectId(int objectId) {
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
}


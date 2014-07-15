package org.zkoss.zk.timeline;

import java.util.Date;

import org.zkoss.json.JSONAware;
import org.zkoss.json.JSONs;
import org.zkoss.zul.impl.XulElement;

public class TimelineEvent implements JSONAware {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private String objectId;
	private Date startDate;
	private Date stopDate;
	private String title;
	
	public String getObjectId() {
		return objectId;
	}
	public void setObjectId(String objectId) {
		this.objectId = objectId;
	}
	public Date getStartDate() {
		return startDate;
	}
	public void setStartDate(Date startDate) {
		this.startDate = startDate;
	}
	public Date getStopDate() {
		return stopDate;
	}
	public void setStopDate(Date stopDate) {
		this.stopDate = stopDate;
	}
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	
	public String toJSONString() {
		return "{\"objectId\":\"" + objectId + "\",\"title\":\"" + title + "\",\"startDate\":\"" + JSONs.d2j(startDate) + "\"" 
				+ (stopDate != null ? ",\"stopDate\":\"" + JSONs.d2j(stopDate) + "\"" : "")
				+ "}";
	}
}


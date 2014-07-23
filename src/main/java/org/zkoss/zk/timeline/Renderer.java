package org.zkoss.zk.timeline;

public interface Renderer<T extends TimelineItem> {
	public long getStartDate(T t);
	public long getStopDate(T t);
	public int getObjectId(T t);
	public String getHTMLHead(T t);
	public String getHTMLTail(T t);
}


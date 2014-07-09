package org.zkoss.imageslider;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.zkoss.lang.Objects;
import org.zkoss.zk.au.AuRequest;
import org.zkoss.zk.ui.Component;
import org.zkoss.zk.ui.UiException;
import org.zkoss.zk.ui.event.Events;
import org.zkoss.zk.ui.event.SelectEvent;
import org.zkoss.zul.Image;
import org.zkoss.zul.impl.XulElement;

public class ImageSlider extends XulElement {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	static {
		addClientEvent(ImageSlider.class, Events.ON_SELECT, CE_IMPORTANT);
	}
	
	/* Here's a simple example for how to implements a member field */

	private int _scrollIndex = 0; 
	private int _viewportSize = 3;
	private int _selectedIndex = -1;
	private int _imageWidth = 200;
	
	public int getScrollIndex() {
		return _scrollIndex;
	}

	public void setScrollIndex(int scrollIndex) {
		if(!Objects.equals(_scrollIndex, scrollIndex)){			
			_scrollIndex = scrollIndex;
			smartUpdate("photoIndex", _scrollIndex);
		}
	}
	
	/* Component method */
	
	public int getSelectedIndex() {
		return _selectedIndex;
	}

	public void setSelectedIndex(int selectedIndex) {
		if(_selectedIndex != selectedIndex){
			if(selectedIndex >= getChildren().size())
				throw new IndexOutOfBoundsException("Can't set the selected index larger than the size of children images.");
			
			_selectedIndex = selectedIndex;
			smartUpdate("selectedIndex", _selectedIndex);
		}
	}
	
	public int getImageWidth() {
		return _imageWidth;
	}

	public void setImageWidth(int imageWidth) {
		if(_imageWidth != imageWidth){			
			_imageWidth = imageWidth;
			smartUpdate("imageWidth", _imageWidth);
		}
	}
	
	public int getViewportSize() {
		return _viewportSize;
	}

	public void setViewportSize(int viewportSize) {
		
		if(_viewportSize != viewportSize){			
			_viewportSize = viewportSize;
			smartUpdate("viewportSize", _viewportSize);
		}
	}
	
	public void setSelectedItem(Image img){
		setSelectedIndex(getChildren().indexOf(img));
	}
	
	public int getImageLength() {
		return getChildren().size();
	};

	public Image getSelectedItem(){
		return (Image) getChildren().get(_selectedIndex);
	}
	
	//super//
	protected void renderProperties(org.zkoss.zk.ui.sys.ContentRenderer renderer)
	throws java.io.IOException {
		super.renderProperties(renderer);
		
		if(_viewportSize != 3)
			render(renderer, "viewportSize", _viewportSize);
		if(_imageWidth != 200)
			render(renderer, "imageWidth", _imageWidth);

	}
	
	public void service(AuRequest request, boolean everError) {
		final String cmd = request.getCommand();
		final Map<String, Object> data = request.getData();
		
		if (cmd.equals(Events.ON_SELECT)) {
			final int index = (Integer)data.get("index");
			this._selectedIndex = index;
			SelectEvent.getEvent(request);
			
			Set<Image> set = new HashSet<Image>();
			set.add((Image) getChildren().get(index));
			Events.postEvent(new SelectEvent<Image, Object>(Events.ON_SELECT, this, set));
		} else
			super.service(request, everError);
	}
	
	@Override
	public void beforeChildRemoved(Component child) {
		setSelectedIndex(-1);
		super.beforeChildRemoved(child);
	}

	@Override
	public void beforeChildAdded(Component child, Component insertBefore) {
		if(!(child instanceof Image))
			throw new UiException("Unsupported child for ImageSlider: " + child);
		super.beforeChildAdded(child, insertBefore);
	}

	/**
	 * The default zclass is "z-imageslider"
	 */
	public String getZclass() {
		return (this._zclass != null ? this._zclass : "z-imageslider");
	}
}


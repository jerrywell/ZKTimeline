package test.ctrl;

import org.zkoss.imageslider.ImageSlider;

import org.zkoss.zk.ui.Component;
import org.zkoss.zk.ui.select.SelectorComposer;
import org.zkoss.zk.ui.select.annotation.Listen;
import org.zkoss.zk.ui.select.annotation.Wire;
import org.zkoss.zul.Image;
import org.zkoss.zul.Spinner;

public class DemoWindowComposer extends SelectorComposer<Component> {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	
	@Wire
	private ImageSlider imageSlider;
	
	@Wire
	private Spinner imageWidthQuantity;
	
	@Wire
	private Spinner viewportQuantity;
	
	@Wire
	private Spinner selectedIndexQuantity;
	
	
	public void doAfterCompose(Component comp) throws Exception {
		super.doAfterCompose(comp);				
	}
	
	/* Event method */
	
	@Listen("onClick = #setViewport")
	public void testSetViewport(){
		imageSlider.setViewportSize(viewportQuantity.getValue());
	}
	
	@Listen("onClick = #setImageWidth")
	public void testSetImageWidth(){
		imageSlider.setImageWidth(imageWidthQuantity.getValue());
	}
	
	@Listen("onClick = #setSelectedIndex")
	public void testSetSelectedIndex(){
		imageSlider.setSelectedIndex(selectedIndexQuantity.getValue());
	}
	
	@Listen("onClick = #addImage")
	public void testAddImage(){
		Image image = new Image();
		image.setSrc("resources/img/ironman-01.jpg");
		imageSlider.appendChild(image);
	}
	
	@Listen("onClick = #removeImage")
	public void testRemoveImage(){
		Image image = imageSlider.getSelectedItem();
		imageSlider.removeChild(image);
	}
}
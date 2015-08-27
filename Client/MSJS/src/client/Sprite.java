package client;
import java.awt.Image;

import javax.swing.JLabel;


public class Sprite extends JLabel{

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private int x;
	private int y;
	private Image image;
	
	public int getYCoords() {
		return y;
	}
	public void setYCoords(int y) {
		this.y = y;
	}
	public int getXCoords() {
		return x;
	}
	public void setXCoords(int x) {
		this.x = x;
	}
	
	public void move(String direction)
	{
		if(direction.equals("up"))
		{
			if(y > 0){
				setYCoords(y - 1);
				//(InfoFrame)(this.getParent().getParent().getParent().getParent()).grid[]
			}
		}
		else if(direction.equals("down"))
		{
			if(y < 9){
				setYCoords(y + 1);
			}
		}
		else if(direction.equals("left"))
		{
			if(x > 0){
				setXCoords(x - 1);
			}
		}
		else if(direction.equals("right"))
		{
			if(x < 9){
				setXCoords(x + 1);
			}
		}
	}
	
	public Image getImage() {
		return image;
	}
	public void setImage(Image image) {
		this.image = image;
	}
	public static Sprite create(String str) throws Exception
	{
		if(str.equals("hero"))
			return new Hero();
		else if(str.equals("villain"))
			return new Villain();
		else
			return new Sprite();
	}
}

package client;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.IOException;

import javax.imageio.ImageIO;
import javax.swing.ImageIcon;


public class Hero extends Sprite{

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public Hero() throws Exception
	{
		BufferedImage heroInit = null;
		try {
			heroInit = ImageIO.read(this.getClass().getResourceAsStream("/Resources/hero.png"));
			
		} catch (IOException e) {
			
			e.printStackTrace();
		}
		
		int screenWidth = java.awt.GraphicsEnvironment.getLocalGraphicsEnvironment().getMaximumWindowBounds().width;
		int screenHeight = java.awt.GraphicsEnvironment.getLocalGraphicsEnvironment().getMaximumWindowBounds().height;
		Image hero = heroInit.getScaledInstance((int)(screenWidth * 0.04),(int)(screenHeight * 0.07), Image.SCALE_SMOOTH);
		
		setIcon(new ImageIcon(hero));
	}
}

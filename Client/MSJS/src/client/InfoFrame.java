package client;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.Frame;
import java.awt.GraphicsEnvironment;
import java.awt.GridLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import javax.swing.BorderFactory;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JTextArea;
import javax.swing.SwingConstants;
import javax.swing.border.EmptyBorder;

import org.json.JSONObject;


public class InfoFrame extends JFrame{

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	public JTextArea console;
	public JLabel[][] grid;
	public JSONObject json;
	public int screenWidth;
	public int screenHeight;
	public JPanel gridPanel;
	public JPanel right;
	public JPanel bottom;
	public JPanel pane;
	public InfoFrame(JSONObject json) throws Exception
	{
		super("Middle School Javascript");
		this.json = json;
		grid = new JLabel[10][10];
		for(int i = 0; i < 10; i++){
			for(int j = 0; j < 10; j++)
			{
				grid[i][j] = new JLabel();
			}
		}
		setExtendedState(Frame.MAXIMIZED_BOTH);
		setVisible(true);
		setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		pane = new JPanel(new BorderLayout());
		add(pane);
		
		JLabel title = new JLabel("MSJS");
		title.setHorizontalAlignment(SwingConstants.CENTER);
		
		Font logoFont = null;
		try
		{
			logoFont = Font.createFont(Font.TRUETYPE_FONT, getClass().getResourceAsStream("/Resources/Raleway-SemiBold.ttf"));
		}
		catch(Exception e)
		{
			
		}
		logoFont = logoFont.deriveFont(Font.PLAIN, 50);
		GraphicsEnvironment environ = GraphicsEnvironment.getLocalGraphicsEnvironment();
		environ.registerFont(logoFont);
		title.setFont(logoFont);
		Color titleColor = new Color(255,84,9);
		title.setForeground(titleColor);
		
		screenWidth = java.awt.GraphicsEnvironment.getLocalGraphicsEnvironment().getMaximumWindowBounds().width;
		screenHeight = java.awt.GraphicsEnvironment.getLocalGraphicsEnvironment().getMaximumWindowBounds().height;
		
		title.setBounds(0,0,(screenWidth), (int)(screenHeight * 0.15));
		pane.add(title, BorderLayout.NORTH);
		
		bottom = new JPanel(new BorderLayout());
		JPanel left = new JPanel(new BorderLayout());
		right = new JPanel();
		gridPanel = new JPanel(new GridLayout(10,10));
		
		
		//String string = "Hero hero1 = new Hero();\nhero1.setx(1);\nhero1.sety(0);\nVillain villain1 = new Villain();\nvillain1.setx(0);\nvillain.sety(1);";
		console = new JTextArea();
		console.setPreferredSize(new Dimension((int)(screenWidth * 0.4), (int)(screenHeight * 0.7)));
		console.setBorder(BorderFactory.createLineBorder(Color.DARK_GRAY, 6, false));
		
		left.setBorder(new EmptyBorder((int)(screenWidth * 0.05),(int)(screenWidth * 0.05),(int)(screenWidth * 0.05),(int)(screenWidth * 0.05)));
		
		left.add(console, BorderLayout.NORTH);
		ButtonPanel buttons = new ButtonPanel();
		left.add(buttons, BorderLayout.SOUTH);
		bottom.add(left, BorderLayout.WEST);
		
		Color gridColor = new Color(8,229,202);
		gridPanel.setBackground(gridColor);
		gridPanel.setPreferredSize(new Dimension((int)(screenWidth * 0.4), (int)(screenHeight * 0.7)));
		gridPanel.setBorder(BorderFactory.createEmptyBorder(2,2,2,2));
		gridPanel.setBorder(BorderFactory.createLineBorder(Color.DARK_GRAY, 6, false));
		String consoleText = "//Create the window\nvar window = Window;";
		for(int i = 0; i < 10; i++){
			for(int j = 0; j < 10; j++){
				for(int k = 0; k < json.getJSONArray("sprites").length(); k++){
					if(json.getJSONArray("sprites").getJSONObject(k).getInt("x") == j && json.getJSONArray("sprites").getJSONObject(k).getInt("y") == i)
					{
						if(json.getJSONArray("sprites").getJSONObject(k).get("type").equals("friendly"))
						{
							consoleText += "\n\n//Create a hero and add her to our grid\nvar hero" + (k + 1) + " = Sprite.create(\"hero\");\n";
							consoleText += "Window.grid[" + json.getJSONArray("sprites").getJSONObject(k).getInt("x") + "][" + json.getJSONArray("sprites").getJSONObject(k).getInt("y") + "] = hero" + (k + 1) + ";";
							
						}
						else if(json.getJSONArray("sprites").getJSONObject(k).get("type").equals("enemy"))
						{
							consoleText += "\n\n//Create a villain and add him to our grid\nvar villain" + (k + 1) + " = Sprite.create(\"villain\");\n";
							consoleText += "Window.grid[" + json.getJSONArray("sprites").getJSONObject(k).getInt("x") + "][" + json.getJSONArray("sprites").getJSONObject(k).getInt("y") + "] = villain" + (k + 1) + ";";
							
						}
						else
							grid[i][j].setText("sprite");
							
					}
					
				}
				
				grid[i][j].setBorder(BorderFactory.createLineBorder(Color.DARK_GRAY));
				//gridPanel.add(grid[i][j]);
				
				
			}
		}
		console.setText(consoleText);
		update();
		
		buttons.button1.addActionListener(new ActionListener(){
			@Override
			public void actionPerformed(ActionEvent e) {
				update();
			}
		});
		right.add(gridPanel, SwingConstants.CENTER);
		right.setBorder(new EmptyBorder((int)(screenWidth * 0.05),(int)(screenWidth * 0.05),(int)(screenWidth * 0.05),(int)(screenWidth * 0.05)));
		bottom.add(right, BorderLayout.EAST);
		pane.add(bottom, BorderLayout.SOUTH);
		
		
		
	}
	public void update(){
		/*gridPanel = null;
		gridPanel = new JPanel();
		Color gridColor = new Color(8,229,202);
		gridPanel.setBackground(gridColor);
		gridPanel.setPreferredSize(new Dimension((int)(screenWidth * 0.4), (int)(screenHeight * 0.7)));
		gridPanel.setBorder(BorderFactory.createEmptyBorder(2,2,2,2));
		gridPanel.setBorder(BorderFactory.createLineBorder(Color.DARK_GRAY, 6, false));*/
		
		for(int i = 0; i < 10; i++){
			for(int j = 0; j< 10; j++){
				gridPanel.remove(grid[i][j]);
				grid[i][j] = new JLabel();
				grid[i][j].setBorder(BorderFactory.createLineBorder(Color.DARK_GRAY));
			}
		}
		
		String userCode = console.getText();
		ScriptEngineManager factory = new ScriptEngineManager();
		ScriptEngine engine = factory.getEngineByName("JavaScript");
		engine.put("Sprite", new Sprite());
		engine.put("Window", this);
		try {
			engine.eval(userCode);
		} catch (ScriptException e1) {
			e1.printStackTrace();
		}
		
		
		for(int i = 0; i < 10; i++){
			for(int j = 0; j< 10; j++){
				gridPanel.add(grid[i][j]);
			}
		}
		gridPanel.revalidate();
		gridPanel.repaint();
		right.revalidate();
		right.repaint();
		bottom.revalidate();
		bottom.repaint();
		pane.revalidate();
		pane.repaint();
		revalidate();
		repaint();
	}
}
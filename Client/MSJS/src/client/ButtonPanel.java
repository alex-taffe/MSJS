package client;
import java.awt.Color;
import java.awt.GridLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.FileNotFoundException;
import java.io.PrintWriter;

import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JOptionPane;
import javax.swing.JPanel;


public class ButtonPanel extends JPanel
{
	/**
	 * 
	 */
	private static final long serialVersionUID = 1147360602366203479L;
	public MyButton button1;
	public ButtonPanel()
	{
		setLayout(new GridLayout(0,3));
		setVisible(true);
		button1 = new MyButton("run");
		
		add(button1);
	
		
		MyButton button3 = new MyButton("save");
		button3.addActionListener(new ActionListener(){
			@Override
			public void actionPerformed(ActionEvent e) {
				String file = JOptionPane.showInputDialog(null, "Please enter your file name", "Name Your File", JOptionPane.PLAIN_MESSAGE);
				try {
					new PrintWriter(file + ".txt");
				} catch (FileNotFoundException e1) {
					e1.printStackTrace();
				}
			}
		});
		add(button3);
		
		MyButton button2 = new MyButton("close");
		button2.addActionListener(new ActionListener(){
			@Override
			public void actionPerformed(ActionEvent e) {
				JOptionPane.showMessageDialog(null, "Thanks for Learning!", "Goodbye", JOptionPane.CLOSED_OPTION);
				System.exit(0);
			}
		});
		add(button2);
		
	}
	
}
class MyButton extends JButton
	{
		/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

		public MyButton(String name)
		{
			super(name);
			setForeground(Color.WHITE);
			setBackground(new Color(255,84,9));
			setBorder(BorderFactory.createEmptyBorder());
		}
	}
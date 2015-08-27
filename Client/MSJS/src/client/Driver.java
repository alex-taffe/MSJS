package client;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

import javax.swing.JOptionPane;

import org.json.JSONObject;
import org.json.JSONTokener;

public class Driver {

	public static InfoFrame infoFrame;
	public static void main(String [] args) throws Exception
	{
		String code = JOptionPane.showInputDialog(null, "Please enter your teacher code", "Enter Your Code", JOptionPane.PLAIN_MESSAGE);
		String url = "https://msjsapp.com/get-lesson?code=" + code;
		 
		URL obj = new URL(url);
		HttpURLConnection con = (HttpURLConnection) obj.openConnection();
 
		// optional default is GET
		con.setRequestMethod("GET");
		con.setRequestProperty("User-Agent", "Mozilla/5.0");

 
		int responseCode = con.getResponseCode();
		System.out.println("\nSending 'GET' request to URL : " + url);
		System.out.println("Response Code : " + responseCode);
 
		BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
		String inputLine;
		StringBuffer response = new StringBuffer();
 
		while ((inputLine = in.readLine()) != null) {
			response.append(inputLine);
		}
		in.close();

		
		JSONObject json = new JSONObject(new JSONTokener(response.toString()));
		//System.out.println(json.getJSONArray("sprites").getJSONObject(0).get("type"));
		
		infoFrame = new InfoFrame(json);
		infoFrame.setVisible(true);
	}
}
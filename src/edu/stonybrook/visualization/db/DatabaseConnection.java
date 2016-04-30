package edu.stonybrook.visualization.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnection {

	private static Connection conn = null;
	private DatabaseConnection()
	{
		try {
			String myDriver = "com.mysql.jdbc.Driver";
			//String myUrl = "jdbc:mysql://130.245.101.3:3306/ADE";
			String myUrl = "jdbc:mysql://127.0.0.1:3306/visualization";
			Class.forName(myDriver);
			conn = DriverManager.getConnection(myUrl, "root", "admin");
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
	}
	public static Connection getInstance()
	{
		if (conn == null)
		{
			new DatabaseConnection();
		}
		return conn;
	}
	
	public static void close()
	{
		if (conn != null)
		{
			try {
				conn.close();
			} catch (SQLException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			conn = null;
		}
	}
}

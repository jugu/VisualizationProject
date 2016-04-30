package edu.stonybrook.visualization.db;

import java.sql.Connection;

public class YoutubeDBService {
	private Connection dbConn;
	public YoutubeDBService()
	{
		dbConn = DatabaseConnection.getInstance();
	}
	
	public String getVideosPerLike()
	{
		return "test";
	}

}

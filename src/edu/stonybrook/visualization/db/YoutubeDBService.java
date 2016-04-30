package edu.stonybrook.visualization.db;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.text.SimpleDateFormat;
import java.util.Date;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

public class YoutubeDBService {
	private Connection dbConn;
	PreparedStatement pstmt = null;
	ResultSet rS = null;
	public YoutubeDBService()
	{
		dbConn = DatabaseConnection.getInstance();
	}
	
	private Date getMinDateForChannelVideos(String channel)
	{
		try
		{
			String  s  = " SELECT MIN(DATE(PUBLISHED_AT)) as MINDATE FROM VIDEO WHERE CHANNEL_TITLE = ?";
			pstmt = dbConn.prepareStatement(s);
			pstmt.setString(1, channel);
			rS = pstmt.executeQuery();
			if (rS.next())
			{
				return new java.util.Date(rS.getDate("MINDATE").getTime());
			}
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
		finally
		{
			close();
		}
		return new Date();				
	}
	
	public String getViewsPerLike(String channelTitle)
	{
		String result = "";
		try 
		{
			Date minDate = getMinDateForChannelVideos(channelTitle);
			String s = " select (view_count)/like_Count as VPL, date(published_at) as publishedat, "
					 + " ? as channeldate, "
					 + " DATEDIFF(date(published_at),?) as daysFromStart "
					 + " from video where channel_title  = ? order by publishedat";
			pstmt = dbConn.prepareStatement(s);
			pstmt.setDate(1, new java.sql.Date(minDate.getTime()));
			pstmt.setDate(2, new java.sql.Date(minDate.getTime()));
			pstmt.setString(3, channelTitle);
			rS = pstmt.executeQuery();
			JsonObject js = new JsonObject();
			JsonArray jsArr = new JsonArray();
			while (rS.next())
			{
				js = new JsonObject();
				js.addProperty("value", rS.getInt("VPL"));
				js.addProperty("published", new SimpleDateFormat("yyyy-MM-dd").format(rS.getDate("publishedat")));
				js.addProperty("channeldate", new SimpleDateFormat("yyyy-MM-dd").format(rS.getDate("channeldate")));
				js.addProperty("daysfromstart", rS.getInt("daysFromStart"));
				jsArr.add(js);
			}
			result = jsArr.toString();
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
		finally
		{
			close();
		}
		return result;
		
	}
	
	private void close()
	{
		try {
			if (rS != null)
			{
				rS.close();
				rS = null;
			}
			if (pstmt != null)
			{
				pstmt.close();
				pstmt = null;
			}
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
	}

}

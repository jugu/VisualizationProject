package edu.stonybrook.visualization.db;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;




public class YoutubeDBService {
	private Connection dbConn;
	PreparedStatement pstmt = null;
	ResultSet rS = null;
	public YoutubeDBService()
	{
		dbConn = DatabaseConnection.getInstance();
	}
	
	public JSONArray getChannelStatistics(String channelTitle, String category, boolean allChannels)
	{
		JSONArray jsArray = new JSONArray();
		JSONObject js = new JSONObject();
		try
		{
			String s = "SELECT * FROM CHANNEL";
			if (!allChannels)
				s += " WHERE CHANNEL_TITLE = ?";
			else
				s += " WHERE CATEGORY = ?";
			s += " ORDER BY CHANNEL_TITLE";
			pstmt = dbConn.prepareStatement(s);
			if (!allChannels)
				pstmt.setString(1, channelTitle);
			else
				pstmt.setString(1, category);
			rS = pstmt.executeQuery();
			while (rS.next())
			{
				js = new JSONObject();
				js.put("title", rS.getString("channel_title"));
				js.put("videos", rS.getLong("video_count"));
				js.put("views", rS.getLong("view_count"));
				js.put("subscribers", rS.getLong("subscriber_count"));
				jsArray.put(js);
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
		return jsArray;
	}
	
	public String getChannelTrend(String channelTitle, String category, boolean allChannels)
	{
		JSONArray resultjs = getChannelStatistics(channelTitle, category, allChannels);
		JSONArray jsArray = new JSONArray();
		try
		{
			if (!allChannels)
			{
				List<Date> minmaxDateList = getMinMaxDateForChannelVideos(channelTitle);
				Date minDate = minmaxDateList.get(0);
				String s = " select video_title, view_count, like_count, dislike_count, comment_count, published_at, duration, url ";
					s += " from video where channel_title = ? ORDER BY PUBLISHED_AT";
				pstmt = dbConn.prepareStatement(s);
				pstmt.setString(1, channelTitle);
				rS = pstmt.executeQuery();
				JSONObject js ;
				while (rS.next())
				{
					js = new JSONObject();
					js.put("views", rS.getLong("view_count"));
					js.put("likes", rS.getLong("like_count"));
					js.put("dislikes", rS.getInt("dislike_count"));
					js.put("comments", rS.getInt("comment_count"));
					js.put("videotitle", rS.getString("video_title"));
					js.put("duration", getDuration(rS.getString("DURATION")));
					js.put("videodate", new SimpleDateFormat("yyyy-MM-dd").format(rS.getDate("published_at")));
					js.put("startdate", new SimpleDateFormat("yyyy-MM-dd").format(minDate));
					js.put("videourl", rS.getString("url"));
					int daydiff = (int)((rS.getDate("published_at").getTime() - minDate.getTime())/(1000L*60*60*24));
					js.put("daydiff", daydiff);
					jsArray.put(js);
				}
				((JSONObject)resultjs.get(0)).put("statistics", jsArray);
			}
			else
			{
				String s = " select sum(view_count) as views, sum(like_count) as likes, sum(dislike_count) as dislikes, sum(comment_count) as comments, channel_title ";
				s += " from video where category_name = ? group by channel_title";
				pstmt = dbConn.prepareStatement(s);
				pstmt.setString(1, channelTitle);
				rS = pstmt.executeQuery();
				JSONObject js ;
				int i = 0;
				while (rS.next())
				{
					((JSONObject)resultjs.get(i)).put("views", rS.getLong("views"));
					((JSONObject)resultjs.get(i)).put("likes", rS.getLong("likes"));
					((JSONObject)resultjs.get(i)).put("dislikes", rS.getInt("dislikes"));
					((JSONObject)resultjs.get(i)).put("comments", rS.getInt("comments"));
					((JSONObject)resultjs.get(i)).put("title", rS.getString("channel_title"));
					i++;
				}
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
		return resultjs.toString();
	}
	
	private List<Date> getMinMaxDateForChannelVideos(String channel)
	{
		List<Date> resultList = new ArrayList<Date>();
		try
		{
			String  s  = " SELECT MIN(DATE(PUBLISHED_AT)) as MINDATE, MAX(DATE(PUBLISHED_AT)) as MAXDATE FROM VIDEO WHERE CHANNEL_TITLE = ?";
			pstmt = dbConn.prepareStatement(s);
			pstmt.setString(1, channel);
			rS = pstmt.executeQuery();
			if (rS.next())
			{
				resultList.add(new java.util.Date(rS.getDate("MINDATE").getTime()));
				resultList.add(new java.util.Date(rS.getDate("MAXDATE").getTime()));
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
		return resultList;				
	}
	
	public String getVideosUploadedOverTime(String channelTitle, String category, boolean aggregateForCategory)
	{
		JSONObject js = new JSONObject();
		List<Date> resultList = getMinMaxDateForChannelVideos(channelTitle);
		Date minDate = resultList.get(0);
		Date maxDate = resultList.get(1);
		try
		{
			String s = " select video_title, date(published_at) as publishedat, "
					 + " ? as channeldate, "
					 + " DATEDIFF(date(published_at),?) as daysFromStart "
					 + " from video where channel_title  = ? order by publishedat";
			pstmt = dbConn.prepareStatement(s);
			pstmt.setDate(1, new java.sql.Date(minDate.getTime()));
			pstmt.setDate(2, new java.sql.Date(minDate.getTime()));
			pstmt.setString(3, channelTitle);
			rS = pstmt.executeQuery();
			js.put("startdate", new SimpleDateFormat("yyyy-MM-dd").format(minDate));
			js.put("enddate", new SimpleDateFormat("yyyy-MM-dd").format(maxDate));
			Map<Integer, int[]> timeFrame2VideoUploadCountListMap = new HashMap<Integer, int[]>();
			int session30 = (int)((maxDate.getTime() - minDate.getTime())/(1000L*60*60*24*30));
			int session90 = (int)((maxDate.getTime() - minDate.getTime())/(1000L*60*60*24*90));
			int session180 = (int)((maxDate.getTime() - minDate.getTime())/(1000L*60*60*24*180));
			int session365 = (int)((maxDate.getTime() - minDate.getTime())/(1000L*60*60*24*365));
			timeFrame2VideoUploadCountListMap.put(30, new int[session30 + 1]);
			timeFrame2VideoUploadCountListMap.put(90, new int[session90 + 1]);
			timeFrame2VideoUploadCountListMap.put(180, new int[session180 + 1]);
			timeFrame2VideoUploadCountListMap.put(365, new int[session365 + 1]);
			int days = 0;
			while (rS.next())
			{
				days = rS.getInt("daysFromStart");
				int intervalArr[] = timeFrame2VideoUploadCountListMap.get(30);
				session30 = days/30;
				intervalArr[session30]++;
				intervalArr = timeFrame2VideoUploadCountListMap.get(90);
				session90 = days/90;
				intervalArr[session90]++;
				intervalArr = timeFrame2VideoUploadCountListMap.get(180);
				session180 = days/180;
				intervalArr[session180]++;
				intervalArr = timeFrame2VideoUploadCountListMap.get(365);
				session365 = days/365;
				intervalArr[session365]++;
			}
			JSONArray jsArr = new JSONArray();
			JSONObject jsObj = new JSONObject();
			JSONArray countJsArr = new JSONArray();
			for (Map.Entry<Integer, int[]> entry : timeFrame2VideoUploadCountListMap.entrySet())
			{
				jsObj = new JSONObject();
				int key = entry.getKey();
				jsObj.put("timeframe",key);
				int[] valueArr = entry.getValue();
				countJsArr = new JSONArray(valueArr);
				jsObj.put("count", countJsArr);
				jsArr.put(jsObj);
			}
			js.put("statistics", jsArr);
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
		finally
		{
			close();
		}
		return js.toString();
	}
	
	public String getViewsPerLike(String channelTitle, String category, boolean aggregateForCategory)
	{
		if (!aggregateForCategory)
			return getViewsPerLike(channelTitle);
		else
		{
			String result = "";
			try 
			{
				List<Date> dateList = getMinMaxDateForChannelVideos(channelTitle);
				Date minDate = dateList.get(0);
				String s = " select (view_count)/like_Count as VPL, date(published_at) as publishedat, "
						 + " ? as channeldate, "
						 + " DATEDIFF(date(published_at),?) as daysFromStart "
						 + " from video where channel_title  = ? order by publishedat";
				pstmt = dbConn.prepareStatement(s);
				pstmt.setDate(1, new java.sql.Date(minDate.getTime()));
				pstmt.setDate(2, new java.sql.Date(minDate.getTime()));
				pstmt.setString(3, channelTitle);
				rS = pstmt.executeQuery();
				JSONObject js = new JSONObject();
				JSONArray jsArr = new JSONArray();
				while (rS.next())
				{
					js = new JSONObject();
					js.put("value", rS.getInt("VPL"));
					js.put("published", new SimpleDateFormat("yyyy-MM-dd").format(rS.getDate("publishedat")));
					js.put("channeldate", new SimpleDateFormat("yyyy-MM-dd").format(rS.getDate("channeldate")));
					js.put("daysfromstart", rS.getInt("daysFromStart"));
					jsArr.put(js);
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
	}
	
	private int getDuration(String str)
	{
		int duration = 0;
		int hour  = 0;
		int minute = 0;
		int second = 0;
		try {
			duration = Integer.parseInt(str);
			return duration;
		}
		catch (Exception e)
		{
			str = str.substring(2);
			if (str.indexOf("H") >= 0)
			{
				hour = Integer.parseInt(str.split("H")[0]);
				if (str.split("H").length > 1)
					str = str.split("H")[1];
			}
			if (str.indexOf("M") >= 0)
			{
				minute = Integer.parseInt(str.split("M")[0]);
				if (str.split("M").length > 1)
					str = str.split("M")[1];
			}
			if (str.indexOf("S") >= 0)
			{
				second = Integer.parseInt(str.split("S")[0]);
			}
		}
		return hour*60*60 + minute*60 + second;
	}
	
	public String getViewsPerLike(String channelTitle)
	{
		String result = "";
		try 
		{
			List<Date> minmaxDateList = getMinMaxDateForChannelVideos(channelTitle);
			Date minDate = minmaxDateList.get(0);
			String s = " select (view_count)/like_Count as VPL, date(published_at) as publishedat, "
					 + " ? as channeldate, "
					 + " DATEDIFF(date(published_at),?) as daysFromStart "
					 + " from video where channel_title  = ? order by publishedat";
			pstmt = dbConn.prepareStatement(s);
			pstmt.setDate(1, new java.sql.Date(minDate.getTime()));
			pstmt.setDate(2, new java.sql.Date(minDate.getTime()));
			pstmt.setString(3, channelTitle);
			rS = pstmt.executeQuery();
			JSONObject js = new JSONObject();
			JSONArray jsArr = new JSONArray();
			while (rS.next())
			{
				js = new JSONObject();
				js.put("value", rS.getInt("VPL"));
				js.put("published", new SimpleDateFormat("yyyy-MM-dd").format(rS.getDate("publishedat")));
				js.put("channeldate", new SimpleDateFormat("yyyy-MM-dd").format(rS.getDate("channeldate")));
				js.put("daysfromstart", rS.getInt("daysFromStart"));
				jsArr.put(js);
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

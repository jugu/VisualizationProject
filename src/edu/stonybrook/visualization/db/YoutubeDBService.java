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
	
	public String getVideosUploadedOverTime(String channelTitle, boolean aggregateForCategory)
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
	
	public String getViewsPerLike(String channelTitle, boolean aggregateForCategory)
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

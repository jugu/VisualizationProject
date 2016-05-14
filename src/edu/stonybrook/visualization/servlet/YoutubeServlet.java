package edu.stonybrook.visualization.servlet;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import edu.stonybrook.visualization.db.YoutubeDBService;

/**
 * Servlet implementation class YoutubeServlet
 */
public class YoutubeServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

    /**
     * Default constructor. 
     */
    public YoutubeServlet() {
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doPost(request, response);
	}
	
	private String processRequest (String view, String source, String category, String splom)
	{
		YoutubeDBService dbService = new YoutubeDBService();
		boolean checkAcrossCategory = false;
		if (view != null && source != null && category != null)
		{
			if (source.equals(category))
				checkAcrossCategory = true;
			if ("V1".equals(view))
				return dbService.getVideosUploadedOverTime(source, category, checkAcrossCategory);
			else if ("V2".equals(view))
				return dbService.getChannelTrend(source, category, checkAcrossCategory);
		}
		else if (splom != null)
		{
			return dbService.getChannelTrend(source, null, true);
		}
		return dbService.getViewsPerLike(source, category, checkAcrossCategory);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		String viewId =  request.getParameter("view");
		String sourceId  = request.getParameter("source");
		String categoryId  = request.getParameter("category");
		String splom = request.getParameter("splom");
		String output = processRequest(viewId, sourceId, categoryId, splom);
		PrintWriter pw = response.getWriter();
		pw.write(output);
	}

}

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
	
	private String processRequest (String view, String source, String category)
	{
		YoutubeDBService dbService = new YoutubeDBService();
		return dbService.getViewsPerLike(source);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		String viewId =  request.getParameter("view");
		String sourceId  = request.getParameter("source");
		String categoryId  = request.getParameter("category");
		String output = processRequest(viewId, sourceId, categoryId);
		PrintWriter pw = response.getWriter();
		pw.write(output);
	}

}

var selectedTrend = 'views'
var combinedOrParallel = 'combined' 
function slider(min, max,step, margin)
{
	var range = document.getElementById('range');

	noUiSlider.create(range, {
		start: [ 20, 80 ], // Handle start position
		step: 10, // Slider moves in increments of '10'
		margin: 20, // Handles must be more than '20' apart
		connect: true, // Display a colored bar between the handles
		direction: 'ltr', // Put '0' at the bottom of the slider
		orientation: 'horizontal', // Orient the slider vertically
		behaviour: 'tap-drag', // Move handle on tap, bar is draggable
		range: { // Slider can select '0' to '100'
			'min': 0,
			'max': 100
		},
		pips: { // Show a scale with the slider
			mode: 'steps',
			density: 2
		}
	});
	
	var valueInput = document.getElementById('value-input')
	// When the slider value changes, update the input and span
	range.noUiSlider.on('update', function( values, handle ) {
		if ( handle ) {
			valueInput.value = values[handle];
		}
	});
	
	// When the input changes, set the slider value
	valueInput.addEventListener('change', function(){
		range.noUiSlider.set([null, this.value]);
	});

}
function channelTrend(obj)
{
	$("#divTimeFrame").css('display',"none");
	var jsobj = JSON.parse(obj);
	var categoryView = false;
	if (jsobj.length == 1)
		jsobj = jsobj[0]
	else
		categoryView = true;
	var text =  jsobj.title + " channel has " + jsobj.subscribers + " subscribers, "
	          + jsobj.views + " views, and "
	          + jsobj.videos + " videos ";
	$("#chart").html(text);
	data = jsobj;	
	if (categoryView)
	{
		$("#channeltrend").css('display','none');
		$("#trendFrame").css('display','none');
		$("#categorytrend").css('display','block');
		if (combinedOrParallel == 'combined')
		{
			$("#combinedview").css('backgroundColor', '#ffa500');
			$("#parallelview").css('backgroundColor', 'white');
			loadCategoryView(data)
		}
		else
		{
			$("#combinedview").css('backgroundColor', 'white');
			$("#parallelview").css('backgroundColor', '#ffa500');
			loadParallelCoordinates(data)
		}

		$("#combinedview").click(function(){
			$("#combinedview").css('backgroundColor', '#ffa500');
			$("#parallelview").css('backgroundColor', 'white');
			combinedOrParallel = 'combined'
			loadCategoryView(data);
		})
		$("#parallelview").click(function(){
			$("#combinedview").css('backgroundColor', 'white');
			$("#parallelview").css('backgroundColor', '#ffa500');
			combinedOrParallel = 'parallel'
			loadParallelCoordinates(data)
		})
	}
	else
	{
		resetbuttons(selectedTrend);
		if (combinedOrParallel == 'combined')
		{
			if (selectedTrend == 'Video Quality')
				quadrantchart(data.statistics);
			else
			{
				loadChannelViewBetter(data.statistics, selectedTrend);
			}
		}
		else
		{
			$("#trendFrame").css('display','none');
			$("#combinedviewchannel").css('backgroundColor', 'white');
			$("#parallelviewchannel").css('backgroundColor', '#ffa500');
			loadParallelCoordinates(data.statistics)
		}
		$("#combinedviewchannel").click(function(){
			combinedOrParallel = 'combined'
			$("#trendFrame").css('display','block');
			$("#combinedviewchannel").css('backgroundColor', '#ffa500');
			$("#parallelviewchannel").css('backgroundColor', 'white');
			if (selectedTrend == 'Video Quality')
				quadrantchart(data.statistics);
			else
			{
				loadChannelViewBetter(data.statistics, selectedTrend);
			}
		})
		$("#parallelviewchannel").click(function(){
			combinedOrParallel = 'parallel'
			$("#trendFrame").css('display','none');
			$("#combinedviewchannel").css('backgroundColor', 'white');
			$("#parallelviewchannel").css('backgroundColor', '#ffa500');
			loadParallelCoordinates(data.statistics)
		})
	}
}

function resetbuttons(selView)
{
	//alert('here')
	$("#trendFrame").css('display','block');
	$("#channeltrend").css('display','block');
	$("#combinedviewchannel").css('backgroundColor', '#ffa500');
	$("#parallelviewchannel").css('backgroundColor', 'white');
	$("#categorytrend").css('display','none');
	$("#trendFrame input").css('backgroundColor', 'white');
	if (selView == 'views')
		$("#viewtrend").css('backgroundColor', '#ffa500');
	if (selView == 'likes')
		$("#liketrend").css('backgroundColor', '#ffa500');
	if (selView == 'dislikes')
		$("#disliketrend").css('backgroundColor', '#ffa500');
	if (selView == 'views per like')
		$("#viewsperliketrend").css('backgroundColor', '#ffa500');
	if (selView == 'likes per dislike')
		$("#likesperdisliketrend").css('backgroundColor', '#ffa500');
	if (selView == 'duration')
		$("#durationtrend").css('backgroundColor', '#ffa500');
	if (selView == 'Video Quality')
		$("#videoquality").css('backgroundColor', '#ffa500');
	$("#ratio").html("")
}

function process(view)
{
	selectedTrend = view;
	resetbuttons(selectedTrend);
	if (view == 'Video Quality')
		quadrantchart(data.statistics);
	else
		loadChannelViewBetter(data.statistics, view);
}


var legendFilterChannel = {
		"views":{"val":true,"cls":"showlegend"},
		"likes":{"val":true,"cls":"showlegend"},
		"dislikes":{"val":true,"cls":"showlegend"},
		"comments":{"val":true,"cls":"showlegend"},
		"date":{"val":true,"cls":"showlegend"},
}

function quadrantchart(dataoriginal)
{
	var parseDate = d3.time.format("%Y-%m-%d").parse;	
	var setup= {};
	setup.width=$("#chart").width();
	setup.height=500;
	setup.dotRadius=4;
	setup.xlabel = 'Likes per Dislike'
	setup.ylabel = 'Views per Like'
	$("#chart").html('');
	var data = jQuery.extend(true, [], dataoriginal);
	var totalA = 0
	var totalB = 0
	var valid = 0
	var dataarray = []
	data.forEach(function(d) {
	    d.date = parseDate(d.videodate);
	    if (d.likes > 0)
	    	d['views per like'] = d.views/d.likes;
	    else
	    	d['views per like'] = 0;
	    if (d.dislikes > 0)
	    	d['likes per dislike'] = d.likes/d.dislikes;
	    else
	    	d['likes per dislike'] = 0;
	});
	for (var i = 0; i < data.length; i++)
	{
		if (data[i]['likes'] > 0 && data[i]['dislikes'] > 0)
		{
			totalA += data[i]['likes per dislike']
			totalB += data[i]['views per like']
			valid++;
			dataarray.push({"url":data[i]['videourl'],"label":data[i]['videotitle'],"x":data[i]['likes per dislike'], "y":data[i]['views per like'], 'Z':data[i]['videotitle']})
		}
	}
	var likeDislikeRatio = Math.round(totalA/valid);
	var viewLikeRatio =Math.round(totalB/valid);
	setup.quadrantxaxis = likeDislikeRatio
	setup.quadrantyaxis = viewLikeRatio;
	setup.quadrantaxiscolor = 'blue'
	createQuadrantChart('chart', dataarray, setup)
}

var parseDate = d3.time.format("%Y-%m-%d").parse;

function loadChannelViewBetter(dataoriginal, selView)
{
	var data = jQuery.extend(true, [], dataoriginal);
	minViews = 10000000
	maxViews = 0
	data.forEach(function(d) {
	    d.date = parseDate(d.videodate);
	    if (d.likes > 0)
	    	d['views per like'] = d.views/d.likes;
	    else
	    	d['views per like'] = 0;
	    if (d.dislikes > 0)
	    	d['likes per dislike'] = d.likes/d.dislikes;
	    else
	    	d['likes per dislike'] = 0;
	    if (minViews > d.views)
	    	minViews = d.views
	    if (maxViews < d.views)
	    	maxViews = d.views
	    
	});	
	//alert(minViews + ' ' + maxViews)
		
	if (selView == 'likes per dislike' || selView == 'views per like' || selView == 'duration')
	{
		var totalA = 0
		var totalB = 0
		var valid = 0
		var totalC = 0;
		for (var i = 0; i < data.length; i++)
		{
			if (data[i]['likes'] > 0 && data[i]['dislikes'] > 0)
			{
				totalA += data[i]['likes per dislike']
				totalB += data[i]['views per like']
				valid++;
			}
			totalC += data[i]['duration']
		}
		var likeDislikeRatio = Math.round(totalA/valid);
		var viewLikeRatio =Math.round(totalB/valid);
		var dura = Math.round(totalC/data.length);
		if (selView == 'likes per dislike' )
			$("#ratio").html('Average Ratio : ' +likeDislikeRatio);
		else if (selView == 'views per like' )
			$("#ratio").html('Average Ratio : ' +viewLikeRatio);
		else
			$("#ratio").html('Average video duration : '  + dura + ' seconds');
	}
	else {
		$("#ratio").html('');
	}

	$("#chart").html("");
	var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = $("#chart").width() - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
	var svg = d3.select("#chart").append("svg")
	 .attr("width", width + margin.left + margin.right)
	 .attr("height", height + margin.top + margin.bottom)
	 .datum(generateData(data, selView));
	
	var chart = d3LineWithLegend()
               .xAxis.label('Day of Video Upload relative to first video')
               .yAxis.label('metric value');

     svg.transition().duration(500)
	     .call(chart);
     
     chart.dispatch.on('showTooltip', function(e) {
    	  var offset = $('#chart').offset(), // { left: 0, top: 0 }
    	        left = e.pos[0] + offset.left,
    	        top = e.pos[1] + offset.top;

    	    var content = '<h3>' + e.point[2] + '</h3>' +
    	                  '<p>' +
    	                  '<iframe id="video" width="400" height="200" src="https://www.youtube.com/embed/'+e.point[3]+'?autoplay=1&rel=0&wmode=Opaque&enablejsapi=1" frameborder="0"></iframe>'+
    	                  '</p>';

    	    nvtooltip.show([left, top], content);
     });
     chart.dispatch.on('hideTooltip', function(e) {
    	 stopVideo($('#video'));
    	 nvtooltip.cleanup();
     });
     //slider(0, 100,10, 20)
   $(window).resize(function() {
	   var margin = chart.margin();

	   chart
	     .width(widthmod(margin))
	     .height(heightmod(margin));

	   d3.select('#chart svg')
	     .attr('width', widthmod(margin))
	     .attr('height', heightmod(margin))
	     .call(chart);

	   });

     function widthmod(margin) {
	   var w = $("#chart").width() - 20;

	   return ( (w - margin.left - margin.right - 20) < 0 ) ? margin.left + margin.right + 2 : w;
	 }

	 function heightmod(margin) {
	   var h = $("#chart").height() - 20;

	   return ( h - margin.top - margin.bottom - 20 < 0 ) ? 
	             margin.top + margin.bottom + 2 : h;
	 }
	 //data
	 function generateData(data, selView) {
	   var pushdata = []
	   for (var i = 0; i < data.length; i++)
		{
		   if (data[i][selView] != '')
			   pushdata.push([data[i].daydiff, parseInt(data[i][selView]),data[i].videotitle, data[i].videourl]);
		}
	   var retdata = [
	         	     {
	         		       data: pushdata,
	         		       label: selView
	         		     }
	         		   ];
	   return  retdata
	 }	 
}

var legendFilter = {
		"views":{"val":true,"cls":"showlegend"},
		"likes":{"val":true,"cls":"showlegend"},
		"dislikes":{"val":true,"cls":"showlegend"},
		"comments":{"val":true,"cls":"showlegend"},
		"subscribers":{"val":true,"cls":"showlegend"},
		"videos":{"val":true,"cls":"showlegend"},
		"title":{"val":false,"cls":"showlegend"}
}

function loadCategoryView(dataoriginal)
{
	var data = jQuery.extend(true, [], dataoriginal);
	$("#chart").html("");
	var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = $("#chart").width() - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

	var x0 = d3.scale.ordinal().rangeRoundBands([0, width], .1);

	var x1 = d3.scale.ordinal();
	
	var y = d3.scale.linear().range([height, 0]);
	
	var color = d3.scale.category10();
	
	var xAxis = d3.svg.axis().scale(x0).orient("bottom");
	
	var yAxis = d3.svg.axis()
	    .scale(y).orient("left").tickFormat(d3.format(".2s"));
	var svg = d3.select("#chart").append("svg")
	    	 .attr("width", width + margin.left + margin.right)
	    	 .attr("height", height + margin.top + margin.bottom)
	    	 .append("g")
	    	 .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	var countNames = d3.keys(data[0]).filter(function(key) { return key != "title" && key != 'category'});
	
	 data.forEach(function(d) {
	    d.counts = countNames.map(function(name) { return {name: name, value: +d[name]}; });
	  });
	
	  x0.domain(data.map(function(d) { return d.title; }));
	  x1.domain(countNames).rangeRoundBands([0, x0.rangeBand()]);
	  y.domain([0, d3.max(data, function(d) { return d3.max(d.counts, function(d) { if (legendFilter[d.name].val) return d.value; else return 0}); })]);

	  svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);
	
	  svg.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)
	    .append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text("counts");
	
	  var state = svg.selectAll("#chart")
	      .data(data)
	    .enter().append("g")
	      .attr("class", "state")
	      .attr("transform", function(d) { return "translate(" + x0(d.title) + ",0)"; });
	
	  state.selectAll("rect")
	      .data(function(d) { return d.counts; })
	    .enter().append("rect")
	      .attr("width", x1.rangeBand())
	      .attr("x", function(d) {  return x1(d.name); })
	      .attr("y", function(d) { if (legendFilter[d.name]['val']) return y(d.value); else return 0})
	      .attr("height", function(d) { if (legendFilter[d.name].val) return height - y(d.value);  else return 0 })
	      .style("fill", function(d) { return color(d.name); })
	      .on('mouseover', function (d, i) {
	    	  if (legendFilter[d.name].val)
	    	  {
	        	  var offset = $('#chart').offset(), // { left: 0, top: 0 }
	    	        left = d3.event.pageX,
	    	        top = y(d.value) + offset.top + 20,
	    	        content = '<div>'+d.name+': '+d3.format(".2s")(d.value)+'</div>';
	    	  }})
	      .attr("x", function(d) { return x1(d.name); })
	      .attr("y", function(d) { if (legendFilter[d.name]['val']) return y(d.value); else return 0})
	      .attr("height", function(d) { if (legendFilter[d.name].val) return height - y(d.value);  else return 0 })
	      .style("fill", function(d) { return color(d.name); })
	      .on('mouseover', function (d) {
	    	  if (legendFilter[d.name].val)
	    	  {
	        	  var offset = $('#chart').offset(), // { left: 0, top: 0 }
	        	  left = d3.event.pageX,
	    	        top = y(d.value),
	    	        content = '<div>'+d.name+': '+d3.format(".2s")(d.value)+'</div>';
	    		  nvtooltip.show([left, top], content);
	    	  }
	      })
	      .on('mouseout', function () { nvtooltip.cleanup()});
	
	  var legend = svg.selectAll(".legend")
	      .data(countNames.slice().reverse())
	      .enter().append("g")
	      .attr("class", function(d) { return legendFilter[d]['cls']})
	      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })
	      .on("click", function(d){
	    	  if(legendFilter[d].val)
	    	  {
	    		  legendFilter[d].val = false;
	    	  	  legendFilter[d].cls = 'unselectlegend';
	    	  }
	    	  else
	    	  {
	    		  legendFilter[d].val = true;
	    		  legendFilter[d].cls = 'showlegend';
	    	  }
	    	  loadCategoryView(dataoriginal);
	      });
	
	  legend.append("rect")
	      .attr("x", width - 2)
	      .attr("width", 18)
	      .attr("height", 18)
	      .style("fill", color);
	
	  legend.append("text")
	      .attr("x", width - 8)
	      .attr("y", 9)
	      .attr("dy", ".35em")
	      .style("text-anchor", "end")
	      .text(function(d) { return d; });
}

function loadParallelCoordinates(data)
{
	$("#chart").html('')
	var margin = {top: 30, right: 10, bottom: 10, left: 10},
    width = $("#chart").width() - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

	var x = d3.scale.ordinal().rangePoints([0, width], 1),
	    y = {},
	    dragging = {};

	var line = d3.svg.line(),
	    axis = d3.svg.axis().orient("left"),
	    background,
	    foreground;
	var svg = d3.select("#chart").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	  // Extract the list of dimensions and create a scale for each.
	  x.domain(dimensions = d3.keys(data[0]).filter(function(d) {
	    return d != "category" && d != "title" && d != "videotitle" && d != "videourl" && d != "startdate" && d != "videodate" && (y[d] = d3.scale.linear()
	        .domain(d3.extent(data, function(p) { return +p[d]; }))
	        .range([height, 0]));
	  }));
	
	  // Add grey background lines for context.
	  background = svg.append("g")
	      .attr("class", "background")
	    .selectAll("path")
	      .data(data)
	    .enter().append("path")
	      .attr("d", path);
	
	  // Add blue foreground lines for focus.
	  foreground = svg.append("g")
	      .attr("class", "foreground")
	    .selectAll("path")
	      .data(data)
	    .enter().append("path")
	      .attr("d", path).on("mouseover", function(d){
	    	  var offset = $('#chart').offset(), // { left: 0, top: 0 }
  	          left = event.clientX,
  	          top = event.clientY;
	    	  var txt = '';
	    	  if (d.title)
	    		  txt = d.title
	    	  else
	    		  txt = d.videotitle
	    	  var content = '<h3>' + txt + '</h3>';
	    	  nvtooltip.show([left, top], content);
	      }).on("mouseout", function (){nvtooltip.cleanup();});
	
	  // Add a group element for each dimension.
	  var g = svg.selectAll(".dimension")
	      .data(dimensions)
	    .enter().append("g")
	      .attr("class", "dimension")
	      .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
	      .call(d3.behavior.drag()
	        .origin(function(d) { return {x: x(d)}; })
	        .on("dragstart", function(d) {
	          dragging[d] = x(d);
	          background.attr("visibility", "hidden");
	        })
	        .on("drag", function(d) {
	          dragging[d] = Math.min(width, Math.max(0, d3.event.x));
	          foreground.attr("d", path);
	          dimensions.sort(function(a, b) { return position(a) - position(b); });
	          x.domain(dimensions);
	          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
	        })
	        .on("dragend", function(d) {
	          delete dragging[d];
	          transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
	          transition(foreground).attr("d", path);
	          background
	              .attr("d", path)
	            .transition()
	              .delay(500)
	              .duration(0)
	              .attr("visibility", null);
	        }));
	
	  // Add an axis and title.
	  g.append("g")
	      .attr("class", "axis")
	      .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
	    .append("text")
	      .style("text-anchor", "middle")
	      .attr("y", -9)
	      .text(function(d) { return d; });
	
	  // Add and store a brush for each axis.
	  g.append("g")
	      .attr("class", "brush")
	      .each(function(d) {
	        d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush));
	      })
	    .selectAll("rect")
	      .attr("x", -8)
	      .attr("width", 16);
	//});
	
	function position(d) {
	  var v = dragging[d];
	  return v == null ? x(d) : v;
	}
	
	function transition(g) {
	  return g.transition().duration(500);
	}
	
	// Returns the path for a given data point.
	function path(d) {
	  return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
	}
	
	function brushstart() {
	  d3.event.sourceEvent.stopPropagation();
	}
	
	// Handles a brush event, toggling the display of foreground lines.
	function brush() {
	  var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
	      extents = actives.map(function(p) { return y[p].brush.extent(); });
	  foreground.style("display", function(d) {
	    return actives.every(function(p, i) {
	      return extents[i][0] <= d[p] && d[p] <= extents[i][1];
	    }) ? null : "none";
	  });
	}
}

function loadsplomdata()
{
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			loadScatterPlotMatrix(JSON.parse(xhttp.responseText));
		}
	};
	xhttp.open("GET", "youtube?splom=1", true);
	xhttp.send();
}

function loadScatterPlotMatrix(data)
{
	$("#chart").html("")
	var width = $("#chart").width(),
	    size = 120,
	    padding = 30,
	    legendspace = 150;

	var x = d3.scale.linear()
	    .range([padding / 2, size - padding / 2]);

	var y = d3.scale.linear()
	    .range([size - padding / 2, padding / 2]);

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom")
	    .ticks(6).tickFormat(d3.format(".2s"))

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left")
	    .ticks(6).tickFormat(d3.format(".2s"))

	var color = d3.scale.category10();
	//d3.csv("flowers.csv", function(error, data) {
	  //if (error) throw error;
	  var domainByTrait = {},
	      traits = d3.keys(data[0]).filter(function(d) { 
	    	  			return d !== "category" && d !== "title"; }),
	      n = traits.length;

	  traits.forEach(function(trait) {
	    domainByTrait[trait] = d3.extent(data, function(d) { return d[trait]; });
	  });

	  xAxis.tickSize(size * n);
	  yAxis.tickSize(-size * n);

	  var brush = d3.svg.brush()
	      .x(x)
	      .y(y)
	      .on("brushstart", brushstart)
	      .on("brush", brushmove)
	      .on("brushend", brushend);

	  var svgparent = d3.select("#chart").append("svg")
			  .attr("width", size * n + padding + legendspace)
			  .attr("height", size * n + padding + legendspace)
			.append("g")
			  .attr("transform", "translate(" + 0 + "," + 0 + ")");
	  
	  
	  var svg = svgparent.append("svg")
	      .attr("width", size * n + padding)
	      .attr("height", size * n + padding)
	    .append("g")
	      .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

	  svg.selectAll(".x.axis")
	      .data(traits)
	    .enter().append("g")	    
	      .attr("class", "x axis")
	      .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
	      .each(function(d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); });

	  svg.selectAll(".y.axis")
	      .data(traits)
	    .enter().append("g")
	      .attr("class", "y axis")
	      .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
	      .each(function(d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });

	  var cell = svg.selectAll(".cell")
	      .data(cross(traits, traits))
	    .enter().append("g")
	      .attr("class", "cell")
	      .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
	      .each(plot);

	  // Titles for the diagonal.
	  cell.filter(function(d) { return d.i === d.j; }).append("text")
	      .attr("x", padding)
	      .attr("y", padding)
	      .attr("dy", ".71em")
	      .text(function(d) { return d.x; });

	  cell.call(brush);

	  function plot(p) {
	    var cell = d3.select(this);

	    x.domain(domainByTrait[p.x]);
	    y.domain(domainByTrait[p.y]);

	    cell.append("rect")
	        .attr("class", "frame")
	        .attr("x", padding / 2)
	        .attr("y", padding / 2)
	        .attr("width", size)
	        .attr("height", size);

	    cell.selectAll("circle")
	        .data(data)
	      .enter().append("circle")
	        .attr("cx", function(d) { return x(d[p.x]); })
	        .attr("cy", function(d) { return y(d[p.y]); })
	        .attr("r", 4)
	        .style("fill", function(d) { return color(d.category); })
	        .on("mouseover", function(d){
	        	var left = event.clientX,
	  	          top = event.clientY + 15;
	        	var content = d.category
	        	nvtooltip.show([left, top], content);
	        })
	        .on("mouseout", function() {
	        	nvtooltip.cleanup();
	        });
	  }

	  var brushCell;
	  // Clear the previously-active brush, if any.
	  function brushstart(p) {
	    if (brushCell !== this) {
	      d3.select(brushCell).call(brush.clear());
	      x.domain(domainByTrait[p.x]);
	      y.domain(domainByTrait[p.y]);
	      brushCell = this;
	    }
	  }

	  // Highlight the selected circles.
	  function brushmove(p) {
	    var e = brush.extent();
	    svg.selectAll("circle").classed("hidden", function(d) {
	      return e[0][0] > d[p.x] || d[p.x] > e[1][0]
	          || e[0][1] > d[p.y] || d[p.y] > e[1][1];
	    });
	  }

	  // If the brush is empty, select all circles.
	  function brushend() {
	    if (brush.empty()) svg.selectAll(".hidden").classed("hidden", false);
	  }

	  d3.select(self.frameElement).style("height", size * n + padding + 20 + "px");
	//});

	function cross(a, b) {
	  var c = [], n = a.length, m = b.length, i, j;
	  for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
	  return c;
	}
	var countNames = [];
	data.forEach(function(d) {
		 if (countNames.indexOf(d.category) < 0)
			 countNames.push(d.category)
	  });
	var legend = svgparent.selectAll(".legend")
    .data(countNames.slice().reverse())
    .enter().append("g")
    .attr("class","legend")
    .attr("transform", function(d, i) { return "translate("+0+"," + i*30 + ")"; })

	legend.append("rect")
	    .attr("x", 860)
	    .attr("width", 20)
	    .attr("height", 15)
	    .style("fill", color);
	
	legend.append("text")
	    .attr("x", 850)
	    .attr("y", 15)
	    .attr("height", 15)
	    .style("text-anchor", "end")
	    .text(function(d) { return d; });
}
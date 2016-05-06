var selectedTrend = 'views'
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
		$("#trendFrame").css('display','none');
		//loadCategoryView(data)
		loadCategoryView(data)
	}
	else
	{
		resetbuttons(selectedTrend);
		if (selectedTrend == 'Video Quality')
			quadrantchart(data.statistics);
		else
		{			
			loadChannelViewBetter(data.statistics, selectedTrend);
		}
	}
}

function resetbuttons(selView)
{
	$("#trendFrame").css('display','block');
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
	//slider(0, 100,10, 20)
	var data = jQuery.extend(true, [], dataoriginal);	
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
               .xAxis.label('Days from Channel Inaugration (for video upload)')
               .yAxis.label('metric value');

     svg.transition().duration(500)
	     .call(chart);
     
     chart.dispatch.on('showTooltip', function(e) {
    	  var offset = $('#chart').offset(), // { left: 0, top: 0 }
    	        left = e.pos[0] + offset.left,
    	        top = e.pos[1] + offset.top;

    	    var content = '<h3>' + e.series.label + '</h3>' +
    	                  '<p>' +
    	                  '<iframe id="video" width="400" height="200" src="https://www.youtube.com/embed/'+e.point[3]+'?autoplay=1&rel=0&wmode=Opaque&enablejsapi=1" frameborder="0"></iframe>'+
    	                  '</p>';

    	    nvtooltip.show([left, top], content);
     });

     chart.dispatch.on('hideTooltip', function(e) {
    	 stopVideo($('#video'));
    	 nvtooltip.cleanup();
     });
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
	var countNames = d3.keys(data[0]).filter(function(key) { return key != "title" });
	
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
	      .attr("x", function(d) { return x1(d.name); })
	      .attr("y", function(d) { if (legendFilter[d.name]['val']) return y(d.value); else return 0})
	      .attr("height", function(d) { if (legendFilter[d.name].val) return height - y(d.value);  else return 0 })
	      .style("fill", function(d) { return color(d.name); })
	      .on('mouseover', function (d) {
	    	  if (legendFilter[d.name].val)
	    	  {
	        	  var offset = $('#chart').offset(), // { left: 0, top: 0 }
	    	        left = x1(d.name) + offset.left,
	    	        top = y(d.value) + offset.top,
	    	        content = '<div>jugu</div>';
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

function loadParallelCoordinates()
{
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

d3.csv("cars.csv", function(error, cars) {

  // Extract the list of dimensions and create a scale for each.
  x.domain(dimensions = d3.keys(cars[0]).filter(function(d) {
    return d != "name" && (y[d] = d3.scale.linear()
        .domain(d3.extent(cars, function(p) { return +p[d]; }))
        .range([height, 0]));
  }));

  // Add grey background lines for context.
  background = svg.append("g")
      .attr("class", "background")
    .selectAll("path")
      .data(cars)
    .enter().append("path")
      .attr("d", path);

  // Add blue foreground lines for focus.
  foreground = svg.append("g")
      .attr("class", "foreground")
    .selectAll("path")
      .data(cars)
    .enter().append("path")
      .attr("d", path);

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
});

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
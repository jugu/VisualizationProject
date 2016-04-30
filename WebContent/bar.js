var width = 1000, height = 450, padding = 20;
var fontFamily = 'verdana';
var barFillColor = 'steelblue';
var barFocusColor = 'yellow';
var strokeColor = '#F00226';
var noOfBins = 32;
var toolTipBackground = '#FFF';
var binVariables = [ 0, 1, 2 ], chartIndex = 0;
var pieData = [], forceData = [];
var pieDataColor = '#FFF';
var HTTP = 0, QUIC = 1, HTTP2 = 2, SPDY = 3;
var jsonData, rawJson;
;
function pieNew() {
	var pieTextAlign = 'middle', pieWidth = 100, pieHeight = 100, pieRadius = 50;
	$('#chart').html("");
	var data = [ [ 2752, 382 ], [ 79, 471 ], [ 1230, 239 ] ];

	var pieColors = d3.scale.ordinal().domain(
			[ 0, 0.25 * pieData.length, 0.5 * pieData.length,
					0.75 * pieData.length, pieData.length ]).range(
			[ '#F4D03E', '#4FBA6F', '#EF4836', '#52B3D9', '#FCBC0B', '#9DBFDC',
					'#F58033' ]);

	var arc = d3.svg.arc().outerRadius(pieRadius).innerRadius(pieRadius - 20);

	var pieChart = d3.layout.pie().value(function(d) {
		return d[0];
	});

	var svg = d3.select('#chart').append('svg').attr('id', 'piechart').attr(
			'width', pieWidth + 50).attr('height', pieHeight);

	var container = svg.append('g').attr(
			'transform',
			'translate(' + (pieWidth - pieRadius) + ', '
					+ (pieHeight - pieRadius) + ')');

	container.selectAll('path').data(pieChart(data)).enter().append('g').attr(
			'class', 'slice');

	d3.selectAll('g.slice').append('path').attr('d', 0).style('fill',
			function(d, i) {
				return pieColors(i);
			}).style('stroke', '#FFF').transition().duration(300).delay(300)
			.attr('d', arc).ease('bounce');

	d3.selectAll('g.slice').append('text').text(function(d, i) {
		return d.data[0];
	}).attr('transform', function(d) {
		return 'translate(' + arc.centroid(d) + ')';
	}).style('fill', pieDataColor).style('text-anchor', pieTextAlign).style(
			'font-family', fontFamily);

}

function type(d) {
	d.apples = +d.apples;
	d.oranges = +d.oranges;
	return d;
}

// Store the displayed angles in _current.
// Then, interpolate from _current to the new angles.
// During the transition, _current is updated in-place by d3.interpolate.
function arcTween(a) {
	var i = d3.interpolate(this._current, a);
	this._current = i(0);
	return function(t) {
		return arc(i(t));
	};
}

function drawgraph() {
	var Obj = jsonData;
	$("#chart").html("");
	var m = [ 80, 80, 80, 80 ]; // margins
	var w = 800 - m[1] - m[3]; // width
	var h = 400 - m[0] - m[2]; // height

	var color = d3.scale.category10();
	var lineList = [], dataList = [];
	var max = 0, length = 0, tempList, maxSize = 0;
	for (var i = 0; i < Obj.length; i++) {
		tempList = Obj[i].fthroughputEverySec;
		length = tempList.length;
		if (length == 0)
			continue;
		maxSize = maxSize >= length ? maxSize : length;
		for (var j = 0; j < length; j++) {
			max = max >= tempList[j] ? max : tempList[j];
		}
		dataList.push(tempList);
	}

	var x = d3.scale.linear().domain([ 0, maxSize ]).range([ 0, w ]);
	var y = d3.scale.linear().domain([ 0, max ]).range([ h, 0 ]);
	for (var i = 0; i < dataList.length; i++) {
		tempList = dataList[i];
		var line = d3.svg.line().interpolate("basis").x(function(d, i) {
			return x(i);
		}).y(function(d) {
			return y(d);
		});
		lineList.push(line);
	}
	var graph = d3.select("#chart").append("svg:svg").attr("width",
			w + m[1] + m[3]).attr("height", h + m[0] + m[2]).append("svg:g")
			.attr("transform", "translate(" + m[3] + "," + m[0] + ")");
	var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(1);
	graph.append("svg:g").attr("class", "x axis").attr("transform",
			"translate(0," + h + ")").call(xAxis);
	var yAxisLeft = d3.svg.axis().scale(y).ticks(6).orient("left");
	graph.append("svg:g").attr("class", "y axis").attr("transform",
			"translate(-10,0)").call(yAxisLeft).append("text").attr(
			"transform", "rotate(-90)").attr("y", -50).style("text-anchor",
			"end").text("Throughput");
	graph.append("text").attr("text-anchor", "middle") // this makes it easy to
	// centre the text as
	// the transform is
	// applied to the anchor
	.attr("transform", "translate(" + (w / 2) + "," + (h + 25) + ")") // centre
	// below
	// axis
	.text("Time (s)");
	var k = 0;
	for (var i = 0; i < lineList.length; i++) {
		graph.append("svg:path").attr("d", lineList[i](dataList[i])).attr(
				'stroke', function(d, j) {
					return color(k++);
				});
	}
}

function httpVsQuicInPackets(index) {
	var Obj = jsonData;
	var pieTextAlign = 'middle', pieWidth = 350, pieHeight = 350, pieRadius = 175;
	$("#chart").html("");
	var quic = 0, http = 0, http2 = 0, spdy = 0;
	var maxSize = 0, fDirPacketList = [], fdir, fdirList = [], length = 0, dataList = [];

	for (var i = 0; i < Obj.length; i++) {
		if(index !== i)
			continue;
		fdir = Obj[i].rdir;
		length = fdir.length;
		if (length == 0)
			continue;
		maxSize = maxSize >= length ? maxSize : length;
		for (var j = 0; j < length; j++) {
			var type = fdir[j].packetType;
			if (type == HTTP)
				++http;
			else if (type == QUIC)
				++quic;
			else if (type == HTTP2)
				++http2;
			else if (type == SPDY)
				++spdy;
		}
		// dataList.push([http, quic, http2, spdy]);

		fdir = Obj[i].fdir;
		length = fdir.length;
		if (length == 0)
			continue;
		maxSize = maxSize >= length ? maxSize : length;
		for (var j = 0; j < length; j++) {
			var type = fdir[j].packetType;
			if (type == HTTP)
				++http;
			else if (type == QUIC)
				++quic;
			else if (type == HTTP2)
				++http2;
			else if (type == SPDY)
				++spdy;
		}
		dataList.push([ http, quic, http2, spdy ]);
	}

	var pieColors = d3.scale.ordinal().domain(
			[ 0, 0.25 * pieData.length, 0.5 * pieData.length,
					0.75 * pieData.length, pieData.length ]).range(
			[ '#F58033', '#4FBA6F', '#EF4836', '#F4D03E' ]);

	for (var i = 0; i < dataList.length; i++) {
		var data = dataList[i];
		var arc = d3.svg.arc().outerRadius(pieRadius).innerRadius(
				pieRadius - 50);

		var pieChart = d3.layout.pie().value(function(d) {
			return d;
		});

		var svg = d3.select('#chart').append('svg').attr('id', 'piechart')
				.attr('width', pieWidth + 90).attr('height', pieHeight);

		var container = svg.append('g').attr(
				'transform',
				'translate(' + (pieWidth - pieRadius) + ', '
						+ (pieHeight - pieRadius) + ')');

		container.selectAll('path').data(pieChart(data)).enter().append('g')
				.attr('class', 'slice');

		d3.selectAll('g.slice').append('path').attr('d', 0).style('fill',
				function(d, i) {
					return pieColors(i);
				}).style('stroke', '#FFF').transition().duration(300)
				.delay(300).attr('d', arc).ease('bounce');

		d3.selectAll('g.slice').append('text').text(function(d, i) {
			return d.data;
		}).attr('transform', function(d) {
			return 'translate(' + arc.centroid(d) + ')';
		}).style('fill', pieDataColor).style('text-anchor', pieTextAlign)
				.style('font-family', fontFamily);
		var legendRectSize = 18;
		var legendSpacing = 4;
		var legend = svg.selectAll('.legend').data(pieChart(data)).enter()
				.append('g').attr('class', 'legend')
				.attr('transform', function(d, i) {
					var height = legendRectSize + legendSpacing;
					var offset = height * pieColors.domain().length / 2;
					var horz = -2 * legendRectSize;
					var vert = i * height - offset;
					return 'translate(0,0)';
				});
		legend.append('rect').attr('width', legendRectSize).attr('height',
				legendRectSize).style('fill', function(d, i) {
			return pieColors(i);
		}).style('stroke', function(d, i) {
			return pieColors(i);
		}).attr('x', (2 * pieRadius)).attr('y', function(d, i) {
			return legendRectSize - legendSpacing + (i * 21);
		});
		legend.append('text').attr('x',
				(2 * pieRadius) + legendRectSize + legendSpacing).attr('y',
				function(d, i) {
					return legendRectSize + legendSpacing + (i * 21) + 5;
				}).text(function(d, i) {
			var t = "HTTP";
			if (i == 1) {
				t = "QUIC";
			} else if (i == 2) {
				t = "HTTP2";
			} else if (i == 3) {
				t = "SPDY";
			}
			return d.data + "(" + t + ")";
		});

	}
}

function divergingStackedBars() {
	$("#chart").html("");
	var margin = {
		top : 50,
		right : 20,
		bottom : 10,
		left : 65
	}, width = 800 - margin.left - margin.right, height = 500 - margin.top
			- margin.bottom;

	var y = d3.scale.ordinal().rangeRoundBands([ 0, height ], .3);

	var x = d3.scale.linear().rangeRound([ 0, width ]);

	var color = d3.scale.ordinal().range(
			[ "#c7001e", "#f6a580", "#cccccc", "#92c6db", "#086fad" ]);

	var xAxis = d3.svg.axis().scale(x).orient("top");

	var yAxis = d3.svg.axis().scale(y).orient("left")

	var svg = d3.select("#chart").append("svg").attr("width",
			width + margin.left + margin.right).attr("height",
			height + margin.top + margin.bottom).attr("id", "d3-plot").append(
			"g").attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");

	color.domain([ "Strongly disagree", "Disagree",
			"Neither agree nor disagree", "Agree", "Strongly agree" ]);

	var Obj = jsonData, tempList = [], dataList = [], maxSize = 0, max = 0;
	var fDirPacketList = [], fdir;
	for (var i = 0; i < Obj.length; i++) {
		tempList = Obj[i].fthroughputEverySec;
		length = tempList.length;
		if (length == 0)
			continue;
		maxSize = maxSize >= length ? maxSize : length;
		for (var j = 0; j < length; j++) {
			max = max >= tempList[j] ? max : tempList[j];
		}
		dataList.push(tempList);
	}
	var data = dataList[0];
	data
			.forEach(function(d) {
				// calc percentages
				d["Strongly disagree"] = +d[1] * 100 / d.N;
				d["Disagree"] = +d[2] * 100 / d.N;
				d["Neither agree nor disagree"] = +d[3] * 100 / d.N;
				d["Agree"] = +d[4] * 100 / d.N;
				d["Strongly agree"] = +d[5] * 100 / d.N;
				var x0 = -1
						* (d["Neither agree nor disagree"] / 2 + d["Disagree"] + d["Strongly disagree"]);
				var idx = 0;
				d.boxes = color.domain().map(function(name) {
					return {
						name : name,
						x0 : x0,
						x1 : x0 += +d[name],
						N : +d.N,
						n : +d[idx += 1]
					};
				});
			});

	var min_val = d3.min(data, function(d) {
		return d;
	});

	var max_val = d3.max(data, function(d) {
		return d;
	});

	x.domain([ min_val, max_val ]).nice();
	y.domain(data.map(function(d) {
		return d;
	}));

	svg.append("g").attr("class", "x axis").call(xAxis);

	svg.append("g").attr("class", "y axis").call(yAxis)

	var vakken = svg.selectAll(".question").data(data).enter().append("g")
			.attr("class", "bar").attr("transform", function(d) {
				return "translate(0," + y(d) + ")";
			});

	var bars = vakken.selectAll("rect").data(function(d) {
		return d;
	}).enter().append("g").attr("class", "subbar");

	bars.append("rect").attr("height", y.rangeBand()).attr("x", function(d) {
		return x(d);
	}).attr("width", function(d) {
		return x(d) - x(d);
	}).style("fill", function(d) {
		return color(d);
	});

	bars.append("text").attr("x", function(d) {
		return x(d);
	}).attr("y", y.rangeBand() / 2).attr("dy", "0.5em").attr("dx", "0.5em")
			.style("font", "10px sans-serif").style("text-anchor", "begin");

	vakken.insert("rect", ":first-child").attr("height", y.rangeBand()).attr(
			"x", "1").attr("width", width).attr("fill-opacity", "0.5").style(
			"fill", "#F5F5F5").attr("class", function(d, index) {
		return index % 2 == 0 ? "even" : "uneven";
	});

	svg.append("g").attr("class", "y axis").append("line").attr("x1", x(0))
			.attr("x2", x(0)).attr("y2", height);

	var startp = svg.append("g").attr("class", "legendbox").attr("id",
			"mylegendbox");
	// this is not nice, we should calculate the bounding box and use that
	var legend_tabs = [ 0, 120, 200, 375, 450 ];
	var legend = startp.selectAll(".legend").data(color.domain().slice())
			.enter().append("g").attr("class", "legend").attr("transform",
					function(d, i) {
						return "translate(" + legend_tabs[i] + ",-45)";
					});

	legend.append("rect").attr("x", 0).attr("width", 18).attr("height", 18)
			.style("fill", color);

	legend.append("text").attr("x", 22).attr("y", 9).attr("dy", ".35em").style(
			"text-anchor", "begin").style("font", "10px sans-serif").text(
			function(d) {
				return d;
			});

	d3.selectAll(".axis path").style("fill", "none").style("stroke", "#000")
			.style("shape-rendering", "crispEdges")

	d3.selectAll(".axis line").style("fill", "none").style("stroke", "#000")
			.style("shape-rendering", "crispEdges")

	var movesize = width / 2 - startp.node().getBBox().width / 2;
	d3.selectAll(".legendbox").attr("transform",
			"translate(" + movesize + ",0)");

}

function addFileContents() {
	if (jsonData.length == 0)
		return;
	var m = 0;
	var str = "";
	for (var i = 0; i < jsonData.length; i++) {
		var obj = jsonData[i];
		str += '<div onclick="showFlow('+ i +')" class="flow">' +
		'<div class="flowobject"><label for="name">Source: '
		+ obj.src + ', Destination: ' + obj.dest
		+ '</label></div>';
		str += '<div class="flowobject"><label for="name">Forward throughput: '
			+ obj.fthroughput
			+ ', Reverse throughput: '
			+ obj.rthroughput + '</label></div>';
		str += '<div class="flowobject"><label for="name">Page Load Time: '
			+ obj.plt
			+ ', RTT: '
			+ obj.rtt
			+ '</label></div>';
		str += '<div><label for="name"><b>Packets: </b></label></div><div id="flow'+ i +'" style="display:none">';
		var fdir = obj.fdir, k = 0;
		for (var j = 0; j < fdir.length; j++) {
			var packet = fdir[j];
			var packetString = "Packet Type: ";
			if (packet.packetType == HTTP)
				packetString += "HTTP";
			else if (packet.packetType == HTTP2)
				packetString += "HTTP2";
			else if (packet.packetType == SPDY)
				packetString += "SPDY";
			else if (packet.packetType == QUIC)
				packetString += "QUIC";
			if (typeof packet.tcp !== "undefined") {
				packet = packet.tcp;
				packetString += ", Source Port: " + packet.sourcePort
						+ ", Destination Port: " + packet.destinationPort;
				packetString += ", Sequence No: " + packet.seq
						+ ", Acknowledge No: " + packet.ack;
				packetString += ", Window: " + packet.window + ", is SIN: "
						+ packet.inSyn + ", is ACK: " + packet.isAck
						+ ", is FIN: " + packet.isFyn;
			}
			if (typeof packet.udp !== "undefined") {
				packet = packet.udp;
				packetString += ", Source Port: " + packet.src
						+ ", Destination Port: " + packet.dest;
				packetString += ", Length: " + packet.length + ", checkSum: "
						+ packet.checkSum + ", PayLoad Length: "
						+ packet.payLoadLength;
			}
			str += '<div onclick="showDiv('+ m + ')"><label for="name">Packet ' + j
			+ '</label></div>';
			str += '<div id="div'+ m +'" style="display:none">'+ packetString +'</div>';
			++m;
		}
		var rdir = obj.rdir;
		for (var j = 0; j < rdir.length; j++) {
			var packet = rdir[j];
			var packetString = "Packet Type: ";
			if (packet.packetType == HTTP)
				packetString += "HTTP";
			else if (packet.packetType == HTTP2)
				packetString += "HTTP2";
			else if (packet.packetType == SPDY)
				packetString += "SPDY";
			else if (packet.packetType == QUIC)
				packetString += "QUIC";
			if (typeof packet.tcp !== "undefined") {
				packet = packet.tcp;
				packetString += ", Source Port: " + packet.sourcePort
						+ ", Destination Port: " + packet.destinationPort;
				packetString += ", Sequence No: " + packet.seq
						+ ", Acknowledge No: " + packet.ack;
				packetString += ", Window: " + packet.window + ", is SIN: "
						+ packet.inSyn + ", is ACK: " + packet.isAck
						+ ", is FIN: " + packet.isFyn;
			}
			if (typeof packet.udp !== "undefined") {
				packet = packet.udp;
				packetString += ", Source Port: " + packet.src
						+ ", Destination Port: " + packet.dest;
				packetString += ", Length: " + packet.length + ", checkSum: "
						+ packet.checkSum + ", PayLoad Length: "
						+ packet.payLoadLength;
			}
			str += '<div onclick="showDiv('+ m + ')"><label for="name">Packet ' + j
			+ '</label></div>';
			str += '<div id="div'+ m +'" style="display:none">'+ packetString +'</div>';
			++m;
		}
		str += '</div></div>';
	}
	$("#filecontents").append(str);
}

function showFlow(i) {
	var style = document.getElementById('flow' + i).style.display;
	if(style === 'none')
		document.getElementById('flow' + i).style.display = 'block';
	/*else
		document.getElementById('flow' + i).style.display = 'none';*/
	httpVsQuicInPackets(i);
}

function showDiv(i) {
	var style = document.getElementById('div' + i).style.display;
	if(style === 'none')
		document.getElementById('div' + i).style.display = 'block';
	else
		document.getElementById('div' + i).style.display = 'none';
}

function addFileStatistics() {
	addFileContents();
}

function start() {
	rawJson = $("#json").val();
	jsonData = JSON.parse(rawJson);
	// drawgraph();
	addFileStatistics();
}

function drawThroughput() {
	var xson = jsonData;
	$("#chart").html("");
	$("#chart1").html("");
	var m = [ 80, 80, 80, 80 ];
	var w = 1000 - m[1] - m[3];
	var h = 400 - m[0] - m[2];
	var graph = d3.select("#chart").append("svg:svg").attr("width",
			w + m[1] + m[3]).attr("height", h + m[0] + m[2]).append("svg:g")
			.attr("transform", "translate(" + m[3] + "," + m[0] + ")");
	var elements = [];
	var color = d3.scale.category10();
	var lineList = [], dataList = [];
	var max = 0, length = 0, tempList, maxSize = 0;
	for (var l = 0; l < xson.length; l++) {
		var Obj = xson[l];
		dataList = [];
		for (var i = 0; i < Obj.length; i++) {
			tempList = Obj[i].fthroughputEverySec;
			length = tempList.length;
			if (length == 0)
				continue;
			maxSize = maxSize >= length ? maxSize : length;
			for (var j = 0; j < length; j++) {
				max = max >= tempList[j] ? max : tempList[j];
			}
			dataList.push(tempList);
		}
		elements.push(dataList);
	}

	var x = d3.scale.linear().domain([ 0, maxSize ]).range([ 0, w ]);
	var y = d3.scale.linear().domain([ 0, max ]).range([ h, 0 ]);
	dataList = elements[0];
	for (var i = 0; i < dataList.length; i++) {
		var line = d3.svg.line().interpolate("basis").x(function(d, i) {
			return x(i);
		}).y(function(d) {
			return y(d);
		});
		lineList.push(line);
	}
	var lineList1 = [];
	dataList = elements[1];
	for (var i = 0; i < dataList.length; i++) {
		var line = d3.svg.line().interpolate("basis").x(function(d, i) {
			return x(i);
		}).y(function(d) {
			return y(d);
		});
		lineList1.push(line);
	}
	var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(1);
	graph.append("svg:g").attr("class", "x axis").attr("transform",
			"translate(0," + h + ")").call(xAxis);
	var yAxisLeft = d3.svg.axis().scale(y).ticks(6).orient("left");
	graph.append("svg:g").attr("class", "y axis").attr("transform",
			"translate(-10,0)").call(yAxisLeft).append("text").attr(
			"transform", "rotate(-90)").attr("y", -50).style("text-anchor",
			"end").text("Throughput");
	graph.append("text").attr("text-anchor", "middle") // this makes it
	.attr("transform", "translate(" + (w / 2) + "," + (h + 25) + ")") // centre
	.text("Time (s)");
	var k = 0;
	dataList = elements[0];
	for (var i = 0; i < lineList.length; i++) {
		graph.append("svg:path").attr("d", lineList[i](dataList[i])).attr(
				'stroke', "#006400");
	}
	dataList = elements[1];
	for (var i = 0; i < lineList1.length; i++) {
		graph.append("svg:path").attr("d", lineList1[i](dataList[i])).attr(
				'stroke', "#FF9900");
	}

	var colors = [ [ "HTTP", "#006400" ], [ "QUIC/SPDY", "#FF9900" ] ];
	// add legend
	var legend = graph.append("g").attr("class", "legend1")
	// .attr("x", w - 65)
	// .attr("y", 50)
	.attr("height", 100).attr("width", 100).attr('transform',
			'translate(-20,50)');

	var legendRect = legend.selectAll('rect').data(colors);

	legendRect.enter().append("rect").attr("x", w - 80).attr("width", 10).attr(
			"height", 10);

	legendRect.attr("y", function(d, i) {
		return i * 20;
	}).style("fill", function(d) {
		return d[1];
	});

	var legendText = legend.selectAll('text').data(colors);

	legendText.enter().append("text").attr("x", w - 62);

	legendText.attr("y", function(d, i) {
		return i * 20 + 9;
	}).text(function(d) {
		return d[0];
	});
}

function pageLoadTime() {
	var xson = jsonData;
	$("#chart").html("");
	$("#chart1").html("");
	for (var l = 0; l < xson.length; l++) {
		var Obj = xson[l];
		var ipList = [];
		var color = d3.scale.category10();
		var dataList = [];
		var length = 0, tempList;
		for (var i = 0; i < Obj.length; i++) {
			tempList = parseInt(Obj[i].plt);
			dataList.push(tempList);
			ipList.push(Obj[i].src);
		}
		var data = dataList;
		var margin = {
			top : 20,
			right : 20,
			bottom : 70,
			left : 40
		}, width = 400 - margin.left - margin.right, height = 450 - margin.top
				- margin.bottom;
		var x = d3.scale.ordinal().rangeRoundBands([ 0, width ], .05);
		var y = d3.scale.linear().range([ height, 0 ]);
		var xAxis = d3.svg.axis().scale(x).orient("bottom");
		var yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);

		var svg;
		if (l == 0) {
			svg = d3.select("#chart").append("svg").attr("width",
					width + margin.left + margin.right).attr("height",
					height + margin.top + margin.bottom).style('padding-left',
					'20px').style('padding-bottom', '20px').append("g").attr(
					"transform",
					"translate(" + margin.left + "," + margin.top + ")");
		} else {
			svg = d3.select("#chart1").append("svg").attr("width",
					width + margin.left + margin.right).attr("height",
					height + margin.top + margin.bottom).style('padding-left',
					'20px').style('padding-bottom', '20px').append("g").attr(
					"transform",
					"translate(" + margin.left + "," + margin.top + ")");
		}

		x.domain(data.map(function(d, i) {
			return i;
		}));
		y.domain([ 0, d3.max(data, function(d) {
			return d;
		}) ]);

		svg.append("g").attr("class", "x axis").attr("transform",
				"translate(0," + height + ")").call(xAxis).selectAll("text")
				.style("text-anchor", "end").attr("dx", "-.8em").attr("dy",
						"-.55em").attr("transform", "rotate(-90)").text(
						function(d, i) {
							return ipList[i];
						});

		svg.append("g").attr("class", "y axis").call(yAxis).append("text")
				.attr("transform", "rotate(-90)").attr("y", -50).attr("dy",
						".71em").style("text-anchor", "end").text("PLT (ms)");

		svg.selectAll("bar").data(data).enter().append("rect").style("fill",
				"steelblue").attr("x", function(d, i) {
			return x(i);
		}).attr("width", x.rangeBand()).attr("y", function(d) {
			return y(d);
		}).attr("height", function(d) {
			return height - y(d);
		});
	}
}

function forwardReverseThroughput(isForwardThroughput) {
	var xson = jsonData;
	$("#chart").html("");
	$("#chart1").html("");
	for (var l = 0; l < xson.length; l++) {
		var Obj = xson[l];
		var ipList = [];
		var color = d3.scale.category10();
		var dataList = [];
		var length = 0, tempList;
		for (var i = 0; i < Obj.length; i++) {
			if (isForwardThroughput) {
				tempList = parseInt(Obj[i].fthroughput);
			} else {
				tempList = parseInt(Obj[i].rthroughput);
			}
			dataList.push(tempList);
			ipList.push(Obj[i].src);
		}
		var data = dataList;
		var margin = {
			top : 20,
			right : 20,
			bottom : 70,
			left : 40
		}, width = 400 - margin.left - margin.right, height = 450 - margin.top
				- margin.bottom;
		var x = d3.scale.ordinal().rangeRoundBands([ 0, width ], .05);
		var y = d3.scale.linear().range([ height, 0 ]);
		var xAxis = d3.svg.axis().scale(x).orient("bottom");
		var yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);

		var svg;
		if (l == 0) {
			svg = d3.select("#chart").append("svg").attr("width",
					width + margin.left + margin.right).attr("height",
					height + margin.top + margin.bottom).style('padding-left',
					'20px').style('padding-bottom', '20px').append("g").attr(
					"transform",
					"translate(" + margin.left + "," + margin.top + ")");
		} else {
			svg = d3.select("#chart1").append("svg").attr("width",
					width + margin.left + margin.right).attr("height",
					height + margin.top + margin.bottom).style('padding-left',
					'20px').style('padding-bottom', '20px').append("g").attr(
					"transform",
					"translate(" + margin.left + "," + margin.top + ")");
		}

		x.domain(data.map(function(d, i) {
			return i;
		}));
		y.domain([ 0, d3.max(data, function(d) {
			return d;
		}) ]);

		svg.append("g").attr("class", "x axis").attr("transform",
				"translate(0," + height + ")").call(xAxis).selectAll("text")
				.style("text-anchor", "end").attr("dx", "-.8em").attr("dy",
						"-.55em").attr("transform", "rotate(-90)").text(
						function(d, i) {
							return ipList[i];
						});

		var tput = isForwardThroughput ? "Forward" : "Reverse";
		svg.append("g").attr("class", "y axis").call(yAxis).append("text")
				.attr("transform", "rotate(-90)").attr("y", -60).attr("dy",
						".71em").style("text-anchor", "end").text(
						tput + " Throughput (ms)");

		svg.selectAll("bar").data(data).enter().append("rect").style("fill",
				"steelblue").attr("x", function(d, i) {
			return x(i);
		}).attr("width", x.rangeBand()).attr("y", function(d) {
			return y(d);
		}).attr("height", function(d) {
			return height - y(d);
		});
	}
}

function visualizationStart() {
	rawJson = $("#json").val();
	jsonData = JSON.parse(rawJson);
	drawThroughput();
}
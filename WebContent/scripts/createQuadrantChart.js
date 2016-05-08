function createQuadrantChart(div, data, setup){

//Options
var width = setup.width || 800,
    height = setup.height || 600,
    dotRadius = setup.dotRadius || 4, 
    dotcolor = setup.dotcolor || '#800000', 
    xtype = setup.xtype || ".0f",  //add precision here on other side
    ytype = setup.ytype || ".0f",
    ztype = setup.ztype || ".0f",
    gridSpacing = setup.gridSpacing || 10,
    topspace = setup.topspace || 60,
    lbuffer= setup.lbuffer || 100,
    rbuffer= setup.rbuffer || 40,
    bottomspace= setup.bottomspace || 60,
    title= setup.title || "",
    xlabel= setup.xlabel || "",
    ylabel= setup.ylabel || "",
    quadrantxaxis = setup.quadrantxaxis || 0,
    quadrantyaxis = setup.quadrantyaxis || 0,
    quadrantaxiscolor = setup.quadrantaxiscolor || '#808080',
    quadrantaxiswidth = setup.quadrantaxiswidth || '2px',
    quadrantaxisopacity = setup.quadrantaxisopacity || '0.5',
    svgborderwidth = setup.svgborderwidth || '2px ',
    svgbordercolor = setup.svgbordercolor || '#ccc',
    gridlinesstroke = setup.gridlinesstroke || 'steelblue', 
    gridlineswidth = setup.gridlineswidth || '0.5px',
    gridlinesopacity = setup.gridlinesopacity || '0.5',
    axislinewidth = setup.axislinewidth || '1px',
    axislinecolor = setup.axislinecolor || '#000000',
    axisopacity = setup.axisopacity || '0.5',
    axistextsize = setup.axistextsize || '10px',
    axistextcolor = setup.axistextcolor || '#000000',
    item_min_ptsize = setup.item_min_ptsize || 2,
    item_max_ptsize = setup.item_max_ptsize || 10,
    dotstroke = setup.dotstroke || '#000000',
    dotstrokewidth = setup.dotstrokewidth || '0px',
    itemslabel = setup.itemslabel || 'true',
    itemsfontsize = setup.itemsfontsize || '10px',
    itemsfontcolor = setup.itemsfontcolor || '#000000',
    titlefontsize = setup.titlefontsize || '24px',
    titlefontcolor = setup.titlefontcolor || '#000000',
    axislabelsize = setup.axislabelsize || '20px',
    axislabelcolor = setup.axislabelcolor || '#000000',
    colorschemetype = setup.colorschemetype || 'unique'    
;  


//min and max data values (for setting up axis)  
var min_x = d3.min(data, function(d) {
  return d.x;
});
var min_y = d3.min(data, function(d) {
  return d.y;
});
var max_x = d3.max(data, function(d) {
  return d.x;
});
var max_y = d3.max(data, function(d) {
  return d.y;
});
  
  
var min_size, max_size, no_z=false, no_category=false, categoryarray=[];
  
//whether or not z-value is given (otherwise default dotRadius)
if(!data[0].z){
  no_z=true;
}else{
// dot size range  
  min_size = d3.min(data, function(d) {
    return d.z;
  });
  max_size = d3.max(data, function(d) {
    return d.z;
  });
  var cscale = d3.scale.linear().domain([min_size,max_size]).range([item_min_ptsize,item_max_ptsize]);
}
    
//whether or not category is given (otherwise default dotcolor)    
if(!data[0].category){
  no_category=true;
}else{
  for(var count=0; count<data.length; count=count+1){
    categoryarray.push(data[count].category);
  }
  
  //remove duplicates function
  function uniq_fast(a) {
    var seen = {};
    var out = [];
    var len = a.length;
    var j = 0;
    for(var i = 0; i < len; i++) {
         var item = a[i];
         if(seen[item] !== 1) {
               seen[item] = 1;
               out[j++] = item;
         }
    }
    return out;
}
  
//sophisticated alpha numeric sorting
function sortAlphaNum(a,b) {
    var reA = /[^a-zA-Z]/g;
    var reN = /[^0-9]/g; 
    var aA = a.replace(reA, "");
    var bA = b.replace(reA, "");
    if(aA === bA) {
        var aN = parseInt(a.replace(reN, ""), 10);
        var bN = parseInt(b.replace(reN, ""), 10);
        return aN === bN ? 0 : aN > bN ? 1 : -1;
    } else {
        return aA > bA ? 1 : -1;
    }
}

  
  //12 unique colors based on colorbrewer
  var c20 = d3.scale.ordinal().domain([]).range(["#1f78b4", "#33a02c" , "#e31a1c", "#ff7f00" , "#6a3d9a", "#b15928",  "#a6cee3", "#b2df8a" , "#fb9a99", "#fdbf6f" , "#cab2d6", "#ffff99"]);
  //add more schemes later
  var cquantile = d3.scale.ordinal().domain(['1','2','3','4','5']).range(["#005a32", "#238b45" , "#41ab5d", "#74c476" , "#a1d99b"]);
  var cnone = d3.scale.ordinal().domain([]).range([dotcolor]);  
  
//remove duplicates
  var newarray=uniq_fast(categoryarray);
  newarray.sort(sortAlphaNum);
  
  //set colorscale type according to sent value of sequential, unique, none  :  may need to add more schemes in future to deal with number of class variability
  var colorscale;
  if(colorschemetype=="sequential"){colorscale=cquantile};
  if(colorschemetype=="unique"){colorscale=c20};
  if(colorschemetype=="none"){colorscale=cnone};  

}    
  
//buffer the axis ranges so that points arent on edge of graph  
var buffer_x = ((max_x)-(min_x))*.03; //3% buffer
var buffer_y = ((max_y)-(min_y))*.03; //3% buffer  
  
var svg = d3.select("#"+div).append("svg").attr("id","svgel")
    .attr("width",width) //+lbuffer+rbuffer
    .attr("height",height); //+bottomspace+topspace
    
    svg.append("rect")
    .attr("width",width) //+lbuffer+rbuffer
    .attr("height",height) //+bottomspace+topspace      
    .style({'fill':'white','fill-opacity':'0','stroke-width': svgborderwidth,'stroke':svgbordercolor});

//Scales for item positions
var x = d3.scale.linear().domain([min_x-buffer_x,max_x+buffer_x]).range([lbuffer,(width-rbuffer)]);
var y = d3.scale.linear().domain([min_y-buffer_y,max_y+buffer_y]).range([height-bottomspace,topspace]);


//gridlines
svg.append("path")
  .attr("d",function() {
    var d = "";

    for (var i = lbuffer; i < (width-rbuffer)+gridSpacing; i += gridSpacing ) {
      d += "M"+(i)+","+topspace+" L"+i+","+(height-bottomspace);
    }

    for (var i = topspace; i < (height-bottomspace)+gridSpacing; i += gridSpacing ) {
      d += "M"+lbuffer+","+(i)+" L"+(width-rbuffer)+","+(i);
    }

    return d;
  }).style({'stroke': gridlinesstroke, 'stroke-width': gridlineswidth, 'opacity': gridlinesopacity});


//quadrant axes
svg.append("path")
  .attr("d","M"+lbuffer+","+(y(quadrantyaxis))+" L"+(width-rbuffer)+","+(y(quadrantyaxis)))
  .attr("stroke", quadrantaxiscolor)
  .attr("stroke-width", quadrantaxiswidth)
  .attr('opacity', quadrantaxisopacity)
  .append("svg:title")
   .text(function(d){
  var formatter=d3.format(ytype);
  return formatter(setup.quadrantyaxis);
});

svg.append("path")
  .attr("d","M"+(x(quadrantxaxis))+","+topspace+" L"+(x(quadrantxaxis))+","+(height-bottomspace))
  .attr("stroke", quadrantaxiscolor)
  .attr("stroke-width", quadrantaxiswidth)
  .attr('opacity', quadrantaxisopacity)
  .append("svg:title")
   .text(function(d){
  var formatter=d3.format(xtype);
  return formatter(setup.quadrantxaxis);
});

  var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.format(xtype)); 
  var yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(d3.format(ytype)); 
 
  var xAxisGroup = svg.append("g") //
    .attr("class", "xaxis")
    .attr("transform", "translate("+0+"," + (height-bottomspace) + ")")
    .call(xAxis);

      
  xAxisGroup.selectAll('.xaxis line, .xaxis path')
     .style({'stroke': axislinecolor, 'fill': 'none', 'stroke-width': axislinewidth, 'opacity': axisopacity});
  
  xAxisGroup.selectAll('.xaxis text')
     .style({'stroke': axistextcolor, 'font-size': axistextsize, 'opacity': axisopacity});
  
  var yAxisGroup = svg.append("g")
      .attr("class", "yaxis")
      .attr("transform", "translate("+lbuffer+", "+0+")")
      .call(yAxis);
  
  yAxisGroup.selectAll('.yaxis line, .yaxis path')
     .style({'stroke': axislinecolor, 'fill': 'none', 'stroke-width': axislinewidth, 'opacity': axisopacity});  
  
  yAxisGroup.selectAll('.yaxis text')
     .style({'stroke': axistextcolor, 'font-size': axistextsize, 'opacity': axisopacity});
  
  
//One group per item
var items = svg.selectAll("g.item").data(data).enter().append("g");

  
  
//Add a dot
items.append("circle")
  .attr("r", function(d){
  if(no_z){return dotRadius;}else{return cscale(d.z);}
})
  .attr("cx",function(d){
    return x(d.x);
  })
  .attr("cy",function(d){
    return y(d.y);
  })
.style({'fill': function(d){
  if(no_category){
    return dotcolor;
  }else{
    for(var i=0; i<(newarray.length+1); i=i+1){
      if(d.category==newarray[i]){return colorscale(i);}
    }
  }

}, 'stroke': dotstroke, 'stroke-width': dotstrokewidth})
// .append("svg:title")
//  .text(function(d) { 
//  var xformatter=d3.format(xtype); 
//  var yformatter=d3.format(ytype); 
//  var zformatter=d3.format(ztype); 
  //return d.label+"\nX = "+xformatter(d.x)+"\nY = "+yformatter(d.y);
//  
//})
.on('mouseover', function (d) {
	 var offset = $('#chart').offset(), // { left: 0, top: 0 }
     left = x(d.x) + offset.left,
     top = y(d.y) + offset.top;
	 var content =  '<iframe id="video" width="400" height="200" src="https://www.youtube.com/embed/'+d.url+'?autoplay=1" frameborder="0"></iframe>'
	nvtooltip.show([left, top], content);
}).on('mouseout', function (d) {
	stopVideo($('#video'));
	nvtooltip.cleanup();
});

    
if(itemslabel==='true'){  
  
var textLabels = items.append("text")
  .attr("x",function(d){
    return x(d.x);
  })
  .attr("y",function(d){
    return y(d.y);
  })
  .attr("dy","1.25em")
  .attr("text-anchor","middle")
  .text(function(d){return '';})
.style({'font-size': itemsfontsize, 'fill': itemsfontcolor});
  
}

  //xaxis
svg.append("text")
    .attr("text-anchor", "middle")
    .attr("x", ((width-rbuffer-lbuffer)/2)+lbuffer)
    .attr("y", (height - 10))
    .text(setup.xlabel)
.style({'font-size': axislabelsize, 'fill': axislabelcolor});  
  
  //yaxis
svg.append("text")
    .attr("text-anchor", "middle")
    .attr("y", 27)
    .attr("x", -(((height-bottomspace-topspace)/2)+(topspace)))
    .attr("transform", "rotate(-90)")
    .text(setup.ylabel)
  .style({'font-size': axislabelsize, 'fill': axislabelcolor});    
  
  //title
svg.append("text")
    .attr("text-anchor", "middle")
    .attr("x", ((width-rbuffer-lbuffer)/2)+lbuffer)
    .attr("y", (topspace/2)+5)
    .text(setup.title)  
  .style({'font-size': titlefontsize, 'fill': titlefontcolor});    
  
  };
  
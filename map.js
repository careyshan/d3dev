const mapChart = function (selection, props) {

  // Unpack the properties.
  const width = props.width;
  const height = props.height;
  const data = props.data;
  const numOfState = props.numOfState;
  const scaleOfMap = props.scaleOfMap;
  const fill = props.fill;
  const stroke = props.stroke;
  const strokeWidth = props.strokeWidth;
  const onCountyClick = props.onCountyClick;

  const margin = props.margin;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  let tooltip = d3.select('body').selectAll('.tooltip-div').data([null]);
  tooltip = tooltip
    .enter().append('div')
      .attr('class','tooltip-div')
      .style('position','absolute')
      .style('background','#fff')
      .style('padding','5 15px')
      .style('border','1px #fff solid')
      .style('border-radius','5px')
      .style('opacity','0')
    .merge(tooltip);

  const projection = d3.geoMercator()
                   .center([-8, 53])
                   .scale(scaleOfMap)
                   .translate([width/2,height/2]);


  const path = d3.geoPath()
             .projection(projection);
  let svg = selection.selectAll('svg').data([null]);
  svg = svg.enter().append('svg')
    .merge(svg)
      .attr('width', width)
      .attr('height', height);

 /*let svg = d3.select("body")
             .append("svg")
             .attr("width",width)
             .attr("height",height);*/

  var mapPaths = svg.selectAll(".map-path").data(data);
  mapPaths
   .enter().append("path")
     .attr("class", "map-path")
   .merge(mapPaths)
     .attr("d", function(d){return path(d)})
     .attr("fill", fill)
     .attr("stroke", stroke)
     .attr("stroke-width", strokeWidth)
     .on("click",function(d){
       tooltip.transition().style("opacity",1);
       tooltip.html(d.properties.Counties)
         .style('left',(d3.event.pageX)+"px")
         .style('top',(d3.event.pageY)+"px");

       d3.select(this).style('opacity',1);

       onCountyClick(d.properties.Counties);
     })
  };
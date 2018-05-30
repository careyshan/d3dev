const lineChart = function (selection, props) {

  // Unpack the properties.
  const width = props.width;
  const height = props.height;
  let data = props.data;
  const xValue = props.xValue;
  const yValue = props.yValue;
  const lineValue = props.lineValue;
  const onPointHover = props.onPointHover;
  const selectedPoint = props.selectedPoint;


  const margin = props.margin;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  let tooltip = d3.select('body').selectAll('.tooltip-linechart').data([null]);
  tooltip = tooltip
    .enter().append('div')
      .attr('class','tooltip-linechart')
      .style('position','absolute')
      .style('background','lightgrey')
      .style('padding','5 15px')
      .style('border','1px #fff solid')
      .style('border-radius','5px')
      .style('opacity','0')
      .style('pointer-events', 'none')
    .merge(tooltip);

  const nested = d3.nest()
    .key(lineValue)
    .entries(data);


  const xScale = d3.scaleTime()
    .domain(d3.extent(data, xValue))
    .range([0, innerWidth]);

  const yScale = d3.scaleLinear()
    .domain(d3.extent(data, yValue))
    //.domain([d3.min(data, yValue), d3.max(data, yValue)])
    .range([innerHeight, 0]);

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  // Append an SVG the first invocation,
  // use the existing SVG on subsequent invocations.
  let svg = selection.selectAll('svg').data([null]);
  svg = svg.enter().append('svg')
    .merge(svg)
      .attr('width', width)
      .attr('height', height);

  let g = svg.selectAll('g').data([null]);
  g = g.enter().append('g')
    .merge(g)
      .attr('transform', "translate(" + margin.left + "," + margin.top + ")");
//      .attr('transform', `translate(${margin.left},${margin.top})`); // ES6 String Literal

  let xAxisG = g.selectAll('.xAxis').data([null]);
  xAxisG = xAxisG.enter().append('g').attr('class', 'xAxis')
    .merge(xAxisG)
      .transition()
      .delay(1000)
      .duration(1000)
      .ease(d3.easeLinear)
      .attr('transform', "translate(0," + innerHeight + ")");

  //xAxisG.call(d3.axisBottom(xScale));

  let yAxisG = g.selectAll('.yAxis').data([null]);
  yAxisG = yAxisG.enter().append('g').attr('class', 'yAxis')
    .merge(yAxisG)
      .transition()
      .delay(1000)
      .duration(1000)
      .ease(d3.easeLinear)
      .attr('transform', "translate(-2,0)");

  xAxisG.call(d3.axisBottom(xScale));
  yAxisG.call(d3.axisLeft(yScale));

  colorScale.domain(nested.map(function(d){return d.key;}).sort());

  //colorScale.domain(nested.map(function(d){return d.key;}));//setting domain values
  //colorScale.domain(colorScale.domain().sort());//now setting the domain to be sorted. Its okay to call it twice

  const line = d3.line()
    .x(function(d) { return xScale(xValue(d)); })
    .y(function(d) { return yScale(yValue(d)); });

  const paths = g.selectAll(".chart-line").data(nested);
  paths.exit().remove();
  paths
    .enter().append("path")
      .attr("class", "chart-line")
    .merge(paths)
      .transition()
      .delay(1000)
      .duration(1000)
      .ease(d3.easeLinear)
      .attr("d", function (d){
        return line(d.values);
      })
      .attr("stroke", function (d) { return colorScale(d.key); })
      .attr("fill", "none");

  //console.log(data)

  let circlesL = g.selectAll('.circle-dots').data(data);  //update selection
  circlesL.exit().remove();
  circlesL = circlesL //enter selection
    .enter().append('circle')
      .attr("class", "circle-dots")
      .attr('r', 4)
      .attr('fill-opacity', 1)
    .merge(circlesL);

  circlesL
      .transition()
      .delay(1000)
      .duration(1000)
      .ease(d3.easeLinear)
      .attr('cx', function(d){ return xScale(xValue(d)); })
      .attr('cy', function(d){ return yScale(yValue(d)); })
      .attr('fill', function(d){return colorScale(lineValue(d))});


  circlesL.on("mouseover",function(d){
    d3.select(this).transition()
        .attr("r", 10);
      onPointHover(d);
//        let rowSelection = onPointHover(d.County,d.Date,d.element,d.value);
//        let selected = rowSelection();
       //console.log(selected);

       tooltip.transition().style("opacity",1);
       tooltip.html(d.element +": "+d.value )
         .style('left',(d3.event.pageX)+"px")
         .style('top',(d3.event.pageY)+"px");
       d3.select(this).style('opacity',1);

//        this.getSelected = function(){
//          return selected;
//        }

//        onPointHover(selected);
   });
  circlesL.on("mouseout",function(d){
    d3.select(this).transition()
        .attr("r", 4);
    onPointHover(null);
  })
}

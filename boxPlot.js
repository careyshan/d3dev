const boxPlot = function (selection, props) {

  // Unpack the properties.
  const width = props.width;
  const height = props.height;
  let data = props.data;
  const xValue = props.xValue;
  const yValue = props.yValue;
  const margin = props.margin;

  let tooltip = d3.select('body').selectAll('.tooltip-boxplot').data([null]);
  tooltip = tooltip
    .enter().append('div')
      .attr('class','tooltip-boxplot')
      .style('position','absolute')
      .style('background','lightgrey')
      .style('padding','5 15px')
      .style('border','1px #fff solid')
      .style('border-radius','5px')
      .style('opacity','0')
    .merge(tooltip);

  // https://github.com/d3/d3-array#quantile
  // https://github.com/d3/d3-array/blob/master/src/quantile.js
  function quartiles(d) {
    return [
      d3.quantile(d, .25),
      d3.quantile(d, .5),
      d3.quantile(d, .75)
    ];
  }

  const boxPlotData = d3.nest()
    .key(xValue)// essentially a splitter
    .entries(data);//returns the splitter array

   // Compute Box Plot statistics.
  boxPlotData.forEach(function (d){
    var sorted = d.values.map(yValue);
    sorted.sort();
    //console.log(sorted)

//     const types = {}
//     d.values.map(yValue).forEach(n => types[typeof n] = true)
    d.quartileData = quartiles(sorted);
    d.iqr = d.quartileData[2]-d.quartileData[0]
   //console.log(d.iqr);
   //console.log(d.quartileData);
//     console.log(types)
    d.whiskerData = [d.quartileData[0]-(1.5*d.iqr), d.quartileData[2]+(1.5*d.iqr)];
  //console.log(d.whiskerData)
  });
  //console.log(boxPlotData)

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = d3.scaleBand()
    .domain(data.map(xValue))
    .range([0, innerWidth])
    .padding(0.3);

  xScale.domain(xScale.domain().sort());

  const yScale = d3.scaleLinear()
    // .domain(d3.extent(data, yValue))
    .domain([
      d3.min(data.map(yValue).concat(boxPlotData.map(function (d) {
        return d.whiskerData[0];
      }))),
      d3.max(data.map(yValue).concat(boxPlotData.map(function (d) {
        return d.whiskerData[1];
      })))
     ])
    .range([innerHeight, 0]);

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(xScale.domain());

  //console.log((data[0]));

  // Append an SVG the first invocation,
  // use the existing SVG on subsequent invocations.
  // if(svg) { selection.append('svg') }
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
      .attr('transform', "translate(0," + innerHeight + ")");

 // xAxisG.call(d3.axisBottom(xScale));

  let yAxisG = g.selectAll('.yAxis').data([null]);
  yAxisG = yAxisG.enter().append('g').attr('class','yAxis')
    .merge(yAxisG)
      .transition()
      .delay(1000)
      .duration(1000)
      .ease(d3.easeLinear)
      .attr('transform', "translate(-2,0)");

  xAxisG.call(d3.axisBottom(xScale));
  yAxisG.call(d3.axisLeft(yScale));

  let groups = g.selectAll('.box-group').data(boxPlotData);//only works on second invocation
  groups.exit().remove();
  groups = groups.enter().append('g').attr('class', 'box-group')
     .merge(groups);

  const circlesb = groups.selectAll('.circleb')
    .data(function(boxData){ // boxData name used to avoid two 'd's.
      return boxData.values.filter(function(d) {
        return yValue(d) > boxData.whiskerData[1] || yValue(d) < boxData.whiskerData[0]; //If there were outliers
        //return true;
      })
    });
  circlesb.exit().remove();
  circlesb.enter().append('circle')
    .merge(circlesb)
      .attr('class','circleb')
      .transition()
      .delay(1000)
      .duration(1000)
      .ease(d3.easeLinear)
      .attr('cx', function(d){ return xScale(xValue(d)) + xScale.bandwidth() / 2; })
      .attr('cy', function(d){ return yScale(yValue(d)); })
      .attr('r', 7)
      .attr('stroke-opacity', 1)
      .attr('fill', "none")
      .attr("stroke", function (d) { return colorScale(d.element); });

  const centerlines = g.selectAll(".line-center").data(boxPlotData);
  centerlines.exit().remove();
  centerlines.enter().append('line').attr('class', 'line-center')
    .merge(centerlines)
      .transition()
      .delay(1000)
      .duration(1000)
      .ease(d3.easeLinear)
      .attr("x1", function (d){ return xScale(d.key) + (xScale.bandwidth() / 2); })
      .attr("x2", function (d){ return xScale(d.key) + (xScale.bandwidth() / 2); })
      .attr("y1", function (d){ return yScale(d.whiskerData[0]); })
      .attr("y2", function (d){ return yScale(d.whiskerData[1]); })
      .attr('stroke', function (d) { return colorScale(d.key); })
      .style("stroke-width", "1px");


  const boxes = g.selectAll('rect').data(boxPlotData);
  boxes.exit().remove();
  boxes.enter().append('rect')
    .merge(boxes)
      .transition()
      .delay(1000)
      .duration(1000)
      .ease(d3.easeLinear)
      .attr('x', function (d){ return xScale(d.key) })
      .attr('y', function (d){ return yScale(d.quartileData[2]) })
      .attr('width', xScale.bandwidth())
      .attr('height', function (d){
        return yScale(d.quartileData[0]) - yScale(d.quartileData[2]);
      })
      .attr("fill", function (d) { return colorScale(d.key); })
      .attr('fill-opacity', 0.4)
      .attr('stroke',function (d) { return colorScale(d.key); })
      .style("stroke-width", "1px");

    const median = g.selectAll('.line-median').data(boxPlotData);
  median.exit().remove();
  median.enter().append("line").attr("class", "line-median")
    .merge(median)
      .transition()
      .delay(1000)
      .duration(1000)
      .ease(d3.easeLinear)
      .attr("x1", function (d){ return xScale(d.key) })
      .attr("x2", function (d){ return xScale(d.key) + xScale.bandwidth(); })
      .attr("y1", function (d){ return yScale(d.quartileData[1]); })
      .attr("y2", function (d){ return yScale(d.quartileData[1]); })
      .style("stroke", function (d) { return colorScale(d.key); })
      .style("stroke-width", "3.8px");

    median.on("mouseover",function(d){
      console.log(d)
     tooltip.transition().style("opacity",1);
     tooltip.html(d.quartileData[1])
       .style('left',(d3.event.pageX)+"px")
       .style('top',(d3.event.pageY)+"px");
     d3.select(this).style('opacity',1);
   })

  const whiskerSize = 0.3 * xScale.bandwidth() / 2;

  const whiskerTop = g.selectAll('.whisker-top').data(boxPlotData);
  whiskerTop.exit().remove();
  whiskerTop.enter().append('line').attr('class', 'whisker-top')
    .merge(whiskerTop)
      .transition()
      .delay(1000)
      .duration(1000)
      .ease(d3.easeLinear)
      .attr('x1', function(d){ return xScale(d.key) + xScale.bandwidth()/2 - whiskerSize; })
      .attr('x2', function(d){ return xScale(d.key) + xScale.bandwidth()/2 + whiskerSize; })
      .attr('y1', function(d){ return yScale(d.whiskerData[1]); })
      .attr('y2', function(d){ return yScale(d.whiskerData[1]); })
      .attr('stroke', function (d) { return colorScale(d.key); });

   whiskerTop.on("mouseover",function(d){
     tooltip.transition().style("opacity",1);
     tooltip.html(d.whiskerData[1])
       .style('left',(d3.event.pageX)+"px")
       .style('top',(d3.event.pageY)+"px");
     d3.select(this).style('opacity',1);
   })

  const whiskerBottom = g.selectAll('.whisker-bottom').data(boxPlotData);
  whiskerBottom.exit().remove();
  whiskerBottom.enter().append('line').attr('class', 'whisker-bottom')
    .merge(whiskerBottom)
      .transition()
      .delay(1000)
      .duration(1000)
      .ease(d3.easeLinear)
      .attr('x1', function(d){ return xScale(d.key) + xScale.bandwidth()/2 - whiskerSize;; })
      .attr('x2', function(d){ return xScale(d.key) + xScale.bandwidth()/2 + whiskerSize; })
      .attr('y1', function(d){ return yScale(d.whiskerData[0]); })
      .attr('y2', function(d){ return yScale(d.whiskerData[0]); })
      .attr('stroke', function (d) { return colorScale(d.key); })
      .style("stroke-width", "1px");

  whiskerBottom.on("mouseover",function(d){
     tooltip.transition().style("opacity",0.9).duration(500);
     tooltip.html(d.whiskerData[0])
       .style('left',(d3.event.pageX)+"px")
       .style('top',(d3.event.pageY)+"px");
     d3.select(this).style('opacity',1)
     .style("stroke-width", "5px");
   })

}

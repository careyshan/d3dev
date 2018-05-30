function tabulate(selection, props) {
    let data = props.data;
    const columns = props.columns;
//     const rowSelected = props.rowSelected;
    const rowSelection = props.rowSelection;

    const isSelectedRow = function (d){
      return d === rowSelection;
    };

    if (rowSelection) {
      data = data.filter(isSelectedRow);
    }

    //console.log("in Table");
    //console.log(rowSelection);

    const tableUpdate = selection
      .selectAll('table').data([null]);
    const tableEnter = tableUpdate
      .enter().append("table")
        .attr("style", "margin-left: 0px");

//     const thead = tableUpdate.select("thead")
//       .merge(tableEnter.append("thead"));

    const thead = tableEnter.append("thead")
      .merge(tableUpdate.select("thead"));

    const tbody = tableEnter.append("tbody")
      .merge(tableUpdate.select("tbody"));

    // append the header row
    let tr = thead.selectAll("tr").data([null]);
    tr = tr.enter().append("tr").merge(tr);

  //console.log(selected);
    const th = tr.selectAll("th").data(columns);
    th.enter().append("th")
      .merge(th)
        .text(function(column) { return column; });

    // create a row for each object in the data
    let rows = tbody.selectAll("tr").data(data);
    rows.exit().remove();
    rows = rows.enter().append("tr").merge(rows)
      .style("background-color",function (d){
        return isSelectedRow(d) ? "lightgrey" : "white";
      });

    /*rows.on("mouseover",function(d){

       let x = d;
    })*/
    //console.log(rowSelection);
    // create a cell in each row for each column
    const cells = rows.selectAll("td")
        .data(function(row) {
//             console.log(columns.map(function(column) {
//                 return {column: column, value: row[column]};
//             }));
            return columns.map(function(column) {
                return row[column]
            });
        });
    cells
      .enter()
        .append("td")
        // Could be done in pure CSS
        .attr("style", "font-family: Courier") // sets the font style
      .merge(cells)
        .text(function(d) { return d; });
}

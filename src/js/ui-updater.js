export default class UIUpdater {
  constructor(option) {
    this.index_datalist = "#" + option.id_index_datalist;
  }

  createDataColumnIndex({ data }) {
    if (data.length <= 0) return false;
    const options = d3.select(this.index_datalist)
      .selectAll("option")
      .data(Object.keys(data[0]))
    options.exit().remove();
    const entered = options.enter().append("option");
    entered.merge(options)
      .attr("value", d => d);
  }

  setGraphAppender(ga) {
    this.graphAppender = ga;
  }

  replotGraph() {
    this.graphAppender.replotAll();
  }
}
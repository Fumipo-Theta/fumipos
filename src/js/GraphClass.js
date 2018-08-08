

const testData = [
  { x: 1, y: 2, dummy: 1 },
  { x: 0, y: -1, dummy: 1 },
  { x: 2, y: 10, dummy: 1 }
]

export class Graph {
  constructor(graphId, settingId) {
    this.graph = "#" + graphId;
    this.settingId = "#" + settingId;
    this.state = {}
    this.svgSize = {
      size: { width: 300, height: 200 },
      padding: { left: 15, right: 15, top: 15, buttom: 15 },
      offset: { x: 60, y: 60 },
      axis: { width: 0, height: 0 }
    };
    this.axis = {}
    this.scale = {}
    this.extent = { x: [0, 1], y: [0, 1] }
  }

  initialize(dataEntries = testData) {
    this.readSetting();
    this.setStateX();
    this.setStateY();
    this.updateExtent(dataEntries);
    this.updateSvgSize();
    this.createSvg();
    this.createAxis();
    this.update(dataEntries);
  }


  createSvg() {
    d3.select(this.graph + " .plot").append("h1");
    this.svg = d3.select(this.graph + " .plot")
      .append("svg")
    this.canvas = this.svg.append("g").attr("class", "plotArea")
    this.updateSvg();
    this.updateTitle();
  }



  createAxis() {
    this.updateAxisSize();
    const { size, offset, padding, axis } = this.svgSize;
    const svg = this.svg;
    // y軸を登録
    svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + (offset.x + padding.left) + "," + (size.height - axis.height - offset.y - padding.buttom) + ")");
    // y軸ラベルを登録
    svg.select(".y.axis")
      .append("text")
      .attr("class", "ylabel")
      .attr("transform", "rotate (-90," + -offset.x + "," + axis.height * 0.6 + ")")
      .attr("x", -offset.x)
      .attr("y", axis.height * 0.6)
      .text(" ");

    // x軸を登録
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(" + (offset.x + padding.left) + "," + (size.height - offset.y - padding.buttom) + ")");
    // x軸ラベルを登録
    svg.select(".x.axis")
      .append("text")
      .attr("class", "xlabel")
      .attr("x", axis.width * 0.4)
      .attr("y", offset.y * 0.75)
      .text(" ");

    this.updateAxis();
  }

  update(dataEntries = testData) {
    this.readSetting();
    this.setStateX();
    this.setStateY();
    this.updateExtent(dataEntries);
    this.updateSvgSize();
    this.updateSvg();
    this.updateTitle();
    this.updateAxis();
    this.replot(dataEntries);
  }

  setTitle(text) {
    d3.select(this.graph).select("h1").text(text);
  }

  updateTitle() {
  }

  updateSvg() {
    const { size, offset, padding, axis } = this.svgSize;
    this.svg.attr("width", size.width)
      .attr("height", size.height);
    this.canvas.attr("transform", `translate(${padding.left + offset.x},${padding.top})`)
      .attr("width", axis.width)
      .attr("height", axis.height)
      .attr("fill", "gray")
  }

  updateAxis() {
    this.updateAxisSize();
    this.updateAxisType();
    const { size, offset, padding, axis } = this.svgSize;

    this.svg.select("g.y.axis")
      .attr("transform", `translate(${offset.x + padding.left},${size.height - axis.height - offset.y - padding.buttom} )`);

    this.svg.select("g.x.axis")
      .attr("transform", "translate(" + (offset.x + padding.left) + "," + (size.height - offset.y - padding.buttom) + ")");

    this.svg.select(".y.axis").transition().call(this.axis.y);
    this.svg.select(".x.axis").transition().call(this.axis.x);

    this.svg.select(".y.axis").select("path").transition()
      .attr("d", "M" + axis.width + ",0H0V" + axis.height + "H" + axis.width)
    this.svg.select(".x.axis").select("path").transition()
      .attr("d", "M0,-" + axis.height + "V0H" + axis.width + "V-" + axis.height)

    this.svg.select("text.ylabel").transition()
      .attr("transform", "rotate (-90," + -offset.x + "," + axis.height * 0.6 + ")")
      .attr("x", -offset.x)
      .attr("y", axis.height * 0.6)
      .text(this.state.y.name);
    this.svg.select("text.xlabel").transition()
      .attr("x", axis.width * 0.4)
      .attr("y", offset.y * 0.75)
      .text(this.state.x.name);

    this.svg.selectAll("path.domain").attr("fill", "none");
  }

  updateAxisSize() {
    const { size, padding, offset } = this.svgSize;
    this.svgSize.axis = {
      width: size.width - offset.x - padding.left - padding.right,
      height: size.height - offset.y - padding.top - padding.buttom
    }
  }

  updateSvgSize() {

  }

  updateAxisType() {
    const { size, axis } = this.svgSize;
    this.scale.x = d3.scaleLinear();
    this.scale.x.domain(this.extent.x).range([0, axis.width]);
    this.axis.x = d3.axisBottom(this.scale.x).ticks(5)
    this.axis.x.tickSize(6, -size.height);

    this.scale.y = d3.scaleLinear();
    this.scale.y.domain(this.extent.y).range([axis.height, 0]);
    this.axis.y = d3.axisLeft(this.scale.y).ticks(5)
    this.axis.y.tickSize(6, -size.width);
  }

  readSetting() {
    [...document.querySelector(this.settingId).querySelectorAll("input")].forEach(d => {
      switch (d.type) {
        case "checkbox":
          this.state[d.id] = d.checked;
          break;
        case "text":
          this.state[d.id] = d.value;
          break;
        case "number":
          this.state[d.id] = parseFloat(d.value);
          break;
        case "range":
          this.state[d.id] = parseFloat(d.value);
          break;
        default:
          this.state[d.id] = d.value;
          break;
      }
    });

  }

  setStateX() {

  }

  setStateY() {

  }

  updateExtent(df) {

  }
}

export class GraphManager {
  constructor() {
    this.graphCount = 0;
    this.label = "";
    this.type = "";
    this.instance = {};
  }

  setData(dataEntries) {
    this.data = dataEntries;
    Object.values(this.instance).forEach(g => {
      g.update(dataEntries);
    })
  }

  incrementCounter() {
    this.graphCount++;
  }


  getCount() {
    return this.graphCount;
  }

  buttonLabel() {
    return this.label;
  }

  graphType() {
    return this.type;
  }

  getTemplate(uiState) {
    return this.template(uiState);
  }

  getStyle() {
    return this.style();
  }

  appendGraph(graphId, settingId, id) {
    this.instance[id] = new this.Graph(graphId, settingId);
    this.instance[id].initialize(this.data)
  }

  removeGraph(id) {
    this.instance[id] = null;
  }

  updateGraph(id) {
    this.instance[id].update(this.data);
  }
};


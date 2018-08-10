

const testData = [
  { x: 1, y: 2, dummy: 1 },
  { x: 0, y: -1, dummy: 1 },
  { x: 2, y: 10, dummy: 1 }
]



export class Graph {
  constructor(graphId, settingId, tooltipId) {
    this.graph = "#" + graphId;
    this.settingId = "#" + settingId;
    this.tooltip = d3.select("#" + tooltipId);
    this.clipPathId = "clip_" + graphId
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

  initialize(state) {
    this.readSetting();
    this.setStateX();
    this.setStateY();
    this.updateExtent(state);
    this.updateSvgSize();
    this.createSvg();
    this.createAxis();
    this.update(state);
  }


  createSvg() {
    d3.select(this.graph + " .plot").append("h1");
    this.svg = d3.select(this.graph + " .plot")
      .append("svg")
    this.clipRect = this.svg.append("defs")
      .append("clipPath")
      .attr("id", this.clipPathId)
      .append("rect");
    this.canvas = this.svg.append("g")
      .attr("class", "plotArea")
      .attr("clip-path", `url(#${this.clipPathId})`)

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
      .attr("fill", "black")
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
      .attr("fill", "black")
      .text(" ");

    this.updateAxis();
  }

  update(state) {
    this.readSetting();
    this.setStateX();
    this.setStateY();
    this.updateExtent(state);
    this.updateSvgSize();
    this.updateSvg();
    this.updateTitle();
    this.updateAxis();
    this.replot(state);
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
      .attr("transform", `translate(${offset.x + padding.left},${size.height - axis.height - offset.y - padding.buttom} )`)
      .call(this.axis.y)
      .select("path")//.transition()
      .attr("d", "M" + axis.width + ",0H0V" + axis.height + "H" + axis.width)

    this.svg.select("g.x.axis")
      .attr("transform", "translate(" + (offset.x + padding.left) + "," + (size.height - offset.y - padding.buttom) + ")")
      .call(this.axis.x)
      .select("path")//.transition()
      .attr("d", "M0,-" + axis.height + "V0H" + axis.width + "V-" + axis.height)


    this.svg.select("text.ylabel")
      .attr("transform", "rotate (-90," + -offset.x + "," + axis.height * 0.6 + ")")
      .attr("x", -offset.x)
      .attr("y", axis.height * 0.6)
      .transition()
      .text(this.state.y.name);
    this.svg.select("text.xlabel")
      .attr("x", axis.width * 0.4)
      .attr("y", offset.y * 0.75)
      .transition()
      .text(this.state.x.name);

    this.svg.selectAll("path.domain").attr("fill", "none");
  }

  updateAxisSize() {
    const { size, padding, offset } = this.svgSize;
    this.svgSize.axis = {
      width: size.width - offset.x - padding.left - padding.right,
      height: size.height - offset.y - padding.top - padding.buttom
    }
    this.clipRect
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", this.svgSize.axis.width)
      .attr("height", this.svgSize.axis.height)

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
    [...document.querySelector(this.settingId).querySelectorAll("select")].forEach(d => {
      this.state[d.id] = d.value;
    })
  }

  setStateX() {

  }

  setStateY() {

  }

  updateExtent({ data }) {

  }
}

export class GraphManager {
  constructor(uiState) {
    this.graphCount = 0;
    this.label = "";
    this.type = "";
    this.instance = {};
    this.uiState = uiState;
  }

  replot() {
    Object.values(this.instance).forEach(g => {
      g.update(this.uiState);
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

  getTemplate() {
    return this.template(this.uiState);
  }

  getStyle() {
    return this.style();
  }

  append(graphId, settingId, tooltipId, id) {
    this.instance[id] = new this.Graph(graphId, settingId, tooltipId);
    this.instance[id].initialize(this.uiState)
  }

  remove(id) {
    this.instance[id] = null;
  }

  update(id) {
    this.instance[id].update(this.uiState);
  }
};


import { GraphManager, Graph } from "./GraphClass.js";

class Binary extends Graph {
  constructor(graph, setting) {
    super(graph, setting);
  }

  readSetting() {
    super.readSetting();

    this.state.x = Binary.parseDataName(
      this.state.xName,
      this.state.x_min,
      this.state.x_max,
      this.state.checkLogX
    )
    this.state.y = Binary.parseDataName(
      this.state.yName,
      this.state.y_min,
      this.state.y_max,
      this.state.checkLogY
    )

    this.svgSize.size = this.getSvgSize();
  }


  updateTitle() {
    const { x, y } = this.state;
    this.svg.select("h1").text(`${x.name} vs. ${y.name}`);
  }

  setAxis() {
    const { size, axis } = this.svgSize;
    this.scale.x = (this.state.x.islog)
      ? d3.scaleLog()
      : d3.scaleLinear();
    this.scale.x.domain(this.extent.x).range([0, axis.width]);
    this.axis.x = (this.state.x.islog)
      ? d3.axisBottom(this.scale.x).ticks(0, "e")
      : d3.axisBottom(this.scale.x).ticks(5)
    this.axis.x.tickSize(6, -size.height);

    this.scale.y = (this.state.y.islog)
      ? d3.scaleLog()
      : d3.scaleLinear();
    this.scale.y.domain(this.extent.y).range([axis.height, 0]);
    this.axis.y = (this.state.y.islog)
      ? d3.axisLeft(this.scale.y).ticks(0, "e")
      : d3.axisLeft(this.scale.y).ticks(5)
    this.axis.y.tickSize(6, -size.width);

  }


  static parseDataName(name, min, max, islog) {
    const obj = {
      name: name,
      islog: islog,
      max: max,
      min: min,
      char: new Array(name.match(/[A-Z]+/gi)),
      num: new Array(name.match(/[0-9]+/g))
    };
    const type = (name.match(/^[0-9]+/))
      ? {
        type: "isotope",
        element: name.match(/[a-z]+/i)[0],
        sup: name,
        sub: "dummy"
      }
      : (name.match(/\//))
        ? {
          type: "ratio",
          element: name.split("/")[0],
          sup: name.split("/")[0],
          sub: name.split("/")[1]
        }
        : {
          type: "abundance",
          element: "dummy",
          sup: name,
          sub: "dummy"
        }
    return Object.assign(obj, type);
  }

  getSvgSize() {
    const width = parseInt(
      document.querySelector("body").clientWidth * this.state.imageSize);
    const aspect = this.state.aspect;

    return {
      width: parseInt(width),
      height: parseInt(width * aspect)
    }
  }


}

export default class GraphBinaryPlot extends GraphManager {
  constructor() {
    super();
    this.label = "Binary variation";
    this.type = "Binary";
    this.Graph = Binary;
  }



  style() {
    return `
      top: 50px;
  left: 30%;
  display:none;
  position: fixed;
  width: 40vw;
  min-width: 300px;
  margin: 5px auto;
  padding: 15px;
  background-color: rgba(250,250,255,0.9);
  z-index:11;
  border-radius: 5px;
  box-shadow: 0px 10px 10px 3px rgba(0,0,0,0.2), 0px 5px 5px 1px rgba(0,0,0,0.5);
    `
  }

  template(uiState) {
    return `
    <style>
    .binary-setting .eleInput label{
  width: 10vw;
  min-width: 70px;
}
.binary-setting .rangeInput label{
  width: 6vw;
  min-width: 50px;
}
binary-setting .imageInput label{
  width: 6vw;
  min-width: 100px;
}
    </style>

    <form class="binary-setting" action="#">
  <a href="#" class="close_button"></a>
  <hr style="visibility:hidden">
  <div class="eleInput">
    <span class="text">element</span>

    <label for="xName" class="inp">
      <input type="text" id="xName" placeholder="&nbsp;" pattern="^[0-9A-Za-z\s]+$" required autofocus list="indexList" autocomplete="on">
      <span class="label">x</span>
      <span class="border"></span>
    </label>

    <span class="text">vs.</span>

    <label for="yName" class="inp">
      <input type="text" id="yName" placeholder="&nbsp;" pattern="^[0-9A-Za-z\s]+$" required list="indexList" autocomplete="on">
      <span class="label">y</span>
      <span class="border"></span>
    </label>


  </div>

  <hr>

  <div class="rangeInput">
    <span class="text">Range</span>
    <!-- x min : x max -->
    <label for="x_min" class="inp">
      <input type="number" id="x_min" placeholder="&nbsp;">
      <span class="label">x min</span>
      <span class="border"></span>
    </label>

    <span class="text">:</span>

    <label for="x_max" class="inp">
      <input type="number" id="x_max" placeholder="&nbsp;">
      <span class="label">x max</span>
      <span class="border"></span>
    </label>

    <span class="text">&</span>

    <!-- y min : y max-->

    <label for="y_min" class="inp">
      <input type="number" id="y_min" placeholder="&nbsp;">
      <span class="label">y min</span>
      <span class="border"></span>
    </label>

    <span class="text">:</span>

    <label for="y_max" class="inp">
      <input type="number" id="y_max" placeholder="&nbsp;">
      <span class="label">y max</span>
      <span class="border"></span>
    </label>
  </div>

  <hr>
  <div class="logInput">
    <label for="#checkLogX">
      <input type="checkbox" id="checkLogX">
      <span class="text">log x</span>
    </label>

    <label for="#checkLogY">
      <input type="checkbox" id="checkLogY">
      <span class="text">log y</span>
    </label>
  </div>
  <hr>


  <div class="imageInput">

    <div style="width: 300px">
      <span class="text">Image size</span>
      <input class="mdl-slider mdl-js-slider" type="range" id="imageSize" min="0.2" max="1" value="0.45" step="0.05">
    </div>
    <hr>

    <label for="aspect" class="inp">
      <input type="number" id="aspect" value="1" placeholder="&nbsp;">
      <span class="label">aspect ratio</span>
      <span class="border"></span>
    </label>
  </div>

</form>
    `
  }
};


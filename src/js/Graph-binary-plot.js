import { GraphManager, Graph } from "./GraphClass.js";
import TransExcramate from "./Graph-event-trans-excramate.js";

const {
  transduce,
  Dataframe
} = funcTools;
const {
  mapping,
  filtering,
  intoArray
} = transduce;



const getPrecision = (val, precise = 4) => {
  let value = new Number(val);
  return value.toPrecision(precise);
}

class Binary extends Graph {
  constructor(graph, setting, tooltip) {
    super(graph, setting, tooltip);
    this.magnifyMyData = {
      r: 1.5,
      strokeWidth: 1.2
    }
  }


  replot(state) {

    const canvas = this.canvas;
    const plotFunc = Binary.showPoint(
      this.state,
      this.scale,
      this.plotStyle,
      state
    );

    const circle = canvas.selectAll("circle").data(state.data);
    circle.exit().transition().remove();
    const enter = circle.enter().append("circle")
    const merged = enter.merge(circle)
    merged.each(plotFunc);

    merged.on("mouseover", TransExcramate.onMouseOver(
      this.state,
      this.plotStyle,
      state,
      Binary.showTooltip(this.state, this.tooltip)
    ));
    merged.on("mouseout", TransExcramate.onMouseOut(
      this.state,
      this.plotStyle,
      state,
      Binary.hideTooltip(this.state, this.tooltip)
    ));
    merged.on("click", TransExcramate.onClick(
      this.state,
      this.plotStyle,
      state
    ));

    this.svg.on("click", TransExcramate.globalClick(merged, this.plotStyle))
  }

  static showTooltip({ x, y }, tooltip) {
    return function (d) {
      tooltip.style("visibility", "visible")
        .text(`${d.name}  ${d.location} [ ${getPrecision(d[x.sup])}${(x.sub === "dummy") ? "" : "/" + getPrecision(d[x.sub]) + "=" + getPrecision(d[x.sup] / d[x.sub])} : ${getPrecision(d[y.sup])}${(y.sub === "dummy") ? "" : "/" + getPrecision(d[y.sub]) + "=" + getPrecision(d[y.sup] / d[y.sub])} ]`)
    }
  }

  static hideTooltip(_, tooltip) {
    return function (d) {
      tooltip.style("visibility", "hidden")
    }
  }

  static showPoint(
    { x, y },
    scale,
    plotStyle,
    { styleClass }
  ) {

    return function (d) {
      const cx = scale.x(+d[x.sup] / +d[x.sub])
      const cy = scale.y(+d[y.sup] / +d[y.sub])

      const self = d3.select(this)

      if (isNaN(cx) || isNaN(cy) || !isFinite(cx) || !isFinite(cy)) {
        self.transition()
          .attr("r", 0)
          .remove();
        return false;
      }
      self.attr('stroke-width', d => d.study === "mine" ? 1 : "none")
        .attr("fill", "none")
        .attr("class", d => Graph.setClass(d, styleClass))
        .attr("opacity", plotStyle.opacity)
        .transition()
        .attr("r", plotStyle.r)
        .attr("cx", cx)
        .attr("cy", cy)
    }
  }

  static plotStyle(type, multiple, { symbol }) {
    return function (d) {
      const value = (d.onState === "selected")
        ? symbol["selected" + type]
        : (d.onState === "on")
          ? symbol["on" + type]
          : symbol["base" + type];
      return (d.study === "mine")
        ? value * multiple
        : value
    }
  }


  updateSvgSize() {
    const width = parseInt(
      document.querySelector("body").clientWidth * this.state.imageSize);
    const aspect = this.state.aspect;

    this.svgSize.size = {
      width: parseInt(width),
      height: parseInt(width * aspect)
    }
  }

  setStateX() {
    this.state.x = Binary.parseDataName(
      this.state.xName,
      this.state.x_min,
      this.state.x_max,
      this.state.checkLogX
    )
  }

  setStateY() {
    this.state.y = Binary.parseDataName(
      this.state.yName,
      this.state.y_min,
      this.state.y_max,
      this.state.checkLogY
    )
  }


  updateTitle() {
    const { x, y } = this.state;
    this.setTitle(`${x.name} vs. ${y.name}`);
  }

  updateAxisType() {
    const { size, axis } = this.svgSize;
    this.scale.x = (this.state.x.islog)
      ? d3.scaleLog()
      : d3.scaleLinear();
    this.scale.x.domain(this.extent.x)
      .range([0, axis.width])
      .nice();
    this.axis.x = d3.axisBottom(this.scale.x)
    this.axis.x.tickSize(6, -size.height);

    this.scale.y = (this.state.y.islog)
      ? d3.scaleLog()
      : d3.scaleLinear();
    this.scale.y.domain(this.extent.y)
      .range([axis.height, 0])
      .nice();
    this.axis.y = d3.axisLeft(this.scale.y)
    this.axis.y.tickSize(6, -size.width);

  }

  updateExtent({ data }) {
    if (!Array.isArray(data)) return null;
    const { x, y } = this.state;
    this.extent.x = [
      (isNaN(x.min))
        ? d3.min(data.filter(d => isFinite(+d[x.sup] / +d[x.sub])), d => +d[x.sup] / +d[x.sub])
        : x.min,
      (isNaN(x.max))
        ? d3.max(data.filter(d => isFinite(+d[x.sup] / +d[x.sub])), d => +d[x.sup] / +d[x.sub])
        : x.max
    ];

    this.extent.y = [
      (isNaN(y.min))
        ? d3.min(data.filter(d => isFinite(+d[y.sup] / +d[y.sub])), d => +d[y.sup] / +d[y.sub])
        : y.min,
      (isNaN(y.max))
        ? d3.max(data.filter(d => isFinite(+d[y.sup] / +d[y.sub])), d => +d[y.sup] / +d[y.sub])
        : y.max
    ];

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

}

export default class GraphBinaryPlot extends GraphManager {
  constructor(uiState) {
    super(uiState);
    this.label = "Binary variation";
    this.type = "Binary";
    this.Graph = Binary;
  }



  style() {
    return `
  top: 50px;
  left: 30%;
  width: 40vw;
  min-width: 300px;
    `
  }

  template(uiState) {
    return `
<style>
.binary-setting{
  display : flex;
  flex-direction : column;
}
.binary-setting > div{
  display : flex;
  align-items : center;
  border-bottom : 1px dashed var(--form-color);
  margin: 3px 0;
  padding : 10px 0;
}

.binary-setting .eleInput label{
  /*width: 10vw;*/
  min-width: 70px;
}
.binary-setting .rangeInput label{
  /*width: 6vw;*/
  min-width: 50px;
}
.binary-setting .imageInput {
  
}
.binary-setting .imageInput span{
  flex : 1;
}
.binary-setting .imageInput input{
  flex : 2;
}
.binary-setting .imageInput label{
  /*width: 6vw;*/
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

  
  <div class="logInput">
    <label >
      <input type="checkbox" id="checkLogX" tabindex=0>
      <span class="checkbox-parts">log x</span>
    </label>

    <label>
      <input type="checkbox" id="checkLogY"  tabindex=0>
      <span class="checkbox-parts" >log y</span>
    </label>
  </div>
  


  <div class="imageInput">
      <span class="text">Image size</span>
      <input class="mdl-slider mdl-js-slider" type="range" id="imageSize" min="0.2" max="1" value="0.3" step="0.05">
  
  </div>
  
  <div>
    <label for="aspect" class="inp">
      <input type="number" id="aspect" min="0.1" value="0.8" step="0.05" placeholder="&nbsp;">
      <span class="label">aspect ratio</span>
      <span class="border"></span>
    </label>
  </div>

</form>
    `
  }
};


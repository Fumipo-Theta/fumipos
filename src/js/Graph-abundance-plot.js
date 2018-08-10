import { GraphManager, Graph } from "./GraphClass.js";

const {
  transduce,
  Dataframe
} = funcTools;
const {
  mapping,
  filtering,
  intoArray
} = transduce;

let clickFlag = false;

class Abundance extends Graph {
  constructor(graph, setting, tooltip) {
    super(graph, setting, tooltip);
  }

  replot(state) {
    const refData = Abundance.getNormList(state, this.state);
    const plotData = Abundance.getNormalizedData(this.state.doNormalization, state, refData);
    const { x } = this.state;

    const path = this.canvas.selectAll("path").data(plotData);
    path.exit()
      .remove()
    const entered = path.enter().append("path");
    const merged = entered.merge(path);
    merged.each(Abundance.showPlot(x, this.scale, state))

  }

  static showPlot(x, scale, { symbol, styleClass }) {
    const { label } = x
    const line = d3.line()
      .x(d => scale.x(d.x))
      .y(d => scale.y(d.y))
      .defined(d => !isNaN(d.y) && d.y !== 0);
    const getOneLine = d => label.map(e => ({
      x: e,
      y: d[e]
    }))
    return function (d) {
      d3.select(this)
        .attr("fill", "none")
        .attr("class", d => Abundance.setClass(d, styleClass))
        .attr("d", d => line(getOneLine(d)))
        .attr("stroke-width", symbol.baseWidth)
    }
  }

  static onMouseOver() {
    return function (d) {
      const sameId = Abundance.extractClass(d3.select(this).attr("class"), id);
      d3.selectAll("." + sameId)
        .each(d => {
          d.onState = (d.onState === "selected")
            ? "selected"
            : "on"
        })
        .classed("base", false)
        .classed("on", d => d.onState === "on")
        .attr("r", myData.r)
        .attr("opacity", myData.opacity);

      d3.selectAll(".plotArea .base")
        //.transition()
        .attr("opacity", symbol.outOpacity)
        .attr('r', symbol.outRadius);
    }
  }

  static setClass(d, styleClass) {
    const styleColumn = (d.hasOwnProperty(styleClass))
      ? d[styleClass]
      : "none";
    const study = (d.hasOwnProperty("study"))
      ? d.study
      : "none";


    return `Binary D${d.id} ${styleColumn} ${study} ${d.onState}`
  }

  static extractClass(className, selector) {
    const classList = className.split(" ");
    switch (selector) {
      case "id":
        return classList[1];

      case "style":
        return classList[2];

      case "study":
        return classList[3];
      case "onState":
        return classList[4];

      default:
        return false;

    }
  }


  static getNormList({ refData }, { normInfo }) {
    return refData
      .filter(e => e.name === normInfo[0] && e.study === normInfo[1])[0]
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

  readSetting() {
    super.readSetting();
    this.state.normInfo = this.state.reserver.split(",")
  }

  setStateX() {
    this.state.x = {
      label: this.state.eleName
        .replace(/,/g, " ")
        .replace(/\s+/g, " ")
        .replace(/\s$/, "")
        .split(" "),
      name: ""
    }
  }

  setStateY() {
    this.state.y = {
      name: "Abundance"
    }
  }

  updateTitle() {
    const { x, y, normInfo } = this.state;
    this.setTitle(`Normalized by ${normInfo[0]}`);
  }

  updateAxisType() {
    const { size, axis } = this.svgSize;
    this.scale.x = d3.scalePoint();
    this.scale.x.domain(this.extent.x)
      .range([0, axis.width])
      .padding(0.5);
    this.axis.x = d3.axisBottom(this.scale.x)
    this.axis.x.tickSize(6, -size.height);

    this.scale.y = d3.scaleLog()
    this.scale.y.domain(this.extent.y)
      .range([axis.height, 0])
      .nice();
    this.axis.y = d3.axisLeft(this.scale.y)
    this.axis.y.tickSize(6, -size.width);

  }

  static getNormalizedData(doNormalization, { data }, refData) {
    return (doNormalization)
      ? intoArray(
        mapping(e => {
          const obj = {}
          Object.entries(e)
            .forEach(([k, v]) => {
              const val = v / refData[k]
              if (isNaN(val)) {
                obj[k] = v
              } else {
                obj[k] = (isFinite(val))
                  ? val
                  : NaN;
              }
            })
          return obj
        })
      )(data)
      : data;
  }

  updateExtent() {
    const { x, y_min, y_max } = this.state;
    this.extent.x = x.label;
    this.extent.y = [y_min, y_max]
  }
}

export default class GraphAbundancePlot extends GraphManager {
  constructor(uiState) {
    super(uiState);
    this.label = "Abundance pattern";
    this.type = "Abundance";
    this.Graph = Abundance;
  }

  style() {
    return `
  top: 50px;
  left: 30%;
  width: 50vw;
  min-width: 300px;
    `
  }

  template(uiState) {
    return `
<style>
.abundance-setting{
  display : flex;
  flex-direction : column;
}
.abundance-setting > div{
  display : flex;
  align-items : center;
  border-bottom : 1px dashed #4e4ebb;
  margin: 3px 0;
  padding : 10px 0;
}
.abundance-setting .inp.wide{
  max-width : 100%;
}
.abundance-setting .imageInput span{
  flex : 1;
}
.abundance-setting .imageInput input{
  flex : 2;
}
.abundance-setting .imageInput label{
  min-width: 100px;
}
</style>


<form class="abundance-setting" name="formAbundance" action="#">
  <a href="#" class="close_button"></a>
  <hr style="visibility:hidden">
    
  <datalist id="eleList">
    <option value="La Ce Pr Nd Sm Eu Gd Tb Dy Ho Er Tm Yb Lu"></option>
    <option value="Rb Ba Th U Ta Nb K La Ce Pb Pr Sr Nd Zr Hf Sm Eu Gd Tb Dy Y Ho Er Tm Yb Lu"></option>
    <option value="Rb Ba Th Nb La Ce Pb Pr Sr Nd Zr Hf Sm Eu Gd Tb Dy Y Ho Er Tm Yb Lu"></option>
    <option value="Rb Ba Th U K Ta Nb La Ce Sr Nd P Hf Zr Sm Ti Tb Yb"></option>
    <option value="Sr K Rb Ba Th Ta Nb Ce P Zr Hf Sm Ti Y Yb"></option>
    <option value="Rb Ba Th K Nb La Ce Sr Nd Zr Sm Eu Gd Ti Dy Y Er Yb V Cr Ni"></option>
    <option value="Rb Ba Th Nb K Pb Sr Nd Zr Hf Y"></option>
  </datalist>

  <div class="eleInput__Abundance">
    <label >
      <input type="checkbox" id="doNormalization" tabindex=0 checked>
      <span class="checkbox-parts">Normalize</span>
    </label>

    <label for="eleName" class="inp wide">
      <input  type="text" id="eleName" placeholder="&nbsp;"  pattern="^[0-9A-Za-z\s]+$" autofocus required  list="eleList" autocomplete="on" value="La Ce Pr Nd Sm Eu Gd Tb Dy Ho Er Tm Yb Lu">
      <span class="label">Element list</span>
      <span class="border"></span>
    </label>
  </div>

  <div>
  <span class="text">Normalizing reserver</span>
  <br>
  <select id="reserver">
    <optgroup label="Primitive mantle">
      <option value="PM,Sun&McDonough-1989">Sun & McDonough(1989)</option>
      <option value="PM,Lyubetskaya&Korenaga-2007">Lyubetskaya & Korenaga(2007)</option>
    </optgroup>
    <optgroup label="MORB source mantle">
      <option value="AverageDMM,Workman&Hart-2005">Average DMM by Workman & Hart (2005)</option>
      <option value="EDMM,Workman&Hart-2005">EDMM by Workman & Hart(2005)</option>
      <option value="DDMM,Workman&Hart-2005">DMM by Workman & Hart(2005)</option>
    </optgroup>
    <optgroup label="MORB">
      <option value="NMORB,Sun&McDonough-1989">MORB by Sun & McDonough(1989)</option>
      <option value="EMORB,Sun&McDonough-1989">EMORB by Sun & McDonough(1989)</option>
    </optgroup>
    <optgroup label="OIB">
      <option value="OIB,Sun&McDonough-1989">OIB by Sun & McDonough(1989)</option>
    </optgroup>
    <optgroup label="Chondrite">
      <option value="CI_chondrite,Lodders-2003">CI chondrite by Lodders(2003)</option>
    </optgroup>
    <optgroup label="Raw value">
      <option value="not_normalize,mine">Not normalizing</option>
    </optgroup>
  </select>
  </div>


  <div class="rangeInput__Abundance">
    <span>Range</span>
    <label for="y_min" class="inp">
      <input type="number" id="y_min" value="0.001" placeholder="&nbsp;">
      <span class="label">y min</span>
      <span class="border"></span>
    </label>

    <span class="text">:</span>

    <label for="y_max" class="inp">
      <input type="number" id="y_max" value="1000" placeholder="&nbsp;">
      <span class="label">y max</span>
      <span class="border"></span>
    </label>
  </div>
  

  <div class="imageInput">
      <span class="text">Image size</span>
      <input class="mdl-slider mdl-js-slider" type="range" id="imageSize" min="0.2" max="1" value="0.5" step="0.05">
  
  </div>
  
  <div>
    <label for="aspect" class="inp">
      <input type="number" id="aspect" value="0.8" placeholder="&nbsp;">
      <span class="label">aspect ratio</span>
      <span class="border"></span>
    </label>
  </div>

</form>
  `}
}
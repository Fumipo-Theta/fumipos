import { GraphManager, Graph } from "./GraphClass";
import TransExcramate from "./Graph-event-trans-excramate";
import funcTools from "./lib/funcTools"
import { setClass } from "./usecases/plot_data_class_name"
import PrimitiveAST from "ast/src/arithmetic/primitive/ast"
import labelPresenter from "./usecases/label_presenter"

class AST extends PrimitiveAST {
    constructor(...arg) {
        super(...arg)
    }

    evaluate(...arg) {
        try {
            return super.evaluate(...arg)
        } catch (e) {
            if (e instanceof TypeError) return NaN
        }
    }
}


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

/**
 * Make binary plot of x and y axis.
 * Arithmetic formula with column name of data table is
 *  available for x and y axis.
 *
 */
class Binary extends Graph {
    constructor(graph, setting, tooltip) {
        super(graph, setting, tooltip);
        this.magnifyMyData = {
            r: 1.5,
            strokeWidth: 1.2
        }
        this.xAST = new AST()
        this.yAST = new AST()
    }


    replot(uiState) {

        const canvas = this.canvas;
        const plotFunc = Binary.showPoint(
            this.xAST,
            this.yAST,
            this.scale,
            this.plotStyle,
            uiState
        );

        const circle = canvas.selectAll("circle").data(uiState.data);
        circle.exit().transition().remove();
        const enter = circle.enter().append("circle")
        const merged = enter.merge(circle)
        merged.each(plotFunc);

        merged.on("mouseover", TransExcramate.onMouseOver(
            this.console,
            this.plotStyle,
            uiState
        ))
            .on("mouseover.tooltip", this.showTooltip(uiState))
            .on("mouseout", TransExcramate.onMouseOut(
                this.console,
                this.plotStyle,
                uiState
            ))
            .on("mouseout.tooltip", this.hideTooltip())
            .on("click", TransExcramate.onClick(
                this.console,
                this.plotStyle,
                uiState
            ), false);

        this.svg.on("click.onoff", TransExcramate.globalClick(merged, this.plotStyle), false)
        TransExcramate.updateExtentByBrush(this.brushArea, {
            end: Binary.updateExtentByBrush(uiState).bind(this)
        });
    }

    static updateExtentByBrush(state) {
        return function (d3_event) {
            const [start, end] = d3_event.selection;
            this.extent.x = [
                this.scale.x.invert(start[0]),
                this.scale.x.invert(end[0])
            ];
            this.extent.y = [
                this.scale.y.invert(end[1]),
                this.scale.y.invert(start[1])
            ];
            this.updateAxis();
            this.replot(state);
        }
    }

    showTooltip(uiState) {
        return (d) => {
            this.tooltip.updateContent(`${uiState.tooltipAST.evaluate(d)} [ ${getPrecision(this.xAST.evaluate(d))}, ${getPrecision(this.yAST.evaluate(d))} ]`)
            this.tooltip.show()
        }
    }

    hideTooltip() {
        return (d) => {
            this.tooltip.hide()
        }
    }

    static showPoint(
        xAST,
        yAST,
        scale,
        plotStyle,
        { styleClass, optionalClasses }
    ) {

        return function (d) {
            const cx = scale.x(xAST.evaluate(d))
            const cy = scale.y(yAST.evaluate(d))

            const self = d3.select(this)

            if (isNaN(cx) || isNaN(cy) || !isFinite(cx) || !isFinite(cy)) {
                self.transition()
                    .attr("r", 0)
                    .remove();
                return false;
            }
            self.attr('stroke-width', d => d.study === "mine" ? 1 : "none")
                .attr("fill", "none")
                .attr("class", d => setClass(d, "Binary", styleClass, optionalClasses))
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

    getSetting() {
        const setting = {};
        [...document.querySelector(this.settingId).querySelectorAll("input")].forEach(d => {
            switch (d.type) {
                case "checkbox":
                    setting[d.id] = d.checked;
                    break;
                case "text":
                    setting[d.id] = d.value;
                    break;
                case "number":
                    setting[d.id] = parseFloat(d.value);
                    break;
                case "range":
                    setting[d.id] = parseFloat(d.value);
                    break;
                default:
                    setting[d.id] = d.value;
                    break;
            }
        });
        [...document.querySelector(this.settingId).querySelectorAll("select")].forEach(d => {
            setting[d.id] = d.value;
        })
        return setting
    }


    updateFigureSize() {
        const width = parseInt(
            document.querySelector("body").clientWidth * this.console.imageSize);
        const aspect = this.console.aspect;

        this.graphGeometry.figureSize = {
            width: parseInt(width),
            height: parseInt(width * aspect)
        }
    }

    updateXAxis() {
        this.xAxis.label = labelPresenter(this.console.xName)
        this.xAxis.setRange(this.console.x_min, this.console.x_max)
        this.yAxis.scaleType = (this.console.checkLogX) ? "log" : "linear"

        this.xAST.parse(this.console.xName)
    }

    updateYAxis() {
        this.yAxis.label = labelPresenter(this.console.yName)
        this.yAxis.setRange(this.console.y_min, this.console.y_max)
        this.yAxis.scaleType = (this.console.checkLogY) ? "log" : "linear"
        this.yAST.parse(this.console.yName)
    }

    updateState() {

    }


    updateTitle() {
        this.setTitle(`${this.xAxis.label} vs. ${this.yAxis.label}`);
    }

    updateAxisType() {
        const size = this.graphGeometry.figureSize;
        const axis = this.graphGeometry.axisSize;
        this.scale.x = (this.xAxis.isLog())
            ? d3.scaleLog()
            : d3.scaleLinear();
        this.scale.x.domain(this.extent.x)
            .range([0, axis.width])
            .nice();
        this.axis.x = d3.axisBottom(this.scale.x).ticks(5)
        this.axis.x.tickSize(6, -size.height);

        this.scale.y = (this.yAxis.isLog())
            ? d3.scaleLog()
            : d3.scaleLinear();
        this.scale.y.domain(this.extent.y)
            .range([axis.height, 0])
            .nice();
        this.axis.y = d3.axisLeft(this.scale.y).ticks(5)
        this.axis.y.tickSize(6, -size.width);

    }

    updateExtent({ data }) {
        if (!Array.isArray(data)) return null;

        const xRangeCand = d3.extent(data
            .map(d => this.xAST.evaluate(d))
            .filter(isFinite))
        const yRangeCand = d3.extent(data
            .map(d => this.yAST.evaluate(d))
            .filter(isFinite))

        this.extent.x = [
            isNaN(this.xAxis.min)
                ? xRangeCand[0]
                : this.xAxis.min,
            isNaN(this.xAxis.max)
                ? xRangeCand[1]
                : this.xAxis.max
        ];

        this.extent.y = [
            isNaN(this.yAxis.min)
                ? yRangeCand[0]
                : this.yAxis.min,
            isNaN(this.yAxis.max)
                ? yRangeCand[1]
                : this.yAxis.max
        ];


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
      <input type="text" id="xName" placeholder="&nbsp;" pattern="^[0-9A-Za-z\\s]+$" required autofocus list="indexList" autocomplete="on">
      <span class="label">x</span>
      <span class="border"></span>
    </label>

    <span class="text">vs.</span>

    <label for="yName" class="inp">
      <input type="text" id="yName" placeholder="&nbsp;" pattern="^[0-9A-Za-z\\s]+$" required list="indexList" autocomplete="on">
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

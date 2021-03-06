import { GraphManager, Graph } from "./GraphClass";
import TransExcramate from "./Graph-event-trans-excramate";
import funcTools from "./lib/funcTools"
import { setClass } from "./usecases/plot_data_class_name"

const {
    transduce,
    Dataframe
} = funcTools;
const {
    mapping,
    filtering,
    intoArray
} = transduce;



class Abundance extends Graph {
    /**
     * @param{string} graph
     * @param{string} setting
     * @param{Tooltip} tooltip
     */
    constructor(graph, setting, tooltip) {
        super(graph, setting, tooltip);
        this.magnifyMyData = {
            r: 1.5,
            strokeWidth: 1.2
        }
    }


    replot(uiState) {
        this.console.refData = Abundance.getNormList(uiState, this.console);
        const plotFunc = Abundance.showPlot(
            this.xAxis,
            this.console,
            this.scale,
            this.plotStyle,
            uiState
        );

        const path = this.canvas.selectAll("g").data(uiState.data);
        path.exit().transition().remove()
        const entered = path.enter().append("g");
        const merged = entered.merge(path);
        merged.each(plotFunc)

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
            ));


        this.svg.on("click", TransExcramate.globalClick(merged, this.plotStyle))
    }

    showTooltip(uiState) {
        return (d) => {
            this.tooltip.updateContent(`${uiState.tooltipAST.evaluate(d)}`)
            this.tooltip.show()
        }
    }

    hideTooltip() {
        return (d) => {
            this.tooltip.hide()
        }
    }


    static showPlot(
        xAxis,
        { doNormalization, refData },
        scale,
        plotStyle,
        { symbol, styleClass, optionalClasses }
    ) {
        const defined = d => !isNaN(d.y) && d.y !== 0 && isFinite(d.y);
        const line = d3.line()
            .x(d => scale.x(d.x))
            .y(d => scale.y(d.y))
            .defined(defined);


        const getOneLine = d => xAxis.label.map(e => ({
            x: e,
            y: d[e]
        }))
        const normalize = Abundance.getNormalizedData(doNormalization, refData)
        return function (d) {
            const data = getOneLine(normalize(d))
            const filtered = data.filter(defined)
            d3.select(this)
                .attr("class", d => setClass(d, "Abundance", styleClass, optionalClasses))
                .selectAll("path")
                .remove()
            d3.select(this).append("path")
                .attr("fill", "none")
                .attr("class", d => setClass(d, "Abundance", styleClass, optionalClasses))
                .attr("stroke-width", plotStyle.strokeWidth)
                .attr("opacity", plotStyle.opacity)
                .transition()
                //.call(line)
                .attr("d", line(data))
            if (data.length === filtered.length) return;
            d3.select(this).append("path")
                .attr("fill", "none")
                .attr("class", d => setClass(d, "Abundance", styleClass, optionalClasses))
                .attr("stroke-width", plotStyle.strokeWidth * 0.9)
                .attr("opacity", plotStyle.opacity)
                .attr("stroke-dasharray", "1 8")
                .attr("stroke-linecap", "round")
                .transition()
                //.call(line)
                .attr("d", line(filtered))

        }
    }




    static getNormList({ refData }, { normInfo }) {
        return refData
            .filter(e => e.name === normInfo[0] && e.study === normInfo[1])[0]
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

        setting.normInfo = setting.reserver.split(",")
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
        this.xAxis.label = this.console.eleName
            .replace(/,/g, " ")
            .replace(/\s+/g, " ")
            .replace(/\s$/, "")
            .split(" ")
    }

    updateYAxis() {
    }

    updateTitle() {
        const { normInfo, doNormalization } = this.console;
        this.setTitle((doNormalization)
            ? `Normalized by ${normInfo[0]}`
            : `Abundance`);
    }

    updateAxisType() {
        const size = this.graphGeometry.figureSize
        const axis = this.graphGeometry.axisSize
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

    static getNormalizedData(doNormalization, refData) {
        return d => {
            if (doNormalization) {
                const obj = {}
                Object.entries(d)
                    .forEach(([k, v]) => {

                        if (isNaN(refData[k]) && isNaN(v)) {
                            obj[k] = v
                        } else {
                            const val = v / refData[k]
                            if (isNaN(refData[k])) {
                                obj[k] = NaN;
                            } else {
                                obj[k] = (isFinite(val))
                                    ? val
                                    : NaN;
                            }
                        }
                    })
                return obj
            } else {
                return d
            }
        }
    }

    updateExtent() {
        const { y_min, y_max } = this.console;
        this.extent.x = this.xAxis.label;
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
  border-bottom : 1px dashed var(--form-color);
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
      <input  type="text" id="eleName" placeholder="&nbsp;"  pattern="^[0-9A-Za-z\\s]+$" autofocus required  list="eleList" autocomplete="on" value="La Ce Pr Nd Sm Eu Gd Tb Dy Ho Er Tm Yb Lu">
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
      <input type="number" id="aspect" min="0.1" value="0.8" step="0.05" placeholder="&nbsp;">
      <span class="label">aspect ratio</span>
      <span class="border"></span>
    </label>
  </div>

</form>
  `}
}

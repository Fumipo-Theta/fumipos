import GraphGeometry from "./entity/graph_geometry"
import GraphStyle from "./entity/graph_style"
import TextStyle from "./entity/text_style"

const testData = [
    { x: 1, y: 2, dummy: 1 },
    { x: 0, y: -1, dummy: 1 },
    { x: 2, y: 10, dummy: 1 }
]


/**
 * Grpahクラスの作り方
 *
 * Graphクラスを継承する.
 * 次のインスタンスメソッドを定義する
 *
 * * setStateX
 * * setStateY
 * * updateSvgSize
 * * updateAxisType
 * * updateExtent
 * * updateTitle
 * * replot
 * また, つぎのクラスメソッドを定義する
 *
 * * showPoint
 *
 * プロット要素へのuiイベントを設定するには次のクラスメソッドを定義する.
 *
 * * onMouseOver
 * * onMouseMove
 * * onMouseOut
 * * onClick
*/
export class Graph {
    constructor(graphId, settingId, tooltipId) {
        this.graph = "#" + graphId;
        this.settingId = "#" + settingId;
        this.tooltip = d3.select("#" + tooltipId);
        this.clipPathId = "clip_" + graphId
        this.state = {}
        this.graphGeometry = new GraphGeometry(
            { width: 300, height: 200 }, // figureSize
            { left: 10, right: 15, top: 15, buttom: 10 }, //figurePadding
            { x: 24 + 60, y: 24 + 40 }, // axisOffset
            { width: 0, height: 0 }, // axisSize
        )
        /* svg style */
        this.xlabel = new TextStyle({ fontSize: 24 })
        this.ylabel = new TextStyle({ fontSize: 24 })
        this.xtick = new TextStyle({ fontSize: 20 })
        this.ytick = new TextStyle({ fontSize: 20 })

        this.axis = {}
        this.scale = {}
        this.extent = { x: [0, 1], y: [0, 1] }

        this.magnifyMyData = {
            r: 1.5,
            strokeWidth: 1.2
        }
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

    setPlotStyle(state) {
        const {
            r,
            strokeWidth
        } = this.magnifyMyData;
        this.plotStyle = {
            r: Graph.plotStyle("Radius", r, state),
            strokeWidth: Graph.plotStyle("Width", strokeWidth, state),
            opacity: Graph.plotStyle("Opacity", 1, state)
        };
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

    /**
     * replotメソッドにてデータを要素にバインドし,
     * データに従って要素の属性を更新してプロットに反映させる.
     *
     * プロット要素へのuiイベントを他のグラフと連携するためには,
     * このメソッドにて, アプリケーションのuiStateがもつdataを
     * バインドする.
     * また, プロット要素のclass属性の設定や取得には, それぞれ
     * Graph.setClass, Graph.extractClassメソッドを用いる.
     *
     * @param {uiState} state
     */
    replot(state) {
        const { data, symbol, styleClass } = state.data;
        const binded = this.canvas.selectAll("circle")
            .data(data)
        binded.exit().remove();
        const entered = binded.enter().append("circle")
        const merged = entered.merge(binded);
        merged.each(Graph.showPlot());
    }

    static showPlot() {
        return function (d) {
            const selected = d3.select(this);
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

    createSvg() {
        d3.select(this.graph + " .plot").append("h1");
        this.svg = d3.select(this.graph + " .plot")
            .append("svg")
        this.clipRect = this.svg.append("defs")
            .append("clipPath")
            .attr("id", this.clipPathId)
            .append("rect");
        this.brushArea = this.svg.append("g")
            .attr("class", "brushArea")
            .attr("clip-path", `url(#${this.clipPathId})`)
        this.canvas = this.svg.append("g")
            .attr("class", "plotArea")
            .attr("clip-path", `url(#${this.clipPathId})`)


        this.updateSvg();
        this.updateTitle();
    }



    createAxis() {
        this.updateAxisSize();
        const size = this.graphGeometry.figureSize
        const padding = this.graphGeometry.figurePadding
        const offset = this.graphGeometry.axisOffset
        const axis = this.graphGeometry.axisSize
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
            .attr("text-anchor", "middle")
            .text("y axis")
            .style("font-size", this.ylabel.size);

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
            .attr("text-anchor", "middle")
            .text("x axis")
            .style("font-size", this.xlabel.size);

        this.updateAxis();
    }

    update(state) {
        this.setPlotStyle(state);
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
        const size = this.graphGeometry.figureSize
        const padding = this.graphGeometry.figurePadding
        const offset = this.graphGeometry.axisOffset
        const axis = this.graphGeometry.axisSize

        this.svg.attr("width", size.width)
            .attr("height", size.height);
        this.canvas.attr("transform", `translate(${padding.left + offset.x},${padding.top})`)
            .attr("width", axis.width)
            .attr("height", axis.height)
            .attr("fill", "gray")
        this.brushArea.attr("transform", `translate(${padding.left + offset.x},${padding.top})`)
            .attr("width", axis.width)
            .attr("height", axis.height)
    }

    /**
     * 軸ラベルは
     * インスタンス変数 state.x.name, state.y.name
     */
    updateAxis() {
        this.updateAxisSize();
        this.updateAxisType();

        const size = this.graphGeometry.figureSize
        const padding = this.graphGeometry.figurePadding
        const offset = this.graphGeometry.axisOffset
        const axis = this.graphGeometry.axisSize


        const yAxis = this.svg.select("g.y.axis")
            .attr("transform", `translate(${offset.x + padding.left},${size.height - axis.height - offset.y - padding.buttom} )`)
            .call(this.axis.y);
        yAxis.select("path")//.transition()
            .attr("d", "M" + axis.width + ",0H0V" + axis.height + "H" + axis.width)
        yAxis.selectAll(".tick text")
            .style("font-size", this.ytick.size)


        const xAxis = this.svg.select("g.x.axis")
            .attr("transform", "translate(" + (offset.x + padding.left) + "," + (size.height - offset.y - padding.buttom) + ")")
            .call(this.axis.x)
        xAxis.select("path")//.transition()
            .attr("d", "M0,-" + axis.height + "V0H" + axis.width + "V-" + axis.height)
        xAxis.selectAll(".tick text")
            .style("font-size", this.xtick.size)


        this.svg.select("text.ylabel")
            .attr("transform", `translate(${-(offset.x - this.ylabel.size) * 0.5},${axis.height * 0.5})rotate (-90,0,0)`)
            .attr("x", 0)
            .attr("y", (-40 - this.ylabel.size) * 0.5)
            .style("font-size", this.ylabel.size)
            .transition()
            .text(this.state.y.name || "y axis");

        this.svg.select("text.xlabel")
            .attr("x", axis.width * 0.5)
            .attr("y", (offset.x + this.xlabel.size) * 0.5)
            .style("font-size", this.xlabel.size)
            .transition()
            .text(this.state.x.name || "x axis");

        this.svg.selectAll("path.domain").attr("fill", "none");
    }

    updateAxisSize() {
        const size = this.graphGeometry.figureSize
        const padding = this.graphGeometry.figurePadding
        const offset = this.graphGeometry.axisOffset

        const { x, y } = this.state;
        const xlabelLength = (x.hasOwnProperty("name"))
            ? x.name.length
            : 0

        const ylabelLength = (y.hasOwnProperty("name"))
            ? y.name.length
            : 0

        this.xlabel.size = 24// parseInt(size.width / 20);
        while (xlabelLength * this.xlabel.size > size.width) {
            this.xlabel.size -= 1;
        }

        this.ylabel.size = 24;
        while (ylabelLength * this.ylabel.size > size.height) {
            this.ylabel.size -= 1;
        }

        offset.y = this.ylabel.size + 40;
        offset.x = this.xlabel.size + 60;

        this.graphGeometry.axisSize = {
            width: size.width - offset.x - padding.left - padding.right,
            height: size.height - offset.y - padding.top - padding.buttom
        }
        this.clipRect
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", this.graphGeometry.axisSize.width)
            .attr("height", this.graphGeometry.axisSize.height)

    }

    updateSvgSize() {

    }

    updateAxisType() {
        const size = this.graphGeometry.figureSize
        const axis = this.graphGeometry.axisSize;

        this.scale.x = d3.scaleLinear();
        this.scale.x.domain(this.extent.x).range([0, axis.width]);
        this.axis.x = d3.axisBottom(this.scale.x).ticks(5)
        this.axis.x.tickSize(6, -size.height);

        this.scale.y = d3.scaleLinear();
        this.scale.y.domain(this.extent.y).range([axis.height, 0]);
        this.axis.y = d3.axisLeft(this.scale.y).ticks(5)
        this.axis.y.tickSize(6, -size.width);
    }

    /**
     * 連携する GraphManagerがtemplateメソッドで生成したHTMLのうち
     * input[type=checkbox, text, number, range], select要素の
     * idとvalueまたはcheckedを読み取る.
     *
     * インスタンス変数stateにidをkeyとしてvalueまたはcheckedを格納する.
     *
     * 設定をもとにインスタンス変数の状態を変更するためには,
     * このメソッドを継承した上で処理を追加する.
    */
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

    /**
     * グラフの軸ラベルを設定するには, state.x, state.yについて
     * nameを設定する必要がある.
     */
    setStateX() {
        this.state.x = {
            name: ""
        }
    }

    setStateY() {
        this.state.y = {
            name: ""
        }
    }

    updateExtent({ data }) {

    }
}

/**
 * GraphManagerの作り方
 *
 * GraphManagerを継承する
 *
 * コンストラクタで次のインスタンス変数を定義する
 *
 * * {String} label: グラフ追加ボタンの表示テキスト
 * * {String} type: 他のGrpahManagerとかぶらない一意なテキスト
 * * {Graph} Graph: プロットを担うGraphクラス
 *
 * 次のインスタンスメソッドを定義する
 *
 * * {void -> String} style:
 *      プロット設定メニューの表示位置とサイズを定義
 * * {uiState -> String} template:
 *      プロット設定メニューのHTMLを定義
 *      input, select属性が読み取られ, 連携するGraphクラスの
 *      インスタンス変数 stateに格納される.
 *      state = {
 *        [key = id of DOM] : [value = value or checked
 *                              attribute of the DOM]
 *      }
 */
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

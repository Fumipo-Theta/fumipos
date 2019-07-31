import GraphGeometry from "./entity/graph_geometry"
import TextStyle from "./entity/text_style"
import GraphAxisInfo from "./entity/graph_axis_info"
import NotImplementedError from "./error/not_implemented_error"

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
    constructor(graphId, settingId, tooltip) {
        this.graph = "#" + graphId;
        this.settingId = "#" + settingId;
        this.tooltip = tooltip
        this.clipPathId = "clip_" + graphId
        this.console = {}
        this.graphGeometry = new GraphGeometry({
            figureSize: { width: 300, height: 200 },
            figurePadding: { left: 10, right: 15, top: 15, buttom: 10 },
            axisOffset: { x: 24 + 60, y: 24 + 40 },
            axisSize: { width: 0, height: 0 },
        })
        /* svg style */
        this.xlabel = new TextStyle({ fontSize: 24 })
        this.ylabel = new TextStyle({ fontSize: 24 })
        this.xtick = new TextStyle({ fontSize: 20 })
        this.ytick = new TextStyle({ fontSize: 20 })

        this.xAxis = new GraphAxisInfo("x", 0, 1, "linear")
        this.yAxis = new GraphAxisInfo("y", 0, 1, "linear")

        this.axis = {}
        this.scale = {}
        this.extent = { x: [0, 1], y: [0, 1] }

        this.magnifyMyData = {
            r: 1.5,
            strokeWidth: 1.2
        }
    }

    initialize(state) {
        this.console = this.getSetting();
        this.updateXAxis();
        this.updateYAxis();
        this.updateExtent(state);
        this.updateFigureSize();
        this.createFigure();
        this.createAxis();
        this.update(state);
    }

    setPlotStyle(uiState) {
        const {
            r,
            strokeWidth
        } = this.magnifyMyData;
        this.plotStyle = {
            r: Graph.plotStyle("Radius", r, uiState),
            strokeWidth: Graph.plotStyle("Width", strokeWidth, uiState),
            opacity: Graph.plotStyle("Opacity", 1, uiState)
        };
    }

    static plotStyle(type, multiple, { symbol }) {
        return function (d) {
            const value = (d.onState === "selected")
                ? symbol["selected" + type]
                : (d.onState === "on")
                    ? symbol["on" + type]
                    : symbol["base" + type];
            return value
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
     * @param {uiState} uiState
     */
    replot(uiState) {
        throw new NotImplementedError("replot")
    }


    createFigure() {
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
        this.console = this.getSetting();
        this.updateState();
        this.updateXAxis();
        this.updateYAxis();
        this.updateExtent(state);
        this.updateFigureSize();
        this.updateSvg();
        this.updateTitle();
        this.updateAxis();
        this.replot(state);
    }

    updateState() { }

    setTitle(text) {
        d3.select(this.graph).select("h1").text(text);
    }

    updateTitle() {
        throw new NotImplementedError("updateTitle")
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
            .text(this.yAxis.label);

        this.svg.select("text.xlabel")
            .attr("x", axis.width * 0.5)
            .attr("y", (offset.x + this.xlabel.size) * 0.5)
            .style("font-size", this.xlabel.size)
            .transition()
            .text(this.xAxis.label);

        this.svg.selectAll("path.domain").attr("fill", "none");
    }

    updateAxisSize() {
        const size = this.graphGeometry.figureSize
        const padding = this.graphGeometry.figurePadding
        const offset = this.graphGeometry.axisOffset

        const xlabelLength = this.xAxis.label.length

        const ylabelLength = this.yAxis.label.length

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

    updateFigureSize() {
        throw new NotImplementedError("updateFigureSize")
    }

    updateAxisType() {
        throw new NotImplementedError("updateAxisType")
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
     *
     * @return {Object<string,number|string|boolean>}
    */
    getSetting() {
        throw new NotImplementedError("getSetting")
    }


    /**
     * グラフの軸ラベルを設定するには, state.x, state.yについて
     * nameを設定する必要がある.
     */
    updateXAxis() {
        throw new NotImplementedError("updateXAxis")
    }

    updateYAxis() {
        throw new NotImplementedError("updateYAxis")
    }

    updateExtent({ data }) {
        throw new NotImplementedError("updateExtent")
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

    append(graphId, settingId, tooltip, id) {
        this.instance[id] = new this.Graph(graphId, settingId, tooltip);
        this.instance[id].initialize(this.uiState)
    }

    remove(id) {
        this.instance[id] = null;
    }

    update(id) {
        this.instance[id].update(this.uiState);
    }

    style() {
        throw new NotImplementedError("style")
    }

    template(uiState) {
        throw new NotImplementedError("template")
    }
};

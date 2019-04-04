

export const template = uiState => `
  <style>
  #form_legend input.button{
    cursor: pointer;
    min-width: 10vw;
    font-size: 1.5rem;
    margin: 5px 0px;
    padding: 10px;
  }


  #legend_form{
    margin: 5px;
  }

    #legend_table{
      margin: 0px;
    }

      #legend_table input.color{
        background-color: #fff;
        border: none;
        padding:0px;
      }

      #legendKey{
        color: #fff;
        background: none;
        border:none;
        font-weight: bold;
        text-align: center;
      }

  </style>

  <div id="legend_form">
  <form id="form_legend">
    <a href="#" class="close_button" id="close_legendForm"></a>
    <hr style="visibility:hidden">
    <label>
      <input id="legendJSON" type="file" accept=".json" >
      <span class="file-parts">Select legend file(.JSON)</span>
    </label>
    <input id="legendAutoLoad" type='button' style="display:none;">
    <hr>
    Selected file:
    <span id="legendFileLabel"></span>
    <hr>
    <input id="hideAll_button" class="button" type="button" value="Hide all">
    <input id="showAll_button" class="button" type="button" value="Show all">
  </form>
</div>

<div id="legend_table">
</div>
  `;
const getStyleText = function (legendStyle) {
    const group = (legendStyle.hasOwnProperty("group"))
        ? "." + legendStyle.group
        : "",
        color = (legendStyle.hasOwnProperty("color"))
            ? legendStyle.color
            : "white", /* whiteじゃないとマウスオーバーが不安定になる */
        stroke = (legendStyle.hasOwnProperty("stroke"))
            ? legendStyle.stroke
            : "none",
        strokeWidth = legendStyle.hasOwnProperty("stroke-width")
            ? legendStyle["stroke-width"]
            : "none"

    return `.plotArea circle${group}{fill:${color};stroke:${stroke};stroke-width:${strokeWidth};}` +
        `.plotArea path${group}{fill:none;stroke:${color};stroke-width:${strokeWidth};}` +
        `td${group}{color:${color};}`
}

const toggleVisibility = (_) => {
    // 凡例テーブルの状態を取得し,シンボルの表示状態を切り替え
    const legendSimbol = d3.select("table.legend").selectAll("td.switch");
    legendSimbol.each(function (d) {
        var visiblityState = d3.select(this).attr("name");
        var className = d3.select(this).attr("class");
        var classArray = className.split(" ");
        if (visiblityState == "hidden") {
            d3.selectAll(".plotArea circle." + classArray[1])
                .attr("visibility", "hidden");
            d3.selectAll(".plotArea path." + classArray[1])
                .attr("visibility", "hidden");
        } else {
            d3.selectAll(".plotArea circle." + classArray[1])
                .attr("visibility", "visible");
            d3.selectAll(".plotArea path." + classArray[1])
                .attr("visibility", "visible");
        }
    });
}

const changeLegendStyle = (legendObj) => {
    document.querySelector("#legendStyle").innerHTML = Object.values(legendObj.legends)
        .map(getStyleText)
        .reduce((a, b) => a + b, "");
}

const setEventToLegend = (legendObj) => {
    const legendSimbol = d3.select("table.legend").selectAll("td.switch")
    legendSimbol.on("click", function (d) {
        if (d3.select(this).attr("name") !== "hidden") {
            d3.select(this)
                .attr("style", "color:#ffffff")
                .attr("name", "hidden");
        } else {
            d3.select(this)
                .attr("style", "")
                .attr("name", "visible");
        }
        toggleVisibility();
    });

    /* カラーピッカーにonchangeイベントを設定*/
    const legendColor = d3.select("table.legend").selectAll("input");
    legendColor.on("change", function () {
        const selectedClass = d3.select(this).attr("class"),
            color = this.value;

        const selected = Object.entries(legendObj.legends)
            .filter(([k, v]) => v.group === selectedClass)[0];
        selected[1].color = color;

        changeLegendStyle({
            key: legendObj.key,
            legends: Object.assign(
                legendObj.legends,
                {
                    [selected[0]]: selected[1]
                })
        })
    });

    //console.log("set mouse event to legend")
}

const createLegendTable = (legendObj) => {

    d3.select("#legend_table").select("table").remove("table");
    var table = d3.select("#legend_table").append("table")
        .attr("class", "legend");
    var thead = table.append("thead");
    var tbody = table.append("tbody");

    var theadRow = thead.append('tr')
    theadRow.append("th").append("input")
        .attr("type", "text")
        .attr("id", "legendKey")
        .attr("value", legendObj.key);
    theadRow.append("th").text("symbol");
    theadRow.append("th").text("color");

    var tbodyRow = tbody.selectAll("tr").data(legendObj.legends);
    tbodyRow.exit().remove();

    const enteredTbodyRow = tbodyRow.enter().append("tr")
    const mergedTbodyRow = enteredTbodyRow.merge(tbodyRow)
    mergedTbodyRow.append("th").text(d => d.name);
    mergedTbodyRow.append("td")
        .attr("class", d => "switch " + d.group)
        .text(d => (d.stroke) ? "○" : "●");
    mergedTbodyRow.append("td").append("input")
        .attr("class", d => d.group)
        .attr("type", "color")
        .attr("value", d => d.color);

    changeLegendStyle(legendObj);
};


const setLegendFromUrl = uiState => (url) => {
    /* レジェンド定義css読み込み */
    fetch(url).then(function (data) {
        return data.json();
    }).then(function (obj) {
        uiState.styleClass = obj.key;
        createLegendTable(obj);
        setEventToLegend(obj);
        d3.select('#legendFileLabel').text(url);
    })
};

const allHide = _ => {
    const circle = d3.selectAll(".plotArea circle")
        .attr("visibility", "hidden");
    const path = d3.selectAll(".plotArea path")
        .attr("visibility", "hidden");
    const td = d3.select("table.legend")
        .selectAll(".switch")
        .attr("style", "color:#FFFFFF")
        .attr("name", "hidden");
}

const allShow = _ => {
    const circle = d3.selectAll(".plotArea circle")
        .attr("visibility", "visible");
    const path = d3.selectAll(".plotArea path")
        .attr("visibility", "visible");
    const td = d3.select("table.legend")
        .selectAll(".switch")
        .attr("style", "")
        .attr("name", "visible");
}

export const exportToEmitter = [
    { type: "afterReplot", action: toggleVisibility }
];

export const eventSetter = (emitter, uiState) => {

    setLegendFromUrl(uiState)("../data/legend_NE_Shikoku.json")

    document.getElementById("legendJSON").addEventListener('change', function (ev) {
        const file = ev.target.files;
        const reader = new FileReader();
        reader.readAsText(file[0]);
        //console.log(file)
        reader.onload = ev => {
            var obj = JSON.parse(reader.result);
            uiState.styleClass = obj.key;
            createLegendTable(obj);
            setEventToLegend(obj);
            emitter.replot();
            emitter.afterReplot();
        };
        document.querySelector("#legendFileLabel").innerHTML = (file[0].name);
    }, false);

    document.querySelector("#hideAll_button")
        .addEventListener('click', function (ev) { allHide() }, false);
    document.querySelector("#showAll_button")
        .addEventListener('click', function (ev) { allShow() }, false);

}

export const option = {
    label: "Legend",
    draggable: false
}

export const style = `
  left: 25%;
  min-width: 25vw;
  `;

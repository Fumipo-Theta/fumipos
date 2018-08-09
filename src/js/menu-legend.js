

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
    <label class="file" for="legendJSON">
      Select legend file(.JSON)
      <input id="legendJSON" type="file" accept=".json" style="display:none;">
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
      : "white",
    stroke = (legendStyle.hasOwnProperty("stroke"))
      ? legendStyle.stroke
      : "none",
    strokeWidth = legendStyle.hasOwnProperty("stroke-width")
      ? legendStyle["stroke-width"]
      : "none"

  return `.plotArea circle${group}{
      fill:${color};
      stroke:${stroke};
      stroke-width:${strokeWidth};
    }
    .plotArea path${group}{
      fill:none;
      stroke:${stroke};
      stroke-width:${strokeWidth};
    }
    td${group}{
      color:${color};
    }
    `
}


const createLegendTable = (legendObj, uiState) => {
  uiState.styleClass = legendObj.key;
  d3.select("#legend_table").select("table").remove("table");
  d3.select("#legendStyle").remove();
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

  /* styleタグを生成し登録 */
  const style = '<style type="text/css" id="legendStyle">' +
    Object.values(legendObj.legends)
      .map(getStyleText)
      .reduce((a, b) => a + b, "") +
    '</style>';

  $('head').append(style);

  //fumiposAPI.setEventToLegend();
};


const setLegendFromUrl = uiState => (url) => {
  /* レジェンド定義css読み込み */
  fetch(url).then(function (data) {
    return data.json();
  }).then(function (obj) {
    createLegendTable(obj, uiState);
    d3.select('#legendFileLabel').text(url);
  })
};

export const eventSetter = (emmiter, uiState) => {
  setLegendFromUrl(uiState)("../public/data/legend_NE_Shikoku.json")

  document.getElementById("legendJSON").addEventListener('change', function (ev) {
    const file = ev.target.files;
    const reader = new FileReader();
    reader.readAsText(file[0]);
    //console.log(file)
    reader.onload = ev => {
      var obj = JSON.parse(reader.result);
      createLegendTable(obj);
      emitter.replotGraph();
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


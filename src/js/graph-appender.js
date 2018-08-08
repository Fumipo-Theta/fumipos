
export default class GraphAppender {
  constructor(graphAreaId, graphMenuContentsId, overlayId, eventEmitter, uiState) {
    this.emitter = eventEmitter;
    this.uiState = uiState;
    this.graphMenuBtns = [];
    this.graphAreaId = graphAreaId;
    this.graphMenuContentsId = graphMenuContentsId;
    this.overlayId = overlayId;
    this.graphManager = {};
    return this;
  }

  initialize() {
    const div = document.createElement("div");
    div.id = "graphAppender";
    div.innerHTML = `
      <form class="graphAppender" id="graphAppend_button"></form>
      `
    document.querySelector("#" + this.graphAreaId).appendChild(div);
    this.dom = document.querySelector("#graphAppend_button");
    return this;
  }


  registerBtns(...graphMenuBtns) {
    this.graphMenuBtns = graphMenuBtns;
    document.querySelector("body").appendChild(
      (_ => {
        const style = document.createElement("style")
        style.innerHTML = this.graphMenuBtns.map(({ style }) => style)
          .reduce((a, b) => a + "\n" + b, "");
        style.id = "graph-menu-btn-style";
        return style;
      })()
    )
    return this;
  }


  /**
   * Graphタイプを追加すると, 
   * 1. 追加ボタンを登録
   * 2. 各Graphクラスへのグラフの登録やstate更新をラップする
   */
  registerGraphManager(...GraphManager) {
    GraphManager.forEach(G => {
      const g = new G(this.uiState);
      this.setGraphAppendButton({
        label: g.buttonLabel(),
        type: g.graphType()
      });
      this.graphManager[g.graphType()] = g;
    })
    return this;
  }

  appendGraph(type) {
    const G = this.graphManager[type];
    const id = G.getCount();
    this.appendGraphSetting(G);
    this.appendGraphArea(G);
    G.append(
      this.getTypeId("graph", type, id),
      this.getTypeId("setting", type, id),
      id
    )
    G.incrementCounter();
  }

  setGraphAppendButton({ label, type }) {
    const appendBtn = document.createElement("input");
    appendBtn.id = `append${type}`;
    appendBtn.classList.add("button", "graphAppender");
    appendBtn.type = "button";
    appendBtn.value = `+ ${label}`;
    appendBtn.addEventListener(
      "click",
      ev => this.appendGraph(type),
      false
    )
    this.dom.appendChild(appendBtn);

  }

  appendGraphSetting(G) {
    const type = G.graphType();
    const id = G.getCount()
    const settingId = this.getTypeId("setting", type, id);

    const setting = document.createElement("div");
    setting.innerHTML = G.getTemplate(this.uiState);
    setting.id = settingId;
    setting.setAttribute("style", G.getStyle());
    setting.addEventListener(
      "change",
      ev => G.update(id),
      false
    )
    document.querySelector("#" + this.graphMenuContentsId)
      .appendChild(setting);

    GraphAppender.setOpenClose(
      "",
      "#" + settingId,
      "#" + this.overlayId
    );


    $("#" + settingId).fadeIn();
    $("#" + this.overlayId).fadeIn();
    $(`#${settingId} input`)[0].focus();
  }

  /**
   * div#${graphAreaId}
   *  \-div#graph-${type}_${id}.graph
   *    \-div#nav-${type}_${id}
   *      \-ul
   *        \-li
   *          \-a#nav_save-${type}-${id}.nav_save
   *        \-li
   *          \-a#nav_setting-${type}-${id}.nav_setting
   *    \-div#plot-${type}_${id}.plot
   *      \-h1
   *      \-svg
   * @param {*} G 
   */
  appendGraphArea(G) {
    const type = G.graphType();
    const id = G.getCount();
    const graphArea = d3.select("#" + this.graphAreaId);

    const graph = graphArea.insert("div", "#graphAppender")
    graph.attr("class", "graph");
    graph.attr("id", this.getTypeId("graph", type, id))

    const graphMenu = graph.append("div");
    graphMenu.attr("id", this.getTypeId("nav", type, id));
    graphMenu.append("ul")
      .attr("style", this.menuBtnStyle);

    const graphBtns = graphMenu.select("ul")
      .selectAll("li")
      .data(this.graphMenuBtns);
    graphBtns.enter().append("li")
      .append("a")
      .attr("id", d => this.getTypeId(d.btnName, type, id))
      .attr("class", d => d.btnName)
      .on("click", d => d.click(
        "#" + this.getTypeId("graph", type, id),
        "#" + this.getTypeId("setting", type, id),
        "#" + this.overlayId,
        id,
        G
      ));

    const plot = graph.append("div");
    plot.attr("id", this.getTypeId("plot", type, id));
    plot.attr("class", "plot")
    $(`#${this.getTypeId("graph", type, id)}`).addClass("active");
  }

  getTypeId(prefix, type, id) {
    return `${prefix}-${type}_${id}`;
  }


  updateDataset(dataEntries) {
    Object.values(this.graphManager).forEach(G => {
      G.replot();
    })
  }

  static setOpenClose(btn, content, overlay) {
    $(btn).click(function () {
      $(content).fadeIn();
      $(overlay).fadeIn();
      return false;
    });
    $(overlay).click(function () {
      $(overlay).fadeOut();
      $(content).fadeOut();
      $(".graph.active").removeClass("active");
    });
    $(`${content} .close_button`).click(function () {
      $(overlay).fadeOut();
      $(content).fadeOut();
      $(".graph.active").removeClass("active");
    });


  }

};


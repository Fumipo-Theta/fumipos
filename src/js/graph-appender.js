
export default class GraphAppender {
  constructor(graphAreaId, graphMenuContentsId, overlayId, eventEmitter, uiState) {
    this.emitter = eventEmitter;
    this.uiState = uiState;
    this.eachGraphMenu = ["save", "setting", "delete"];
    this.graphAreaId = graphAreaId;
    this.graphMenuContentsId = graphMenuContentsId;
    this.overlayId = overlayId;
    this.graphClass = {};
  }

  initialize() {
    const div = document.createElement("div");
    div.id = "graphAppender";
    div.innerHTML = `
      <form class="graphAppender" id="graphAppend_button"></form>
      `

    document.querySelector("#" + this.graphAreaId).appendChild(div);

    this.dom = document.querySelector("#graphAppend_button");
  }


  /**
   * Graphタイプを追加すると, 
   * 1. 追加ボタンを登録
   * 2. 各Graphクラスへのグラフの登録やstate更新をラップする
   */
  register(...GraphClass) {
    GraphClass.forEach(G => {
      this.appendGraphButton({
        label: G.buttonLabel(),
        type: G.graphType()
      });
      this.graphClass[G.graphType()] = G;
    })
  }

  registerGraphClass(G) {
    this.graphClass.push(G);
  }

  appendGraph(type) {
    this.appendGraphSetting(type)

  }

  appendGraphButton({ label, type }) {
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

  appendGraphSetting(type) {
    const G = this.graphClass[type];
    const settingId = this.getSettingId(type, G.getCount());

    const setting = document.createElement("div");
    setting.innerHTML = G.getTemplate(this.uiState);
    setting.id = settingId;
    setting.setAttribute("style", G.getStyle());
    document.querySelector("#" + this.graphMenuContentsId)
      .appendChild(setting);

    GraphAppender.setOpenClose(
      "",
      "#" + settingId,
      "#" + this.overlayId
    )
    $("#" + settingId).fadeIn();
    $("#" + this.overlayId).fadeIn();
  }

  getSettingId(type, id) {
    return `setting-${type}-${id}`;
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
    });
    $(`${content} .close_button`).click(function () {
      $(overlay).fadeOut();
      $(content).fadeOut();
    });


  }

};



export default  class GraphAppender {
    constructor(graphAreaId, graphMenuContentsId, overlayId, eventEmitter, uiState) {
      this.emitter = eventEmitter;
      this.uiState = uiState;
      this.totalGraphCounter = 0;
      this.eachGraphCounter = {};
      this.eachGraphMenu = ["save", "setting", "delete"];
      this.graphAreaId = graphAreaId;
      this.graphMenuContentsId = graphMenuContentsId;
      this.overlayId = overlayId;

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
      })
    }

    appendGraphButton({ label, type }) {
      const appendBtn = document.createElement("input");
      appendBtn.id = `append${type}`;
      appendBtn.classList.add("button", "graphAppender");
      appendBtn.type = "button";
      appendBtn.value = `+ ${label}`;
      this.dom.appendChild(appendBtn);
    }
  };


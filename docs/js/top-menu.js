//import $ from "../../../jslib/jquery-2.2.0.min.js"
/**
 * top menu extensionの作り方
 * 
 * 次の4つを必ずexportする
 * 
 * 1. {function} {String} template(uiState)
 *  メニューウィンドウの内容を表すHTMLを返す.
 *  これはメニュー登録時にdiv要素にラップされる.
 * 2. {function} {void} eventSetter(emitter, uiState)
 *  上記のHTML要素にイベントハンドラを与えるメソッド.
 *  emitterに登録されたactionを用いることができる.
 * 3. {Object} option = {
 *  {String} label : "Label of Button shown in top menu"
 *  {Bool} draggable : Either draggable or not
 * }
 *  トップメニューに表示されるメニュー表示ボタンの名前と, 
 *  ドラッグイベントによる移動の可否を定義する.
 * 4. {String} style = "css string defining geometry of menu contents"
 *  表示されるメニューウィンドウのサイズやpaddingを定義する.
 *  (templateが返すHTML要素をラップしたdiv要素に与えられるスタイル)
 * 
 * Event Emitterに追加する関数がある場合次を定義する
 * 5. {Array} exportToEmitter = [
 *  {
 *    {String} type : "action type of Emitter",
 *    {function} action : {void} method
 *  }
 * ]
 */

export default class TopMenu {
  constructor(menuBarId, overlayId, eventEmitter, uiState) {
    this.overlayId = overlayId;
    this.menuBarId = menuBarId;
    this.menuCount = 0;
    this.emitter = eventEmitter;
    this.uiState = uiState;
    this.initialize();
  }

  initialize() {
    this.setMenuSpace();
  }

  setMenuSpace() {
    const menuSpace = document.createElement("div");
    menuSpace.id = "menu-bar-contents";
    document.querySelector("body").appendChild(menuSpace);
    this.menuBar = document.querySelector(`#${this.menuBarId}`)
    this.menuSpace = document.querySelector(`#menu-bar-contents`);
  }

  register(...menus) {
    menus.forEach(({ template, option, eventSetter, style, exportToEmitter }) => {
      const contentId = "menu-bar-content-"
        + this.menuCount++;
      const btnId = "btn-" + contentId;

      const openButton = document.createElement("a");
      openButton.classList.add("menu-btn")
      openButton.id = btnId;
      openButton.href = "#";
      openButton.innerText = option.label;
      this.menuBar.appendChild(openButton);
      const left = openButton.offsetLeft;


      const dom = document.createElement("div")

      dom.id = contentId;
      dom.classList.add("menu-bar-content");
      dom.setAttribute("style", style);
      this.menuSpace.appendChild(dom);
      dom.style.left = left;
      $("#" + contentId).html(template(this.uiState)).trigger("create");


      eventSetter(this.emitter, this.uiState);

      if (Array.isArray(exportToEmitter)) {
        this.emitter.registerAction(exportToEmitter)
      }

      TopMenu.setOpenClose(
        "#" + btnId,
        "#" + contentId,
        "#" + this.overlayId
      );
      TopMenu.setDrag("#" + contentId, option);
    })
  }

  static setOpenClose(btn, content, overlay) {
    $(btn).click(function () {
      $(content).fadeIn();
      $(content + " input")[0].focus();
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

  static setDrag(content, { draggable }) {
    if (draggable) {
      $(content).draggable({
        cursor: "move"
      })
    }
  }

}

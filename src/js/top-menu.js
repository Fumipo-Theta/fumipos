/**
 * TopMenu
 * 
 * FUMIPOSのトップメニューバーにメニューボタンと
 * 設定メニューを設定する.
 * 
 * メニューはjavascriptモジュールの形で作成する.
 * メニューは4つのオブジェクトを提供する.
 * 1. template:: uiState => HTML string
 * 2. eventSetter :: (emitter, uiState) => function
 * 3. option :: {buttonLabel: String, draggable:Bool}
 * 4. style :: String
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.TopMenu = factory(
      root.$,

    );
  }
}(this, function ($) {




  class TopMenu {
    constructor(menuBarId, overlayId, eventEmitter, uiState) {
      const menuSpace = document.createElement("div");
      menuSpace.id = "menu-bar-contents";
      document.querySelector("body").appendChild(menuSpace);

      this.menuBar = document.querySelector(`#${menuBarId}`)
      this.menuSpace = document.querySelector(`#menu-bar-contents`);
      this.overlayId = overlayId;

      this.menuCount = 0;
      this.emitter = eventEmitter;
      this.uiState = uiState;
    }

    register(...menus) {
      menus.forEach(({ template, option, eventSetter, style }) => {
        const contentId = "menu-bar-content-"
          + this.menuCount++;
        const btnId = "btn-" + contentId;

        const openButton = document.createElement("a");
        openButton.classList.add("menu-btn")
        openButton.id = btnId;
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

  return TopMenu;
}))
import publisher from "./pub-sub"
import { isActive, activate, deactivate } from "./usecases/toggle_active_state"

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
    constructor(menuBarId, overlay, eventEmitter, uiState) {
        this.menuBarId = menuBarId;
        this.menuCount = 0;
        this.emitter = eventEmitter;
        this.uiState = uiState;
        this.initialize();

        overlay.addClickEventListener(() => {
            publisher.publish({ type: "hide-all-fixed-menus" })
        })
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

    register(..._menus) {
        const menus = [..._menus].reverse()
        menus.forEach(({ template, option, eventSetter, style, exportToEmitter }) => {
            const contentId = "menu-bar-content-"
                + this.menuCount++;
            const btnId = "btn-" + contentId;

            const openButton = `<div>
                <a class="menu-btn" id=${btnId} href="#">
                    ${option.label}
                </a>

                <div id="${contentId}" class="menu-bar-content inactive" style="${style}">
                    ${template(this.uiState)}
                </div>
            </div>`

            this.menuBar.insertAdjacentHTML("afterbegin", openButton);

            eventSetter(this.emitter, this.uiState);

            if (Array.isArray(exportToEmitter)) {
                this.emitter.registerAction(exportToEmitter)
            }

            TopMenu.setOpenClose(
                document.querySelector("#" + btnId),
                document.querySelector("#" + contentId)
            );
            TopMenu.setDrag("#" + contentId, option);
        })
    }

    /**
     *
     * @param {HTMLElement} btn
     * @param {HTMLElement} content
     * @param {HTMLElement} overlay
     */
    static setOpenClose(btn, content) {


        publisher.subscriber().subscribe("hide-all-fixed-menus", () => {
            deactivate(btn)
            deactivate(content)
        })

        btn.addEventListener("click", () => {
            if (isActive(btn)) {
                publisher.publish({ type: "hide-all-fixed-menus" });
                publisher.publish({ type: "hide-overlay" })
                return
            }
            publisher.publish({ type: "hide-all-fixed-menus" });
            publisher.publish({ type: "show-overlay" })
            activate(btn)
            activate(content)
            content.querySelector("input").focus()

        })

        content.querySelector(".close_button").addEventListener("click", () => {
            publisher.publish({ type: "hide-all-fixed-menus" });
            publisher.publish({ type: "hide-overlay" })
        })

    }


    static setDrag(content, { draggable }) {
        if (draggable) {
            $(content).draggable({
                cursor: "move"
            })
        }
    }

}

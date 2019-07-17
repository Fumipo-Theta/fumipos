import publisher from "./pub-sub"
import { activate, deactivate } from "./usecases/toggle_active_state"

export default class Overlay {
    constructor(selector) {
        this._dom = document.querySelector(selector)
        this._dom.addEventListener("click", () => {
            deactivate(this._dom)
        })
        publisher.subscriber().subscribe("hide-overlay", () => {
            deactivate(this._dom)
        })

        publisher.subscriber().subscribe("show-overlay", () => {
            activate(this._dom)
        })
    }

    addClickEventListener(callback) {
        this._dom.addEventListener("click", callback)
    }
}

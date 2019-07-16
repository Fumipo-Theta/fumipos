export default class TextStyle {
    constructor({ family = "san-serif", style = "normal", size = "16", color = "black" } = {}) {
        this._family = family
        this._style = style
        this._size = size
        this._color = color
    }

    get family() { return this._family }
    set family(fontFamily) { this._family = fontFamily }
    get style() { return this._style }
    set style(fontStyle) { this._style = fontStyle }
    get size() { return this._size }
    set size(fontSize) { this._size = fontSize }
    get color() { return this._color }
    set color(fontColor) { this._color = fontColor }
}

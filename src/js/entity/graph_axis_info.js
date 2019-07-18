export default class GraphAxisInfo {
    /**
     * @param {sring} label
     * @param {number} min
     * @param {number} max
     * @param {"linear" | "log"}
     */
    constructor(label, min, max, scaleType) {
        this._label = label
        this._min = min
        this._max = max
        this._scaleType = scaleType
    }

    get label() { return this._label }
    get min() { return this._min }
    get max() { return this._max }
    get scaleType() { return this._scaleType }
    set label(s) { this._label = s }
    set min(n) { this._min = n }
    set max(n) { this._max = n }
    set scaleType(s) { this._scaleType = s }

    setRange(_min, _max) {
        this.min = _min
        this.max = _max
    }

    getRange() { return [this.min, this.max] }
    isLinear() { return this._scaleType === "linear" }
    isLog() { return this._scaleType === "log" }
}

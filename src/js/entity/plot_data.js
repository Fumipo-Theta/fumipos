export default class PlotData {
    /**
     *
     * @param {Array<PlotDataEntry>} entries
     */
    constructor(entries) {
        this._entries = entries
    }

    get entries() {
        return this._entries
    }

    map(f) {
        return this.entries.map(f)
    }
}

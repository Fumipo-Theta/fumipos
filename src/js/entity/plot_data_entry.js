export default class PlotDataEntry {
    /**
     *
     * @param {Object<string,string|number>} dict
     */
    constructor(dict) {
        this._items = dict
    }

    get items() {
        return this._items
    }

    static has(entry, key) {
        return entry.items.hasOwnProperty(key)
    }

    static get(entry, key) {
        return entry.items[key]
    }
}

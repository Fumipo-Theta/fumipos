import Entry from "../entity/plot_data_entry"

/**
 *
 * @param {string} key
 * @param {string|number} defaultValue
 * @return {Entry=>string|number}
 */
export default function getAnItemFromEntry(key, defaultValue) {
    return entry => Entry.has(entry, key)
        ? Entry.get(entry, key)
        : defaultValue
}

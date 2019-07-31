/**
 *
 * @param {string} text
 * @return {string}
 */
export default function labelPresenter(text) {
    return text.replace(/[\{\}]/g, "")
}

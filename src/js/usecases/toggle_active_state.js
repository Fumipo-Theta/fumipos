/**
 *
 * @param {HTMLElement} dom
 */
export function isActive(dom) {
    return dom.classList.contains("active")
}

/**
 *
 * @param {HTMLElement} dom
 */
export function activate(dom) {
    dom.classList.remove("inactive")
    dom.classList.add("active")
}

/**
 *
 * @param {HTMLElement} dom
 */
export function deactivate(dom) {
    dom.classList.remove("active")
    dom.classList.add("inactive")
}

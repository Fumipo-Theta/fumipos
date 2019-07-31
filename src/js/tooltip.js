function concatAttribute(attr_dict) {
    return Object.entries(attr_dict)
        .map(e => `${e[0]}="${e[1]}"`)
        .reduce((acc, e) => `${acc} ${e}`, "")
}

export default class Tooltip {
    constructor(containorId) {
        this.containorId = containorId
        this.domContainor = document.querySelector(containorId)
        this.domContainor.insertAdjacentHTML(
            "beforeend",
            this.template()
        )
        this.tooltip = document.querySelector("#graph_tooltip")
    }

    template() {
        const containorAttr = {
            id: "graph_tooltip",
            style: `position: fixed;
    bottom : 0;
    left : 0;
    z-index: 10;
    visibility: hidden;
    padding: 2px 5px;
    border: 1px solid #000;
    border-radius: 3px;
    background-color: #333;
    color: #fff;
    font-size: 1.5rem;`,

        }

        return `<div ${concatAttribute(containorAttr)}>
        test text
        </div>`
    }

    show() {
        this.tooltip.style.visibility = "visible"
    }

    hide() {
        this.tooltip.style.visibility = "hidden"
    }

    updateContent(text) {
        this.tooltip.innerText = text
    }
}

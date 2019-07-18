export function setClass(d, graphType, styleClass, optionalClasses) {
    const styleColumn = (d.hasOwnProperty(styleClass))
        ? d[styleClass]
        : "none";

    const optional = optionalClasses
        .map(cls => d.hasOwnProperty(cls) ? d[cls] : "")
        .reduce((acc, e) => `${acc} ${e}`, "")

    return `${graphType} plot D${d.id} ${styleColumn} ${d.onState} ${optional}`
}

export function extractClass(classString, selector) {
    const classList = classString.split(" ");
    switch (selector) {
        case "id":
            return classList[2];

        case "style":
            return classList[3];

        case "onState":
            return classList[4];


        default:
            return false;

    }
}

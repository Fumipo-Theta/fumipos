function checkSizeValidity(sizeDict) {
    if (!sizeDict.hasOwnProperty("width") | !sizeDict.hasOwnProperty("height")) {
        throw new ReferenceError("Invalid object for size")
    }
}

export default class GraphGeometry {
    constructor(figureSize, figurePadding, axisOffset, axisSize) {
        this._figureSize = figureSize
        this._figurePadding = figurePadding
        this._axisOffset = axisOffset
        this._axisSize = axisSize
    }

    get figureSize() { return this._figureSize }
    set figureSize(size) { checkSizeValidity(size); this._figureSize = size }
    get figurePadding() { return this._figurePadding }
    get axisOffset() { return this._axisOffset }
    get axisSize() { return this._axisSize }
    set axisSize(size) { checkSizeValidity(size); this._axisSize = size }
}

import requireProperty from "../validation/require_property"
import isDefined from "../validation/is_defined"

function checkSizeValidity(sizeDict) {
    requireProperty(sizeDict, "width")
    requireProperty(sizeDict, "height")
    return sizeDict
}


export default class GraphGeometry {
    constructor({ figureSize, figurePadding, axisOffset, axisSize } = {}) {
        isDefined(figureSize)
        isDefined(figurePadding)
        isDefined(axisOffset)
        isDefined(axisSize)

        this._figureSize = figureSize
        this._figurePadding = figurePadding
        this._axisOffset = axisOffset
        this._axisSize = axisSize
    }

    get figureSize() { return this._figureSize }
    set figureSize(size) { this._figureSize = checkSizeValidity(size); }
    get figurePadding() { return this._figurePadding }
    get axisOffset() { return this._axisOffset }
    get axisSize() { return this._axisSize }
    set axisSize(size) { this._axisSize = checkSizeValidity(size); }
}

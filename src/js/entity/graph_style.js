import TextStyle from "./text_style"



export default class GraphStyle {
    /**
     *
     * @param {TextStyle} labelStyle
     * @param {TextStyle} tickStyle
     */
    constructor(labelStyle, tickStyle) {
        this._labelStyle = labelStyle
        this._tickStyle = tickStyle
    }

    get labelStyle() { return self._labelStyle }

    get tickStyle() { return self._tickStyle }
}


/*
    Usecase: get xlabel font
    getXlabelFont(graphStyle): number
*/

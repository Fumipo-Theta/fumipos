export const template = uiState => `
    <style>
        #tooltip-wrapper{
            width: 30em;
        }
        #tooltip-wrapper .inp.wide{
            max-width : 100%;
        }
    </style>

    <div id="tooltip-wrapper">
        <form class="tooltip-form" id="tooltipForm" style="width:95%"; min-height: 200px;">
            <hr style="visibility:hidden">
            <a href="#" class="close_button" id="close_tooltipForm"></a>
            <label for="tooltipFormat" class="inp wide">
                <input type="text" id="tooltipFormat" placeholder="&nbsp;" autofocus value="{id}">
              <span class="label">Tooltip format</span>
              <span class="border"></span>
            </label>
        </form>
    </div>
`

export const eventSetter = (emitter, uiState) => {
    uiState.tooltipAST.parse(document.querySelector("#tooltipFormat").value)
    document.querySelector("#tooltipFormat").addEventListener(
        "change",
        ev => {
            uiState.tooltipAST.parse(ev.target.value)
        },
        false
    )
}

export const option = {
    label: "Tooltip",
    draggable: false
}

export const style = ``


export const template = uiState => `
  <style>
    #symbol-wrapper{
      display : flex;
      justify-content : center;
      width: 35vw;
  padding : 0 5px;
  min-width:300px;
  min-height: 100px;
    }
    #symbolForm{
      display : flex;
      flex-direction : column;
      align-items : center;
    }
    #symbolForm .list-title{
      color : #3e3e99;
    }
    #symbolForm ul{
      border-bottom: 1px dashed #4e4ebb;
      width : 100%;
      padding : 0;
    }
    #symbolForm li{
      display: flex;
      align-items: center;
      margin: 5px 0;
    }
    #symbolForm li span{
      flex: 1;
    }
    #symbolForm li input{
      flex : 2;
    }
  </style>

  <div id="symbol-wrapper">
  <form class="symbolForm" id="symbolForm" style="width: 95%;min-height: 500px;">
    <a href="#" class="close_button" id="close_symbolForm"></a>
    <hr style="visibility:hidden">
    <span class="list-title">Opacity</span>
    <ul>
    <li>
      <span>Fade out</span>
      <input type="range" id="outOpacity" min="0" max="1" value="0.3" step="0.1" >
    </li>
    <li>
      <span>Base</span>
      <input type="range" id="baseOpacity" min="0" max="1" value="0.8" step="0.1" >
    </li>
    <li>
      <span>Focused</span>
      <input type="range" id="onOpacity" min="0" max="1" value="1" step="0.1">
    </li>
    <li>
      <span>Selected</span>
      <input type="range" id="selectedOpacity" min="0" max="1" value="1" step="0.1">
    </li>
    </ul>
    
    <span class="list-title">Symbol size</span>
    <ul>
    <li>
      <span>Fade out</span>
      <input type="range" id="outRadius" min="1" max="12" value="3" step="0.5">
    </li>
    <li>
      <span>Base</span>
      <input type="range" id="baseRadius" min="1" max="12" value="6" step="0.5">
    </li>
    <li>
      <span>Focused</span>
      <input type="range" id="onRadius" min="1" max="12" value="9" step="0.5">
    </li>
    <li>
      <span>Selected</span>
      <input type="range" id="selectedRadius" min="1" max="12" value="9" step="0.5">
    </li>
    </ul>

    <span class="list-title">Path width</span>
    <ul>
    <li>
      <span>Fade out</span>
      <input type="range" id="outWidth" min="0" max="3" value="0.25" step="0.05">
    </li>
    <li>
      <span>Base</span>
      <input type="range" id="baseWidth" min="0" max="3" value="1" step="0.05">
    </li>
    <li>
      <span>Focused</span>
      <input type="range" id="onWidth" min="0" max="3" value="3" step="0.05">
    </li>
    <li>
      <span>Selected</span>
      <input type="range" id="selectedWidth" min="0" max="3" value="3" step="0.05">
    </li>
    </ul>
    </div>
  `;

export const eventSetter = (emitter, uiState) => {
  [...document.querySelectorAll("#symbolForm input")].forEach(dom => {
    const id = dom.id;
    dom.value = uiState.symbol[id]
    dom.addEventListener(
      "change",
      ev => {
        uiState.symbol[id] = parseFloat(dom.value);
        emitter.replotGraph()
      },
      false
    )
  })
}

export const option = {
  label: "Symbol",
  draggable: false
}

export const style = `
  left: 15%;
  
  
  `
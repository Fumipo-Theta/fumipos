import GraphClass from "./GraphClass.js";



export default class GraphBinaryPlot extends GraphClass {
  constructor() {
    super();
    this.label = "Binary variation";
    this.type = "Binary";
  }

  style() {
    return `
      top: 50px;
  left: 30%;
  display:none;
  position: fixed;
  width: 40vw;
  min-width: 300px;
  margin: 5px auto;
  padding: 15px;
  background-color: rgba(250,250,255,0.9);
  z-index:11;
  border-radius: 5px;
  box-shadow: 0px 10px 10px 3px rgba(0,0,0,0.2), 0px 5px 5px 1px rgba(0,0,0,0.5);
    `
  }

  template(uiState) {
    return `
    <form class="binary" action="#">
  <a href="#" class="close_button"></a>
  <hr style="visibility:hidden">
  <div class="eleInput__Binary">
    <span class="text">element</span>

    <label for="xName" class="inp">
      <input type="text" id="xName" placeholder="&nbsp;" pattern="^[0-9A-Za-z\s]+$" required autofocus list="indexList" autocomplete="on">
      <span class="label">x</span>
      <span class="border"></span>
    </label>

    <span class="text">vs.</span>

    <label for="yName" class="inp">
      <input type="text" id="yName" placeholder="&nbsp;" pattern="^[0-9A-Za-z\s]+$" required list="indexList" autocomplete="on">
      <span class="label">x</span>
      <span class="border"></span>
    </label>


  </div>

  <hr>

  <div class="rangeInput__Binary">
    <span class="text">Range</span>
    <!-- x min : x max -->
    <label for="x_min" class="inp">
      <input type="text" id="x_min" placeholder="&nbsp;">
      <span class="label">x min</span>
      <span class="border"></span>
    </label>

    <span class="text">:</span>

    <label for="x_max" class="inp">
      <input type="text" id="x_max" placeholder="&nbsp;">
      <span class="label">x max</span>
      <span class="border"></span>
    </label>

    <span class="text">&</span>

    <!-- y min : y max-->

    <label for="y_min" class="inp">
      <input type="text" id="y_min" placeholder="&nbsp;">
      <span class="label">y min</span>
      <span class="border"></span>
    </label>

    <span class="text">:</span>

    <label for="y_max" class="inp">
      <input type="text" id="y_max" placeholder="&nbsp;">
      <span class="label">y max</span>
      <span class="border"></span>
    </label>
  </div>

  <hr>
  <div class="logInput">
    <label for="#checkLogX">
      <input type="checkbox" id="checkLogX">
      <span class="text">log x</span>
    </label>

    <label for="#checkLogY">
      <input type="checkbox" id="checkLogY">
      <span class="text">log y</span>
    </label>
  </div>
  <hr>


  <div class="imageInput__Binary">

    <div style="width: 300px">
      <span class="text">Image size</span>
      <input class="mdl-slider mdl-js-slider" type="range" id="imageSize" min="0.2" max="1" value="0.45" step="0.05">
    </div>
    <hr>

    <label for="aspect" class="inp">
      <input type="text" id="aspect" value="1" placeholder="&nbsp;">
      <span class="label">aspect ratio</span>
      <span class="border"></span>
    </label>
  </div>

</form>
    `
  }
};


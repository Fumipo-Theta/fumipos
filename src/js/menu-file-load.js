import tf from "../../../jslib/textParser_esm.js";
const {
  Dataframe,
  transduce,
  statefullTransducer
} = funcTools;
const {
  mapping,
  intoArray
} = transduce;
const {
  indexing
} = statefullTransducer;
const {
  toEntries,
  mapEntries
} = Dataframe;


const load = (typeof require === 'undefined') ?
  fetch
  : require("node-fetch");


export function template(state) {
  return `
  <style>
    #menu-file-load input.button{
    cursor: pointer;
    min-width: 10vw;
    font-size: 1.5rem;
    margin: 5px 0px;
    padding:10px;
  }
  </style>

  <form id="menu-file-load" class="selectFile" action="#">
    <a href="#" class="close_button" id="close_selectFile"></a>
    <hr style="visibility:hidden">
      <label class="file" for="selectFileMain">
        Select plot file (.CSV)
    <input type="file" id="selectFileMain" accept=".csv" required style="display:none">
  </label>
    <input class="button" type="button" id="use_test_data" value="Use test data">
    <hr>
    Selected file: <span id="selectedMainFile"></span>

    <hr>
    <label class="file" for="selectFileRef">
      Select Abundance file (.CSV)
      <input type="file" id="selectFileRef" accept=".csv" style="display:none">
    </label>
    <input class="button" type="button" id="use_test_ref" value="Use default">
    <hr>
    Selected file: <span id="selectedRefFile"></span>

  </form>`
};

export function eventSetter(emitter, uiState) {
  document.getElementById("use_test_data").onclick = function (ev) {
    const url = "./data/lava_compositions.csv";
    load(url).then(function (response) {
      return response.text();
    }).then(function (text) {

      uiState.data = intoArray(
        indexing(0),
        mapping(([i, d]) => Object.assign(d, { id: i })),
        mapEntries(d => ({ dummy: 1 })),
      )(toEntries(tf.text2Dataframe(text, "csv")))

      document.querySelector("#selectedMainFile").innerHTML = (url);
      emitter.createDataColumnIndex(uiState);
    })
  };


  document.getElementById('use_test_ref').onclick = function (ev) {
    const url = "./data/Refferencial_abundance.csv";

    load(url).then(function (response) {
      return response.text();
    }).then(function (text) {
      uiState.refData = toEntries(tf.text2Dataframe(text, "csv"));

      emitter.replotGraph();
      document.querySelector("#selectedRefFile").innerHTML = (url);
    })

  }

  document.getElementById("use_test_data").click();
  document.getElementById('use_test_ref').click();

  /* Button for use user data */
  document.getElementById("selectFileMain").onchange = function (ev) {
    var file = ev.target.files;
    var reader = new FileReader();

    reader.readAsText(file[0]);
    //console.log(file)
    reader.onload = function (ev) {

      uiState.data = intoArray(
        indexing(0),
        mapping(([i, d]) => Object.assign(d, { id: i })),
        mapEntries(d => ({ dummy: 1 })),
      )(toEntries(tf.text2Dataframe(reader.result, "csv")))

      emitter.replotGraph();
      emitter.createDataColumnIndex(uiState);
    };

    for (var i = 0; i < file.length; i++) {
      document.querySelector("#selectedMainFile").innerHTML = (file[i].name + "\n");
    }
  };

  /* Button for user defined refferance data */
  document.getElementById("selectFileRef").onchange = function (ev) {
    var file = ev.target.files;
    var reader = new FileReader();

    reader.readAsText(file[0]);
    //console.log(file)
    reader.onload = function (ev) {
      uiState.refData = toEntries(tf.text2Dataframe(reader.result, "csv"));

      emitter.replotGraph();
    };

    for (var i = 0; i < file.length; i++) {
      document.querySelector("#selectedRefFile").innerHTML = (file[i].name + "\n");
    }
  }
};

export const option = {
  label: "Select file",
  draggable: false
}

export const style = `
  left: 5%;
  width: 40vw;
  overflow: auto;
  `

import tf from "../../../jslib/textParser_esm.js";

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
    let url = "./data/lava_compositions.csv";
    load(url).then(function (response) {
      return response.text();
    }).then(function (text) {
      uiState.plotData = tf.text2Object(text, 'csv');
      uiState.plotData.map((v) => {
        if (!v.value.dummy) v.value.dummy = 1;
      });
      document.querySelector("#selectedMainFile").innerText(url);
      emitter.createIndexList(uiState);
    })
  };

  document.getElementById('use_test_ref').onclick = function (ev) {
    let url = uiState.referenceDataSetting.url || "./data/Refferencial_abundance.csv";

    load(url).then(function (response) {
      return response.text();
    }).then(function (text) {
      uiState.refData = tf.text2Object(text, 'csv');
      emitter.replotGraphsObj(uiState);
      document.querySelector("#selectedRefFile").innerText(url);
    })

  }

  /* Button for use user data */
  document.getElementById("selectFileMain").onchange = function (ev) {
    var file = ev.target.files;
    var reader = new FileReader();

    reader.readAsText(file[0]);
    //console.log(file)
    reader.onload = function (ev) {
      uiState.plotData = tf.text2Object(reader.result, 'csv');

      uiState.plotData.map((v) => {
        if (!v.value.dummy) v.value.dummy = 1;
      });

      emitter.replotGraphsObj(uiState);

      emitter.createIndexList(uiState);
    };

    for (var i = 0; i < file.length; i++) {
      document.querySelector("#selectedMainFile").innerText(file[i].name + "\n");
    }
  };

  /* Button for user defined refferance data */
  document.getElementById("selectFileRef").onchange = function (ev) {
    var file = ev.target.files;
    var reader = new FileReader();

    reader.readAsText(file[0]);
    //console.log(file)
    reader.onload = function (ev) {
      uiState.refData = tf.text2Object(reader.result, 'csv');

      //fumiposAPI.replotGraphsObj(fumipo);
    };

    for (var i = 0; i < file.length; i++) {
      document.querySelector("#selectedRefFile").innerText(file[i].name + "\n");
    }
  }
  /*
  if (uiState.useDefaultDataSet) {
    document.getElementById("use_test_data").click();
  } else {
    $("#mainFile").fadeIn();
    $("#setting_overlay").fadeIn();
  }

  if (uiState.referenceDataSetting) {
    document.getElementById('use_test_ref').click();
  } else {
    $("#mainFile").fadeIn();
    $("#setting_overlay").fadeIn();
  }
  */
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

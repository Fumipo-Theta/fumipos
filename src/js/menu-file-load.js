import tf from "./lib/textParser_esm";
import funcTools from "./lib/funcTools"

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
    <label>
      <input type="file" id="selectFileMain" accept=".csv" required>
      <span class="file-parts">Select plot file (.CSV)</span>
    </label>
    <input class="button" type="button" id="use_test_data" value="Use test data">
    <hr>
    Selected file: <span id="selectedMainFile"></span>

    <hr>
    <label>
      <input type="file" id="selectFileRef" accept=".csv" >
      <span class="file-parts">Select Abundance file (.CSV)</span>
    </label>
    <input class="button" type="button" id="use_test_ref" value="Use default">
    <hr>
    Selected file: <span id="selectedRefFile"></span>

  </form>`
};

const createDataColumnIndex = (index_datalist, { data }) => {
    if (data.length <= 0) return false;
    const options = d3.select(index_datalist)
        .selectAll("option")
        .data(Object.keys(data[0]))
    options.exit().remove();
    const entered = options.enter().append("option");
    entered.merge(options)
        .attr("value", d => d);
}

export function eventSetter(emitter, uiState) {
    const indexListId = "indexList"
    const datalist = document.createElement("datalist")
    datalist.id = indexListId
    document.querySelector("body").appendChild(datalist)

    document.getElementById("use_test_data").onclick = function (ev) {
        const url = "./data/lava_compositions.csv";
        load(url).then(function (response) {
            return response.text();
        }).then(function (text) {

            uiState.data = intoArray(
                indexing(0),
                mapping(([i, d]) => Object.assign(d, { id: i })),
                mapEntries(d => ({ dummy: 1, onState: "base" })),
            )(toEntries(tf.text2Dataframe(text, "csv")))

            document.querySelector("#selectedMainFile").innerHTML = (url);
            createDataColumnIndex("#" + indexListId, uiState);
        })
    };


    document.getElementById('use_test_ref').onclick = function (ev) {
        const url = "./data/Refferencial_abundance.csv";

        load(url).then(function (response) {
            return response.text();
        }).then(function (text) {
            uiState.refData = toEntries(tf.text2Dataframe(text, "csv"));


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
                mapEntries(d => ({ dummy: 1, onState: "base" })),
            )(toEntries(tf.text2Dataframe(reader.result, "csv")))

            emitter.replot();
            emitter.afterReplot();
            createDataColumnIndex("#" + indexListId, uiState);
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

            emitter.replot();
            emitter.afterReplot();
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
  width: 40vw;
  overflow: auto;
  `

import TopMenu from "./top-menu.js";
import * as menuFileLoad from "./menu-file-load.js";
import * as menuSymbol from "./menu-symbol.js";
import * as menuLegend from "./menu-legend.js";
import * as menuTest from "./menu-test.js";
import GraphAppender from "./graph-appender.js";
import GraphBinaryPlot from "./Graph-binary-plot.js";
import GraphAbundancePlot from "./Graph-abundance-plot.js";
import * as graphSettingBtn from "./graph-btn-setting.js";
import * as graphDeleteBtn from "./graph-btn-delete.js";
import * as graphPngBtn from "./graph-btn-save_as_png.js";
import * as graphRefreshBtn from "./graph-btn-refresh.js";
import UIUpdater from "./ui-updater.js";

const initializer = {

  'legend': {
    'userStyleURL': './data/legend_region.json',
    'commonStyleURL': './css/graph_common.css'
  },
  'userDataSetting': {
    'useDefault': true,
    'url': './data/lava_compositions.csv'
  },
  'referranceDataSetting': {
    'useDefault': true,
    'url': './data/Refferencial_abundance.csv'
  }
}

const autoMode = {
  'menu': {
    'symbol': [
      {
        'id': 'outOpacity',
        'min': 0,
        'max': 1,
        'step': 0.1,
        'value': 0.1
      },
      {
        'id': 'baseOpacity',
        'min': 0,
        'max': 1,
        'step': 0.1,
        'value': 0.8
      },
      {
        'id': 'onOpacity',
        'min': 0,
        'max': 1,
        'step': 0.1,
        'value': 1
      },
      {
        'id': 'outRadius',
        'min': 1,
        'max': 12,
        'step': 0.5,
        'value': 6
      },
      {
        'id': 'baseRadius',
        'min': 1,
        'max': 12,
        'step': 0.5,
        'value': 6
      },
      {
        'id': 'onRadius',
        'min': 1,
        'max': 12,
        'step': 0.5,
        'value': 9
      },
      {
        'id': 'outWidth',
        'min': 0,
        'max': 3,
        'step': 0.05,
        'value': 0.25
      },
      {
        'id': 'baseWidth',
        'min': 0,
        'max': 3,
        'step': 0.05,
        'value': 1
      },
      {
        'id': 'onWidth',
        'min': 0,
        'max': 3,
        'step': 0.05,
        'value': 3
      }
    ]
  },
  'plot': [
    {
      'type': 'binary',
      'inputList': [
        { 'id': 'xName', 'type': 'value', 'value': 'SiO2' },
        { 'id': 'yName', 'type': 'value', 'value': 'MgO' },
        { 'id': 'x_min', 'type': 'value', 'value': null },
        { 'id': 'x_max', 'type': 'value', 'value': null },
        { 'id': 'y_min', 'type': 'value', 'value': null },
        { 'id': 'y_max', 'type': 'value', 'value': null },
        { 'id': 'checkLogX', 'type': 'checked', 'value': false },
        { 'id': 'checkLogY', 'type': 'checked', 'value': false },
        { 'id': 'imageSize', 'type': 'value', 'value': 0.3 },
        { 'id': 'aspect', 'type': 'value', 'value': 0.8 }
      ]
    },
    {
      'type': 'abundance',
      'inputList': [
        { 'id': 'eleName', 'type': 'value', 'value': 'La Ce Pr Nd Sm Eu Gd Tb Dy Ho Er Tm Yb Lu' },
        { 'id': 'reserver', 'type': 'value', 'value': 'PM,Sun&McDonough-1989' },
        { 'id': 'y_min', 'type': 'value', 'value': 0.01 },
        { 'id': 'y_max', 'type': 'value', 'value': 1000 },
        { 'id': 'imageSize', 'type': 'value', 'value': 0.7 },
        { 'id': 'aspect', 'type': 'value', 'value': 0.8 }
      ]

    }
  ]

}

const state = {
  data: [
    { x: 1, y: 2, dummy: 1, study: "mine" },
    { x: 0, y: -1, dummy: 1 },
    { x: 2, y: 10, dummy: 1 },
    { y: 0, z: 11, dummy: 1 },
    { y: 1, z: 3, dummy: 1 }
  ],
  symbol: {
    baseOpacity: 0.7,
    baseRadius: 4,
    baseWidth: 1,
    onOpacity: 0.9,
    onRadius: 5,
    onWidth: 3,
    selectedOpacity: 1,
    selectedRadius: 6,
    selectedWidth: 5,
    outOpacity: 0.3,
    outRadius: 2,
    outWidth: 0.25,
  },
  styleClass: "",

  dataStack: [],
}

const emitter = new UIUpdater()

const topMenu = new TopMenu("fixed-menu-contents", "setting_overlay", emitter, state)
const ga = new GraphAppender("graph_area", "setting_menu", "setting_overlay", emitter, state);

/*
  ここで明示的にemitterにactionを登録スべきか,
  menuアイテムなどを読み込むときに自動的にactionがセットされるようにしたほうがいいか.
*/

window.onresize = ev => {
  emitter.replot();
  emitter.afterReplot();
}

window.onload = ev => {

  let url = './css/graph_common.css'

  fetch(url).then(function (data) {
    return data.text();
  }).then(function (text) {
    document.querySelector("#graph_style").innerHTML = (text);
  });

  $('#graph_area').sortable({
    cursor: "move",
    opacity: 0.7,
    handle: "h1"
  });

  topMenu.register(
    menuFileLoad,
    menuSymbol,
    menuLegend,
    menuTest
  );

  ga.registerBtns(
    graphSettingBtn,
    graphRefreshBtn,
    graphPngBtn,
    graphDeleteBtn
  )
    .registerGraphManager(
      GraphBinaryPlot,
      GraphAbundancePlot
    );

  ga.setGraphAppendButton({ label: "Test", type: "Test" });
}

/*
window.onbeforeunload = function (e) {
  return "Unload ?";
};
*/

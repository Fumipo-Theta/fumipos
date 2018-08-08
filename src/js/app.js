import TopMenu from "./top-menu.js";
import * as menuFileLoad from "./menu-file-load.js";
import * as menuSymbol from "./menu-symbol.js";
import * as menuLegend from "./menu-legend.js";
import * as menuTest from "./menu-test.js";
import GraphAppender from "./graph-appender.js";
import GraphBinaryPlot from "./Graph-binary-plot.js";
import * as graphSettingBtn from "./graph-btn-setting.js";
import * as graphDeleteBtn from "./graph-btn-delete.js";
import * as graphPngBtn from "./graph-btn-save_as_png.js";
import UIUpdater from "./ui-updater.js";

const initializer = {
  'component': {
    'sideMenu': false,
    'fixedMenu': {
      'simulate': {
        url: "./form_simulate.html",
        target: "#simulate_setting",
        button: "#melting_btn",
        overlay: false,
        draggable: true,
        close: "#close_simulateForm",
        'label': 'Simulate'
      }
    },
    'graphAppender': {
      url: "./fumipos_graphAppender.html",
      target: "#graphAppender",
      draggable: false
    },
    'footer': {
      url: "./fumipos_footer.html",
      target: "#footer"
    }
  },

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
    baseRadius: 6,
    baseWidth: 1,
    onOpacity: 0.9,
    onRadius: 9,
    onWidth: 3,
    outOpacity: 0.3,
    outRadius: 3,
    outWidth: 0.25
  },
  styleClass: "",

  dataStack: []
}

const emitter = new UIUpdater({
  id_index_datalist: "indexList"
})

const topMenu = new TopMenu("fixed-menu-contents", "setting_overlay", emitter, state)
const ga = new GraphAppender("graph_area", "setting_menu", "setting_overlay", emitter, state);


window.onload = ev => {
  $('#graph_area').sortable({
    cursor: "move",
    opacity: 0.7
  });
  topMenu.initialize();
  topMenu.register(
    menuFileLoad,
    menuSymbol,
    menuLegend,
    menuTest
  );

  ga.initialize()
    .registerBtns(
      graphSettingBtn,
      graphPngBtn,
      graphDeleteBtn
    )
    .registerGraphManager(GraphBinaryPlot);
  ga.setGraphAppendButton({ label: "Abundance", type: "Abundance" });
  ga.setGraphAppendButton({ label: "Test", type: "Test" });
}

/*
const fumipo = fumiposAPI.createFumipo(initializer);
window.addEventListener('load', fumiposAPI.workSpaceInitialize(fumipo), false);
window.addEventListener('load', fumiposAPI.autoFixedMenu(autoMode.menu), false);
 
window.onbeforeunload = function (e) {
  return "Unload ?";
};
*/

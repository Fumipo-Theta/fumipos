(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.app = factory(
      root.TopMenu,
      root.menuFileLoad,
      root.menuSymbol,
      root.menuLegend,
      root.menuTest,
      //root.fumiposAPI
    );
  }
}(this, function (
  TopMenu,
  menuFileLoad,
  menuSymbol,
  menuLegend,
  menuTest,
  /*_fumiposAPI*/) {
  /*
  const fumiposAPI = (typeof require === 'undefined' && (typeof _fumiposAPI === 'object' || typeof _fumiposAPI === 'function'))
    ? _fumiposAPI
    : require("./fumiposAPI.js");
  */

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

  const state = {}

  const topMenu = new TopMenu("fixed-menu-contents", "setting_overlay", state)
  window.onload = ev => {
    topMenu.register(
      menuFileLoad,
      menuSymbol,
      menuLegend,
      menuTest
    );
  }

  /*
  const fumipo = fumiposAPI.createFumipo(initializer);
  window.addEventListener('load', fumiposAPI.workSpaceInitialize(fumipo), false);
  window.addEventListener('load', fumiposAPI.autoFixedMenu(autoMode.menu), false);
  
  window.onbeforeunload = function (e) {
    return "Unload ?";
  };
  */

  return {
    //fumipo
  };
}))
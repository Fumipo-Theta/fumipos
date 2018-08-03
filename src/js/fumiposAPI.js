(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([
      "../../../jslib/d3.min",
      "../../../multiCrystallization/js/multiCrystallization_v1.4.1",
      "../../../jslib/textFile"
    ], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.fumiposAPI = factory(
      root.d3,
      root.Crystal,
      root.TextParser
    );
  }
}(this, function (_d3, _Crystal, _tf) {

  //┌-- Module loading -----------------------------------------------------------------┐

  const d3 = (typeof require === 'undefined' && typeof _d3 === 'object') ?
    _d3
    : require('../../../jslib/d3.min.js');

  const Crystal = _Crystal


  const tf = (typeof require === 'undefined' && (typeof _tf === 'object' || typeof _tf === 'function'))
    ? _tf
    : require('../../../jslib/textParser');


  const load = (typeof require === 'undefined') ?
    fetch
    : require("node-fetch");


  //└----------------------------------------------------------------------------------┘


  const fumiposAPI = {};


  fumiposAPI.Crystal = Crystal;

  /* fumipo オブジェクトコンストラクタ */
  fumiposAPI.createFumipo = function (_initializer) {
    let obj = {};
    obj.formDOM = [];
    obj.plotter = [];
    obj.plotData = [];
    obj.refData = [];
    obj.partitioningData = [];
    obj.initializer = _initializer;
    return obj;
  }

  /* リプロットメソッド */
  fumiposAPI.replotGraphsObj = function (fumipo) {
    //console.log(formDOMArray)
    //console.log(plotObjArray)
    for (let i = 0, iterateNum = fumipo.plotter.length; i < iterateNum; i++) {
      fumipo.plotter[i].replot(fumipo.plotData, fumipo.refData, fumipo.formDOM[i][0], fumipo.partitioningData);
    };

    fumiposAPI.toggleVisibility();

  }



  /* 自動モード(共通設定) */
  fumiposAPI.autoFixedMenu = function (menuSetting) {
    for (let key in menuSetting) {
      let form = menuSetting[key];

      for (let input of form) {
        let target = d3.select(`#${input.id}`);
        for (let attr in input) {
          target.attr(attr, input[attr]);
        }
      }

    }
  }


  /* HTML component loader */

  fumiposAPI.loadHTML = function (obj) {
    return new Promise(function (res, rej) {

      load(obj.url).then(function (response) {
        return response.text();
      }).then(function (text) {

        $(obj.target).html(text).trigger("create");

        if (obj.button) {
          $(function () {
            $(obj.button).click(function () {
              $(obj.target).fadeIn();
              $(obj.overlay).fadeIn();
              return false;
            });
          });
          $(obj.overlay).click(function () {
            $(obj.overlay).fadeOut();
            $(obj.target).fadeOut();
          });
          $(obj.close).click(function () {
            $(obj.overlay).fadeOut();
            $(obj.target).fadeOut();
          });
        };

        if (obj.draggable) {
          $(function () {
            $(obj.target).draggable({
              cursor: "move"
            });
          });
        };

        //Promise.resolve(text)
        res(text)
      })//.then(function (r) {
      //res()
      //});

    })
  }

  /* create list for autocomplete of xName and yName */
  fumiposAPI.createIndexList = function (_fumipo) {
    if (!_fumipo.plotData[0]) return false;

    let keys = Object.keys(_fumipo.plotData[0].value);

    let options = d3.select("#indexList").selectAll("option").data(keys)

    options.enter().append("option")
      .attr("value", function (d) { return d });
  }

  /* Work Space initializer */
  fumiposAPI.workSpaceInitialize = function (fumipo) {
    const setting = fumipo.initializer;

    /* Make component */
    let body = d3.select('body');

    /* Main contents wrapper */


    /* グラフを並び替えられるようにする */
    //if (window.matchMedia('(max-width:1024px)').matches) {

    //} else {
    $('#graph_area').sortable({
      cursor: "move",
      opacity: 0.7
    });
    //};

    /* graph appender */
    if (setting.component.graphAppender) {
      fumiposAPI.loadHTML(setting.component.graphAppender)
        .then(function (r) {
          fumipo.graphAppend = new fumiposAPI.GraphAppender(fumipo, "#graph_area");
          document.getElementById("appendBinary").onclick = function () {
            fumipo.graphAppend.setGraph("binary");
          }
          document.getElementById("appendAbundance").onclick = function () {
            fumipo.graphAppend.setGraph("abundance");
          };
        });

    }






    /* Side menu */
    if (setting.component.sideMenu) {
      body.insert('div', '#wrapper').attr('class', 'overlay').attr('id', 'js__overlay');
      body.insert('nav', '#wrapper').attr('class', 'side-menu');
      body.insert('div', '#wrapper').attr('class', 'side-menu-btn').attr('id', 'js__sideMenuBtn')
        .append('a').attr('id', 'panel-btn').attr('href', '#')
        .append('span').attr('id', 'panel-btn-icon');

      $(function () {
        var $body = $('body');
        $("#panel-btn").click(function () {
          $body.toggleClass('side-open');
          $('#js__overlay').on('click', function () {
            $body.removeClass('side-open');
            $("#panel-btn-icon").toggleClass("close");
            return false;

          });
          $("#panel-btn-icon").toggleClass("close");
          return false;
        });
      });

    }

    /* Fixed menu */
    if (setting.component.fixedMenu) {

      for (let key in setting.component.fixedMenu) {
        let menu = setting.component.fixedMenu[key];
        d3.select('#top-menu').append('div').attr('id', menu.target.replace('#', ''));

        d3.select('#fixed-menu-contents').append('a')
          .attr('href', '#').attr('class', 'menu-btn')
          .attr('id', menu.button.replace('#', ''))
          .text(menu.label);

        fumiposAPI.loadHTML(menu);

      }

    }

    /* ファイル読み込み */
    (function (menu) {
      fumiposAPI.loadHTML(menu.dataFile)
        .then(function (_r) {
          /* Button for use default data*/
          document.getElementById("use_test_data").onclick = function (ev) {
            let url = "./data/lava_compositions.csv";
            load(url).then(function (response) {
              return response.text();
            }).then(function (text) {
              fumipo.plotData = tf.text2Object(text, 'csv');
              fumipo.plotData.map((v) => {
                if (!v.value.dummy) v.value.dummy = 1;
              });
              d3.select("#selectedMainFile").text(url);
              fumiposAPI.createIndexList(fumipo);
            })
          };

          document.getElementById('use_test_ref').onclick = function (ev) {
            let url = setting.referranceDataSetting.url || "./data/Refferencial_abundance.csv";

            load(url).then(function (response) {
              return response.text();
            }).then(function (text) {
              fumipo.refData = tf.text2Object(text, 'csv');
              fumiposAPI.replotGraphsObj(fumipo);
              d3.select("#selectedRefFile").text(url);
            })

          }

          /* Button for use user data */
          document.getElementById("selectFileMain").onchange = function (ev) {
            var file = ev.target.files;
            var reader = new FileReader();

            reader.readAsText(file[0]);
            //console.log(file)
            reader.onload = function (ev) {
              fumipo.plotData = tf.text2Object(reader.result, 'csv');

              fumipo.plotData.map((v) => {
                if (!v.value.dummy) v.value.dummy = 1;
              });

              fumiposAPI.replotGraphsObj(fumipo);

              fumiposAPI.createIndexList(fumipo);
            };

            for (var i = 0; i < file.length; i++) {
              d3.select("#selectedMainFile").text(file[i].name + "\n");
            }
          };

          /* Button for user defined refferance data */
          document.getElementById("selectFileRef").onchange = function (ev) {
            var file = ev.target.files;
            var reader = new FileReader();

            reader.readAsText(file[0]);
            //console.log(file)
            reader.onload = function (ev) {
              fumipo.refData = tf.text2Object(reader.result, 'csv');

              fumiposAPI.replotGraphsObj(fumipo);
            };

            for (var i = 0; i < file.length; i++) {
              d3.select("#selectedRefFile").text(file[i].name + "\n");
            }
          }

          if (setting.userDataSetting.useDefault) {
            document.getElementById("use_test_data").click();
          } else {
            $("#mainFile").fadeIn();
            $("#setting_overlay").fadeIn();
          }

          if (setting.referranceDataSetting) {
            document.getElementById('use_test_ref').click();
          } else {
            $("#mainFile").fadeIn();
            $("#setting_overlay").fadeIn();
          }

        });

      fumiposAPI.loadHTML(menu.symbol)
        .then(function (_r) {
          document.getElementById("symbolForm")
            .getElementsByTagName("form")[0]
            .addEventListener('change', function () { fumiposAPI.replotGraphsObj(fumipo) }, false);

        });

      fumiposAPI.loadHTML(menu.legend)
        .then(function (_r) {

          /* JSON を読みこんだら表に反映 */

          document.getElementById("legendJSON").addEventListener('change', function (ev) {
            var file = ev.target.files;
            var reader = new FileReader();
            reader.readAsText(file[0]);
            //console.log(file)
            reader.onload = function (ev) {
              var obj = $.parseJSON(reader.result);
              fumiposAPI.createLegendTable(obj);
              fumiposAPI.replotGraphsObj(fumipo);
            };
            d3.select(setting.legend.selectedFileLabelId).text(file[0].name);
          }, false);

          /* ユーザー定義凡例スタイル読み込み */
          if (setting.legend.userStyleURL) fumiposAPI.setLegendFromUrl(setting.legend.userStyleURL);

          document.getElementById("hideAll_button")
            .addEventListener('click', function (ev) { fumiposAPI.allHide() }, false);
          document.getElementById("showAll_button")
            .addEventListener('click', function (ev) { fumiposAPI.allShow() }, false);
        });

      fumiposAPI.loadHTML(menu.simulate)
        .then(function (_r) {
          /* csvPartitioningObjにPartitioning coeffecient fileを読み込み	*/
          document.getElementById("selectMeltingFile").onchange = function (evt) {
            var file = evt.target.files;
            var reader = new FileReader();
            reader.readAsText(file[0]);

            reader.onload = function (ev) {
              fumipo.partitioningData = tf.fumipotext2Object(reader.result, 'csv');

              //fumipo.plotter.map((plotter)=>plotter.setPartitioningObj(fumipo.partitioningData));

              /* Form melting のテーブルに結果を表示*/
              d3.select("div#simulatePhase").selectAll("tr.data").remove();

              var tableDOM = d3.select("div#simulatePhase").select("tbody").selectAll("tr.data").data(fumipo.partitioningData);

              tableDOM.exit().remove();
              tableDOM.enter().append("tr")
                .attr("class", function (d) { return "data " + d.value["phase"]; })

              var tableRow = d3.select("div#simulatePhase").selectAll("tr.data").data(fumipo.partitioningData);
              tableRow.append("th")
                .attr("class", function (d) { return "phase " + d.value["phase"]; })
                .text(function (d) { return d.value["phase"]; });

              tableRow.append("td").append("input")
                .attr("id", function (d) { return "initial_" + d.value["phase"]; })
                .attr("type", "text")
                .attr("size", "10")
                .attr("value", "0");
              tableRow.append("td").append("input")
                .attr("id", function (d) { return "reaction_" + d.value["phase"]; })
                .attr("type", "text")
                .attr("size", "10")
                .attr("value", "0");

            };
            d3.select("#partitioningFile").text(file[0].name);
          };

          document.getElementById("simulate_setting")
            .getElementsByTagName("form")[0]
            .addEventListener('change', function () { fumiposAPI.replotGraphsObj(fumipo) }, false);
        });


    })(setting.component.fixedMenu)



    // グラフの共通スタイルの読みこみ
    let url = setting.legend.commonStyleURL || './css/graph_common.css'

    load(url).then(function (data) {
      return data.text();
    }).then(function (text) {
      d3.select("#graph_style").text(text);
    })
  }

  /* レジェンドロード */
  fumiposAPI.setLegendFromUrl = function (url) {
    /* レジェンド定義css読み込み */

    fetch(url).then(function (data) {
      return data.json();
    }).then(function (obj) {
      fumiposAPI.createLegendTable(obj);
      d3.select('#legendFileLabel').text(url);
    })
  };


  /* テーブル作成関数 */
  fumiposAPI.createLegendTable = function (legendObj) {
    d3.select("#legend_table").select("table").remove("table");
    d3.select("#legendStyle").remove();
    var table = d3.select("#legend_table").append("table").attr("class", "legend");
    var thead = table.append("thead");
    var tbody = table.append("tbody");
    var headerKey = [legendObj.key, "symbol", "color"];

    var theadRow = thead.append('tr')
    theadRow.append("th").append("input")
      .attr("type", "text")
      .attr("id", "legendKey")
      .attr("value", legendObj.key);

    theadRow.append("th").text("symbol");
    theadRow.append("th").text("color");

    var tbodyRow = tbody.selectAll("tr").data(legendObj.legends);
    tbodyRow.exit().remove();
    tbodyRow.enter().append("tr")
      .append("th").text(function (d) { return d.name; });

    tbodyRow.append("td")
      .attr("class", function (d) { return "switch " + d.class; })
      .text(function (d) {
        if (d.stroke) {
          return "○";
        } else {
          return "●";
        }
      });

    tbodyRow.append("td").append("input")
      .attr("class", function (d) { return d.class; })
      .attr("type", "color")
      .attr("value", function (d) { return d.color; });

    /* styleタグを生成し登録 */
    var style = "";
    style += '<style type="text/css" id="legendStyle">'
    for (key in legendObj.legends) {
      var obj = legendObj.legends[key];
      if (obj.class) {
        if (!obj.stroke) {
          style += 'circle.' + obj.class + '{fill:' + obj.color + ';}';
        } else {
          style += 'circle.' + obj.class + '{fill:#ffffff;stroke:' + obj.color + ';}';
        };
        style += 'path.abundance.' + obj.class + '{stroke:' + obj.color + ';}'; style += 'td.' + obj.class + '{color:' + obj.color + ';}';
      } else {
        if (!obj.stroke) {
          style += 'circle{fill:' + obj.color + ';}';
        } else {
          style += 'circle{fill:#ffffff;stroke:' + obj.color + ';}';
        };
        style += 'path.abundance{stroke:' + obj.color + ';}';
        style += 'td{color:' + obj.color + ';}';
      }
    }
    style += '</style>';
    $('head').append(style);

    fumiposAPI.setEventToLegend();
  };



  /* 凡例にマウスイベントを設定 */
  fumiposAPI.setEventToLegend = function () {
    var legendSimbol = d3.select("table.legend").selectAll("td.switch")
    legendSimbol.on("click", function (d) {
      var visiblityState = d3.select(this).attr("name");
      if (visiblityState != "hidden") {
        d3.select(this)
          .attr("style", "color:#ffffff")
          .attr("name", "hidden");
      } else {
        d3.select(this)
          .attr("style", "")
          .attr("name", "visible");
      }

      fumiposAPI.toggleVisibility();
    });

    /* カラーピッカーにonchangeイベントを設定*/
    var legendColor = d3.select("table.legend").selectAll("input");
    legendColor.on("change", function () {
      var styleSheet = d3.select("#legendStyle");
      var style = styleSheet.text();
      var selectedClass = d3.select(this).attr("class");
      var color = this.value;

      /* 正規表現を用いてスタイルタグの中身を書き換え */
      var preCircle = new RegExp('\.' + selectedClass + '\{fill:#[0-9a-f]*;\}');
      var postCircle = '.' + selectedClass + '{fill:' + color + ';}';
      var preBorderCircle = new RegExp('\.' + selectedClass + '\{fill:#ffffff;stroke:#[0-9a-f]*;\}');
      var postBorderCircle = '.' + selectedClass + '{fill:#ffffff;stroke:' + color + ';}';
      var prePath = new RegExp('\.' + selectedClass + '\{stroke:#[0-9a-f]*;\}');
      var postPath = '.' + selectedClass + '{stroke:' + color + ';}';
      var preTd = new RegExp('\.' + selectedClass + '\{color:#[0-9a-f]*;\}');
      var postTd = '.' + selectedClass + '{color:' + color + ';}';

      style = style.replace(preCircle, postCircle);
      style = style.replace(preBorderCircle, postBorderCircle);
      style = style.replace(prePath, postPath);
      style = style.replace(preTd, postTd);

      styleSheet.text(style);
    });

    //console.log("set mouse event to legend")
  }

  /* toggleVisibility() */
  fumiposAPI.toggleVisibility = function () {
    // チェックボックスの状態を取得
    var checkBoxes = d3.select("form.symbolform").selectAll("input.showFlag");
    var checkFlag = new Object();

    for (var attrKey = 0; attrKey < checkBoxes[0].length; attrKey++) {
      checkFlag[attrKey] = { "className": checkBoxes[0][attrKey].name, "flag": checkBoxes[0][attrKey].checked };
    }

    // 凡例テーブルの状態を取得し,シンボルの表示状態を切り替え
    var legendSimbol = d3.select("table.legend").selectAll("td.switch");
    legendSimbol.each(function (d) {
      var visiblityState = d3.select(this).attr("name");
      var className = d3.select(this).attr("class");
      var classArray = className.split(" ");
      if (visiblityState == "hidden") {
        d3.selectAll("circle." + classArray[1])
          .attr("visibility", "hidden");
        d3.selectAll("path.abundance." + classArray[1])
          .attr("visibility", "hidden");
      } else {
        d3.selectAll("circle." + classArray[1])
          .attr("visibility", "visible");
        d3.selectAll("path.abundance." + classArray[1])
          .attr("visibility", "visible");
      }

    });

  }

  /* allHide() */
  fumiposAPI.allHide = function () {
    d3.selectAll("circle.binary")
      .attr("visibility", "hidden");

    d3.selectAll("circle.path")
      .attr("visibility", "hidden");

    d3.selectAll("path.abundance")
      .attr("visibility", "hidden");

    d3.select("table.legend").selectAll("td.switch")
      .attr("style", "color:#FFFFFF")
      .attr("name", "hidden");
  };

  /* allShow() */
  fumiposAPI.allShow = function () {
    d3.selectAll("circle.binary")
      .attr("visibility", "visible");

    d3.selectAll("circle.path")
      .attr("visibility", "visible");

    d3.selectAll("path.abundance")
      .attr("visibility", "visible");

    d3.select("table.legend").selectAll("td.switch")
      .attr("style", "")
      .attr("name", "visible");
  };

  /* showMine() */
  fumiposAPI.showMine = function () {
    flag = document.formLegend.checkMine.checked;

    if (flag == true) {
      fumiposAPI.allShow();
    } else {
      fumiposAPI.allHide();
      d3.selectAll("circle.Binary.mine")
        .attr("visibility", "visible");
      d3.selectAll("circle.path.mine")
        .attr("visibility", "visible");
      d3.selectAll("path.abundance.mine")
        .attr("visibility", "visible");
      d3.select("table.legend").selectAll("td.switch")
        .attr("style", "")
        .attr("name", "visible");
    }

  };


  /* Graph appender */
  fumiposAPI.GraphAppender = function (fumipo, graphAreaID) {
    this.fumipo = fumipo;
    this.graphArea = d3.select(graphAreaID);
    this.graphNumCounter = 0;
    this.binaryNumCounter = 0;
    this.abundanceNumCounter = 0;
    this.mapNumCounter = 0;
    this.menuContent = new Array();
    this.menuContent = ["save", "setting", "delete"];
  };

  /* autoGraphAppend */
  fumiposAPI.GraphAppender.prototype.autoGraphAppend = function (plotList) {
    for (let obj of plotList) {
      this.setGraph(obj.type, obj.inputList);
    }
  }

  /* setGraph */
  fumiposAPI.GraphAppender.prototype.setGraph = function (graphType, formSetting) {
    const fumipo = this.fumipo;
    const self = this;

    if (graphType == "binary") {
      var graphTypeString = "Binary";
      var formURL = "./form_Binary.html";
      var graphNum = this.binaryNumCounter;
      this.binaryNumCounter = this.binaryNumCounter + 1;
      var Constructor = fumiposAPI.Binary;

      if (formSetting) {
        form = formSetting;
      } else if (window.matchMedia('(max-width:1023px)').matches) {
        var form = [
          { 'id': 'xName', 'type': 'value', 'value': null },
          { 'id': 'yName', 'type': 'value', 'value': null },
          { 'id': 'x_min', 'type': 'value', 'value': null },
          { 'id': 'x_max', 'type': 'value', 'value': null },
          { 'id': 'y_min', 'type': 'value', 'value': null },
          { 'id': 'y_max', 'type': 'value', 'value': null },
          { 'id': 'checkLogX', 'type': 'checked', 'value': false },
          { 'id': 'checkLogY', 'type': 'checked', 'value': false },
          { 'id': 'imageSize', 'type': 'value', 'value': 0.5 },
          { 'id': 'aspect', 'type': 'value', 'value': 1.0 }
        ];
      } else {

        var form = [
          { 'id': 'xName', 'type': 'value', 'value': null },
          { 'id': 'yName', 'type': 'value', 'value': null },
          { 'id': 'x_min', 'type': 'value', 'value': null },
          { 'id': 'x_max', 'type': 'value', 'value': null },
          { 'id': 'y_min', 'type': 'value', 'value': null },
          { 'id': 'y_max', 'type': 'value', 'value': null },
          { 'id': 'checkLogX', 'type': 'checked', 'value': false },
          { 'id': 'checkLogY', 'type': 'checked', 'value': false },
          { 'id': 'imageSize', 'type': 'value', 'value': 0.3 },
          { 'id': 'aspect', 'type': 'value', 'value': 0.8 }
        ];
      }

    } else if (graphType == "abundance") {
      graphTypeString = "Abundance";
      formURL = "./form_abundance.html";
      graphNum = this.abundanceNumCounter;
      this.abundanceNumCounter = this.abundanceNumCounter + 1;
      Constructor = fumiposAPI.Abundance;

      if (formSetting) {
        var form = formSetting;
      } else if (window.matchMedia('(max-width:1023px)').matches) {
        form = [
          { 'id': 'eleName', 'type': 'value', 'value': null },
          { 'id': 'reserver', 'type': 'value', 'value': 'PM,Sun&McDonough-1989' },
          { 'id': 'y_min', 'type': 'value', 'value': 0.01 },
          { 'id': 'y_max', 'type': 'value', 'value': 1000 },
          { 'id': 'imageSize', 'type': 'value', 'value': 0.8 },
          { 'id': 'aspect', 'type': 'value', 'value': 0.8 }
        ]

      } else {
        form = [
          { 'id': 'eleName', 'type': 'value', 'value': null },
          { 'id': 'reserver', 'type': 'value', 'value': 'PM,Sun&McDonough-1989' },
          { 'id': 'y_min', 'type': 'value', 'value': 0.01 },
          { 'id': 'y_max', 'type': 'value', 'value': 1000 },
          { 'id': 'imageSize', 'type': 'value', 'value': 0.5 },
          { 'id': 'aspect', 'type': 'value', 'value': 0.8 }
        ];
      }

    } else if (graphType == "map") {
      graphTypeString = "Map";
      formURL = "./form_map.html";
      graphNum = this.mapNumCounter;
      this.mapNumCounter += 1;
      Constructor = fumiposAPI.Map;

      if (formSetting) {
        var from = formSetting;
      } else if (window.matchMedia('(max-width:1023px)').matches) {

        form = [];

      } else {
        form = [];
      }

    };

    /* Create graph & menu rapper */
    this.graphArea.insert("div", "div#graphAppender")
      .attr("class", "wrapper" + graphTypeString + " " + graphTypeString + graphNum);

    /* Create uncountable list */
    d3.select("div.wrapper" + graphTypeString + "." + graphTypeString + graphNum).append("div")
      .attr("class", "nav_" + graphTypeString + graphNum)
      .append("ul");

    /* Create list menu */
    var menuDOM = d3.select("div.nav_" + graphTypeString + graphNum).select("ul").selectAll("li").data(this.menuContent);

    /* Append graph button */
    menuDOM.enter().append("li")
      .attr("class", function (d) { return "nav_" + d + graphNum; })
      .append("a")
      .attr("id", function (d) { return "nav_" + d + "_" + graphTypeString + graphNum; })
      .attr("class", function (d) { return "nav_" + d; });


    /*  Set open event for menu */
    var num = graphNum;
    $("a#nav_setting_" + graphTypeString + graphNum).click(function () {
      $("div.wrapper" + graphTypeString + "." + graphTypeString + num).addClass("active");
      $("div#setting_overlay").fadeIn();
      $("div#form" + graphTypeString + num).fadeIn();
      $("div#form" + graphTypeString + num + " form input")[0].focus();
    });

    //
    //
    /* set save as image event */
    //
    //

    $("a#nav_save_" + graphTypeString + graphNum).click(function () {

      var svg = d3.select(".graph" + graphTypeString + "." + graphTypeString + num).select("svg");

      var commonStyle = document.getElementById("graph_style");
      var legendStyle = document.getElementById("legendStyle");

      var styleText = commonStyle.innerHTML + legendStyle.innerHTML;

      svg.insert("style", "g").attr("type", "text/css").text(styleText);

      svg = d3.select(".graph" + graphTypeString + "." + graphTypeString + num).select("svg");
      var svgDOM = svg[0][0];

      var canvas = document.createElement("canvas");
      var svgData = new XMLSerializer().serializeToString(svgDOM);


      canvas.width = svgDOM.width.baseVal.value;
      canvas.height = svgDOM.height.baseVal.value;

      var ctx = canvas.getContext("2d");

      // 背景をwhiteで塗りつぶしておく
      ctx.rect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.fill();

      var image = new Image;
      image.onload = function () {
        ctx.drawImage(image, 0, 0);
        // Optional: 自動でダウンロードさせる場合
        try {
          var xName = d3.select(".graph" + graphTypeString + "." + graphTypeString + num).select("text.xlabel").text();
        } catch (e) {
          var xName = "Element";
        }

        try {
          var yName = d3.select(".graph" + graphTypeString + "." + graphTypeString + num).select("text.ylabel").text();
        } catch (e) {
          var yName = "Abundance";
        }

        xName = xName.replace(/\//g, "_");
        xName = xName.replace(/#/g, "N");
        xName = xName.replace(/[\s\:\*\"\'\<\>\?\|\\]/g, ""); //"
        yName = yName.replace(/\//g, "_");
        yName = yName.replace(/#/g, "N");
        yName = yName.replace(/[\s\:\*\"\'\<\>\?\|\\]/g, ""); //"

        d3.select("body").append("a")
          .attr("id", "image-file")
          .attr("class", "hidden")
          .attr("type", "application/octet-stream")
          .attr("href", canvas.toDataURL("image/png"))
          .attr("download", xName + "-vs-" + yName + ".png")
          .text("Download as Image")

        //$("body").append("<a id='image-file' class='hidden' type='application/octet-stream' href='"+ canvas.toDataURL("image/png") + "' download='graph.png'>Donload Image</a>")
        $("#image-file")[0].click();

        $("canvas").remove();
        $("#image-file").remove();

        svg.selectAll("style").remove();
      }

      image.src = "data:image/svg+xml;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(svgData)));

    });

    //
    /*  Set delete event */
    //

    $("a#nav_delete_" + graphTypeString + graphNum).click(function () {
      $("div#form" + graphTypeString + num).remove();
      $("div.wrapper" + graphTypeString + "." + graphTypeString + num).remove();
    });

    //
    /* Create setting form */
    //

    d3.select("div#setting_menu").append("div")
      .attr("class", "form" + graphTypeString)
      .attr("id", "form" + graphTypeString + graphNum);

    fetch(formURL).then(function (response) {
      return response.text();
    }).then(function (text) {

      $("div#form" + graphTypeString + graphNum).append($(text)).trigger('create');

      /* Set close event for menu */
      $("#form" + graphTypeString + graphNum + " a.close_button").click(function () {
        $("div.wrapper" + graphTypeString + "." + graphTypeString + num).removeClass("active");
        $("#setting_overlay").fadeOut();
        $("#form" + graphTypeString + num).fadeOut();

      });

      $("#setting_overlay").click(function () {
        $("div.wrapper" + graphTypeString + "." + graphTypeString + num).removeClass("active");
        $("#setting_overlay").fadeOut();
        $("#form" + graphTypeString + num).fadeOut();

      });

      /* Create graph area*/
      d3.select("div.wrapper" + graphTypeString + "." + graphTypeString + graphNum).append("div")
        .attr("class", "graph" + graphTypeString + " " + graphTypeString + graphNum);

      /* セッティングフォームの初期値設定 */
      form.map(function (obj) {
        let target = document.querySelector(`#form${graphTypeString + num} #${obj.id}`);
        target[obj.type] = obj.value;

        if (obj.type === 'value') target.parentNode.classList.toggle('is-dirty');
      })

      /* DOMを再解釈 */
      //componentHandler.upgradeDom();

      /* Initialize graph area */
      fumipo.formDOM[self.graphNumCounter] = $('#form' + graphTypeString + graphNum + ' > form');

      fumipo.plotter[self.graphNumCounter] = new Constructor(`div.graph${graphTypeString}.${graphTypeString + graphNum}`, fumipo.formDOM[self.graphNumCounter][0], fumipo.plotter);

      //console.log(formDOM[this.graphNumCounter][0])
      /* Add eventListenor*/
      d3.select("div#form" + graphTypeString + graphNum).select("form")
        .attr("onchange", `fumipo.plotter[${self.graphNumCounter}].replot(fumipo.plotData,fumipo.refData,fumipo.formDOM[${self.graphNumCounter}][0],fumipo.partitioningData);fumiposAPI.toggleVisibility()`);

      fumipo.plotter[self.graphNumCounter].replot(fumipo.plotData, fumipo.refData, fumipo.formDOM[self.graphNumCounter][0], fumipo.partitioningData);
      fumiposAPI.toggleVisibility()

      if (!formSetting) $("a#nav_setting_" + graphTypeString + graphNum).click();

      self.graphNumCounter = self.graphNumCounter + 1;

    })
  };


  /* Binary object constructor */
  fumiposAPI.Binary = function (svgDivName, formDOM, parentArray) {
    this.parent = parentArray;
    this.svg = {};
    this.svg.divName = svgDivName;
    this.boxPropaty = {
      padding: { left: 15, right: 15, top: 15, buttom: 15 },
      offset: { x: 60, y: 60 }
    };
    this.formObj = this.readForm(formDOM);
    this.svg.DOM = d3.select("body").select(svgDivName);
    this.svg.size = { width: parseInt(this.formObj.imageSize), height: parseInt(this.formObj.imageSize * this.formObj.aspectRatio) };
    this.axis = {};

    this.molarValue = {
      SiO2: 60.06,
      TiO2: 79.90,
      Al2O3: 101.94,
      FeO: 71.84,
      MgO: 40.32,
      Fe2O3: 159.69,
      CaO: 56.08,
      Na2O: 61.99,
      K2O: 94.20,
      P2O5: 141.94,
    };

    this.initialize();
  };

  /* formObj updator */
  fumiposAPI.Binary.prototype.catchFormUpdate = function (formDOM) {
    this.formObj = this.readForm(formDOM);
  };

  /* initializer */
  fumiposAPI.Binary.prototype.initialize = function () {
    // svg 領域のサイズ, オフセット, パディングを設定
    svgDivName = this.svg.divName;
    formObj = this.formObj;

    var offset = this.boxPropaty.offset
    var padding = this.boxPropaty.padding;
    var svg = this.svg;
    svg.DOM.append("svg")
      .attr("width", svg.size.width)
      .attr("height", svg.size.height);
    svg.DOM = svg.DOM.select("svg");

    // 軸の長さを設定
    var axis = this.axis;
    axis.width = svg.size.width - offset.x - padding.left - padding.right;
    axis.height = svg.size.height - offset.y - padding.top - padding.buttom;



    // 軸を登録(svg要素内での位置と仮のラベルを指定)
    // y軸を登録
    svg.DOM.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + (offset.x + padding.left) + "," + (svg.size.height - axis.height - offset.y - padding.buttom) + ")");
    // y軸ラベルを登録
    svg.DOM.select(".y.axis")
      .append("text")
      .attr("class", "ylabel")
      .attr("transform", "rotate (-90," + -offset.x + "," + axis.height * 0.6 + ")")
      .attr("x", -offset.x)
      .attr("y", axis.height * 0.6)
      .text(" ");

    // x軸を登録
    svg.DOM.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(" + (offset.x + padding.left) + "," + (svg.size.height - offset.y - padding.buttom) + ")");
    // x軸ラベルを登録
    svg.DOM.select(".x.axis")
      .append("text")
      .attr("class", "xlabel")
      .attr("x", axis.width * 0.4)
      .attr("y", offset.y * 0.75)
      .text(" ");
  };

  /* Form reader */
  fumiposAPI.Binary.prototype.readForm = function (formDOM) {
    this.formDOM = formDOM;
    var formObj = new Object();
    formObj = {
      styleClass: formDOM.style.value,
      aspectRatio: formDOM.aspect.value,
      imageSize: parseInt(document.getElementById("graph_area").clientWidth * formDOM.imageSize.value),
      x: {},
      y: {}
    };

    var x = formObj.x;
    var y = formObj.y;

    x.name = formDOM.xName.value;
    y.name = formDOM.yName.value;

    //if (x.name == "") x.name="dummy"
    //if (y.name == "") y.name="dummy"

    // logプロットフラグをチェックボックスから取得
    x.logFlag = formDOM.checkLogX.checked;
    y.logFlag = formDOM.checkLogY.checked;

    x.max = parseFloat(formDOM.x_max.value);
    x.min = parseFloat(formDOM.x_min.value);
    y.max = parseFloat(formDOM.y_max.value);
    y.min = parseFloat(formDOM.y_min.value);

    // 組成式の数字を下付きにするため, xNameSupとyNameSupをアルファベットと数字に分割
    x.char = new Array(x.name.match(/[A-Z]+/gi));
    x.num = new Array(x.name.match(/[0-9]+/g));
    y.char = new Array(y.name.match(/[A-Z]+/gi));
    y.num = new Array(y.name.match(/[0-9]+/g));

    // 同位体比かどうか,元素比かどうかを判定

    if (x.name.match(/^[0-9]+/)) {
      x.type = "isotope";
      x.element = x.name.match(/[a-z]+/i)[0];
      x.sup = x.name;
      x.sub = "dummy";
    } else {
      if (x.name.match(/\//)) {
        x.type = "ratio";
        x.element = x.name.split("/")[0];
        x.sup = x.name.split("/")[0];
        x.sub = x.name.split("/")[1];
      } else {
        x.type = "abundance";
        x.element = "dummy";
        x.sup = x.name;
        x.sub = "dummy";
      }
    }

    if (y.name.match(/^[0-9]+/)) {
      y.type = "isotope";
      y.element = y.name.match(/[a-z]+/i)[0];
      y.sup = y.name;
      y.sub = "dummy";
    } else {
      if (y.name.match(/\//)) {
        y.type = "ratio";
        y.element = y.name.split("/")[0];
        y.sup = y.name.split("/")[0];
        y.sub = y.name.split("/")[1];
      } else {
        y.type = "abundance";
        y.element = "dummy";
        y.sup = y.name;
        y.sub = "dummy";
      }
    }
    return formObj;
  };


  /* get extent of data */
  fumiposAPI.Binary.prototype.getDataExtent = function (dataList) {
    var x = this.formObj.x;
    var y = this.formObj.y
    var extent = new Object();
    extent.x = new Array();
    extent.y = new Array();

    if (isNaN(x.max)) {
      extent.x[1] = d3.max(dataList, function (d) { return +d.value[x.sup] / +d.value[x.sub]; });
      //this.formDOM.x_max.value = extent.x[1];

    } else {
      extent.x[1] = parseFloat(x.max);
    }

    if (!isNaN(x.min)) {
      extent.x[0] = parseFloat(x.min);
    } else {
      extent.x[0] = d3.min(dataList, function (d) { return +d.value[x.sup] / +d.value[x.sub]; });
      //this.formDOM.x_min.value = extent.x[0];
    }

    // y軸の最大最小値
    if (!isNaN(y.max)) {
      extent.y[1] = parseFloat(y.max);
    } else {
      extent.y[1] = d3.max(dataList, function (d) { return +d.value[y.sup] / +d.value[y.sub]; });
      //this.formDOM.y_max.value = extent.y[1] ;
    }
    if (!isNaN(y.min)) {
      extent.y[0] = parseFloat(y.min);
    } else {
      extent.y[0] = d3.min(dataList, function (d) { return +d.value[y.sup] / +d.value[y.sub]; });
      //this.formDOM.y_min.value = extent.y[0];
    }

    return extent;
  }

  /* Framework updator */
  fumiposAPI.Binary.prototype.updateFramework = function (extent) {
    var svg = this.svg;
    var formObj = this.formObj;

    // グラフタイトル	
    var head1 = svg.DOM.select("h1")
    head1.text(formObj.x.name + " vs. " + formObj.y.name);

    // イメージサイズの変換
    svg.size = { width: parseInt(formObj.imageSize), height: parseInt(formObj.imageSize * formObj.aspectRatio) };

    var offset = this.boxPropaty.offset;
    var padding = this.boxPropaty.padding;

    svg.DOM.attr("width", svg.size.width)
      .attr("height", svg.size.height);

    var axis = this.axis;
    axis.width = svg.size.width - offset.x - padding.left - padding.right;
    axis.height = svg.size.height - offset.y - padding.top - padding.buttom;

    svg.DOM.select("g.y.axis")
      .attr("transform", "translate(" + (offset.x + padding.left) + "," + (svg.size.height - axis.height - offset.y - padding.buttom) + ")");

    svg.DOM.select("g.x.axis")
      .attr("transform", "translate(" + (offset.x + padding.left) + "," + (svg.size.height - offset.y - padding.buttom) + ")");

    //console.log(xAxisWidth)
    //console.log(yAxisHight)


    // スケールと軸の設定
    // log指定ならlogスケール, そうでなければ線形スケール
    if (formObj.x.logFlag == true) {
      axis.xScale = d3.scale.log()
        .domain(extent.x)
        .range([0, axis.width]);

      axis.x = d3.svg.axis()
        .scale(axis.xScale)
        .ticks(0, "e")
        .orient("bottom")
        .tickSize(6, -svg.size.height);
    } else {
      axis.xScale = d3.scale.linear()
        .domain(extent.x)
        .range([0, axis.width]);

      axis.x = d3.svg.axis()
        .scale(axis.xScale)
        .ticks(5)
        .orient("bottom")
        .tickSize(6, -svg.size.height);
    }

    if (formObj.y.logFlag == true) {
      axis.yScale = d3.scale.log()
        .domain(extent.y)
        .range([axis.height, 0]);

      axis.y = d3.svg.axis()
        .ticks(0, "e")
        .scale(axis.yScale)
        .orient("left")
        .tickSize(6, -svg.size.width);
    } else {
      axis.yScale = d3.scale.linear()
        .domain(extent.y)
        .range([axis.height, 0]);

      axis.y = d3.svg.axis()
        .ticks(5)
        .scale(axis.yScale)
        .orient("left")
        .tickSize(6, -svg.size.width);
    }

    // 軸の作成
    // 軸の書き換え
    svg.DOM.select(".y.axis").transition().call(axis.y);
    svg.DOM.select(".x.axis").transition().call(axis.x);


    svg.DOM.select(".y.axis").select("path").transition()
      .attr("d", "M" + axis.width + ",0H0V" + axis.height + "H" + axis.width)


    svg.DOM.select(".x.axis").select("path").transition()
      .attr("d", "M0,-" + axis.height + "V0H" + axis.width + "V-" + axis.height)



    // 軸ラベルの書き換え
    svg.DOM.select("text.ylabel").transition()
      .attr("transform", "rotate (-90," + -offset.x + "," + axis.height * 0.6 + ")")
      .attr("x", -offset.x)
      .attr("y", axis.height * 0.6)
      .text(formObj.y.name);
    svg.DOM.select("text.xlabel").transition()
      .attr("x", axis.width * 0.4)
      .attr("y", offset.y * 0.75)
      .text(formObj.x.name);

    //var fontSize=parseInt(svg.size.width/25);

    //svg.DOM.selectAll("text").attr("style","font:"+fontSize+"px 'Arial'");
    svg.DOM.selectAll("path.domain").attr("fill", "none");
  }

  /* Replot flow */
  fumiposAPI.Binary.prototype.replot = function (csvObj, csvRefObj, formDOM, csvDObj) {
    this.formObj = this.readForm(formDOM);
    var extent = this.getDataExtent(csvObj);
    this.updateFramework(extent);
    this.plotPoint(csvObj, extent, csvDObj);
  }

  /* Main data plot */
  fumiposAPI.Binary.prototype.plotPoint = function (dataObj, extent, csvDObj) {
    /* インスタンスの変数 */
    var parentHarker = this;
    var svg = this.svg;
    var formObj = this.formObj;
    var x = formObj.x;
    var y = formObj.y;
    var axis = this.axis;
    var offset = this.boxPropaty.offset;
    var padding = this.boxPropaty.padding;

    //console.log(csvObj);
    var styleClass = document.getElementById("legendKey").value;

    // ツールチップのDOMを登録
    var tooltipHarker = d3.select("body").select("#tooltip");

    /* Plot mode Selection */
    var mixModeFlag = false;
    var syncModeFlag = false;
    var simulateModeFlag = false;

    var plotSelection = document.querySelector("#mode_select").value;
    if (plotSelection == "mixing") {
      // Mixing mode かどうかをチェックボックスから取得
      mixModeFlag = true;
    } else if (plotSelection == "none") {
      ;
    } else {
      // Melting mode 
      simulateModeFlag = true;
    };

    //>> シンボルに関する変数をcommon formから定義
    var baseOpacity = document.symbolForm.baseOpacity.value,
      onOpacity = document.symbolForm.onOpacity.value,
      outOpacity = document.symbolForm.outOpacity.value;

    var baseRadius = document.symbolForm.baseRadius.value,
      onRadius = document.symbolForm.onRadius.value,
      outRadius = document.symbolForm.outRadius.value,
      strongRadius = 10;

    var baseWidth = document.symbolForm.baseWidth.value,
      onWidth = document.symbolForm.onWidth.value,
      outWidth = document.symbolForm.outWidth.value,
      strongWidth = 4;

    //>> プロット点の作成と書き換え(マウスオーバー時の挙動も定義)
    // d3のメソッドにより, シンボルは▲や■も用いられるらしい

    // シミュレートによるシンボルを消去
    svg.DOM.selectAll("path.mix").remove();
    svg.DOM.selectAll("path.melting").remove();

    /* d3によるcircle要素の定義と登録 */
    var circle = svg.DOM.selectAll("circle").data(dataObj);
    circle.enter().append("circle")
      .attr("cx", -10)
      .attr("cy", -10);
    circle.exit().remove();

    circle.each(function (d) {

      cx = axis.xScale(+d.value[x.sup] / +d.value[x.sub]) + offset.x + padding.left;
      cy = axis.yScale(+d.value[y.sup] / +d.value[y.sub]) + padding.buttom;

      if (isNaN(cx) || isNaN(cy)) {
        d3.select(this).transition()
          .attr("cy", -10)
          .attr("cx", -10)
          .remove();
        return false;
      }

      d3.select(this).attr("r", function (d) {
        return (d.value['study'] === 'mine') ? baseRadius * 1.5 : baseRadius
      })
        .attr('stroke-width', function (d) {
          return (d.value['study'] === 'mine') ? '4px' : '0px'
        })
        .attr("fill", "none")
        .attr("name", function (d) { return d.value["name"]; })
        .attr("class", function (d) { return ("Binary D" + d.value["ID"] + " " + d.value[styleClass] + " " + d.value["study"]) })
        .attr("opacity", baseOpacity).transition()
        .attr("cx", cx)
        .attr("cy", cy)

    })

    /*circle.attr("r",function(d){
            return (d.value['study'] === 'mine')? baseRadius*1.5 : baseRadius
          })
          .attr('stroke-width',function(d){
            return (d.value['study'] === 'mine')? '4px' : '0px'
          })
          .attr("fill", "none")
          .attr("name", function(d){ return d.value["name"];})
          .attr("class", function(d){ return ("Binary D"+d.value["ID"]+" "+d.value[styleClass]+" "+d.value["study"])})
          .attr("opacity",baseOpacity).transition()
          .attr("cx", function(d){ return axis.xScale(+d.value[x.sup]/+d.value[x.sub])+offset.x+padding.left; })
          .attr("cy", function(d){ return axis.yScale(+d.value[y.sup]/+d.value[y.sub])+padding.buttom; })*/


    //>> マウスイベントリスナを登録
    /* マウスオーバーによってツールチップを表示 & 強調表示 */
    circle.on("mouseover", function (d) {
      d3.selectAll("circle.Binary")
        .transition()
        .each(function (d) {
          if (d3.select(this).attr("r") != strongRadius) {
            d3.select(this)
              .attr("opacity", outOpacity)
              .attr('r', outRadius);
          }
        })

      // 他グラフへの強調表示の波及
      var selectedClass = d3.select(this).attr("class");
      var selectedClassArray = selectedClass.split(" ");

      if (d3.select(this).attr("r") != strongRadius) {
        d3.selectAll("circle.Binary." + selectedClassArray[1])
          .attr("r", onRadius)
          .attr("opacity", onOpacity);
      }

      var abundance = d3.selectAll("path.abundance")
      if (abundance[0].length > 0) {
        abundance.transition()
          .each(function (d) {
            if (d3.select(this).attr("stroke-width") != strongWidth) {
              d3.select(this)
                .attr("stroke-width", outWidth);
            }
          })

        var abundanceThis = d3.selectAll("path.abundance." + selectedClassArray[1]);
        if (abundanceThis[0].length > 0) {
          if (abundanceThis.attr("stroke-width") != strongWidth) {
            abundanceThis.attr("stroke-width", onWidth);
          }
        }
      }

      d3.selectAll("circle.path")
        .attr("r", 0);

      d3.selectAll("circle.path." + selectedClassArray[1])
        .attr("r", 2);


      /* for map
      var mapPoint=d3.selectAll("circle.Map");
      if (mapPoint[0].length > 0){
        mapPoint.transition()
          .attr("opacity",0.1);
      }
      var mapPointThis=d3.selectAll("circle.Map."+selectedClassArray[1]);
      if (mapPoint[0].length > 0){
        mapPointThis.attr("opacity",1);
      }
      */


      function getPrecision(val, precise = 4) {
        let value = new Number(val);
        return value.toPrecision(precise);
      }

      // ツールチップの内容を定義
      return tooltipHarker.style("visibility", "visible")
        .text(`${d.value["name"]}  ${d.value["location"]} [ ${getPrecision(d.value[x.sup])}/${getPrecision(d.value[x.sub])} : ${getPrecision(d.value[y.sup])}/${getPrecision(d.value[y.sub])} ]`);

    });

    /* マウスの移動にツールチップを追従させる */
    circle.on("mousemove", function (d) {
      return tooltipHarker.style("top", (event.pageY - 20) + "px").style("left", (event.pageX + 10) + "px");
    });

    /* マウスアウトでツールチップ非表示 & 強調表示解除 */
    circle.on("mouseout", function (d) {
      d3.selectAll("circle.Binary")
        .transition()
        .each(function (d) {
          if (d3.select(this).attr("r") != strongRadius) {
            d3.select(this)
              .attr("opacity", baseOpacity)
              .attr("r", function (d) {
                if (d.value["study"] == "mine") {
                  return baseRadius * 1.5;
                } else {
                  return baseRadius;
                }
              });
          }
        })

      d3.selectAll("path.abundance")
        .transition()
        .each(function (d) {
          if (d3.select(this).attr("stroke-width") != strongWidth) {
            d3.select(this)
              .attr("stroke-width", baseWidth);
          }
        })

      d3.selectAll("circle.path")
        .attr("r", 2);
      /* for map
      d3.selectAll("circle.Map")
        .transition()
        .attr("opacity",0.3);
      */

      return tooltipHarker.style("visibility", "hidden");
    });

    /* クリックにより特に強調 or 各種シミュレーション */
    circle.on("click", function (d) {
      var selectedClass = d3.select(this).attr("class");
      var selectedClassArray = selectedClass.split(" ");
      if (d3.select(this).attr("r") != strongRadius) {
        d3.selectAll("circle." + selectedClassArray[1])
          .transition()
          .attr("r", strongRadius);
      } else {
        d3.selectAll("circle." + selectedClassArray[1])
          .transition()
          .attr("r", onRadius);
      }

      var abundance = d3.selectAll("path.abundance")
      if (abundance[0].length > 0) {
        var abundanceThis = d3.selectAll("path.abundance." + selectedClassArray[1]);
        if (abundanceThis[0].length > 0) {
          if (abundanceThis.attr("stroke-width") != strongWidth) {
            abundanceThis.transition()
              .attr("stroke-width", strongWidth);
          } else {
            abundanceThis.transition()
              .attr("stroke-width", onWidth);
          }
        }
      }
    });

    /* シミュレーション */
    if (mixModeFlag == true) {
      //>> Mixing simulation
      var endMember = new Array();
      circle.on("click", function (d) {
        if (endMember.length > 2) endMember.shift();
        parentHarker.drawMix_curve(endMember, parentHarker.parent);
        return endMember.push(d);
      });
    } else if (simulateModeFlag == true) {
      //>> Melting simulation
      var endMember = new Array();
      circle.on("click", function (d) {
        endMember.shift();
        endMember.push(d);
        parentHarker.drawSimulatedMelt(endMember, parentHarker.parent, csvDObj);
      });
    }
  }


  /* _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/ */
  //
  //
  /* それぞれのグラフにミキシングカーブを描くための関数 drawMix_curve */
  //
  //
  // _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/ 

  fumiposAPI.Binary.prototype.drawMix_curve = function (endMember, parentArray) {
    var parent = parentArray; // 自身を格納している配列を参照
    // 2点選ばれたなら, ミキシングカーブを計算する
    if (endMember.length == 2) {
      var iterateNum = parent.length;
      for (var j = 0; j < iterateNum; j++) {
        //console.log(parent[j])
        parent[j].plotMixture(endMember);
      };
    };
  };

  /* 実際にmixingカーブを描くメソッド */
  fumiposAPI.Binary.prototype.plotMixture = function (endMember) {
    var tooltipHarker = d3.select("body").select("#tooltip");
    var svg = d3.select(this.svg.divName).select("svg");
    var px, py;
    var mixArray = new Array();
    var mixPoint = new Array();
    mixPoint[0] = new Array();
    var formObj = this.formObj;
    var x = formObj.x;
    var y = formObj.y;
    var axis = this.axis;
    var padding = this.boxPropaty.padding;
    var offset = this.boxPropaty.offset;

    var mixingRatioValues = document.form_simulate.fraction.value;
    var mixingRatio = mixingRatioValues.split(" ");

    /* Mixed value calculator */
    function getMixValue(endMember, name, ratio) {
      var val = (endMember[0].value[name.sup] * endMember[0].value[name.element] * (1 - ratio) + endMember[1].value[name.sup] * endMember[1].value[name.element] * ratio) / (endMember[0].value[name.sub] * endMember[0].value[name.element] * (1 - ratio) + endMember[1].value[name.sub] * endMember[1].value[name.element] * ratio)

      return val;
    };

    for (var i = 0; i < mixingRatio.length; i++) {
      px = getMixValue(endMember, x, mixingRatio[i]);
      py = getMixValue(endMember, y, mixingRatio[i]);
      mixArray.push({ "x": px, "y": py, "label": mixingRatio[i] });
      mixPoint[0][i] = { x: px, y: py };
    };

    var line = d3.svg.line()
      .x(function (d) {
        return axis.xScale(d.x) + offset.x + padding.left;
      })
      .y(function (d) {
        return axis.yScale(d.y) + padding.top;
      })
      .defined(function (d) {
        return !isNaN(d.x) && !isNaN(d.y);
      });



    //console.log(mixPoint)


    /* 溶融曲線をプロット */
    var mixPath = svg.selectAll("path.mix").data(mixPoint);
    mixPath.exit().remove();
    mixPath.enter().append("path");
    mixPath.transition().attr("fill", "none")
      .attr("class", "mix")
      .attr("d", function (d) { return line(d) })
      .attr("stroke-width", 1);

    /* ミキシング結果を示す点をプロット */
    var mixCircle = svg.selectAll("circle.mix").data(mixArray);
    mixCircle.enter().append("circle");
    mixCircle.exit().remove();
    mixCircle.attr("class", "mix")
      .attr("r", 2)
      .attr("opacity", 1)
      .transition()
      .attr("cx", function (d) {
        if (isNaN(d.x) == false && isNaN(d.y) == false) {
          return axis.xScale(d.x) + offset.x + padding.left;
        }
      })
      .attr("cy", function (d) {
        if (isNaN(d.y) == false && isNaN(d.x) == false) {
          return axis.yScale(d.y) + padding.buttom;
        }
      });


    mixCircle.on("mouseover", function (d) {
      return tooltipHarker.style("visibility", "visible")
        .text(d.label);
    });

    mixCircle.on("mousemove", function (d) {
      return tooltipHarker.style("top", (event.pageY - 20) + "px").style("left", (event.pageX + 10) + "px");
    });

    mixCircle.on("mouseout", function (d) {
      return tooltipHarker.style("visibility", "hidden");
    });
  };

  /* それぞれのグラフに溶融曲線を描くための関数 */
  fumiposAPI.Binary.prototype.drawSimulatedMelt = function (endMember, parentArray, csvDObj) {
    var parent = parentArray;
    var iterateNum = parent.length;

    for (var j = 0; j < iterateNum; j++) {
      //console.log(parent[j])
      /* !! hard coding */
      parent[j].plotSimulatedMelt(endMember, csvDObj);
    };
  };

  /* _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/ */
  //
  //
  /* melt simulator */
  //
  //
  // _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/ 
  fumiposAPI.Binary.prototype.setPartitioningObj = function (obj) {
    this.csvDObj = obj;
  }

  fumiposAPI.Binary.prototype.plotSimulatedMelt = function (endMember, _csvDObj) {
    if (_csvDObj.length == 0) {
      alert('Select partitioning coeffecient file. ');
      return false;
    }

    const csvDObj = _csvDObj;

    /* 組成シミュレート関数 */
    /* SimulateObj */
    function SimulatedObj() {
      var func = Object.create(SimulatedObj.prototype);
      func.plotObj = new Object();
      func.plotObj.points = new Array();
      func.plotObj.paths = new Array();
      func.plotObj.paths[0] = new Array();
      return func;
    }
    /* prototype */
    SimulatedObj.prototype = {
      getPlotObj() {
        return this.plotObj;
      },
      getPlotPoints() {
        return this.plotObj.points;
      },
      getPlotPaths(i) {
        if (i) {
          return this.plotObj.paths[i];
        } else {
          return this.plotObj.paths;
        }
      },

      /* phaseObj
      phaseObj:{
        olivine:{
          name:"olivine",
          init:(initial abundance/modal abundance),
          react:(reaction stoichiometry)
          D:{
            Nb:"",
            Fe_Mg:"",
        }
      },
      orthopyroxene:{
    	
      },
    }
        */
      getPhaseObj() {
        var phase = new Object();
        var csvObj = this.csvDObj;

        for (var attrKey in csvObj) {
          var phaseName = csvObj[attrKey].value["phase"];
          phase[phaseName] = new Object();
          phase[phaseName].name = csvObj[attrKey].value["phase"];
          phase[phaseName].init = parseFloat(document.getElementById("initial_" + phase[phaseName].name).value);
          phase[phaseName].react = parseFloat(document.getElementById("reaction_" + phase[phaseName].name).value);
          phase[phaseName].D = new Object();

          for (var key in csvObj[attrKey].value) {
            if (key != "phase") phase[phaseName].D[key] = csvObj[attrKey].value[key];
          };

        };
        return phase;
      },

      /* D obj
    D={
      solidInit:{
        ($x.sup)Fe_Mg:,
        ($x.sub)Nb:,
        ($y.sup)Y:,
        ($y.sub)Zr:,
      },
      solidReact:{
        (x.sup)Fe_Mg:,
        (x.sub)Nb:,
        (y.sup)Y:,
        (y.sub)Zr:,
      },
      olivine:{
        $phaseObj.olivine.D
        (Fe_Mg:,
        Nb:,)
      },
      orthopyroxene:{
        $phaseObj.orthopyroxene.D
        (Fe_Mg:,
        Nb:,)
      },
    }
      */

      getDObj() {
        var phaseObj = this.phaseObj;

        var dObj = new Object();

        dObj.solidInit = new Object();
        dObj.solidReact = new Object();

        for (var elem in this.csvDObj[0].value) {
          if (elem == "phase") continue
          // initialize
          dObj.solidInit[elem] = 0;
          dObj.solidReact[elem] = 0;
          dObj.solidInit[elem] = 0;
          dObj.solidReact[elem] = 0;

          for (var phasekey in phaseObj) {
            var phase = phaseObj[phasekey];

            /* phase ex.
            olivine:{
                name:"olivine",
                init:(initial abundance/modal abundance),
                react:(reaction stoichiometry)
                D:{
                  Nb:"",
                  Fe_Mg:"",
              }
            },
            */

            dObj[phase.name] = phase.D;

            dObj.solidInit[elem] += phase.D[elem] * phase.init;

            dObj.solidReact[elem] += phase.D[elem] * phase.react;

          };
        };
        return dObj;
      },
    };


    /* FixedDegreeFunc */

    function FixedDegreeFunc(endMember, x, y, ratios, csvDObj, calcfunc) {
      var func = Object.create(FixedDegreeFunc.prototype);
      Object.assign(func, SimulatedObj());

      func.endMember = endMember;
      func.x = x;
      func.y = y;
      func.ratios = ratios;
      func.csvDObj = csvDObj;
      func.calcFunc = calcfunc;

      func.phaseObj = func.getPhaseObj();
      func.D = func.getDObj();
      func.setPlotValue();
      return func;
    };
    /* prototype */
    FixedDegreeFunc.prototype = {

      setPlotValue() {
        var l = this.ratios.length;
        for (var i = 0; i < l; i++) {
          var ratio = this.ratios[i];
          if (ratio <= 0) continue;
          var x = this.calcFunc(this.endMember, this.x, ratio, this.D);
          var y = this.calcFunc(this.endMember, this.y, ratio, this.D);
          this.plotObj.paths[0][i] = { "x": x, "y": y };
          this.plotObj.points.push({ "x": x, "y": y, "label": ratio });
        }

      },
    };
    Object.setPrototypeOf(FixedDegreeFunc.prototype, SimulatedObj.prototype);

    // _/_/_/_/_/_/_/_/_/_/
    //
    /* VariableDegreeFunc */
    //
    // _/_/_/_/_/_/_/_/_/_/

    function VariableDegreeFunc(endMember, x, y, ratios, csvDObj, calcFunc) {
      var func = Object.create(VariableDegreeFunc.prototype);
      Object.assign(func, SimulatedObj());

      func.endMember = endMember;
      func.x = x;
      func.y = y;
      func.csvDObj = csvDObj;
      func.calcFunc = calcFunc;

      func.phaseObj = func.getPhaseObj();
      func.D = func.getDObj();
      func.setPlotValue();
      return func;
    };

    /* prototype */

    VariableDegreeFunc.prototype = {

      setPlotValue() {
        this.plotObj = calcFunc(this.endMember, this.x, this.y, this.phaseObj, this.D);
      },

    };
    Object.setPrototypeOf(VariableDegreeFunc.prototype, SimulatedObj.prototype);

    /* _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/ */
    //
    //
    /* 個別のシミュレート関数 */
    //
    //
    // _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/ 

    /* Batch */
    function getBatchMeltValue(endMember, name, ratio, D) {
      var supVal = endMember[0].value[name.sup] / (D.solidInit[name.sup] + ratio * (1 - D.solidReact[name.sup]));

      if (name.sub != "dummy") {
        var subVal = endMember[0].value[name.sub] / (D.solidInit[name.sub] + ratio * (1 - D.solidReact[name.sub]));
      } else {
        subVal = 1.;
      };
      return supVal / subVal;
    };

    function getBatchCrystalValue(endMember, name, ratio, D) {
      var supVal = endMember[0].value[name.sup] / (D.solidInit[name.sup] + (1 - ratio) * (1 - D.solidInit[name.sup]));

      if (name.sub != "dummy") {
        var subVal = endMember[0].value[name.sub] / (D.solidInit[name.sub] + (1 - ratio) * (1 - D.solidInit[name.sub]));
      } else {
        subVal = 1.;
      };
      return supVal / subVal;
    };

    /* aggregate */
    function getAggregationMeltValue(endMember, name, ratio, D) {
      var supVal = (1 - D.solidReact[name.sup] / D.solidInit[name.sup] * ratio);
      supVal = Math.pow(supVal, (1 / D.solidReact[name.sup]));
      supVal = (1 - supVal) * endMember[0].value[name.sup] / ratio;

      if (name.sub != "dummy") {
        var subVal = (1 - D.solidReact[name.sub] / D.solidInit[name.sub] * ratio);
        subVal = Math.pow(subVal, (1 / D.solidReact[name.sub]));
        subVal = (1 - subVal) * endMember[0].value[name.sub] / ratio;
      } else {
        subVal = 1.;
      };
      return supVal / subVal;
    };

    /* Rayleigh */
    function getRayleighMeltValue(endMember, name, ratio, D) {
      var supVal = (1 - D.solidReact[name.sup] / D.solidInit[name.sup] * ratio);
      supVal = Math.pow(supVal, (1 / D.solidReact[name.sup] - 1));
      supVal = supVal * endMember[0].value[name.sup] / D.solidInit[name.sup];

      if (name.sub != "dummy") {
        var subVal = (1 - D.solidReact[name.sub] / D.solidInit[name.sub] * ratio);
        subVal = Math.pow(subVal, (1 / D.solidReact[name.sub] - 1));
        subVal = subVal * endMember[0].value[name.sub] / D.solidInit[name.sub];
      } else {
        subVal = 1.;
      };
      return supVal / subVal;
    };

    function getRayleighCrystalValue(endMember, name, ratio, D) {
      var supVal = Math.pow((1 - ratio), (D.solidInit[name.sup] - 1));
      supVal = supVal * endMember[0].value[name.sup];

      if (name.sub != "dummy") {
        var subVal = Math.pow((1 - ratio), (D.solidInit[name.sub] - 1));
        subVal = subVal * endMember[0].value[name.sub];
      } else {
        subVal = 1.;
      };
      return supVal / subVal;
    };

    function getRayleighRemeltingValue(endMember, name, ratio, D) {
      var supVal = endMember[0].value[name.sup] * (Math.pow((1 + ratio), (D.solidInit[name.sup] - 1)));

      if (name.sub != "dummy") {
        var subVal = endMember[0].value[name.sub] * (Math.pow((1 + ratio), (D.solidInit[name.sub] - 1)));
      } else {
        subVal = 1.;
      };
      return supVal / subVal;
    };

    /* with major element */
    function getRayleighCrystallizationMajor(endMember, x, y, phaseObj, D) {
      /* set constructor operand */
      // initial melt composition
      var initialMelt = {};
      initialMelt.H2O = parseFloat(document.form_simulate.water.value);
      initialMelt.compo = endMember[0].value;

      // solid phase information
      var phaseObj = phaseObj;

      // simulate element
      var x = x;
      var y = y;
      var elements = [];
      elements.push(x.sup);
      if (x.sub != "dummy") elements.push(x.sub);
      elements.push(y.sup);
      if (y.sub != "dummy") elements.push(y.sub);

      // construct Crystal object
      var crystal = new fumiposAPI.Crystal(initialMelt, phaseObj);


      /* set target operand */
      var finalMgN = document.form_simulate.targetMgN.value;
      var targetPhase = document.form_simulate.targetPhase.value;
      var pressure = document.form_simulate.pressure.value;
      var initialMgN = crystal.getEquiMgnumber(targetPhase);
      var coolTime = 0; // dummy
      var coolRate = 0; // dummy

      // 出発メルトから結晶化初期のメルト組成を求める
      let path = (finalMgN > initialMgN) ? "ascend" : "descend";
      let profile = crystal.differentiate(finalMgN, targetPhase, true)
        .getSection("melt", elements, coolTime, coolRate, pressure, pressure, path);

      // プロファイルを返す
      /* create section object 
      return::
      section
      \-Fe_Mg
        \-name:"Fe_Mg"
        \-temperature:[2]
        \-time:~
        \-x:[]
        \-c:[~]
        \-f:[~]
      \-Cr2O3
        \-name:"Cr2O3"
        \-temperature:[2]
        \-time:~
        \-x:[]
        \-c:[~]
        \-f:[~]
      */

      /* ! ここでFの刻み幅を変更 */
      // フォームから制御できるようにする
      if (document.getElementById('equalDivision_switch').checked) {
        let divisionStepSize = document.getElementById('equalDivision_size').value;
        profile = Crystal.transformSectionToEqualDivision(profile, divisionStepSize, 'f');
      }

      /* プロファイルを整形してplotObj形式にする */
      var l = profile[x.sup].c.length;
      var plotObj = {};
      plotObj.points = [];
      plotObj.paths = [];
      plotObj.paths[0] = [];
      for (var i = 0; i < l; i++) {
        //plotObj.points[i]=new Object();
        if (x.sub != "dummy") {
          var px = profile[x.sup].c[i] / profile[x.sub].c[i];
        } else {
          px = profile[x.sup].c[i];
        };

        if (y.sub != "dummy") {
          var py = profile[y.sup].c[i] / profile[y.sub].c[i];
        } else {
          py = profile[y.sup].c[i];
        };

        ratio = profile[x.sup].f[i];

        plotObj.points.push({ "x": px, "y": py, "label": ratio });
        plotObj.paths[0][i] = { "x": px, "y": py };
      };


      return plotObj;
    };

    /* _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/ */
    //
    //
    /* インスタンス変数 */
    //
    //
    // _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/ 

    var tooltipHarker = d3.select("body").select("#tooltip");
    var svg = d3.select(this.svg.divName).select("svg");
    var formObj = this.formObj;
    var x = formObj.x;
    var y = formObj.y;
    var axis = this.axis;
    var padding = this.boxPropaty.padding;
    var offset = this.boxPropaty.offset;

    // Read melting mode
    var simulateMode = document.form_simulate.radioSimulateMode.value;

    // Read melting degrees
    var ratioValues = document.form_simulate.fraction.value;
    var ratioArray = ratioValues.split(" ");
    for (key in ratioArray) {
      ratioArray[key] = parseFloat(ratioArray[key]);
    }


    /* Select melting function */

    if (simulateMode == "BatchMelt") {
      var Constructor = FixedDegreeFunc;
      var calcFunc = getBatchMeltValue;
    } else if (simulateMode == "RayleighMelt") {
      Constructor = FixedDegreeFunc;
      calcFunc = getRayleighMeltValue;
    } else if (simulateMode == "AggregateMelt") {
      Constructor = FixedDegreeFunc;
      calcFunc = getAggregationMeltValue;
    } else if (simulateMode == "BatchCrystal") {
      Constructor = FixedDegreeFunc;
      calcFunc = getBatchCrystalValue;
    } else if (simulateMode == "RayleighCrystal") {
      Constructor = FixedDegreeFunc;
      calcFunc = getRayleighCrystalValue;
    } else if (simulateMode == "RayleighRemelting") {
      Constructor = FixedDegreeFunc;
      calcFunc = getRayleighRemeltingValue;
    } else if (simulateMode == "FracRemeltWithMajor") {
      Constructor = VariableDegreeFunc;
      calcFunc = getRayleighCrystallizationMajor;
    } else {
      alert("Bad melting mode parameter");
      return;
    };

    var plotObjFunc = Constructor(endMember, x, y, ratioArray, csvDObj, calcFunc);


    /* パス用配列を作る補助関数 */
    var line = d3.svg.line()
      .x(function (d) {
        return axis.xScale(d.x) + offset.x + padding.left;
      })
      .y(function (d) {
        return axis.yScale(d.y) + padding.top;
      })
      .defined(function (d) {
        return !isNaN(d.x) && !isNaN(d.y)
      });

    /* 溶融曲線をプロット */
    var simulatePath = svg.selectAll("path.melting").data(plotObjFunc.getPlotPaths());
    simulatePath.exit().remove();
    simulatePath.enter().append("path");
    simulatePath.transition().attr("fill", "none")
      .attr("class", "melting")
      .attr("d", function (d) { return line(d) })
      .attr("stroke-width", 1);

    /* 溶融結果を示す点をプロット */
    var simulateCircle = svg.selectAll("circle.melting").data(plotObjFunc.getPlotPoints());
    simulateCircle.enter().append("circle");
    simulateCircle.exit().remove();
    simulateCircle.attr("class", "melting")
      .attr("r", 2)
      .attr("opacity", 1)
      .transition()
      .attr("cx", function (d) {
        if (isNaN(d.x) == false && isNaN(d.y) == false) { return axis.xScale(d.x) + offset.x + padding.left; }
      })
      .attr("cy", function (d) {
        if (isNaN(d.y) == false && isNaN(d.x) == false) { return axis.yScale(d.y) + padding.buttom; }
      });

    simulateCircle.on("mouseover", function (d) {
      return tooltipHarker.style("visibility", "visible")
        .text(d.label);
    });

    simulateCircle.on("mousemove", function (d) {
      return tooltipHarker.style("top", (event.pageY - 20) + "px").style("left", (event.pageX + 10) + "px");
    });

    simulateCircle.on("mouseout", function (d) {
      return tooltipHarker.style("visibility", "hidden");
    });
  };

  /* Abundanceオブジェクトのコンストラクタ */
  fumiposAPI.Abundance = function (svgDivName, formDOM, parentArray) {
    this.parent = parentArray;
    this.svg = {};
    this.svg.divName = svgDivName;
    this.boxPropaty = {
      padding: { left: 15, right: 15, top: 15, buttom: 15 },
      offset: { x: 60, y: 60 }
    };
    this.formObj = this.readForm(formDOM);
    this.svg.DOM = d3.select("body").select(svgDivName);
    this.svg.size = { width: parseInt(this.formObj.imageSize), height: parseInt(this.formObj.imageSize * this.formObj.aspectRatio) };
    this.axis = {};
    this.initialize();
    this.normList = [];
  }

  /* formObj updator */
  fumiposAPI.Abundance.prototype.catchFormUpdate = function (formDOM) {
    this.formObj = this.readForm(formDOM);
  };

  /* Initializer */
  fumiposAPI.Abundance.prototype.initialize = function () {
    // svg 領域のサイズ, オフセット, パディングを設定
    svgDivName = this.svg.divName;
    formObj = this.formObj;

    var offset = this.boxPropaty.offset;
    var padding = this.boxPropaty.padding;
    var svg = this.svg;

    // Set title
    svg.DOM.append("h1")
      .attr("class", "abundance")
      .text("Abundance graph");

    svg.DOM.append("svg")
      .attr("width", svg.size.width)
      .attr("height", svg.size.height);
    svg.DOM = svg.DOM.select("svg");

    // 軸の長さを設定
    var axis = this.axis;
    axis.width = svg.size.width - offset.x - padding.left - padding.right;
    axis.height = svg.size.height - offset.y - padding.top - padding.buttom;

    //	y軸を登録
    svg.DOM.append("g").transition()
      .attr("class", "y axis")
      .attr("transform", "translate(" + (offset.x + padding.left) + "," + (svg.size.height - axis.height - offset.y - padding.buttom) + ")");
    // y軸ラベルを登録
    svg.DOM.select(".y.axis")
      .append("text").transition()
      .attr("class", "ylabel")
      .attr("transform", "rotate (-90," + -offset.x + "," + axis.height * 0.5 + ")")
      .attr("x", -offset.x)
      .attr("y", axis.height * 0.5)

    // x軸を登録
    svg.DOM.append("g").transition()
      .attr("class", "x axis")
      .attr("transform", "translate(" + (offset.x + padding.left) + "," + (svg.size.height - offset.y - padding.left) + ")");
    // x軸ラベルを登録
    svg.DOM.select(".x.axis")
      .append("text").transition()
      .attr("class", "xlabel")
      .attr("x", axis.width * 0.5)
      .attr("y", offset.y)
  };

  /* Form reader */
  fumiposAPI.Abundance.prototype.readForm = function (formDOM) {
    var formObj = new Object();
    formObj = {
      aspectRatio: formDOM.aspect.value,
      imageSize: parseInt(document.getElementById("graph_area").clientWidth * formDOM.imageSize.value),
      elementList: formDOM.eleName.value.split(" "),
      normInfo: formDOM.reserver.value.split(","),
      extent: {
        y: [parseFloat(formDOM.y_min.value), parseFloat(formDOM.y_max.value)]
      }
    };
    return formObj;
  };

  /* set Normalizing refference List */
  fumiposAPI.Abundance.prototype.setNormList = function (csvRefObj) {
    var normList = new Array();
    var normInfo = this.formObj.normInfo;
    for (attrKey in csvRefObj) {
      if (csvRefObj[attrKey].value["name"] == normInfo[0] && csvRefObj[attrKey].value["study"] == normInfo[1]) {
        normList.push({ "key": 0, "value": csvRefObj[attrKey].value });
      }
    };
    this.normList = normList;
  };

  /* get normalized dataset */
  fumiposAPI.Abundance.prototype.getNormalizedList = function (csvObj) {
    var newList = new Array();
    var norm = new Array();
    var elementList = this.formObj.elementList;
    var normList = this.normList;

    for (attrKey in csvObj) {
      norm.push({ "key": attrKey, "value": Object() })
      // ノーマライズした値を追加
      for (var element in elementList) {
        norm[attrKey].value[elementList[element]] = +csvObj[attrKey].value[elementList[element]] / +normList[0].value[elementList[element]];
      }


      newList.push({ "key": attrKey, "value": csvObj[attrKey].value, "norm": norm[attrKey].value });

    }
    return newList;
  };

  /* Update framework */
  fumiposAPI.Abundance.prototype.updateFramework = function () {
    var svg = this.svg;
    var formObj = this.formObj;
    var extent = formObj.extent;

    // グラフタイトル	
    var head1 = d3.select(svg.divName).select("h1")
    head1.text("Normalized by " + formObj.normInfo[0] + " of " + formObj.normInfo[1]);

    // イメージサイズの変換
    svg.size = { width: parseInt(formObj.imageSize), height: parseInt(formObj.imageSize * formObj.aspectRatio) };

    var offset = this.boxPropaty.offset;
    var padding = this.boxPropaty.padding;

    svg.DOM.attr("width", svg.size.width)
      .attr("height", svg.size.height);

    var axis = this.axis;
    axis.width = svg.size.width - offset.x - padding.left - padding.right;
    axis.height = svg.size.height - offset.y - padding.top - padding.buttom;

    svg.DOM.select("g.y.axis")
      .attr("transform", "translate(" + (offset.x + padding.left) + "," + (svg.size.height - axis.height - offset.y - padding.buttom) + ")");

    svg.DOM.select("g.x.axis")
      .attr("transform", "translate(" + (offset.x + padding.left) + "," + (svg.size.height - offset.y - padding.buttom) + ")");

    //>> 軸の設定
    // y軸はlogスケール
    axis.xScale = d3.scale.ordinal()
      .domain(formObj.elementList)
      .rangePoints([0, axis.width], 1.0);

    axis.yScale = d3.scale.log()
      .domain(extent.y)
      .range([axis.height, 0]);

    axis.x = d3.svg.axis()
      .scale(axis.xScale)
      .ticks(5)
      .orient("bottom")
      .tickSize(6, -svg.size.height);

    axis.y = d3.svg.axis()
      .ticks(10, 0)
      .scale(axis.yScale)
      .orient("left")
      .tickSize(6, -svg.size.width);

    // 軸の書き換え
    svg.DOM.select(".y.axis").transition().call(axis.y);
    svg.DOM.select(".x.axis").transition().call(axis.x);

    svg.DOM.select(".y.axis").select("path").transition()
      .attr("d", "M" + axis.width + ",0H0V" + axis.height + "H" + axis.width);

    svg.DOM.select(".x.axis").select("path").transition()
      .attr("d", "M0,-" + axis.height + "V0H" + axis.width + "V-" + axis.height);
  };

  /* Replot flow */
  fumiposAPI.Abundance.prototype.replot = function (csvObj, csvRefObj, formDOM, csvDObj) {
    this.catchFormUpdate(formDOM);
    this.setNormList(csvRefObj);
    var dataList = this.getNormalizedList(csvObj);
    this.updateFramework();
    this.plotLine(dataList);
  };

  /* plot main data */
  fumiposAPI.Abundance.prototype.plotLine = function (dataList) {
    var parentAbundance = this;
    var svg = this.svg;

    //ツールチップのDOMを登録
    var tooltipAbundance = d3.select("body").select("#tooltip");

    var formObj = this.formObj;
    var elementList = formObj.elementList;
    var axis = this.axis;
    var offset = this.boxPropaty.offset;
    var padding = this.boxPropaty.padding;

    var normList = this.normList;

    var styleClass = document.getElementById("legendKey").value;


    //>> シンボルに関する変数
    var baseOpacity = document.symbolForm.baseOpacity.value,
      onOpacity = document.symbolForm.onOpacity.value,
      outOpacity = document.symbolForm.outOpacity.value;

    var baseRadius = document.symbolForm.baseRadius.value,
      onRadius = document.symbolForm.onRadius.value,
      outRadius = document.symbolForm.outRadius.value,
      strongRadius = 8;

    var baseWidth = document.symbolForm.baseWidth.value,
      onWidth = document.symbolForm.onWidth.value,
      outWidth = document.symbolForm.outWidth.value,
      strongWidth = 4;

    //>> プロット点の作成と書き換え(マウスオーバー時の挙動も定義)
    var line = d3.svg.line()
      .x(function (d, i) {
        return axis.xScale(d.x) + offset.x + padding.left;
      })
      .y(function (d, j) {
        return axis.yScale(d.y) + padding.top;
      })
      .defined(function (d) {
        return !isNaN(d.y) && d.y != 0;
      });

    function getLineObj(d) {
      var tmpArray = new Array();
      var k = 0;
      var n = elementList.length;
      for (var j = 0; j < n; j++) {
        //if (isNaN(d[elementList[j]]) == false){
        tmpArray[k] = new Object();
        tmpArray[k]["x"] = elementList[j];
        tmpArray[k]["y"] = d[elementList[j]];
        k++;
        //}
      }
      //console.log(tmpArray)
      if (tmpArray.length > 0) return tmpArray;
    };


    /**/
    path = svg.DOM.selectAll("path.abundance").data(dataList);
    path.exit().remove();
    path.enter().append("path");
    path.attr("name", function (d) { return d.value["name"]; })
      .attr("fill", "none")
      .attr("class", function (d) { return "abundance D" + d.value["ID"] + " " + d.value[styleClass] + " " + d.value["study"] })
      .attr("d", function (d) { return line(getLineObj(d.norm)); })
      .attr("stroke-width", baseWidth);

    dataList.map((r, i) => {
      let circle = svg.DOM.selectAll("circle.path.D" + r.value.ID).data(elementList);
      circle.exit().remove();
      circle.enter().append("circle");
      circle.attr("cx", function (d) { return axis.xScale(d) + offset.x + padding.left; })
        .attr("cy", function (d) {
          return (isNaN(axis.yScale(r.norm[d]))) ? -10 : axis.yScale(r.norm[d]) + padding.top
        })
        .attr("class", function (d) { return "path D" + r.value.ID + " " + r.value[styleClass] })
        .attr("r", 2);
    })


    //>> マウスイベントリスナを登録
    path.on("mouseover", function (d) {
      d3.selectAll('path.abundance')
        .each(function (d) {
          if (d3.select(this).attr("stroke-width") != strongWidth) {
            d3.select(this)
              .attr("stroke-width", outWidth);
          }
        })

      var selectedClass = d3.select(this).attr("class");
      var selectedClassArray = selectedClass.split(" ");

      if (d3.select(this).attr("stroke-width") != strongWidth) {
        d3.selectAll("path.abundance." + selectedClassArray[1])
          .attr("stroke-width", onWidth);
      }

      var harker = d3.selectAll("circle.Binary")
      if (harker[0].length > 0) {
        harker.transition()
          .each(function (d) {
            if (d3.select(this).attr("r") != strongRadius) {
              d3.select(this)
                .attr("opacity", outOpacity)
                .attr('r', outRadius);
            }
          })

        var harkerThis = d3.selectAll("circle.Binary." + selectedClassArray[1]);
        if (harkerThis[0].length > 0) {
          if (harkerThis.attr("r") != strongRadius) {
            d3.selectAll("circle.Binary." + selectedClassArray[1])
              .attr("opacity", onOpacity)
              .attr("r", onRadius);
          }
        }
      }
      d3.selectAll("circle.path")
        .attr("r", 0);
      return tooltipAbundance.style("visibility", "visible")
        .text(d.value["name"] + "   " + d.value["location"]);
    })

      .on("mousemove", function (d) {
        return tooltipAbundance.style("top", (event.pageY - 20) + "px").style("left", (event.pageX + 10) + "px");
      })

      .on("mouseout", function (d) {
        d3.selectAll('path.abundance')
          .transition()
          .each(function (d) {
            if (d3.select(this).attr("stroke-width") != strongWidth) {
              d3.select(this).attr("stroke-width", baseWidth);
            }
          })

        d3.selectAll("circle.Binary")
          .transition()
          .each(function (d) {
            if (d3.select(this).attr("r") != strongRadius) {
              d3.select(this)
                .attr("r", function (d) {
                  if (d.value["study"] == "mine") {
                    return baseRadius * 1.5;
                  } else {
                    return baseRadius;
                  }
                })
                .attr("opacity", baseOpacity);
            }
          })

        d3.selectAll("circle.path")
          .attr("r", 2);

        return tooltipAbundance.style("visibility", "hidden");
      })

      .on("click", function (d) {

        if (d3.select(this).attr("stroke-width") != strongWidth) {
          d3.select(this)
            .transition()
            .attr("stroke-width", strongWidth);
        } else {
          d3.select(this)
            .transition()
            .attr("stroke-width", onWidth);
        }
        var selectClass = d3.select(this).attr("class");
        var selectClassArray = selectClass.split(" ");
        var harker = d3.selectAll("circle.Binary")
        if (harker[0].length > 0) {
          var harkerThis = d3.selectAll("circle.Binary." + selectClassArray[1]);
          if (harkerThis[0].length > 0) {
            if (harkerThis.attr("r") != strongRadius) {
              harkerThis.transition()
                .attr("r", strongRadius);
            } else {
              harkerThis.transition()
                .attr("r", onRadius);
            }
          }
        }
      })

  };

  fumiposAPI.Abundance.prototype.plotMixture = function (endMember) {

  };

  fumiposAPI.Abundance.prototype.plotSimulatedMelt = function (endMember, csvObj) {

  };

  fumiposAPI.Abundance.prototype.setPartitioningObj = function (obj) {
    this.csvDObj = obj;
  }


  /** Map */
  fumiposAPI.Map = function (svgDivName, formDOM, parentArray) {
    this.mapDOM = $();
    this.parent = parentArray;
    this.svg = {};
    this.formObj = this.readForm(formDOM);
    this.svg.DOM = d3.select("body").select(svgDivName);
    this.svg.size = { width: parseInt(this.formObj.imageSize), height: parseInt(this.formObj.imageSize * this.formObj.aspectRatio) };
    this.axis = {};

    this.molarValue = {
      SiO2: 60.06,
      TiO2: 79.90,
      Al2O3: 101.94,
      FeO: 71.84,
      MgO: 40.32,
      Fe2O3: 159.69,
      CaO: 56.08,
      Na2O: 61.99,
      K2O: 94.20,
      P2O5: 141.94,
    };

    this.initialize();
  }

  fumiposAPI.Map.prototype = Object.create(fumiposAPI.Binary.prototype, {
    constructor: {
      value: fumiposAPI.Map,
      enumerable: false
    }
  })

  fumiposAPI.Map.prototype.initialize = function () {
    let map = new google.maps.Map(this.mapDOM, {
      zoom: 7,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: new google.maps.LatLng(
        33.855050,
        133.522465
      ),
      scaleControl: true
    })
  }


  return fumiposAPI;
}))
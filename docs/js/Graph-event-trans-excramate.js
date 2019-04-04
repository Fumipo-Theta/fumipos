import { Graph } from "./GraphClass.js";

let clicked = false;  // for click events
let isOff = false; // for double click detction


export default class TransExcramate {
  static onMouseOver(
    _,
    plotStyle,
    { symbol }
  ) {
    return function (d) {
      const sameId = Graph.extractClass(d3.select(this).attr("class"), "id");
      const hovered = d3.selectAll("." + sameId)
        .each(d => {
          d.onState = (d.onState === "selected")
            ? "selected"
            : "on"
        })
        .classed("base", false)
        .classed("on", d => d.onState === "on")
      hovered.filter("circle")
        .attr("r", plotStyle.r)
        .attr("opacity", plotStyle.opacity);
      hovered.filter("path")
        .attr("stroke-width", plotStyle.strokeWidth)
        .attr("opacity", plotStyle.opacity);

      d3.selectAll("circle.base")
        .attr("opacity", symbol.outOpacity)
        .attr('r', symbol.outRadius);
      d3.selectAll("path.base")
        .attr("opacity", symbol.outOpacity)
        .attr('stroke-width', symbol.outWidth);
    }
  }

  static onMouseOut(_, plotStyle, { symbol }) {
    return function (d) {
      const self = d3.select(this);
      const sameId = Graph.extractClass(
        self.attr("class"),
        "id"
      );
      const hovered = d3.selectAll("." + sameId)
        .each(d => {
          d.onState = (d.onState === "selected")
            ? "selected"
            : "base"
        })
        .classed("on", false)
        .classed("base", d => d.onState === "base");

      d3.selectAll("circle.base")
        .attr("opacity", (isOff) ? symbol.outOpacity : plotStyle.opacity)
        .attr('r', (isOff) ? symbol.outRadius : plotStyle.r);
      d3.selectAll("path.base")
        .attr("opacity", (isOff) ? symbol.outOpacity : plotStyle.opacity)
        .attr('stroke-width', (isOff) ? symbol.outWidth : plotStyle.strokeWidth);
    }
  }

  static onClick(_, plotStyle, { symbol }) {
    return function (d) {
      const self = d3.select(this);
      const sameId = Graph.extractClass(
        self.attr("class"),
        "id"
      );
      const selected = d3.selectAll("." + sameId)
      if (self.classed("selected")) {
        d.onState = "base";
        selected
          .classed("selected", false)
          .classed("base", true)
      } else {
        d.onState = "selected";
        selected
          .classed("selected", true)
          .classed("base", false)
      }
      selected.filter("circle")
        .attr("opacity", plotStyle.opacity)
        .attr("r", plotStyle.r);
      selected.filter("path")
        .attr("opacity", plotStyle.opacity)
        .attr("stroke-width", plotStyle.strokeWidth)
    }
  }

  static globalClick(merged, plotStyle) {
    return function (d) {
      if (clicked) {
        TransExcramate.globalDoubleClick(merged, plotStyle)
        clicked = false;
        isOff = !isOff;
        return
      }
      clicked = true;

      // シングルタップ判定
      setTimeout(function () {
        if (clicked) {

        }
        clicked = false;
      }, 300);
    }
  }

  static globalDoubleClick(merged, plotStyle) {
    merged.each(d => {
      d.onState = "base"
    })
    d3.selectAll(".plotArea circle")
      .classed("selected", false)
      .classed("base", true)
      .attr("r", plotStyle.r)
      .attr("opacity", plotStyle.opacity)
    d3.selectAll(".plotArea path")
      .classed("selected", false)
      .classed("base", true)
      .attr("stroke-width", plotStyle.strokeWidth)
      .attr("opacity", plotStyle.opacity)
  }

  static selectByBrush(g_plot_d3) {
    g_plot_d3.call(
      d3.brush()
        .on("end", d => {
          g_plot_d3.selectAll("circle")
            .each(function (d) {
              if (!d3.event.selection) return
              const self = d3.select(this);
              const cx = self.attr("cx")
              const cy = self.attr("cy")
              const [start, end] = d3.event.selection;
              if ((start[0] <= cx && cx <= end[0])
                && (start[1] <= cy && cy <= end[1])) {
                self.attr("opacity", 1)
              } else {
                self.attr("opacity", 0.1)
              }
            })

        })
    )
  }

  static updateExtentByBrush(g_plot_d3, callback) {
    g_plot_d3.call(
      d3.brush()
        .on("start", function () {
          d3.event
          g_plot_d3.selectAll(".selection")
            .attr("display", "")
          g_plot_d3.selectAll(".handle")
            .attr("display", "")
        }, false)
        .on("end", function () {
          if (!d3.event.selection) return
          callback.end(d3.event);
          g_plot_d3.selectAll(".selection")
            .attr("display", "none")
          g_plot_d3.selectAll(".handle")
            .attr("display", "none")
          d3.event.selection = null;
        }, false)
    ).selectAll(".overlay") // これ以降を記述すると, brushイベントとcircleのクリックイベントが両立する
      .each(d => d.type === "selection")
      .on("mousedown", d => d)
  }
}
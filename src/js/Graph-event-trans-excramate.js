import { Graph } from "./GraphClass.js";

let clicked = false;
let isOff = false;

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
}
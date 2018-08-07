export const btnName = "nav_save";

export const style = `
a.nav_save::before{
  content:url(../public/image/ic_file_download_24px.svg);
  position: relative;
  
}

a.nav_save:hover::before,
a.nav_save:focus::before{
  transition: all .3s;
  content:url(../public/image/ic_file_download_24px_hover.svg);
}
`

export function click(graph, setting, __) {
  const svg = d3.select(graph).select("svg")
  const style = ["#graphStyle", "legendStyle"]
    .map(id => {
      try {
        return document.querySelector(id).innerHTML
      } catch (e) {
        return "";
      }
    })
    .reduce((a, b) => a + b, "");
  svg.insert("style", "g")
    .attr("type", "text/css")
    .text(style);
  const svgDOM = svg._groups[0][0];

  const canvas = document.createElement("canvas");
  canvas.width = svgDOM.width.baseVal.value;
  canvas.height = svgDOM.height.baseVal.value;
  const svgData = new XMLSerializer().serializeToString(svgDOM);

  const ctx = canvas.getContext("2d");
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.fill();

  const image = new Image;
  image.onload = function () {
    ctx.drawImage(image, 0, 0);
    // Optional: 自動でダウンロードさせる場合
    try {
      var xName = d3.select(graph).select("text.xlabel").text();
    } catch (e) {
      var xName = "x";
    }

    try {
      var yName = d3.select(graph).select("text.ylabel").text();
    } catch (e) {
      var yName = "y";
    }

    xName = xName.replace(/\//g, "_")
      .replace(/#/g, "N")
      .replace(/[\s\:\*\"\'\<\>\?\|\\]/g, ""); //"
    yName = yName.replace(/\//g, "_")
      .replace(/#/g, "N")
      .replace(/[\s\:\*\"\'\<\>\?\|\\]/g, ""); //"

    d3.select("body").append("a")
      .attr("id", "image-file")
      .attr("class", "hidden")
      .attr("type", "application/octet-stream")
      .attr("href", canvas.toDataURL("image/png"))
      .attr("download", xName + "-vs-" + yName + ".png")
      .text("Download as Image")

    $("#image-file")[0].click();

    $("canvas").remove();
    $("#image-file").remove();

    svg.selectAll("style").remove();
  }

  image.src = "data:image/svg+xml;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(svgData)));

}
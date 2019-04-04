export const btnName = "nav_setting";

export const style = `
a.nav_setting::before{
  content:url(../public/image/ic_settings_black_24px.svg);
  position: relative;
  stroke : #eeeeee;
}

a.nav_setting:hover::before,
a.nav_setting:focus::before{
  transition: all .3s;
  content:url(../public/image/ic_settings_black_24px_hover.svg);
}
`

export function click(graph, setting, overlay) {
  //return ev => {
  $(".graph.active").removeClass("active");
  $(graph).addClass("active");
  $(overlay).fadeIn();
  $(setting).fadeIn();
  $(`${setting} input`)[0].focus();
  //}
}
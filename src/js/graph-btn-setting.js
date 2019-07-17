import publisher from "./pub-sub"
import { activate } from "./usecases/toggle_active_state";
export const btnName = "nav_setting";

export const style = `
a.nav_setting::before{
  content:url(../image/ic_settings_black_24px.svg);
  position: relative;
  stroke : #eeeeee;
}

a.nav_setting:hover::before,
a.nav_setting:focus::before{
  transition: all .3s;
  content:url(../image/ic_settings_black_24px_hover.svg);
}
`

export function click(graph, setting) {
    activate(document.querySelector(graph))
    publisher.publish({ type: "show-overlay" })
    activate(document.querySelector(setting))
    $(`${setting} input`)[0].focus();
}

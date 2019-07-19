export const btnName = "nav_refresh";

export const style = `
a.${btnName}::before{
  content:url(./image/sync-alt-solid.svg);
  position: relative;
}

a.${btnName}:hover::before,
a.${btnName}:focus::before{
  transition: all .3s;
  content:url(./image/sync-alt-solid_hover.svg);
}
`

export function click(graph, setting, _, id, GraphManager) {
    GraphManager.update(id);
}

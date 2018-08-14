export const btnName = "nav_refresh";

export const style = `
a.${btnName}::before{
  content:"Re";
  position: relative;
}

a.${btnName}:hover::before,
a.${btnName}:focus::before{
  transition: all .3s;
  content:"Re";
}
`

export function click(graph, setting, _, id, GraphManager) {
  GraphManager.update(id);
}
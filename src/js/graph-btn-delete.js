export const btnName = "nav_delete";

export const style = `
a.nav_delete::before{
  content:url(../public/image/ic_delete_sweep_black_24px.svg);
  position: relative;
  
}

a.nav_delete:hover::before,
a.nav_delete:focus::before{
  transition: all .3s;
  content:url(../public/image/ic_delete_sweep_black_24px_hover.svg);
}
`

export function click(graph, setting, _, id, GraphManager) {
  $(graph).remove();
  $(setting).remove();
  GraphManager.removeGraph(id);
}
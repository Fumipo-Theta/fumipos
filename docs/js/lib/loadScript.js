(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.loadScript = factory();
  }
}(this, function () {
  const loadScript = (obj, opt = {
    defer: true,
    async: false
  }) => {
    const elem = Object.assign(document.createElement("script"), obj, opt)
    document.head.append(elem)
  }

  return loadScript;
}))
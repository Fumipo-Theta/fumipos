(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.GraphAppender = factory();
  }
}(this, function () {
  class GraphAppender {
    costructor(graphAreaId, graphMenuContentsId, overlayId, eventEmitter, uiState) {
      this.emitter = eventEmitter;
      this.uiState = uiState;
      this.totalGraphCounter = 0;
      this.eachGraphCounter = {};
      this.eachGraphMenu = ["save", "setting", "delete"];
    }

    register(...GraphClass) {
      GraphClass.forEach(G => {

      })
    }
  };

  return GraphAppender;
}))
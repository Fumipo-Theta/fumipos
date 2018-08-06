
export default class GraphClass {
  constructor() {
    this.graphCount = 0;
    this.label = "";
    this.type = "";
  }

  incrementCounter() {
    this.graphCount++;
  }

  getCount() {
    return this.graphCount;
  }

  buttonLabel() {
    return this.label;
  }

  graphType() {
    return this.type;
  }

  getTemplate(uiState) {
    return this.template(uiState);
  }

  getStyle() {
    return this.style();
  }

  appendGraph() {

  }

  deleteGraph() {

  }

  updateGraph() {

  }
};


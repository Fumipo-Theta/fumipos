
export default class GraphClass {
  constructor() {
    this.graphCount = 0;
    this.label = "";
    this.type = "";
  }

  incrementCounter() {
    this.graphCount++;
  }

  buttonLabel() {
    return this.label;
  }

  graphType() {
    return this.type;
  }

  genTemplate(uiState) {
    return this.template(uiState);
  }

  appendGraph() {

  }

  deleteGraph() {

  }

  updateGraph() {

  }
};


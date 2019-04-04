export default class UIUpdater {
  constructor(option) {
    this.action = {
      replot: [],
      afterReplot: []
    }
  }

  registerAction(array) {
    ((Array.isArray(array))
      ? array
      : [array])
      .forEach(({ type, action }) => {
        if (!this.action.hasOwnProperty(type)) throw new Error()
        if (this.action[type].indexOf(action) >= 0) throw new Error();
        this.action[type].push(action);
      })
  }

  replot() {
    this.action.replot.forEach(action => {
      action();
    })
  }

  afterReplot() {
    this.action.afterReplot.forEach(action => {
      action();
    })
  }
}
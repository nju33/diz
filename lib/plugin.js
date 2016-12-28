import stringFormat from 'string-template';

export default class Plugin {
  setData(dir) {
    this.dir = Object.assign({}, dir);
  }

  getTitle(props) {
    if (typeof this.titleTemplate === 'function') {
      return stringFormat(this.titleTemplate(props), props);
    }
    return stringFormat(this.titleTemplate, props);
  }

  getDescription(props) {
    if (typeof this.descriptionTemplate === 'function') {
      return stringFormat(this.descriptionTemplate(props), props);
    }
    return stringFormat(this.descriptionTemplate, props);
  }

  renderContents(props) {
    return Object.assign({}, this.baseProps, props);
  }
}

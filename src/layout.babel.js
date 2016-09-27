import _ from 'lodash';

export default {
  root(component) {
    return `
      ${component.sidebar}
      ${component.contents}
    `;
  },
  head(component) {
    return `
      ${component.meta}
      <link rel="stylesheet" href="/styles/index.css">
      ${component.title}
      ${component.ogp}
      ${component.twittercard}
    `;
  },
  bodyHead() {
    return ``;
  },
  bodyLoopHead() {
    return ``;
  },
  bodySingleHead() {
    return ``;
  },
  bodyFoot() {
    return ``;
  },
  bodyLoopFoot() {
    return ``;
  },
  bodySingleFoot() {
    return ``;
  },
  sidebarHead(component) {
    return `${component.headline}`;
  },
  sidebarFoot(component) {
    const sidebar = _.reduce(component, (result, _component) => {
      result += `${_component({})} `;
      return result;
    }, '');
    return sidebar;
  },
  loopHeader(component) {
    const sidebar = _.reduce(component, (result, _component) => {
      if (_.isFunction(_component)) {
        result += `${_component({})} `;
      } else {
        result += _component;
      }
      return result;
    }, '');
    return sidebar;
  },
  singleHeader(component) {
    const sidebar = _.reduce(component, (result, _component) => {
      if (_.isFunction(_component)) {
        result += `${_component({})} `;
      } else {
        result += _component;
      }
      return result;
    }, '');
    return sidebar;
  },
  singleFooter(component) {
    return ``;
  },
};

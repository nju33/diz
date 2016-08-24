'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const templates = {
  sidebar: _fs2.default.readFileSync('./src/templates/sidebar.html', 'utf-8'),
  main: _fs2.default.readFileSync('./src/templates/main.html', 'utf-8'),
  single: _fs2.default.readFileSync('./src/templates/single.html', 'utf-8'),
  entryloop: _fs2.default.readFileSync('./src/templates/entryloop.html', 'utf-8'),
  categoryloop: _fs2.default.readFileSync('./src/templates/categoryloop.html', 'utf-8'),
  tagloop: _fs2.default.readFileSync('./src/templates/tagloop.html', 'utf-8')
};

exports.default = {
  top: (() => {
    _lodash2.default.templateSettings.interpolate = /<<([\s\S]+?)>>/g;
    let template = _fs2.default.readFileSync('./src/templates/home.html', 'utf-8');
    try {
      while (/<<.+?>>/.test(template)) {
        template = _lodash2.default.template(template)(templates);
      }
    } catch (err) {
      console.log(err);
    }
    _lodash2.default.templateSettings.interpolate = /<%=([\s\S]+?)%>/g;
    return template;
  })(),
  entry: (() => {
    _lodash2.default.templateSettings.interpolate = /<<([\s\S]+?)>>/g;
    let template = _fs2.default.readFileSync('./src/templates/entry.html', 'utf-8');
    try {
      while (/<<.+?>>/.test(template)) {
        template = _lodash2.default.template(template)(templates);
      }
    } catch (err) {
      console.log(err);
    }
    _lodash2.default.templateSettings.interpolate = /<%=([\s\S]+?)%>/g;
    return template;
  })()
};
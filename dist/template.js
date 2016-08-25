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
  sidebar: readPartial('sidebar'),
  main: readPartial('main'),
  single: readPartial('single'),
  entryloop: readPartial('entryloop'),
  categoryloop: readPartial('categoryloop'),
  tagloop: readPartial('tagloop')
};

exports.default = {
  top: (() => {
    _lodash2.default.templateSettings.interpolate = /<<([\s\S]+?)>>/g;
    let template = readTemplate('home');
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
    let template = readTemplate('entry');
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


function readPartial(filename) {
  const partialDir = '../templates/partials';
  const filepath = require('path').resolve(__dirname, partialDir, `${ filename }.html`);
  return require('fs').readFileSync(filepath, 'utf-8');
}

function readTemplate(filename) {
  const partialDir = '../templates';
  const filepath = require('path').resolve(__dirname, partialDir, `${ filename }.html`);
  return require('fs').readFileSync(filepath, 'utf-8');
}
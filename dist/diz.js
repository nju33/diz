'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _grayMatter = require('gray-matter');

var _grayMatter2 = _interopRequireDefault(_grayMatter);

var _localConfig = require('./local-config');

var _localConfig2 = _interopRequireDefault(_localConfig);

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

var _template = require('./template');

var _template2 = _interopRequireDefault(_template);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = diz;

diz({
  wd: _path2.default.resolve(process.cwd(), 'test')
});

function diz(opts) {
  const defaultOpts = {
    wd: process.cwd()
  };
  opts = (0, _extends3.default)({}, defaultOpts, opts);

  const entries = {};
  const filepaths = getEntryFiles(opts.wd);

  for (const filepath of filepaths) {
    const entryName = _path2.default.dirname(filepath).match(/[^/]+$/);
    entries[entryName] = _grayMatter2.default.read(filepath);
    entries[entryName].content = (0, _marked2.default)(entries[entryName].content);
  }

  _lodash2.default.templateSettings.evaluate = /;;(.+)(?:;;)?\n/g;
  _lodash2.default.templateSettings.interpolate = /\${([\s\S]+?)}/g;
  try {
    const top = _lodash2.default.template(_template2.default.top)({ entries });
    console.log(top);
    _lodash2.default.forEach(entries, entry => {
      const en = _lodash2.default.template(_template2.default.entry)({ entry });
      console.log(en);
    });
    // for (const entry of entries) {
    // }
  } catch (err) {
    console.log(err);
  }
}

function getEntryFiles(wd) {
  return _glob2.default.sync(_path2.default.resolve(wd, '**/entry.md'));
}

// console.log(_.templateSettings);
// debugger;
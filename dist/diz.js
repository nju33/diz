'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _vinyl = require('vinyl');

var _vinyl2 = _interopRequireDefault(_vinyl);

var _eventStream = require('event-stream');

var _eventStream2 = _interopRequireDefault(_eventStream);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _grayMatter = require('gray-matter');

var _grayMatter2 = _interopRequireDefault(_grayMatter);

var _localConfig = require('./local-config');

var _localConfig2 = _interopRequireDefault(_localConfig);

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

var _template = require('./template');

var _template2 = _interopRequireDefault(_template);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const pages = [];

exports.default = diz;

diz({
  wd: _path2.default.resolve(process.cwd(), 'test')
});

function diz(opts) {
  const defaultOpts = {
    wd: process.cwd()
  };
  opts = (0, _extends3.default)({}, defaultOpts, opts);

  const config = _localConfig2.default.get(opts.wd);

  const entries = {};
  const categories = {};
  const tags = {};
  const archives = {};
  const filepaths = getEntryFiles(opts.wd);

  for (const filepath of filepaths) {
    const entryName = _path2.default.dirname(filepath).match(/[^/]+$/);
    const matter = _grayMatter2.default.read(filepath);
    matter.content = (0, _marked2.default)(matter.content);
    entries[entryName] = matter;

    if (matter.data.category) {
      if (!categories[matter.data.category]) {
        categories[matter.data.category] = [];
      }
      categories[matter.data.category].push(matter);
    }

    if (matter.data.tags && matter.data.tags.length > 0) {
      for (const tag of matter.data.tags) {
        if (!tags[tag]) {
          tags[tag] = [];
        }
        tags[tag].push(matter);
      }
    }

    if (matter.data.date) {
      const year = (0, _moment2.default)(matter.data.date).year();
      const month = (0, _moment2.default)(matter.data.date).month();
      if (!archives[year]) {
        archives[year] = [];
        archives[`_${ year }`] = {};
      }
      archives[year].push(matter);

      if (!archives[`_${ year }`][month]) {
        archives[`_${ year }`][month] = [];
      }
      archives[`_${ year }`][month].push(matter);
    }
  }

  _lodash2.default.templateSettings.evaluate = /;;(.+)(?:;;)?\n/g;
  _lodash2.default.templateSettings.interpolate = /\${([\s\S]+?)}/g;

  try {
    const topdata = (0, _extends3.default)({}, config, { entries, opts, type: 'home' });
    const top = _lodash2.default.template(_template2.default.top)(topdata);
    pages.push(new _vinyl2.default({
      cwd: process.cwd(),
      base: '_out',
      path: '_out/index.html',
      contents: new Buffer(top)
    }));
    console.log(top);
    _lodash2.default.forEach(entries, (entry, name) => {
      const entrydata = (0, _extends3.default)({}, config, { entry, opts, type: 'entry' });
      const en = _lodash2.default.template(_template2.default.entry)(entrydata);
      pages.push(new _vinyl2.default({
        cwd: process.cwd(),
        base: '.',
        path: `./entries/${ name }/index.html`,
        contents: new Buffer(en)
      }));
    });

    _lodash2.default.forEach(categories, (category, name) => {
      const categoryData = (0, _extends3.default)({}, config, { entries: category }, { opts, type: 'category' });
      const t = _lodash2.default.template(_template2.default.top)(categoryData);
      pages.push(new _vinyl2.default({
        cwd: process.cwd(),
        base: '.',
        path: `./categories/${ name }/index.html`,
        contents: new Buffer(t)
      }));
    });

    _lodash2.default.forEach(tags, (tag, name) => {
      const tagData = (0, _extends3.default)({}, config, { entries: tag }, { opts, type: 'tag' });
      const t = _lodash2.default.template(_template2.default.top)(tagData);
      pages.push(new _vinyl2.default({
        cwd: process.cwd(),
        base: '.',
        path: `./tags/${ name }/index.html`,
        contents: new Buffer(t)
      }));
    });

    _lodash2.default.forEach(archives, (archive, year) => {
      if (year.startsWith('_')) {
        _lodash2.default.forEach(archive, (childArchive, month) => {
          const archiveData = (0, _extends3.default)({}, config, { entries: childArchive }, { opts, type: 'archive' });
          const t = _lodash2.default.template(_template2.default.top)(archiveData);
          pages.push(new _vinyl2.default({
            cwd: process.cwd(),
            base: '.',
            path: `./archives/${ year.slice(1) }/${ month }/index.html`,
            contents: new Buffer(t)
          }));
        });
      } else {
        const archiveData = (0, _extends3.default)({}, config, { entries: archive }, { opts, type: 'archive' });
        const t = _lodash2.default.template(_template2.default.top)(archiveData);
        pages.push(new _vinyl2.default({
          cwd: process.cwd(),
          base: '.',
          path: `./archives/${ year }/index.html`,
          contents: new Buffer(t)
        }));
      }
    });
  } catch (err) {
    console.log(err);
  }

  _eventStream2.default.readArray(pages).pipe(require('gulp').dest('_out'));
}

function getEntryFiles(wd) {
  return _glob2.default.sync(_path2.default.resolve(wd, '**/entry.md'));
}
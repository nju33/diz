import fs from 'fs';
import path from 'path';
import File from 'vinyl';
import es from 'event-stream';
import _ from 'lodash';
import glob from 'glob';
import moment from 'moment';
import grayMatter from 'gray-matter';
import marked from 'marked';
import DizMatter from './diz-matter';
import localConfig from './local-config';
import template from './template';

let templates = {};
let first = false;
export default diz;
const defaultOpts = {
  compiler: marked,
  orderEntries(matters) { return matters; },
  orderCategories(matters) { return matters; },
  orderTags(matters) { return matters; },
  orderArchives(matters) { return matters; }
};

function diz(wd, opts) {
  opts = Object.assign({}, defaultOpts, opts);

  const workingDirname = path.basename(wd);
  const config = localConfig.get(wd);
  templates = template.generateTemplates(config.blocks);
  const message = getMessage(_.get(opts, 'site.lang') || en);
  const collectRelation = preRender(template, wd, config, opts, {message});
  const entries = [];
  const categories = {};
  const tags = {};
  const archives = {};
  const filepaths = getEntryFiles(wd);

  for (const filepath of filepaths) {
    const matter = new DizMatter(workingDirname, filepath, opts.compiler);
    entries.push(matter);

    if (!nil(matter.data.category)) {
      (c => {
        const cloned = cloneMatter(matter);
        categories[c] || _.set(categories, c, []);
        categories[c].push(cloned);
      })(matter.data.category);
    }

    if (!nil(matter.data.tags)) {
      if (typeof matter.data.tags === 'string') {
        matter.data.tags = [matter.data.tags];
      }
      for (const t of matter.data.tags) {
        const cloned = cloneMatter(matter);
        tags[t] || _.set(tags, t, []);
        tags[t].push(cloned);
      }
    }

    if (!nil(matter.data.date)) {
      (d => {
        const year = moment(d).year();
        const month = moment(d).month();

        archives[year] || (() => {
          const cloned = cloneMatter(matter);
          _.set(archives, year, []);
          archives[year].push(cloned);
          _.set(archives, `_${year}`, {});
        })();

        (key => {
          const cloned = cloneMatter(matter);
          _.get(archives, key) || _.set(archives, key, []);
          _.get(archives, key).push(cloned);
        })(`_${year}.${month}`);
      })(matter.data.date);
    }
  }

  let orderedEntries = entries;
  let orderedCategories = categories;
  let orderedTags = tags;
  if (typeof opts.orderEntries === 'function') {
    orderedEntries = opts.orderEntries(entries);
  }
  if (typeof opts.orderedCategories === 'function') {
    orderedCategories = opts.orderCategoreis(categories);
  }
  if (typeof opts.orderedTags === 'function') {
    orderedTags = opts.orderTags(tags);
  }

  template.changeContentGenerator();
  const renderCollection = collectRelation({
    entries: orderedEntries,
    categories: orderedCategories,
    tags: orderedTags
  });

  try {
    const files = []
      .concat(renderCollection('loop', 'home', orderedEntries))
      .concat(renderCollection('single', 'entry', orderedEntries))
      // Categories
      .concat((() => {
        let _files = [];
        _.forEach(orderedCategories, (categories, categoryName) => {
          _files = _files.concat(renderCollection(
            'loop', 'categoryHome', categories, {categoryName}))
        });
        return _files;
      })())
      // Tags
      .concat((() => {
        let _files = [];
        _.forEach(orderedTags, (tags, tagName) => {
          _files = _files.concat(renderCollection(
            'loop', 'tagHome', tags, {tagName}))
        });
        return _files;
      })())

    console.log(files);
    debugger;

    template.changeDefaultGenerator();
    return es.readArray(files);
  } catch (err) {
    console.log(err);
  }
}

function nil(value) {
  return typeof value === 'undefined' || value === null;
}

function cloneMatter(matter) {
  const cloned = Object.assign({}, matter);
  cloned.data = Object.assign({}, matter.data);
  return cloned;
}

function getEntryFiles(wd) {
  return glob.sync(path.resolve(wd, '**/entry.md'));
}

function createFile(wd, data) {
  const defaults = {
    cwd: wd,
    base: '.'
  };

  return function(contents, pathData = {}) {
    const customData = Object.assign({}, defaults, data, {
      contents: new Buffer(contents)
    });
    debugger;
    customData.path = customData.path(pathData);
    return new File(customData);
  }
}

function preRender(template, wd, config, opts, message) {
  const matcher = {
    HOME: _.matches({label: 'home'}),
    ENTRY: _.matches({label: 'entry'}),
    'CATEGORY_HOME': _.matches({label: 'categoryHome'}),
    'TAG_HOME': _.matches({label: 'tagHome'}),
    'DATE_YEAR': _.matches({label: 'date-year'}),
    'DATE_MONTH': _.matches({label: 'date-year'})
  };

  const matchesFile = _.cond([
    [matcher.HOME, createFile.bind(null, wd, {
      path: _.template('index.html')
    })],
    [matcher.ENTRY, createFile.bind(null, wd, {
      path: _.template('entries/<%=entryName%>/index.html')
    })],
    [matcher.CATEGORY_HOME, createFile.bind(null, wd, {
      path: _.template('categories/<%=categoryName%>/index.html')
    })],
    [matcher.TAG_HOME, createFile.bind(null, wd, {
      path: _.template('tags/<%=tagName%>/index.html')
    })],
    // [matcher.DATE_YEAR, createFile.bind(null, wd, {
    //   path: _.template('archives/<%=year%>/index.html')
    // })],
    // [matcher.DATE_MONTH, createFile.bind(null, wd, {
    //   path: _.template('archives/<%=year%>/<%=month%>/index.html')
    // })]
  ]);

  return function collectRelation(relationData = {}) {
    return function renderCollection(type, label, matters, pathData = {}) {
      const files = [];

      if (type === 'loop') {
        const data = Object.assign({}, {
          relation: relationData,
          label
        }, config, opts, message, {matters})
        const contents = _.template(templates[label])(data);

        if (label === 'home') {
          files.push(matchesFile(data)(contents));
        } else {
          debugger;
          files.push(matchesFile(data)(contents, pathData));
        }
      } else if (type === 'single') {
        _.forEach(matters, matter => {
          const data = Object.assign({}, {
            relation: relationData,
            label
          }, config, opts, message, {matter})
          const contents = _.template(templates[label])(data);

          if (label === 'entry') {
            files.push(matchesFile(data)(contents, {
              entryName: matter.data.name
            }));
          }
        });
      }
      return files;
    }
  }
}

function getMessage(lang) {
  const dir = `${__dirname}/i18n`;
  let message = require(`${dir}/en/messages.json`);
  try {
    const _message = require(`${dir}/${lang}/messages.json`);
    message = Object.assign({}, message, _message);
    console.log(message);
  } catch (err) {
    console.log(err);
  }
  return message;
}

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

    if (!_.isNil(matter.data.category)) {
      const cloned = cloneMatter(matter);
      _.update(categories, matter.data.category, value => {
        return _.isUndefined(value) ? [cloned] : _.concat(value, [cloned]);
      });
    }

    if (!_.isNil(matter.data.tags)) {
      for (const tagName of _.flatten([matter.data.tags])) {
        const cloned = cloneMatter(matter);
        _.update(tags, tagName, value => {
          return _.isUndefined(value) ? [cloned] : _.concat(value, [cloned]);
        });
      }
    }

    if (!_.isNil(matter.data.date)) {
      (date => {
        const [year, month] = [date.year(), date.month()]
        archives[`${year}-${month}`] || (() => {
          const cloned = cloneMatter(matter);
          _.update(archives, `${year}-${month}`, value => {
            return _.isUndefined(value) ? [cloned] : _.concat(value, [cloned]);
          });
        })();
      })(moment(matter.data.date));
    }
  }

  let orderedEntries = entries;
  if (typeof opts.orderEntries === 'function') {
    orderedEntries = opts.orderEntries(entries);
  }

  let orderedCategories = categories;
  if (typeof opts.orderCategories === 'function') {
    orderedCategories = opts.orderCategories(categories);
  }

  let orderedTags = tags;
  if (typeof opts.orderTags === 'function') {
    orderedTags = opts.orderTags(tags);
  }

  let orderedArchives = archives;
  if (typeof opts.orderArchives === 'function') {
    orderedArchives = opts.orderArchives(archives);
  }

  template.changeContentGenerator();
  const renderCollection = collectRelation({
    entries: orderedEntries,
    categories: orderedCategories,
    tags: orderedTags,
    archives: orderedArchives
  });

  try {
    const files = []
      .concat(renderCollection('loop', 'home', orderedEntries))
      .concat(renderCollection('single', 'entry', orderedEntries))
      // Categories
      .concat((_categories => {
        return _.reduce(_categories, (files, categories, categoryName) => {
          return _.concat(files,
            renderCollection('loop', 'category', categories, {categoryName}));
        }, []);
      })(orderedCategories))
      // Tags
      .concat((_tags => {
        return _.reduce(_tags, (files, tags, tagName) => {
          return _.concat(files,
            renderCollection('loop', 'tag', tags, {tagName}));
        }, []);
      })(orderedTags))
      // Arhives
      .concat((_archives => {
        return _.reduce(_archives, (files, archives, archiveName) => {
          return _.concat(files,
            renderCollection('loop', 'archive', archives, {archiveName}));
        }, []);
      })(orderedArchives));

    console.log(files);
    debugger;

    template.changeDefaultGenerator();
    return es.readArray(files);
  } catch (err) {
    console.log(err);
  }
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
    customData.path = customData.path(pathData);
    return new File(customData);
  }
}

function preRender(template, wd, config, opts, message) {
  const matcher = {
    HOME: _.matches({label: 'home'}),
    ENTRY: _.matches({label: 'entry'}),
    CATEGORY: _.matches({label: 'category'}),
    TAG: _.matches({label: 'tag'}),
    ARCHIVE: _.matches({label: 'archive'}),
  };

  const matchesFile = _.cond([
    [matcher.HOME, createFile.bind(null, wd, {
      path: _.template('index.html')
    })],
    [matcher.ENTRY, createFile.bind(null, wd, {
      path: _.template('entries/<%=entryName%>/index.html')
    })],
    [matcher.CATEGORY, createFile.bind(null, wd, {
      path: _.template('categories/<%=categoryName%>/index.html')
    })],
    [matcher.TAG, createFile.bind(null, wd, {
      path: _.template('tags/<%=tagName%>/index.html')
    })],
    [matcher.ARCHIVE, createFile.bind(null, wd, {
      path: _.template('archives/<%=archiveName%>/index.html')
    })],
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

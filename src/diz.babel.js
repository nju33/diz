import fs from 'fs';
import path from 'path';
import File from 'vinyl';
import es from 'event-stream';
import _ from 'lodash';
import glob from 'glob';
import moment from 'moment';
import pluralize from 'pluralize';
import grayMatter from 'gray-matter';
import marked from 'marked';
import DizMatter from './diz-matter';
import Collection from './collection';
import localConfig from './local-config';
import template from './template';

let templates = {};
let first = false;
export default diz;
const defaultOpts = {
  site: {
    name: '',
    url: '',
    lang: 'ja',
    locale: 'ja_JP'
  },
  compiler: marked,
  template: {}
};

function diz(wd, opts) {
  opts = Object.assign({}, defaultOpts, opts);

  const workingDirname = path.basename(wd);
  const config = localConfig.get(wd);
  const collection = new Collection(config.frontmatter, {
    entries: null
  });
  const filepaths = getEntryFiles(wd);
  const errorLogs = [];

  for (const filepath of filepaths) {
    const matter = new DizMatter({
      compiler: opts.compiler,
      workingDirname,
      filepath,
      config
    });

    if (matter.hasWarning()) {
      matter.showWarning(opts.site.name || '');
    }

    for (const collectionName of matter.collectionNames) {
      collection.add(collectionName, matter);
    }
  }

  _.forEach(collection.list, (list, name) => {
    const suffix = pluralize(name).replace(/(.)/, c => c.toUpperCase());
    const funcName = `order${suffix}`;
    const func = opts[funcName];
    if (_.isFunction(func)) {
      collection.list[name] = func(list);
    }
  });

  templates = template.generateTemplates({
    layout: config.layout,
    template: opts.template,
    collection
  });
  template.changeContentGenerator();

  const render = preRender(template, wd, config, collection);
  const ordered = {};
  const files = [];
  _.forEach(collection.list, (list, name) => {
    if (_.isPlainObject(list)) {
      _.forEach(list, (matters, itemName) => {
        const dirPath = `${pluralize(name)}/${itemName}`;
        files.push(render({
          type: 'loop',
          label: name,
          matters,
          dirPath
        }));
      });
      return;
    } else if (_.isArray(list)) {
      for (const matter of list) {
        const dirPath = `entries/${matter.data.name}`;
        files.push(render({
          type: 'single',
          label: 'entry',
          matter,
          dirPath
        }));
      }
    }

    if (name === 'entries') {
      const dirPath = '';
      files.push(render({
        type: 'loop',
        label: name,
        matters: list,
        dirPath
      }));
    }
  });

  template.changeDefaultGenerator();
  return es.readArray(files);
}

function getEntryFiles(wd) {
  return glob.sync(path.resolve(wd, '**/entry.md'));
}

function preRender(template, wd, config, collection = {}) {
  return function render({
    type,
    label,
    matters,
    matter,
    dirPath
  }) {
    const data = Object.assign({}, {
      data: {},
      label,
      config,
      collection
    });

    if (!_.isNil(matters)) {
      const _data = Object.assign({}, data, {matters});
      const contents = _.template(templates[type])(_data);
      return new File({
        base: wd,
        path: path.join(wd, dirPath, 'index.html'),
        contents: (() => {
          try {
            return Buffer.from(contents);
          } catch (e) {
            return new Buffer(contents);
          }
        })()
      });
    } else if (!_.isNil(matter)) {
      const _data = Object.assign({}, data, {matter});
      const contents = _.template(templates[type])(_data);
      return new File({
        base: wd,
        path: path.join(wd, dirPath, 'index.html'),
        contents: (() => {
          try {
            return Buffer.from(contents);
          } catch (e) {
            return new Buffer(contents);
          }
        })()
      });
    }
  }
}

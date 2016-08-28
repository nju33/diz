import fs from 'fs';
import File from 'vinyl';
import es from 'event-stream';
import path from 'path';
import _ from 'lodash';
import glob from 'glob';
import moment from 'moment';
import grayMatter from 'gray-matter';
import localConfig from './local-config';
import marked from 'marked';
import template from './template';

const pages = [];

export default diz;
diz({
  wd: path.resolve(process.cwd(), 'test')
});

function diz(opts) {
  const defaultOpts = {
    wd: process.cwd()
  };
  opts = Object.assign({}, defaultOpts, opts);

  const config = localConfig.get(opts.wd);

  const entries = {};
  const categories = {};
  const tags = {};
  const archives = {};
  const filepaths = getEntryFiles(opts.wd);

  for (const filepath of filepaths) {
    const entryName = path.dirname(filepath).match(/[^/]+$/);
    const matter = grayMatter.read(filepath);
    matter.content = marked(matter.content);
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
      const year = moment(matter.data.date).year();
      const month = moment(matter.data.date).month();
      if (!archives[year]) {
        archives[year] = [];
        archives[`_${year}`] = {};
      }
      archives[year].push(matter);

      if (!archives[`_${year}`][month]) {
        archives[`_${year}`][month] = [];
      }
      archives[`_${year}`][month].push(matter);
    }

  }

  _.templateSettings.evaluate = /;;(.+)(?:;;)?\n/g;
  _.templateSettings.interpolate = /\${([\s\S]+?)}/g;

  try {
    const topdata = Object.assign({}, config, {entries, opts, type: 'home', data: {}});
    const top = _.template(template.top)(topdata);
    pages.push(new File({
      cwd: process.cwd(),
      base: '_out',
      path: '_out/index.html',
      contents: new Buffer(top)
    }));
    _.forEach(entries, (entry, name) => {
      const entrydata = Object.assign({}, config, {entry, opts, type: 'entry', data: {}});
      const en = _.template(template.entry)(entrydata);
      pages.push(new File({
        cwd: process.cwd(),
        base: '.',
        path: `./entries/${name}/index.html`,
        contents: new Buffer(en)
      }));
    });

    _.forEach(categories, (category, name) => {
      const categoryData = Object.assign({}, config, {entries: category}, {opts, type: 'category', data: {}});
      const t = _.template(template.top)(categoryData);
      pages.push(new File({
        cwd: process.cwd(),
        base: '.',
        path: `./categories/${name}/index.html`,
        contents: new Buffer(t)
      }));
    });

    _.forEach(tags, (tag, name) => {
      const tagData = Object.assign({}, config, {entries: tag}, {opts, type: 'tag', data: {}});
      const t = _.template(template.top)(tagData);
      pages.push(new File({
        cwd: process.cwd(),
        base: '.',
        path: `./tags/${name}/index.html`,
        contents: new Buffer(t)
      }));
    });

    _.forEach(archives, (archive, year) => {
      if (year.startsWith('_')) {
        _.forEach(archive, (childArchive, month) => {
          const archiveData = Object.assign({}, config, {entries: childArchive}, {opts, type: 'archive'}, {
            data: {year: year.slice(1), month}
          });
          const t = _.template(template.top)(archiveData);
          pages.push(new File({
            cwd: process.cwd(),
            base: '.',
            path: `./archives/${year.slice(1)}/${month}/index.html`,
            contents: new Buffer(t)
          }));
        });
      } else {
        const archiveData = Object.assign({}, config, {entries: archive}, {opts, type: 'archive'}, {
          data: {year}
        });
        const t = _.template(template.top)(archiveData);
        pages.push(new File({
          cwd: process.cwd(),
          base: '.',
          path: `./archives/${year}/index.html`,
          contents: new Buffer(t)
        }));
      }
    });
  } catch (err) {
    console.log(err);
  }

  es.readArray(pages).pipe(require('gulp').dest('_out'));
}

function getEntryFiles(wd) {
  return glob.sync(path.resolve(wd, '**/entry.md'));
}

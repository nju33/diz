import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import glob from 'glob';
import matter from 'gray-matter';
import localConfig from './local-config';
import marked from 'marked';
import template from './template';

export default diz;
diz({
  wd: path.resolve(process.cwd(), 'test')
});


function diz(opts) {
  const defaultOpts = {
    wd: process.cwd()
  };
  opts = Object.assign({}, defaultOpts, opts);

  const entries = {};
  const filepaths = getEntryFiles(opts.wd);

  for (const filepath of filepaths) {
    const entryName = path.dirname(filepath).match(/[^/]+$/);
    entries[entryName] = matter.read(filepath);
    entries[entryName].content = marked(entries[entryName].content);
  }

  _.templateSettings.evaluate = /;;(.+)(?:;;)?\n/g;
  _.templateSettings.interpolate = /\${([\s\S]+?)}/g;
  try {
    const top = _.template(template.top)({entries});
    console.log(top);
    _.forEach(entries, entry => {
      const en = _.template(template.entry)({entry});
      console.log(en);
    });
    // for (const entry of entries) {
    // }
  } catch (err) {
    console.log(err);
  }
}

function getEntryFiles(wd) {
  return glob.sync(path.resolve(wd, '**/entry.md'));
}


// console.log(_.templateSettings);
// debugger;

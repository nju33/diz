import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import glob from 'glob';

const partialsDir = path.resolve(__dirname, '../templates/partials');
const templates = _(glob.sync(`${partialsDir}/**/*.html`))
  .reduce((result, filePath) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const basename = path.basename(filePath, '.html');
    _.set(result, basename, content);
    console.log(result);
    return result;
  }, {});

export default {
  generateTemplates(layout, blocks) {
    this.fullTemplates = Object.assign({}, templates, {layout, blocks});
    return {
      home: buildTemplate.call(this, 'home'),
      entry: buildTemplate.call(this, 'entry'),
      category: buildTemplate.call(this, 'category'),
      tag: buildTemplate.call(this, 'tag'),
      archive: buildTemplate.call(this, 'archive')
    };
  },

  changeDefaultGenerator() {
    _.templateSettings.escape = /<%-([\s\S]+?)%>/g;
    _.templateSettings.evaluate =/<%([\s\S]+?)%>/g;
    _.templateSettings.interpolate =/<%=([\s\S]+?)%>/g;
    _.templateSettings.imports = {_};
  },

  changeTemplateGenerator() {
    _.templateSettings.interpolate = /<<([\s\S]+?)>>/g;
    _.templateSettings.imports = {
      _,
      t(strings) { return `<<${strings[0]}>>`; }
    }
  },

  changeContentGenerator() {
    _.templateSettings.evaluate = /;;(.+)(?:;;)?\n/g;
    _.templateSettings.interpolate = /\${([\s\S]+?)}/g;
  }
};

function readPartial(filename) {
  const partialDir = '../templates/partials';
  const filepath = require('path')
                     .resolve(__dirname, partialDir, `${filename}.html`);
  return require('fs').readFileSync(filepath, 'utf-8');
}

function readTemplate(filename) {
  const partialDir = '../templates';
  const filepath = require('path')
                     .resolve(__dirname, partialDir, `${filename}.html`);
  return require('fs').readFileSync(filepath, 'utf-8');
}

function buildTemplate(templateName) {
  this.changeTemplateGenerator();
  let template = readTemplate(templateName);
  try {
    while (/<<.+?>>/.test(template)) {
      template = _.template(template)(this.fullTemplates);
    }
  } catch (err) {
    console.log(err);
  }
  this.changeDefaultGenerator();
  return template;
}

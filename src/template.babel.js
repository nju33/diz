import fs from 'fs';
import _ from 'lodash';

const templates = {
  head: readPartial('head'),
  sidebar: readPartial('sidebar'),
  main: readPartial('main'),
  single: readPartial('single'),
  entryloop: readPartial('entryloop'),
};

export default {
  generateTemplates(layouts, blocks) {
    this.fullTemplates = Object.assign({}, templates, {layouts, blocks});
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

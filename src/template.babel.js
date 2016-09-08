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
  generateTemplates(blocks) {
    const fullTemplates = Object.assign({}, templates, {blocks});

    return {
      home: (() => {
        this.changeTemplateGenerator();
        let template = readTemplate('home');
        try {
          while (/<<.+?>>/.test(template)) {
            template = _.template(template)(fullTemplates);
          }
        } catch (err) {
          console.log(err);
        }
        this.changeDefaultGenerator();
        return template;
      })(),
      entry: (() => {
        this.changeTemplateGenerator();
        let template = readTemplate('entry');
        try {
          while (/<<.+?>>/.test(template)) {
            template = _.template(template)(fullTemplates);
          }
        } catch (err) {
          console.log(err);
        }
        this.changeDefaultGenerator();
        return template;
      })(),
      categoryHome: (() => {
        this.changeTemplateGenerator();
        let template = readTemplate('category-home');
        try {
          while (/<<.+?>>/.test(template)) {
            template = _.template(template)(fullTemplates);
          }
        } catch (err) {
          console.log(err);
        }
        this.changeDefaultGenerator();
        return template;
      })(),
      categorySingle: (() => {
        this.changeTemplateGenerator();
        let template = readTemplate('category-single');
        try {
          while (/<<.+?>>/.test(template)) {
            template = _.template(template)(fullTemplates);
          }
        } catch (err) {
          console.log(err);
        }
        this.changeDefaultGenerator();
        return template;
      })(),
      tagHome: (() => {
        this.changeTemplateGenerator();
        let template = readTemplate('tag-home');
        try {
          while (/<<.+?>>/.test(template)) {
            template = _.template(template)(fullTemplates);
          }
        } catch (err) {
          console.log(err);
        }
        this.changeDefaultGenerator();
        return template;
      })(),
      archive: (() => {
        this.changeTemplateGenerator();
        let template = readTemplate('archive');
        try {
          while (/<<.+?>>/.test(template)) {
            template = _.template(template)(fullTemplates);
          }
        } catch (err) {
          console.log(err);
        }
        this.changeDefaultGenerator();
        return template;
      })()
    };
  },

  changeDefaultGenerator() {
    _.templateSettings.escape = /<%-([\s\S]+?)%>/g
    _.templateSettings.evaluate =/<%([\s\S]+?)%>/g
    _.templateSettings.interpolate =/<%=([\s\S]+?)%>/g
  },

  changeTemplateGenerator() {
    _.templateSettings.interpolate = /<<([\s\S]+?)>>/g;
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

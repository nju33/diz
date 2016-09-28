import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import glob from 'glob';
import pluralize from 'pluralize';
import grayMatter from 'gray-matter'

const partialsDir = path.resolve(__dirname, '../templates/partials');

export default {
  templates: {},
  prepare(template) {
    this.templates = _(glob.sync(`${partialsDir}/**/*.html`))
      .reduce((result, filePath) => {
        const matter = grayMatter.read(filePath);
        const content = matter.content;
        const dirname = path.dirname(filePath).split('/').reverse()[0];
        const basename = path.basename(filePath, '.html');
        const key = dirname !== 'partials' ?
                      `${dirname}:${basename}` :
                      basename;
        const defaults = _.get(matter.data, 'defaults', {});

        if (_.get(matter, 'data.function')) {
          const render = _.curry((pre, suf) => {
            // this.changeContentGenerator();
            this.changeDefaultGenerator();
            return _.template(content)(Object.assign({}, defaults, pre, suf));
          });
          _.set(result, key, render);
        } else {
          _.set(result, key, content);
        }
        return result;
      }, {});
    if (_.isPlainObject(template)) {
      Object.assign(this.templates, template);
    }
  },

  generateTemplates({layout, template, collection}) {
    this.prepare(template);
    this.fullTemplates = Object.assign({}, this.templates, {
      layout,
      collection
    });
    return {
      single: buildTemplate.call(this, 'single'),
      loop: buildTemplate.call(this, 'loop'),
    };
  },

  changeDefaultGenerator() {
    _.templateSettings.escape = /<%-([\s\S]+?)%>/g;
    _.templateSettings.evaluate =/<%([\s\S]+?)%>/g;
    _.templateSettings.interpolate =/<%=([\s\S]+?)%>/g;
    _.templateSettings.imports = {
      _,
      pluralize
    };
  },

  changeTemplateGenerator() {
    const templates = this.templates;
    _.templateSettings.escape = null;
    _.templateSettings.evaluate = /<<<([\s\S]+?)>>>/g;
    _.templateSettings.interpolate = /<<([\s\S]+?)>>/g;
    _.templateSettings.imports = {
      _,
      t(strings) {
        return _.get(templates, strings[0], '');
      },
      templateUrl(basePath) {
        return pagePath => {
          return `/${basePath}/${pagePath}`;
        }
      },
      templateTitle(title) {
        return title;
      },
      templateCount(items) {
        return items.length;
      }
    }
  },

  changeContentGenerator() {
    _.templateSettings.escape = null;
    _.templateSettings.evaluate = /;;(.+)(?:;;)?\n/g;
    _.templateSettings.interpolate = /\${([\s\S]+?)}/g;
    _.templateSettings.imports = {
      _
    };
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
  let template = readTemplate(templateName);
  try {
    while (/<<[\s\S]*?>>/.test(template)) {
      this.changeTemplateGenerator();
      template = _.template(template)(this.fullTemplates);
    }
  } catch (err) {
    console.log(err);
  }
  this.changeDefaultGenerator();
  return template;
}

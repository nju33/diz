import fs from 'fs';
import _ from 'lodash';

const templates = {
  sidebar: readPartial('sidebar'),
  main: readPartial('main'),
  single: readPartial('single'),
  entryloop: readPartial('entryloop'),
  categoryloop: readPartial('categoryloop'),
  tagloop: readPartial('tagloop')
};

export default {
  top: (() => {
    _.templateSettings.interpolate = /<<([\s\S]+?)>>/g
    let template = readTemplate('home');
    try {
      while (/<<.+?>>/.test(template)) {
        template = _.template(template)(templates);
      }
    } catch (err) {
      console.log(err);
    }
    _.templateSettings.interpolate = /<%=([\s\S]+?)%>/g
    return template;
  })(),
  entry: (() => {
    _.templateSettings.interpolate = /<<([\s\S]+?)>>/g
    let template = readTemplate('entry');
    try {
      while (/<<.+?>>/.test(template)) {
        template = _.template(template)(templates);
      }
    } catch (err) {
      console.log(err);
    }
    _.templateSettings.interpolate = /<%=([\s\S]+?)%>/g
    return template;
  })()
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

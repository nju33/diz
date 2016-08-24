import fs from 'fs';
import _ from 'lodash';

const templates = {
  sidebar: fs.readFileSync('./src/templates/sidebar.html', 'utf-8'),
  main: fs.readFileSync('./src/templates/main.html', 'utf-8'),
  single: fs.readFileSync('./src/templates/single.html', 'utf-8'),
  entryloop: fs.readFileSync('./src/templates/entryloop.html', 'utf-8'),
  categoryloop: fs.readFileSync('./src/templates/categoryloop.html', 'utf-8'),
  tagloop: fs.readFileSync('./src/templates/tagloop.html', 'utf-8')
}

export default {
  top: (() => {
    _.templateSettings.interpolate = /<<([\s\S]+?)>>/g
    let template = fs.readFileSync('./src/templates/home.html', 'utf-8');
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
    let template = fs.readFileSync('./src/templates/entry.html', 'utf-8');
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

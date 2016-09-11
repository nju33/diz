import fs from 'fs';
import path from 'path';

const defaults = {
  sidebar: {
    sections: ['entry', 'category', 'tag', 'archive']
  },
  frontmatter: {
    title: null,
    description: null,
    tags: null,
    date: null
  },
  layout: {
    root(component) {
      return [
        component.sidebar,
        component.contents
      ].join('\n');
    },
    head(component) {
      return [
        component.meta,
        component.title,
        component.ogp,
        component.twittercard
      ].join('\n');
    }
  }
}

export default {
  get(wd) {
    try {
      const config = require(path.resolve(wd, 'diz.config'));
      return Object.assign({}, defaults, config);
    } catch (err) {
      console.log(err);
    }
  }
};

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

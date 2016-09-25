import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import layout from './layout';

const defaults = {
  site: {
    name: '',
    lang: '',
    url: '',
    description: '',
    url: '',
    twitter: {
      username: ''
    },
    facebook: {
      username: ''
    }
  },
  frontmatter: {
    title: {
      default: '',
      required: true
    },
    description: {
      default: ''
    }
  },
  layout
}

export default {
  get(wd) {
    try {
      const siteConfig = require(path.resolve(wd, 'site.config'));
      const config = {
        site: Object.assign({}, defaults.site),
        frontmatter: Object.assign({}, defaults.frontmatter),
        layout: Object.assign({}, defaults.layout)
      };

      if (!_.isNil(siteConfig.site)) {
        const key = 'site';
        Object.assign(config[key], siteConfig[key]);
      }

      if (!_.isNil(siteConfig.frontmatter)) {
        const key = 'frontmatter';
        Object.assign(config[key], siteConfig[key]);
      }

      if (!_.isNil(siteConfig.layout)) {
        const key = 'layout';
        Object.assign(config[key], siteConfig[key]);
      }

      return config;
    } catch (err) {
      throw new Error(err);
    }
  }
};

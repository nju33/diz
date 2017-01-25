import url from 'url';
import path from 'path';
import glob from 'glob';
import get from 'lodash.get';
import {string} from 'validated/schema';
import {validate as validateObject} from 'validated/object';
import Directory from './directory';
import {getSlug} from './helpers';

const wm = new WeakMap();

export default class Root {
  static getRootpaths({base = '.'}) {
    return new Promise((resolve, reject) => {
      const pattern = path.join(process.cwd(), base, '/*/');
      glob(pattern, (err, matches) => {
        if (err) {
          return reject(err);
        }
        resolve(matches);
      });
    });
  }

  static getConf(rootpath) {
    return new Promise((resolve, reject) => {
      const confpath = path.join(rootpath, 'config.js');
      glob(confpath, (err, matches) => {
        if (err) {
          return reject(err);
        }

        if (matches.length === 0) {
          return resolve(null);
        }

        if (require.cache[matches[0]]) {
          delete require.cache[matches[0]];
        }
        const config = require(matches[0]);
        resolve(config);
      });
    });
  }

  constructor(rootpath, config) {
    this.config = config;
    if (!this.hasParentInConfig()) {
      validateObject(string, this.config.url);
    }

    this.originalName = getSlug(path.basename(rootpath));
    this.name = getSlug(path.basename(rootpath));
    this.path = rootpath;
    this.mainDirectory = new Directory({
      root: this,
      path: path.dirname(rootpath),
      name: 'posts'
    });
    this.directories = [this.mainDirectory];
  }

  set parent(diz) {
    wm.set(this, diz);
  }

  get parent() {
    return wm.get(this);
  }

  hasParentInConfig() {
    return typeof this.config.parent === 'string';
  }

  hasOutputPathInConfig() {
    return typeof get(this.config, 'output.path') === 'string';
  }

  postProcess(parent) {
    if (parent) {
      this.absURL = path.join(
        parent.absURL,
        url.parse(this.config.url).pathname,
        '/'
      );
    } else {
      this.absURL = path.join(url.parse(this.config.url).pathname, '/');
    }
  }

  getSibling(name) {
    return this.parent.roots.find(root => {
      return root.originalName === name;
    });
  }

  applyPlugins() {
    if (Array.isArray(this.config.plugins) && this.config.plugins.length > 0) {
      this.config.plugins.forEach(plugin => {
        plugin.process(this);
      });
    }
  }

  createDirectory(name, renders = true) {
    const dir = new Directory({
      root: this,
      name,
      renders
    });
    this.directories.push(dir);
    return dir;
  }
}

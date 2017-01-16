import url from 'url';
import path from 'path';
import glob from 'glob';
import Directory from './directory';

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
    this.name = path.basename(rootpath);
    this.path = rootpath;
    this.absURL = path.join(url.parse(config.url).pathname, '/');
    this.config = config;
    this.mainDirectory = new Directory({
      root: this,
      path: path.dirname(rootpath),
      name: 'posts'
    });
    this.directories = [this.mainDirectory];
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

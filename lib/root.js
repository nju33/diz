import {debuglog} from 'util';
import path from 'path';
import es from 'event-stream';
import glob from 'glob';
import flatten from 'lodash.flatten';
import marked from 'marked';
import {autobind} from 'core-decorators';
import {object, maybe, string, sequence, any, mapping} from 'validated/schema';
import {validate as validateObject} from 'validated/object';
import MemoryFS from 'memory-fs';
import Vinyl from 'vinyl';
import CollectionPageGenerator from 'diz-plugin-collection-page-generator';
import webpack from 'webpack';
import webpackConfig from './config/webpack.config';

import Directory from './directory';

const rendererlog = debuglog('renderer');
const mfs = new MemoryFS();

// const defaultConfig = {
//   // base: ***,
//   // ignores: [*, *, *],
//   pager: 20
// };
// const defaultSite = {
//   // site: 'http://...'
// };
// const defaultCompiler = marked;
//
// const defaultPlugins = [
//   new CollectionPageGenerator({pager: 20})
// ];
//
export default class Renderer {
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
//   static themename = null;
//
//   static configSchema = object({
//     base: string,
//     ignores: maybe(sequence(string))
//   })
//
//   static siteSchema = object({
//     title: string,
//     description: string,
//     url: string,
//     lang: maybe(string)
//   })
//
//   static pluginSchema = maybe(sequence(any))
//
//   static _defaultConfig = defaultConfig;
//   static get defaultConfig() {
//     return this._defaultConfig;
//   }
//   static set defaultConfig(config) {
//     this._defaultConfig = Object.assign(
//       defaultConfig,
//       validateObject(mapping(), config)
//     );
//   }
//
//   static _defaultSite = defaultSite;
//   static get defualtSite() {
//     return this._defaultSite;
//   }
//   static set defualtSite(site) {
//     this._defaultSite = Object.assign(
//       defaultSite,
//       validateObject(mapping(), site)
//     );
//   }
//
//   static defaultCompiler = defaultCompiler;

  constructor(rootpath, config) {
    this.path = rootpath;
    this.config = config;
    this.mainDirectory = new Directory({
      rootInstance: this,
      name: path.dirname(rootpath)
    });
    this.directories = [this.mainDirectory];
  }

  createDirectory() {
    return new Directory();
  }

  renderByPlugins() {
    const files = this.dirs.reduce((files, dir) => {
      this.plugins.forEach(plugin => {
        plugin.setData(dir);
        const obj = plugin.process(dir.posts);
        this.plugin.dirs[plugin.collectionKey] = obj.dir;
        files = [...files, ...obj.files];
      });
      return files;
    }, []);
    return files;
  }

  renderAllPosts() {
    const files = this.dirs.reduce((result, dir) => {
      const files = dir.renderPosts(this.theme.types.POST);
      return [...result, ...files];
    }, []);
    return files;
  }

  @autobind
  __render__() {
    const custom = this.renderByPlugins();
    // const top = this.renderTop();
    const posts = this.renderAllPosts();
    return es.readArray([...custom, ...posts]);
  }

  @autobind
  __bundle__(cb) {
    this.webpackCompiler.run((err, stats) => {
      const errorsOnly = stats.toString('errors-only');
      if (err || errorsOnly) {
        return cb(err || errorsOnly, null);
      }

      return (assets => {
        const files = Object.keys(assets).map(filename => {
          const contents = mfs.readFileSync(assets[filename].existsAt);
          return this.dirs.map(dir => {
            return new Vinyl({
              path: dir.name + '/scripts/' + filename,
              contents
            });
          });
        });

        cb(null, es.readArray(flatten(files)));
      })(stats.compilation.assets);
    });
  }
}

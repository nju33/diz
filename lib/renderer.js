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

const defaultConfig = {
  // base: ***,
  // ignores: [*, *, *],
  pager: 20
};
const defaultSite = {
  // site: 'http://...'
};
const defaultCompiler = marked;

const defaultPlugins = [
  new CollectionPageGenerator({pager: 20})
];

export default class Renderer {
  static themename = null;

  static configSchema = object({
    base: string,
    ignores: maybe(sequence(string))
  })

  static siteSchema = object({
    title: string,
    description: string,
    url: string,
    lang: maybe(string)
  })

  static pluginSchema = maybe(sequence(any))

  static _defaultConfig = defaultConfig;
  static get defaultConfig() {
    return this._defaultConfig;
  }
  static set defaultConfig(config) {
    this._defaultConfig = Object.assign(
      defaultConfig,
      validateObject(mapping(), config)
    );
  }

  static _defaultSite = defaultSite;
  static get defualtSite() {
    return this._defaultSite;
  }
  static set defualtSite(site) {
    this._defaultSite = Object.assign(
      defaultSite,
      validateObject(mapping(), site)
    );
  }

  static defaultCompiler = defaultCompiler;

  constructor(opts) {
    (c => {
      try {
        validateObject(string, c.themename);
        this.themename = c.themename;
        this.themePkg = require(path.join(c.themename, 'package.json'));
        this.theme = (name => {
          const themePkgpath = require.resolve(path.join(name, 'package.json'));
          const themeDir = path.dirname(themePkgpath);
          return require(
            path.join(themeDir, this.themePkg.diz.themepath)
          ).default;
        })(this.themename);
      } catch (err) {
        try {
          this.themePkg = require(path.resolve(
            __dirname,
            '../node_modules',
            c.themename, 'package.json'
          ));
          this.theme = (name => {
            const themePkgpath = require.resolve(
              path.resolve(
                __dirname,
                '../node_modules',
                name,
                'package.json'
              )
            );
            const themeDir = path.dirname(themePkgpath);
            return require(
              path.join(themeDir, this.themePkg.diz.themepath)
            ).default;
          })(this.themename);
        } catch (err) {
          console.log(err);
        }
      }
      this.config = Object.assign({}, c.defaultConfig,
        validateObject(c.configSchema, opts.config));
      this.sites = (() => {
        Object.keys(opts.sites).forEach(namespace => {
          opts.sites[namespace] = Object.assign({}, c.defaultSite,
          validateObject(c.siteSchema, opts.sites[namespace]));
        });
        return opts.sites;
      })();
      this.compiler = opts.compiler || c.defaultCompiler;
      this.plugins = validateObject(c.pluginSchema, opts.plugins) ||
                     defaultPlugins;
    })(this.constructor);

    try {
      webpackConfig.entry = [
        'webpack/hot/dev-server',
        'webpack-hot-middleware/client',
        path.join(
          path.dirname(
            require.resolve(path.join(this.themename, 'package.json'))
          ),
          this.themePkg.diz.themepath
        )
      ];
    } catch (err) {
      webpackConfig.entry = [
        'webpack/hot/dev-server',
        'webpack-hot-middleware/client',
        path.join(
          path.dirname(
            require.resolve(
              path.resolve(
                __dirname,
                '../node_modules',
                this.themename,
                'package.json'
              )
            )
          ),
          this.themePkg.diz.themepath
        )
      ];
    }

    webpackConfig.resolve.modules.push(
      path.dirname(
        require.resolve(path.join(this.themename, 'package.json'))
      ),
      'node_modules/'
    );
    this.webpackCompiler = webpack(webpackConfig);
    this.webpackCompiler.outputFileSystem = mfs;

    this.dirs = [];
    this.plugin = {};
    this.plugin.dirs = {};
  }

  getDirpaths() {
    return new Promise((resolve, reject) => {
      const globPattern = path.join(this.config.base, '/*/');
      glob(globPattern, (err, matches) => {
        if (err) {
          return reject(err);
        }

        if (Array.isArray(this.config.ignores)) {
          matches = matches.filter(dirpath => (
            this.config.ignores.indexOf(path.basename(dirpath)) === -1
          ));
        }
        resolve(matches);
      });
    });
  }

  load() {
    return (async context => {
      try {
        context.dirpaths = await this.getDirpaths();
      } catch (err) {
        console.log(err);
        return;
      }

      rendererlog('got dir paths');

      try {
        context.dirs = await new Promise((resolve, reject) => {
          const promises = context.dirpaths.map(async dirpath => {
            const name = path.basename(dirpath);
            const dir = new Directory(name, this);
            try {
              await dir.getPosts(this.config);
            } catch (err) {
              reject(err);
            }
            return dir;
          });
          Promise.all(promises)
            .then(dirs => resolve(dirs))
            .catch(err => reject(err));
        });
      } catch (err) {
        console.log(err);
        return;
      }

      this.dirs = context.dirs;
      rendererlog('Create dirs');

      return {
        render: this.__render__,
        bundle: this.__bundle__
      };
    })({
      dirpaths: null,
      dirs: null
    });
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

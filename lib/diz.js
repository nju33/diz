import url from 'url';
import path from 'path';
import es from 'event-stream';
import Vinyl from 'vinyl';
import zip from 'lodash.zip';
import flatten from 'lodash.flatten';
import {string} from 'validated/schema';
import {validate as validateObject} from 'validated/object';
import MemoryFS from 'memory-fs';
import webpack from 'webpack';
import webpackConfig from './config/webpack.config';
import Root from './root';
import Directory from './directory';

export default class Diz {
  static async load(opts = {}) {
    try {
      validateObject(string, opts.base);
    } catch (err) {
      throw new Error(err);
    }

    const rootpaths = await Root.getRootpaths(opts);
    const configs = await Promise.all(rootpaths.map(async rootpath => {
      const config = await Root.getConf(rootpath);
      return config;
    }));

    const roots = zip(rootpaths, configs)
      .filter(arr => Boolean(arr[1]))
      .map(arr => new Root(arr[0], formatConfig(arr[1])));

    if (roots.length === 0) {
      throw new Error(`
Target directory is missing.
Please create a file called config.js at the root of the target directory
      `.trim());
    }

    await Promise.all(roots.map(async root => {
      const posts = await Directory.load(root);
      root.mainDirectory.posts = posts;
    }));

    return roots;

    function formatConfig(config) {
      return Object.assign({}, config);
    }
  }

  constructor({roots}) {
    this.roots = roots;
    this.roots.forEach(root => {
      root.applyPlugins();
    });
  }

  render() {
    const files = flatten(this.roots.map(root => {
      const config = root.config.theme.config;

      return flatten(root.directories.map(dir => (
        dir.posts.map(post => {
          const props = {
            post: post.formatData(),
            config
          };
          const propsStr = JSON.stringify(props);
          const opts = {};

          if (dir.isRenders()) {
            const renderer = new root.config.theme.Renderer(props, propsStr);
            const html = renderer.render();
            Object.assign(opts, {
              path: path.join(root.name, post.absURL.slice(1) + 'index.html'),
              contents: Buffer.from(html)
            });
          } else {
            Object.assign(opts, {
              path: path.join(root.name, post.absURL.slice(1)),
              contents: Buffer.from(post.original)
            });
          }

          return this.toFile(opts);
        })
      )));
    }));

    return es.readArray(files);
  }

  async bundle() {
    const mfs = new MemoryFS();
    const defaultEntry = Object.assign({}, webpackConfig.entry);
    const defaultResolveModules = Object.assign(
      {}, webpackConfig.resolve.modules
    );
    // const defaultPerformance = Object.assign({}, webpackConfig.performance);

    const promises = this.roots.map(async root => {
      const _webpackConfig = Object.assign({}, webpackConfig);
      _webpackConfig.output.path = root.path;
      _webpackConfig.entry = [
        ...defaultEntry,
        root.config.theme.Renderer.path
      ];
      _webpackConfig.resolve.modules = [
        ...defaultResolveModules,
        root.config.theme.Renderer.nodeModulesPath
      ];
      _webpackConfig.performance = {hints: false};
      const compiler = webpack(_webpackConfig);
      compiler.outputFileSystem = mfs;

      let assets = null;
      try {
        assets = await this.compile(compiler);
      } catch (err) {
        console.log(err);
        return;
      }

      const files = Object.keys(assets).map(filename => {
        const contents = mfs.readFileSync(assets[filename].existsAt);
        const filepath = path.join(...[
          root.name,
          url.parse(root.config.url).pathname,
          '/scripts/',
          filename
        ]);
        return new Vinyl({
          path: filepath,
          contents
        });
      });
      return files;
    });

    const filesArr = await Promise.all(promises);
    const files = flatten(filesArr);
    return es.readArray(files);
  }

  compile(compiler) {
    return new Promise((resolve, reject) => {
      compiler.run((err, stats) => {
        const errorsOnly = stats.toString('errors-only');
        if (err || errorsOnly) {
          return reject(err || errorsOnly, null);
        }

        resolve(stats.compilation.assets);
      });
    });
  }

  toFile({base, path, contents}) {
    return new Vinyl({
      base,
      path,
      contents
    });
  }
}

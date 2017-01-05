import fs from 'fs';
import path from 'path';
import glob from 'glob';
import es from 'event-stream';
import React from 'react';
import {renderToString} from 'react-dom/server';
import Vinyl from 'vinyl';
import zip from 'lodash.zip';
import flatten from 'lodash.flatten';
import jsonStringifySafe from 'json-stringify-safe';
import stringFormat from 'string-template';
import marked from 'marked';
import webpack from 'webpack';
import webpackConfig from './config/webpack.config';
import ThemeConfig from './theme-config';
import Root from './root';
import Directory from './directory';
import Post from './post';

const GLOBAL_NAME = '__DIZ__';

const defaultConfig = {
  title: '{dirname}',
  description: '',
  base: '',
  url: '',
  compile(contents) {
    return marked(contents);
  }
};

export default class Diz {
  static getTheme(pkgname) {
    const filepath = require.resolve(path.join(pkgname, 'package.json'));
    if (require.cache[filepath]) {
      delete require.cache[filepath];
    }
    const pkg = require(filepath);
    return new ThemeConfig({
      _path: path.dirname(filepath),
      data: pkg.diz || {}
    });
  }

  static async load(opts = {}, globalConfig = defaultConfig) {
    try {
      // TODO: validate for globalConfig
      opts = Object.assign({}, {compile: marked}, opts);
    } catch (err) {
      throw new Error(err);
    }

    try {
      const rootpaths = await Root.getRootpaths(opts);
      const configs = await Promise.all(rootpaths.map(async rootpath => {
        const config = await Root.getConf(rootpath);
        return config;
      }));

      const roots = zip(rootpaths, configs)
        .filter(arr => Boolean(arr[1]))
        .map(arr => new Root(arr[0], formatConfig(arr[1])));

      await Promise.all(roots.map(async rootInstance => {
        const posts = await Directory.load(rootInstance);
        rootInstance.mainDirectory.posts = posts;
      }));

      return roots;
    } catch (err) {
      console.log(err);
      return;
    }

    function formatConfig(config) {
      return Object.assign({}, globalConfig, config);
    }
  }

  constructor({roots, theme, themeConfig}) {
    this.roots = roots;
    this.Theme = theme;
    // TODO: validation
    this.themeConfig = themeConfig;
  }

  render(base = null) {
    const posts = flatten(this.roots.map(rootInstance => {
      return flatten(rootInstance.directories.map(dir => dir.posts))
    }));

    // this.Theme.renderToString(Object.assign({
    //   config: this.root.config,
    //   post: this,
    // }));
    // }

    const files = posts.map(post => this.toFile(post, base));
    return es.readArray(files);
  }

  bundle() {
  }

  toFile(post, base) {
    const Theme = require(this.themeConfig.getPath('jsx')).default;
    const props = {post: Post.omitData(post)};
    const safeProps = jsonStringifySafe(props);
    const contents = renderToString(<Theme {...props}/>);
    const markup = fs.readFileSync(this.themeConfig.getPath('html'), 'utf-8');
    const html =
      stringFormat(markup, {
        props: safeProps,
        config: this.config,
        post,
        contents
      });
    return new Vinyl({
      base,
      path: post.absURL.slice(1) + 'index.html',
      contents: Buffer.from(html)
    });
  }
}

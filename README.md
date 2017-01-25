<h1 align="center"><img src="https://github.com/nju33/diz/blob/master/media/logo.png?raw=true"></h1>

A static site generator.

[![Build Status](https://travis-ci.org/nju33/diz.svg?branch=master)](https://travis-ci.org/nju33/diz) [![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo) ![Dependencies Status](https://david-dm.org/nju33/diz.svg)

## Install

```bash
$ yarn add -D diz gulp
$ npm i -D diz gulp
```

## Example

```js
Diz.load({base: 'relative/path/'}).then(roots => {
  const renderer = new Diz({roots});

  // .html etc
  renderer.render().pipe(gulp.dest('example/dist/'));

  // .js using webpack
  renderer.bundle().then(stream => {
    stream.pipe(gulp.dest('example/dist/'));
  });
});
```

## File organization

The directory at the level one level below **root path** is recognized as root.
However, in order to be processed, it is necessary to put config.js directly under the root directory.

```
└─ <base path>
   │   // blog1 is processed
   ├─ <blog1>
   │   ├─ 0_getting-started.md
   │   ├─ 1_hello-world.md
   │   ├─ n_***.md
   │   ├─ config.js
   │
   │   // blog2 isn't processed because there is no config.js
   ├─ <blog2>
   │   ├─ 0_getting-started.md
   │   ├─ 1_hello-world.md
   │   ├─ n_***.md
   ├─ <...>
```

In `config.js`, describe meta information about the site, theme information, compilation method and so on. Also, the string up to `_` in each .md file is removed. It just uses to adjust the order of post files.

For example, it will be like this.

```js
const Renderer = require('diz-theme-xxxx');
const Plugin = require('diz-plugin-yyy');
const marked = require('marked');

module.exports = {
  //* required
  title: 'blog title',
  url: 'http://blog.com/',
  //* option
  description: 'blog description',
  author: 'nju33',

  //* option
  //  Whether to reverse the order of n_*.md files
  reverse: false

  //* option
  //  When parent directory name is specified,
  //  the following happens
  //
  //  1. Inherit config.js of the specified directory
  //  2. Becomes part of the blog of the specified directory
  //
  parent: '...'
  //* option
  //  Overwrite inherited config
  override: {...}

  //* required
  theme: {
    //* required
    //  The theme itself (.jsx etc)
    Renderer,
    //* option
    //  Theme's config
    config: {}
  },

  //* option
  //  Md file conversion function
  //  (contents: string): string
  compile: marked,

  //* option
  //  Array of used plugins
  plugins: [new Plugin()]
};
```

The config data changes depending on the plugin and theme you are using.

## CLI

- `diz generate id`
  <div>Generate urn id</div>
- `diz generate date`
  <div>Generate just date</div>

## Themes

- [Minimalist](https://github.com/nju33/diz-theme-minimalist)

### How to create a theme

1. Install [diz-theme](https://github.com/nju33/diz-theme)
2. use it in parent class (e.g.) `class extends DizTheme`

For more information, click [here](https://github.com/nju33/diz-theme#readme)

## Plugins

- [collection page generator](https://github.com/nju33/diz-plugin-collection-page-generator)
  <div>Create a list pages</div>
- [atom feed](https://github.com/nju33/diz-plugin-atom-feed)
  <div>Create atom feed</div>
- [ref](https://github.com/nju33/diz-plugin-ref)
  <div>Override post.url</div>

## License

The MIT License (MIT)

Copyright (c) 2016 nju33 <nju33.ki@gmail.com>

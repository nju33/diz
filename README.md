<h1 align="center"><img src="https://github.com/nju33/diz/blob/master/media/logo.png?raw=true"></h1>

A static site generator.

[![Build Status](https://travis-ci.org/nju33/diz.svg?branch=master)](https://travis-ci.org/nju33/diz) [![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

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
   │   ├─ 0_post.md
   │   ├─ 1_post.md
   │   ├─ n_post.md
   │   ├─ config.js
   │
   │   // blog2 isn't processed because there is no config.js
   ├─ <blog2>
   │   ├─ 0_post.md
   │   ├─ 1_post.md
   │   ├─ n_post.md
   ├─ <...>
```

In `config.js`, describe meta information about the site, theme information, compilation method and so on.

For example, it will be like this.

```js
const Renderer = require('diz-theme-xxxx');
const Plugin = require('diz-plugin-yyy');
const marked = require('marked');

module.exports = {
  title: 'blog title',              // required
  description: 'blog description',  // required
  url: 'http://example.com/',       // required
  author: 'nju33',                  // option
  theme: {Renderer, config: {}},    // required
  compile: marked,                  // option
  plugins: [new Plugin()]           // option
};
```

The config data changes depending on the plugin and theme you are using.

## CLI

- `diz generate id`
  <div>Generate urn id</div>
- `diz generate date`
  <div>Generate just date</div>

## License

The MIT License (MIT)

Copyright (c) 2016 nju33 <nju33.ki@gmail.com>

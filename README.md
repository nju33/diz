# diz

A static site generator.

[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

## Install

```bash
$ yarn add -D diz gulp
$ npm i -D diz gulp
```

## Example

```js
import gulp from 'gulp';
import Diz from 'diz';

const renderer = new Diz({
  config: {
    // Required
    // Specify directory containing blog directory
    base: __dirname,

    // When ${__dirname}/+(blog1|blog2|blog3)/
    // ignore ${__dirname}/blog2
    // blog1, blog3 are processed
    ignores: ['blog2']
  },
  sites: {
    // Specify blog1 information
    blog1: {
      title: 'title1',
      description: 'description1',
      url: 'http://example1.com'
    }

    // Specify for each blog directory
    // (e.g.)
    // blog3: {
    //   title: '...'
    //   description: '...'
    //   url: '...'
    // }
  },

  // default
  // compiler: marked,
  // plugins: [
  //   new CollectionPageGenerator({pager: 1})
  // ]
});

renderer.load().then(({render, bundle}) => {
  // HTML files
  render().pipe(gulp.dest('example/dist/'));
  // bundle JS files with webpack
  bundle((err, stream) => {
    if (err) {
      console.log(err);
      return;
    }
    return stream.pipe(gulp.dest('example/dist/'));
  });
});

```

## File organization

```
└─ base
   ├─ <blog1>
   │   ├─ 0_post.md
   │   ├─ 1_post.md
   │   ├─ n_post.md
   ├─ <blog2>
   │   ├─ 0_post.md
   │   ├─ 1_post.md
   │   ├─ n_post.md
   ├─ <...>
```

## Options

- `base: string`

## Config

- `title: string`
- `description: string`
- `url: string`
- `compile(x: string): string`
- `plugins: plugin[]`

## CLI

- `diz generate {id}`
  Generate urn id

## License

MIT

# diz

Static site generator with gulp

---

## File organization

```
└─ root
   ├─ site.config.js
   ├─ <category1>
   │  └─ <slug>
   │     └─ entry.{md,html}
   └─ <category2>
      └─ <slug>
         └─ entry.{md,html}
```

## Site config

- #### `site` {Object}
  - `name` {String}
    > specify site name
  - `description` {String}
    > specify site description
  - `url` {String}
    > specify site url
  - `lang` {String}
    > specity your lang
  - `locale` {String}
    > specity your locale
  - `image` {String}
    > specity site image
  - `copyright` {String}
    > specity copyright
  - `author` {String|Object}
    > specity author
  - `twitter` {String|Object}
    > specity twitter config
  - `facebook` {String|Object}
    > specity facebook config

- #### `frontmatter` {Object}
  - `<unique keys...>` {Object}
    - `default` {String|Function}
      > specify default value of this key
    - `required` {Boolean}
      > wheter to require
    - `basePath` {String}
      > specify new path, if you wanna change default path  
      default: plural of this key
    - `collection` {Boolean}
      > whether to collect
    - `colllectionFormat` {Function}
      > When specified, formatted value used actually

- #### `layout` {Object}
  - `root` {Function}
  - `head` {Function}
  - `bodyHead` {Function}
  - `bodyLoopHead` {Function}
  - `bodySingleHead` {Function}
  - `bodyFoot` {Function}
  - `bodyLoopFoot` {Function}
  - `bodySingleFoot` {Function}
  - `sidebarHead` {Function}
  - `sidebarFoot` {Function}
  - `loopHead` {Function}
  - `loopFoot` {Function}
  - `singleHead` {Function}
  - `singleFoot` {Function}

## Example

```js
gulp.task('diz', () => {
  diz('src/root').pipe(gulp.dest('local/'))
});
gulp.wask('watch', ['diz'], () => {
  gulp.watch('src/root/**/*.+(html|md|js)', ['diz']);
});
```

## API

- #### `diz`{Function}
  - `wd`{String}
  - `opts`{Object}
    - `compiler`{Function}
    - `orderEntries`{Function}
    - `orderCategories`{Function}
    - `order<CollectionName>`{Function}

## Features

todo

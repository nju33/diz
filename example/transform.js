import gulp from 'gulp';
import debug from 'gulp-debug';
// import Diz from 'diz-theme-minimalist';
// import CollectionPageGenerator from 'diz-plugin-collection-page-generator';
import Minimalist from 'diz-theme-minimalist';

import Diz from '../lib/diz';

const opts = {
  base: 'example'
};

const themeConfig = Diz.getTheme('diz-theme-minimalist');
console.log(themeConfig.getPath('jsx'));

Diz.load(opts).then(roots => {
  const renderer = new Diz({
    roots,
    theme: Minimalist,
    themeConfig
  });

  const a = renderer.render('base')
  a
    .pipe(debug())
    .pipe(gulp.dest('example/dist/'));
});

// const renderer = new Diz({
//   config: {
//     base: __dirname,
//     ignores: ['blog2', 'dist']
//   },
//   sites: {
//     blog: {
//       title: 'title',
//       description: 'description',
//       url: 'http://example.com'
//     },
//     blog3: {
//       title: 'title',
//       description: 'description',
//       url: 'http://example2.com'
//     }
//   },
//   plugins: [
//     new CollectionPageGenerator({pager: 1}),
//     new CollectionPageGenerator({collectionKey: 'categories', pager: 1})
//   ]
// });
//
// renderer.load().then(({render, bundle}) => {
//   render()
//     .pipe(debug())
//     .pipe(gulp.dest('example/dist/'));
//   bundle((err, stream) => {
//     if (err) {
//       console.log(err);
//       return;
//     }
//
//     return stream
//       .pipe(debug())
//       .pipe(gulp.dest('example/dist/'));
//   });
// });

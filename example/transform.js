import gulp from 'gulp';
import debug from 'gulp-debug';

import Diz from '../lib/diz';

const opts = {
  base: 'example'
};

Diz.load(opts).then(roots => {
  const renderer = new Diz({roots});

  renderer.render()
    .pipe(debug())
    .pipe(gulp.dest('example/dist/'));

  renderer.bundle('diz-theme-minimalist/theme').then(stream => {
    stream
      .pipe(debug())
      .pipe(gulp.dest('example/dist/'));
  });
});

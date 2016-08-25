import gulp from 'gulp';
import plumber from 'gulp-plumber';
import babel from 'gulp-babel';
import rename from 'gulp-rename';

{
  const src = 'src/**/*.babel.js';
  const dest = 'dist/';

  gulp.task('babel', () => {
    gulp.src(src)
      .pipe(plumber())
      .pipe(babel())
      .pipe(rename(path => {
        path.basename = path.basename.match(/^[^.]+/)[0];
      }))
      .pipe(gulp.dest(dest));
  });
}

{
  const src = 'src/**/*.babel.js';
  gulp.task('watch', ['babel'], () => {
    gulp.watch(src, ['babel']);
  });
}

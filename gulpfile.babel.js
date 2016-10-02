import gulp from 'gulp';
import util from 'gulp-util';
import plumber from 'gulp-plumber';
import sourcemaps from 'gulp-sourcemaps';
import babel from 'gulp-babel';
import execa from 'execa';
import browserSync from 'browser-sync';
import bsConfig from './bs-config';

const bs = browserSync.create();

gulp.task('babel', () => {
  gulp.src('lib/**/*.+(js|jsx)')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(babel())
    .on('error', err => {
      const {loc, stack} = err;
      util.log(`line: ${loc.line}, col: ${loc.column}, ${stack}`);
    })
    .pipe(gulp.dest('dist/'));
});

gulp.task('example', () => {
  try {
    execa.shell('yarn example')
      .then(result => {
        util.log(result.stdout);
      })
      .catch(err => {
        util.log(err.stderr);
      });
  } catch (err) {}
});

gulp.task('watch', ['babel', 'example'], () => {
  bs.init(bsConfig, () => {
    gulp.watch('lib/**/*.+(js|jsx)', ['babel', 'example']);
    gulp.watch('example/*.js', ['example']);
  });
});

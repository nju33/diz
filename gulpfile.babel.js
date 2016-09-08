import gulp from 'gulp';
import plumber from 'gulp-plumber';
import babel from 'gulp-babel';
import rename from 'gulp-rename';

gulp.task('babel', () => {
  gulp.src('src/**/*.babel.js')
    .pipe(plumber())
    .pipe(babel())
    .pipe(rename(path => {
      path.basename = path.basename.match(/^[^.]+/)[0];
    }))
    .pipe(gulp.dest('dist/'));
});

gulp.task('babel-json', () => {
  gulp.src('src/**/*.json').pipe(gulp.dest('dist/'));
});

gulp.task('watch', ['babel', 'babel-json'], () => {
  gulp.watch('src/**/*.babel.js', ['babel']);
  gulp.watch('src/**/*.json', ['babel-json']);
});

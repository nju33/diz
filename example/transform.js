import gulp from 'gulp';
import debug from 'gulp-debug';
import Diz from 'diz-theme-minimalist';
import CollectionPageGenerator from 'diz-plugin-collection-page-generator';

const renderer = new Diz({
  config: {
    base: __dirname,
    ignores: ['blog2', 'dist']
  },
  sites: {
    blog: {
      title: 'title',
      description: 'description',
      url: 'http://example.com'
    },
    blog3: {
      title: 'title',
      description: 'description',
      url: 'http://example2.com'
    }
  },
  plugins: [
    new CollectionPageGenerator({pager: 1}),
    new CollectionPageGenerator({collectionKey: 'categories', pager: 1})
  ]
});

renderer.load().then(({render, bundle}) => {
  render()
    .pipe(debug())
    .pipe(gulp.dest('example/dist/'));
  bundle((err, stream) => {
    if (err) {
      console.log(err);
      return;
    }

    return stream
      .pipe(debug())
      .pipe(gulp.dest('example/dist/'));
  });
});

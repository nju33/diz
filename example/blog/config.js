const marked = require('marked');
const CollectionPageGenerator = require('diz-plugin-collection-page-generator');

module.exports = {
  title: 'blog',
  description: 'description',
  url: 'http://example.com/base',
  compile(contents) {
    return marked(contents);
  },
  plugins: [
    new CollectionPageGenerator({pager:1}),
    new CollectionPageGenerator({pager:1, target: 'categories'})
  ]
};

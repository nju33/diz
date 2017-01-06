const Renderer = require('diz-theme-minimalist');
const CollectionPageGenerator = require('diz-plugin-collection-page-generator');
const marked = require('marked');

module.exports = {
  title: 'blog',
  description: 'description',
  url: 'http://example.com/base',
  theme: {
    Renderer,
    config: {}
  },
  compile(contents) {
    return marked(contents);
  },
  plugins: [
    new CollectionPageGenerator({pager: 1}),
    new CollectionPageGenerator({pager: 1, target: 'categories'})
  ]
};

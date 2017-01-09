const Renderer = require('diz-theme-minimalist');
const CollectionPageGenerator = require('diz-plugin-collection-page-generator');
const AtomFeed = require('diz-plugin-atom-feed');
const marked = require('marked');

module.exports = {
  id: 'urn:uuid:b3af7780-d5a5-11e6-bf38-dfb9af9b5ac6',
  title: 'blog',
  description: 'description',
  url: 'http://example.com/base',
  author: 'nju33',
  theme: {
    Renderer,
    config: {}
  },
  compile(contents) {
    return marked(contents);
  },
  plugins: [
    new CollectionPageGenerator({pager: 1}),
    // new CollectionPageGenerator({pager: 1, target: 'categories'}),
    new AtomFeed()
  ]
};

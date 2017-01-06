const Renderer = require('diz-theme-minimalist');
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
  }
};

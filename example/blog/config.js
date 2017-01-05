const marked = require('marked');

module.exports = {
  title: 'blog',
  description: 'description',
  url: 'http://example.com/base',
  compile(contents) {
    return marked(contents);
  }
};

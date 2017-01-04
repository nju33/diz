require('babel-register')({extends: './.babelrc'});
module.exports = require('./dist/renderer').default;

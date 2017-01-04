require('babel-register')({extends: './.babelrc'});
module.exports = require('./dist/theme').default;

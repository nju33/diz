const uuid = require('uuid/v1');

module.exports = () => {
  console.log(`urn:uuid:${uuid()}`);
};

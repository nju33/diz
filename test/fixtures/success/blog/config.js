import Renderer from 'diz-theme-minimalist';
import sinon from 'sinon';

const stub = sinon.stub();
const spy = sinon.spy();

stub.returns('aiueo');

module.exports = {
  stub,
  spy,
  name: 'test',
  url: 'http://example.com',
  theme: {
    Renderer,
    config: {}
  },
  compile() {
    return stub();
  },
  plugins: [
    {
      process() {
        spy();
      }
    }
  ]
};

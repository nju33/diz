import test from 'ava';
import sinon from 'sinon';
import Directory from '../dist/directory';
import Root from '../dist/root';

test('getRootpaths', async t => {
  const matches = await Root.getRootpaths({base: './test/fixtures'});
  t.is(matches.length, 3);
});

test('getConf', async t => {
  const config = await Root.getConf(`${__dirname}/fixtures/success/blog/`);
  t.is(config.name, 'test');
});

test('constructor', async t => {
  const config = await Root.getConf(`${__dirname}/fixtures/success/blog/`);
  const root = new Root(`${__dirname}/fixtures/success/blog/`, config);
  root.postProcess();

  t.truthy(root.name);
  t.is(root.name, 'blog');
  t.truthy(root.path);
  t.truthy(root.absURL);
  t.is(root.absURL, '/');
  t.truthy(root.mainDirectory);
  t.true(root.mainDirectory instanceof Directory);
  t.truthy(root.directories);
  t.true(Array.isArray(root.directories));
});

test('plugins called', t => {
  const spy1 = sinon.spy();
  const spy2 = sinon.spy();
  const config = {
    url: 'http://example.com',
    plugins: [
      {
        process() {
          spy1();
        }
      },
      {
        process() {
          spy2();
        }
      }
    ]
  };
  const root = new Root(`${__dirname}/fixtures/success/blog/`, config);
  root.applyPlugins();

  t.true(spy1.called);
  t.true(spy2.called);
});

test('createDirectory', t => {
  const root = new Root(`${__dirname}/fixtures/success/blog/`, {
    url: 'http://example.com'
  });

  const dir = root.createDirectory('test', true);

  t.true(dir.renders);
  t.is(root.directories.length, 2);
  t.is(dir.root, root);
});

import path from 'path';
import test from 'ava';
import {spy} from 'sinon';
import Directory from '../lib/directory';

test.beforeEach(t => {
  t.context.dir = new Directory('blog', {
    sites: {
      blog: 'yes'
    },
    compiler(a) {
      return a;
    }
  });
});

test('site prop', t => {
  const {dir} = t.context;
  t.is(dir.site, 'yes');

  const dir2 = new Directory('', dir);
  t.is(dir2.site, 'yes');
});

test('getPosts', t => {
  const {dir} = t.context;
  dir.site = {};
  dir.site.url = 'a';
  dir.getPosts({
    base: path.join(__dirname, 'fixtures')
  }).then(() => {
    t.is(dir.posts.length, 3);
  });
});

test('renderPosts', t => {
  const {dir} = t.context;
  const render = spy();
  const toFile = spy();

  dir.posts = Array(3).fill({slug: 'a', render, toFile});
  dir.renderPosts();

  t.true(render.called);
  t.true(toFile.called);
  t.true(Object.prototype.hasOwnProperty.call(dir.posts[0], 'prev'));
  t.true(Object.prototype.hasOwnProperty.call(dir.posts[0], 'next'));
});

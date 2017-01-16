import path from 'path';
import test from 'ava';
import Root from '../dist/root';
import Directory from '../dist/directory';

test('load posts', async t => {
  const root = new Root(`${__dirname}/fixtures/success/blog/`, {
    url: 'http://example.com'
  });
  const posts = await Directory.load(root);

  t.is(posts.length, 3);
});

test('defualt constructor', t => {
  const name = 'test';
  const dir = new Directory({root, path, name});

  t.true(dir.renders);
});

test('createPost', t => {
  const name = 'test';
  const root = new Root('', {url: 'http://example.com'});
  const dir = new Directory({
    root,
    path,
    name
  });

  const type = 'LIST';
  const slug = 'test';
  const data = {};
  const contents = '';

  const post = dir.createPost({
    type,
    slug,
    data,
    contents
  });

  t.is(dir.posts.length, 1);
  t.is(post.root, root);
  t.is(post.directory, dir);
});

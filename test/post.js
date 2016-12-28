import test from 'ava';
import Post from '../lib/post';

test('currentPage is 1', t => {
  const post = new Post({
    site: {url: ''},
    compiler(a) {
      return a;
    }
  }, 'a', '', {}, 1);
  t.is(post.breadcrumb.length, 3);
});

test('currentPage is 2', t => {
  const post = new Post({
    site: {url: ''},
    compiler(a) {
      return a;
    }
  }, 'a', '', {}, 2);
  t.is(post.breadcrumb.length, 4);
});

test('interpretateName', t => {
  let post = new Post({
    site: {url: ''},
    compiler(a) {
      return a;
    }
  }, 'a:1', '', {}, 1);

  t.is(post.interpretateName.length, 1);

  post = new Post({
    site: {url: ''},
    compiler(a) {
      return a;
    }
  }, 'a:2', '', {}, 1);
  t.is(post.interpretateName.length, 2);
});

test('contentsBeginning', t => {
  const post = new Post({
    site: {url: ''},
    compiler(a) {
      return a;
    }
  }, 'a:2', `
test

<!-- break -->

test
  `.trim(), {}, 1);

  t.is(post.contentsBeginning.trim(), 'test');
});

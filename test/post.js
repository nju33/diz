import test from 'ava';
import marked from 'marked';
import Root from '../dist/root';
import Directory from '../dist/directory';
import Post from '../dist/post';

test.beforeEach(t => {
  const root = new Root('foo/bar', {
    url: 'http://example.com',
    compile(contents) {
      return marked(contents);
    }
  });
  const directory = new Directory({name: 'hoge'});
  t.context.post = new Post({
    root,
    directory,
    type: 'POST',
    slug: 'test',
    data: {},
    contents: 'aiueo'
  });
});

test('compile', async t => {
  const {post} = t.context;
  await post.compile();

  t.is(post.absURL, '/hoge/test/');
  t.is(post.original, 'aiueo');
  t.is(post.contents, '<p>aiueo</p>\n');
  t.is(post.contentsBeginning, post.contents);

  t.is(post.id, 'bar:hoge:test');
});

test('getContentsBeginning', t => {
  const {post} = t.context;

  const beginning = post.getContentsBeginning(marked(`
aiueo

<!--break-->

kakiku
  `.trim()));

  t.is(beginning, '<p>aiueo</p>');
});

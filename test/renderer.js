import path from 'path';
import test from 'ava';
import {Diz} from '..';

test.beforeEach(t => {
  t.context.renderer = new Diz({
    config: {
      base: path.join(__dirname, 'fixtures/')
    },
    sites: {
      blog: {
        title: 'test',
        description: 'test',
        url: 'http://example.com'
      }
    }
  });
});

test('State after load', async t => {
  const {renderer} = t.context;
  renderer.load().then(() => {
    t.is(renderer.dirs.length, 1);
    t.is(renderer.dirs[0].name, 'blog');
    t.is(renderer.dirs[0].posts.length, 1);
    t.is(renderer.dirs[0].posts[0].title, 'test');
    t.is(renderer.dirs[0].posts[0].contents, '<p>test</p>\n');
    t.is(renderer.dirs[0].posts[0].absURL, '/posts/a/');
    t.is(renderer.dirs[0].posts[0].url, 'http://example.com/posts/a/');
  });
});

import test from 'ava';
import es from 'event-stream';
import Vinyl from 'vinyl';
import pIsPromise from 'p-is-promise';
import Diz from '../dist/diz';

test('throw when not found config.js', async t => {
  const err = await t.throws(Diz.load({
    base: './test/fixtures/failure/'
  }));
  t.regex(err.message, /Target directory is missing/);
});

test('not throw when found config.js and it ends normally', async t => {
  const roots = await Diz.load({
    base: './test/fixtures/success/'
  });
  const renderer = new Diz({roots});
  const dir = roots[0].mainDirectory;

  t.is(roots.length, 1);
  t.truthy(roots[0].getSibling);
  t.is(renderer.roots.length, 1);
  t.is(dir.posts.length, 3);
});

test('getSibling', async t => {
  const roots = await Diz.load({
    base: './test/fixtures/success/'
  });
  const renderer = new Diz({roots});

  renderer.roots[0].mainDirectory.posts[0].data.ref = 'blog2';
  renderer.roots.push({
    name: 'blog2',
    config: {
      url: 'http://foo.com'
    }
  });

  t.is(typeof roots[0].getSibling('blog2'), 'object');
  t.is(typeof roots[0].getSibling('blog9'), 'undefined');
});

test('render method', async t => {
  const roots = await Diz.load({
    base: './test/fixtures/success/'
  });
  const renderer = new Diz({roots});
  const stream = renderer.render();

  const spy = renderer.roots[0].config.spy;
  t.true(spy.called);

  const post = renderer.roots[0].mainDirectory.posts[0].contents;
  t.is(post, 'aiueo');

  stream.pipe(es.through(file => {
    t.regex(file.history[0], /blog\/posts\/(?:a|b|c)\/index\.html/);
    t.true(Vinyl.isVinyl(file));
  }));
});

test('bundle method', async t => {
  const roots = await Diz.load({
    base: './test/fixtures/success/'
  });
  const renderer = new Diz({roots});
  const promise = renderer.bundle();
  t.true(pIsPromise(promise));

  const stream = await promise;
  t.true(stream.readable);
  stream.pipe(es.through(file => {
    t.is(file.history[0], 'blog/scripts/bundle.js');
    t.true(Vinyl.isVinyl(file));
  }));
});

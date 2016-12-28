import path from 'path';
import test from 'ava';
import {getMatter, getSlug} from '../lib/helpers';

test('getMatter', async t => {
  const matter = await getMatter(
    path.join(__dirname, 'fixtures/blog/a.md')
  );

  t.is(matter.data.title, 'test');
});

test('getSlug', t => {
  const result = getSlug('aaa_iii');
  t.is(result, 'iii');
});

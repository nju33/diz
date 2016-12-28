import {debuglog} from 'util';
import path from 'path';
import Vinyl from 'vinyl';
import glob from 'glob';
import Post from './post';
import {getMatter, getSlug} from './helpers';

const directorylog = debuglog('directory');

export default class Directory {
  constructor(name, {config, sites, site, compiler, theme}) {
    this.name = name;
    this.config = config;
    this.site = (() => {
      try {
        return sites[this.name];
      } catch (err) {
        return site || sites[Object.keys(sites)[0]];
      }
    })();
    this.compiler = compiler;
    this.theme = theme;
    this.posts = [];
  }

  getPosts({base}) {
    return new Promise((resolve, reject) => {
      const postFileGlob = path.join(base, this.name, '**/*.md');
      directorylog('glob pattern: ' + postFileGlob);
      glob(postFileGlob, (err, matches) => {
        directorylog('matches post: ' + matches);
        if (err) {
          return reject(err);
        } else if (matches.length === 0) {
          return reject(new Error(`No post in ${this.name}`));
        }

        Promise.all(matches.map(async match => {
          const matter = await getMatter(match);
          const slug = getSlug(match);
          return new Post(this, `posts:${slug}`, matter.content, matter.data);
        })).then(posts => {
          this.posts = posts;
          resolve();
        });
      });
    });
  }

  createFile(filepath, contents) {
    return new Vinyl({
      path: filepath,
      contents: Buffer.from(contents)
    });
  }

  renderPosts(type, overrideProps = {}) {
    const files = this.posts.reduce((result, post, idx) => {
      post.prev = this.posts[idx - 1];
      post.next = this.posts[idx + 1];
      const renderred = post.render(type, overrideProps);
      const file = post.toFile(renderred);
      result.push(file);
      return result;
    }, []);
    return files;
  }
}

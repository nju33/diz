import path from 'path';
import glob from 'glob';
import Post from './post';
import {getMatter, getSlug} from './helpers';

export default class Directory {
  static async load(root) {
    const matches = await this.getPostpaths(root.path);
    const reversed = matches.reverse();
    const posts = await Promise.all(reversed.map(async (match, idx) => {
      const matter = await getMatter(match);
      const slug = getSlug(match);
      const post = new Post({
        root,
        directory: root.mainDirectory,
        slug,
        data: Object.assign(matter.data, {
          page: idx + 1
        }),
        contents: matter.content
      });

      await post.compile();
      return post;
    }));
    return posts;
  }

  static getPostpaths(targetpath) {
    const postPattern = path.join(targetpath, '**/*.md');
    return new Promise((resolve, reject) => {
      glob(postPattern, (err, matches) => {
        if (err) {
          return reject(err);
        }
        resolve(matches);
      });
    });
  }

  constructor({root, path, name = '', renders = true}) {
    this.root = root;
    this.path = path;
    this.name = name;
    this.renders = renders;
    this.posts = [];
  }

  isRenders() {
    return Boolean(this.renders);
  }

  createPost({type, slug = '', data = {}, contents = ''}) {
    const post = new Post({
      root: this.root,
      directory: this,
      type,
      slug,
      data,
      contents
    });
    this.posts.push(post);
    return post;
  }
}

import {debuglog} from 'util';
import path from 'path';
import glob from 'glob';
import Post from './post';
import {getMatter, getSlug} from './helpers';

const directorylog = debuglog('directory');

export default class Directory {
  static async load(rootInstance) {
    const matches = await this.getPostpaths(rootInstance.path);
    const posts = await Promise.all(matches.map(async match => {
      const matter = await getMatter(match);
      const slug = getSlug(match);
      const post = new Post({
        rootInstance,
        directory: rootInstance.mainDirectory,
        slug,
        data: matter.data,
        contents: matter.content
      });
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

  constructor({rootInstance, path, name = '', renders = true}) {
    this.root = rootInstance;
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
      rootInstance: this.root,
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

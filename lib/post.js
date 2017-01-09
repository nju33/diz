import url from 'url';
import path from 'path';
import pick from 'lodash.pick';
import compact from 'lodash.compact';
import Vinyl from 'vinyl';
import {decorate} from 'core-decorators';
import memoize from 'lodash.memoize';

export default class Post {
  static omitData(post) {
    post.root = pick(post.root, 'config');
    post.directory = pick(post.directory, ['name', 'posts']);
    return post;
  }

  constructor({
    rootInstance,
    directory,
    type = 'POST',
    slug = '',
    data = {},
    contents = ''
  }) {
    this.type = type;
    this.root = rootInstance;
    this.directory = directory;
    this.slug = slug;
    this.data = data;
    this.contents = this.original = contents;
    if (typeof this.root.config.compile === 'function') {
      this.contents = this.root.config.compile(contents);
    }
    this.contents = this.getContentsBeginning(contents);
    const urlParsed = url.parse(this.root.config.url);
    urlParsed.pathname = path.join(...compact([
      urlParsed.pathname,
      this.directory.name,
      this.slug,
      this.data.page ? this.data.page === 1 ? '' : String(this.data.page) : '',
      '/'
    ]));
    this.url = url.format(urlParsed);
    this.absURL = this.url.replace(/https?:\/\/.+?\//, '/');
  }

  get id() {
    return `${this.root.name}:${this.directory.name}:${this.slug}`;
  }

  getContentsBeginning() {
    const match = this.contents.match(/<!--\s*break\s*-->/);
    if (!match) {
      return this.contents;
    }
    return this.contents.slice(0, match.index - 1);
  }
}

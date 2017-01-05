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
    post.directory = pick(post.directory, 'posts');
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

    // this.breadcrumb = [
    //   {
    //     name: 'home',
    //     id: '/'
    //   },
    //   {
    //     name: this.interpretateName[0],
    //     fake: true,
    //     id: path.join('/', this.interpretateName[0], '/')
    //   },
    //   {
    //     name: this.title,
    //     id: this.absURL
    //   }
    // ];
    // if (currentPage > 1) {
    //   this.breadcrumb.push({
    //     name: `page${currentPage}`,
    //     id: path.join(this.absURL, '/')
    //   });
    // }
  }

  // get interpretateName() {
  //   const splitted = this.slug.split(':');
  //   if (splitted[splitted.length - 1] === '1') {
  //     splitted.pop();
  //   }
  //   return splitted;
  // }
  //
  // get filepath() {
  //   return path.join(...[
  //     ...this.dir.name.split(':'),
  //     ...this.interpretateName,
  //     'index.html'
  //   ]);
  // }

  getContentsBeginning() {
    const match = this.contents.match(/<!--\s*break\s*-->/);
    if (!match) {
      return this.contents;
    }
    return this.contents.slice(0, match.index - 1);
  }

  // render() {
  //   return this.root.Theme.renderToString(Object.assign({
  //     config: this.root.config,
  //     post: this,
  //   }));
  // }

  // render(type, overrideProp) {
  //   const props = Object.assign({}, {
  //     type,
  //     site: this.dir.site,
  //     posts: this.dir.posts
  //   }, overrideProp, this);
  //   return this.dir.theme.renderToString(props);
  // }
  // @decorate(memoize)
  // toFile(contents) {
  //   return new Vinyl({
  //     path: this.filepath,
  //     contents: Buffer.from(contents)
  //   });
  // }
}

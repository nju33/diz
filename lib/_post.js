import url from 'url';
import path from 'path';
import Vinyl from 'vinyl';
import {decorate} from 'core-decorators';
import memoize from 'lodash.memoize';

export default class Post {
  constructor(dir, slug, contents = '', frontmatter, currentPage = 1) {
    this.dir = dir;
    this.slug = slug;
    this.contents = this.dir.compiler(contents);
    this.contentsBeginning = this.getContentsBeginning(this.contents);
    this.frontmatter = frontmatter;

    this.title = this.frontmatter.title;
    this.description = this.frontmatter.description;

    this.absURL = path.join('/', ...this.interpretateName, '/');
    this.url = url.resolve(this.dir.site.url, this.absURL);

    this.breadcrumb = [
      {
        name: 'home',
        id: '/'
      },
      {
        name: this.interpretateName[0],
        fake: true,
        id: path.join('/', this.interpretateName[0], '/')
      },
      {
        name: this.title,
        id: this.absURL
      }
    ];

    if (currentPage > 1) {
      this.breadcrumb.push({
        name: `page${currentPage}`,
        id: path.join(this.absURL, '/')
      });
    }
  }

  get interpretateName() {
    const splitted = this.slug.split(':');
    if (splitted[splitted.length - 1] === '1') {
      splitted.pop();
    }
    return splitted;
  }

  get filepath() {
    return path.join(...[
      ...this.dir.name.split(':'),
      ...this.interpretateName,
      'index.html'
    ]);
  }

  getContentsBeginning() {
    const match = this.contents.match(/<!--\s*break\s*-->/);
    if (!match) {
      return this.contents;
    }
    return this.contents.slice(0, match.index - 1);
  }

  render(type, overrideProp) {
    const props = Object.assign({}, {
      type,
      site: this.dir.site,
      posts: this.dir.posts
    }, overrideProp, this);
    return this.dir.theme.renderToString(props);
  }

  @decorate(memoize)
  toFile(contents) {
    return new Vinyl({
      path: this.filepath,
      contents: Buffer.from(contents)
    });
  }
}

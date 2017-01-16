import url from 'url';
import path from 'path';
import pick from 'lodash.pick';
import omit from 'lodash.omit';
import compact from 'lodash.compact';
import pIsPromise from 'p-is-promise';

const wm = new WeakMap();

export default class Post {
  constructor({
    root,
    directory,
    type = 'POST',
    slug = '',
    data = {},
    contents = ''
  }) {
    this.type = type;
    this.slug = slug;
    this.data = data;
    this.original = contents;
    const urlParsed = url.parse(root.config.url);
    urlParsed.pathname = path.join(...compact([
      urlParsed.pathname,
      directory.name,
      this.slug,
      (page => {
        if (directory.name === 'posts') {
          return '';
        }
        return page ? page === 1 ? '' : String(page) : '';
      })(this.data.page),
      '/'
    ]));
    this.url = url.format(urlParsed);
    this.absURL = this.url.replace(/https?:\/\/.+?\//, '/');

    wm.set(this, {
      root,
      directory
    });
  }

  get id() {
    return `${this.root.name}:${this.directory.name}:${this.slug}`;
  }

  get root() {
    return wm.get(this).root;
  }

  get directory() {
    return wm.get(this).directory;
  }

  async compile() {
    this.contents = this.original;
    if (typeof this.root.config.compile === 'function') {
      this.contents = this.root.config.compile(this.original);
      if (pIsPromise(this.contents)) {
        this.contents = await this.contents;
      }
    }
    this.contentsBeginning = this.getContentsBeginning(this.contents);
  }

  // Circular avoidance
  formatData() {
    return Object.assign({}, this, {
      root: {
        absURL: this.root.absURL,
        mainDirectory: pick(Object.assign({}, this.root.mainDirectory), [
          'name',
          'posts'
        ]),
        config: omit(Object.assign({}, this.root.config), [
          'compile',
          'theme',
          'plugins'
        ])
      },
      directory: pick(this.directory, ['name', 'posts'])
    });
  }

  dropCircular() {
    return pick(this, [
      'type',
      'slug',
      'data',
      'original',
      'contents',
      'contentsBeginning',
      'url',
      'absURL'
    ]);
  }

  getContentsBeginning(contents) {
    const match = contents.match(/<!--\s*break\s*-->/);
    if (!match) {
      return contents;
    }
    return contents.slice(0, match.index - 1);
  }
}

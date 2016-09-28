import _ from 'lodash';
import pluralize from 'pluralize';

export default class Collection {
  constructor(frontmatter, initList) {
    this.frontmatter = frontmatter;
    this.list = initList;

    this.path = _.memoize(this._path);
    this.prefixPath = _.memoize(this._prefixPath);
  }

  add(name, matter) {
    const data = _.get(matter, `data.${name}`);
    if (_.isArray(data)) {
      for (const item of _.flatten(data)) {
        this.update(this.path({name, item}), matter);
      }
    } else {
      !_.isNil(data) ?
        this.update(this.path({name, item: data}), matter) :
        this.update(this.path({name}), matter);
    }
  }

  _path({name, item}) {
    let path = this.prefixPath(name);
    if (!_.isNil(item)) {
      path = this.suffixPath(path, name, item);
    }
    return path;
  }

  _prefixPath(name) {
    const basePath = _.get(this.frontmatter, `${name}.basePath`);
    return !_.isNil(basePath) && basePath || pluralize(name);
  }

  suffixPath(currentPath, name, item) {
    const format = _.get(this.frontmatter, `${name}.collectionFormat`);
    if (_.isFunction(format)) {
      return `${currentPath}.${format(item)}`;
    } else {
      return `${currentPath}.${item}`;
    }
  }

  update(path, matter) {
    _.update(this.list, path, val => {
      return _.isNil(val) ? [matter] : _.concat(val, [matter]);
    });
  }

  getEntryComponents(t) {
    return _.reduce(this.frontmatter, (components, data, name) => {
      if (!Boolean(_.get(data, 'collection'))) {
        return components;
      }

      _.set(components, name, t`single:collection`({
        name,
        basePath: _.get(data, 'basePath', name)
      }));
      return components;
    }, {});
  }

  getSidebarComponents(t, {
    templateUrl,
    templateTitle,
    templateCount
  }) {
    return _.reduce(this.frontmatter, (components, data, name) => {
      if (!Boolean(_.get(data, 'collection'))) {
        return components;
      }

      _.set(components, name, t`sidebar:section`({
        headline: _.get(data, 'headline') || name,
        list: (() => {
          const basePath = _.get(data, 'basePath');
          return !_.isNil(basePath) ?
                   this.list[basePath] :
                   this.list[name];
        })(),
        templateUrl: templateUrl(_.get(data, 'basePath', name)),
        templateTitle,
        templateCount
      }));
      return components;
    }, {});
  }
}

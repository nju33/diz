import path from 'path';
import _ from 'lodash';
import chalk from 'chalk';
import grayMatter from 'gray-matter';

export default class DizMatter {
  static parseDir(wd, filePath, workingDir) {
    const pathArr = path.dirname(filePath).split(path.sep);
    const splited = wd.split('/');
    const len = pathArr.length;
    const name = pathArr[len - 1] !== workingDir ? pathArr[len - 1] : null;
    const category = pathArr[len - 2] !== workingDir ? pathArr[len - 2] : null;
    return [(_.includes(splited, category) ? null : category), name];
  }

  constructor(wd, {workingDir, filepath, compiler, config}) {
    const parsed = DizMatter.parseDir(wd, filepath, workingDir);
    const {site, frontmatter} = config;
    const matter = grayMatter.read(filepath);

    this.id = _.uniqueId();
    this.data = matter.data;
    this.data.name = parsed[1];
    this.data.category = parsed[0] || null;
    this.data.url = `/entries/${this.data.name}`;
    this.data.fullUrl = path.join(site.url, this.data.url);
    if (_.isFunction(compiler)) {
      this.content = compiler(matter.content);
    } else {
      this.content = matter.content;
    }
    this.collectionNames = ['entry'];
    this.warning = [];

    this.format = (() => {
      const format = name => {
        const _format = _.get(frontmatter, `${name}.collectionFormat`);
        if (!_.isNil(_format) && _.isFunction(_format)) {
          return _format(_.get(this.data, `${name}`));
        } else {
          return name;
        }
      }
      return _.memoize(format);
    })();

    if (!_.isNil(this.data.category)) {
      this.collectionNames.push('category');
    }
    _.forEach(frontmatter, (data, key) => {
      const collection = _.get(frontmatter, `${key}.collection`)
      if (!_.has(matter.data, key) && _.get(data, 'required')) {
        this.warning.push({
          message: `${key} was required.`,
          filepath: (() => {
            const cwd = `${_.get(process.env, 'INIT_CWD', process.env.PWD)}/`;
            return matter.path.replace(new RegExp(_.escapeRegExp(cwd)), '');
          })()
        });
      } else if (!_.isNil(matter.data[key]) && collection) {
        this.collectionNames.push(key);
      }
    });

    this.beginning = this.content;
    const beginningMatches = this.content.match(/([\s\S]*)<!-- more -->/);
    if (beginningMatches !== null) {
      this.beginning = beginningMatches[1];
    }
  }

  // clone() {
  //   const cloned = Object.assign({}, this);
  //   cloned.data = Object.assign({}, this.data);
  //   return cloned;
  // }

  hasWarning() {
    return Boolean(this.warning.length);
  }

  showWarning(sitename) {
    _.forEach(this.warning, w => {
      const labelText = ` diz : ${sitename} `;
      const label = `${chalk.black.bold.bgYellow(labelText)}`;
      const message = chalk.yellow(w.message);
      const filepath = `${chalk.white.underline(' ' + w.filepath + ' ')}`;
      console.log(`${label} ${message} ${filepath}`);
    });
  }
}

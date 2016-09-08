import path from 'path';
import _ from 'lodash';
import grayMatter from 'gray-matter';

export default class DizMatter {
  constructor(workingDir, filePath, compiler) {
    const matter = grayMatter.read(filePath);
    if (!filePath.endsWith('/')) {
      filePath += '/';
    }
    const parsed = parseDir(filePath, workingDir);
    matter.data.category = parsed[0];
    matter.data.name = parsed[1];

    if (!_.has(matter.data, 'tags')) {
      matter.data.tags = [];
    }

    if (!_.has(matter.data, 'date')) {
      matter.data.date = null;
    }

    this.id = _.uniqueId();
    this.data = matter.data;
    this.content = compiler()(matter.content);

    this.beginning = this.content;
    const beginningMatches = this.content.match(/([\s\S]+)<!-- more -->/);
    if (beginningMatches !== null) {
      this.beginning = beginningMatches[1];
    }
  }
}

function parseDir(filePath, workingDir) {
  const pathArr = path.dirname(filePath).split(path.sep);
  const len = pathArr.length;
  const name = pathArr[len - 1] !== workingDir ? pathArr[len - 1] : null;
  const category = pathArr[len - 2] !== workingDir ? pathArr[len - 2] : null;
  return [category, name];
}

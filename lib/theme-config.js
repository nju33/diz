import path from 'path';

export default class ThemeConfig {
  constructor({_path, data}) {
    this.path = _path;
    this.data = data;
  }

  getPath(keyname) {
    try {
      return path.join(this.path, this.data[keyname]);
    } catch (err) {
      throw new Error(err);
    }
  }
}

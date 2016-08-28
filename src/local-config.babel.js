import fs from 'fs';
import path from 'path';

export default {
  get(wd) {
    try {
      return require(path.resolve(wd, 'diz.config'));
    } catch (err) {
      console.log(err);
    }
  }
};

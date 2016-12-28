import fs from 'fs';
import path from 'path';
import glob from 'glob';
import grayMatter from 'gray-matter';

export function getFiles(dirpath) {
  return new Promise((resolve, reject) => {
    const globPattern = path.join(dirpath, '*.*');
    glob(globPattern, (err, matches) => {
      if (err) {
        return reject(err);
      }
      resolve(matches);
    });
  });
}

export function getMatter(filepath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, 'utf-8', (err, content) => {
      if (err) {
        return reject(err);
      }
      resolve(grayMatter(content));
    });
  });
}

export function getName(filepath) {
  const extname = path.extname(filepath);
  const name = path.basename(filepath, extname);
  return name;
}

export function getSlug(filepath) {
  const name = getName(filepath);
  if (/_/.test(name)) {
    return name.replace(/^[^_]*_*/, '');
  }
  return name;
}

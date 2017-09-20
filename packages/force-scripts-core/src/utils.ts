import path = require('path');

export function transformFileListToEntry(
  basePath: string,
  fileList: fileList,
  opts?: {
    callbackEntry: (name: string, fileList: string[]) => string[];
  }
): Entry {
  return fileList.reduce((entry: Entry, filePath) => {
    const name = stripExt(path.relative(basePath, filePath));
    entry[name] = ([] as string[]).concat(fileList);
    if (opts && opts.callbackEntry) {
      entry[name] = opts.callbackEntry(name, entry[name]);
    }

    return entry;
  }, {});
}

export function stripExt(filename: string): string {
  const pathObj = path.parse(filename);
  return path.join(pathObj.dir, pathObj.name);
}

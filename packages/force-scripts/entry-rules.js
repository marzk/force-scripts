const glob = require('glob');
const path = require('path');

class EntryRules {
  constructor(rules) {
    this.rawRules = [].concat(rules);
    this.rules = this.rawRules.map(rawRule => new EntryRule(rawRule));
  }

  getFileList() {
    return this.rules.reduce(
      (fileList, rule) => fileList.concat(rule => rule.getFileList()),
      []
    );
  }
}

class EntryRule {
  constructor(rawRule, { workdir = process.cwd() } = {}) {
    this.rawRule = [].concat(rawRule);
    this.workdir = workdir;
  }

  // 将多余数组拍平以做兼容
  init() {
    this.rawRule = this.flattenArray(this.rawRule);
  }

  // String -> glob//relative path
  // Function
  getFileList() {
    return this.rawRule.reduce((fileList, fileRule) => {
      const type = this.getType(fileRule);
      switch (type) {
        case 'String':
          // 遇字符串则视为产生FileList
          return fileList.concat(glob.sync(this.workdir, fileRule));
        case 'Function':
          // 遇函数则视为处理已产生的FileList，并取函数返回后数据(返回数据须为数组)
          const result = fileRule(fileList);
          if (!Array.isArray) {
            throw new Error(
              `函数处理后返回的数据不为数组, ${result} \n ${fileRule.toString()}`
            );
          }
          return result;
        case 'RegExp':
          // 过滤
          return fileList.filter(file => fileRule.test(file));
        default:
          throw new Error(
            `EntryRule不接收非String, Function的格式, ${fileRule} ${type}`
          );
      }
    }, []);
  }

  getType(variable) {
    return Object.prototype.toString.call(variable).slice(8, -1);
  }

  flattenArray(arr) {
    const result = [];
    flatten(arr);
    return result;

    function flatten(a) {
      if (Array.isArray(a)) {
        return a.forEach(k => flatten(k));
      }

      result.push(a);
    }
  }
}

module.exports = {
  default: EntryRules,
  EntryRule,
  EntryRules,
};

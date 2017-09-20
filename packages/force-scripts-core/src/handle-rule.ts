import path = require('path');
import glob = require('glob');

const ROOT = process.cwd();

export default function handleRule(
  rules: Rule,
  opts: {
    basePath: string;
  }
): fileList {
  rules = ([] as any[]).concat(rules);

  return rules.reduce((fileList: string[], rule: Rule) => {
    switch (Object.prototype.toString.call(rule)) {
      case '[object String]':
        return fileList.length === 0
          ? glob.sync(path.resolve(ROOT, opts.basePath, rule))
          : fileList.filter(p => p.indexOf(rule) > -1);
      case '[object Regex]':
        return fileList.filter(p => rule.test(p));
      case '[object Function]':
        return rule(fileList);
      case '[object Array]':
        return fileList.concat(handleRule(rule, opts));
      default:
        console.error(rule, '错误的规则');
        process.exit(1);
    }
  }, []);
}

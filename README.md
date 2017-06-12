# force-scripts

取force.config.js，若为数组则生成中间件、目标文件和manifest.json。

## Instruction

```

// 服务端
app.use(require('force-scripts/middleware'));

// deploy
// package.json scripts
force-scripts build

```

## config

```
{
  src: string,
  dest: string,
  entryRules: glob | string | regex | function | [],
  publicPath: string,
  libEntry: string,
  babel: object,
}
```

## getStaticFromEntry 

```
{
  js: [],
  css: [],
  files: [],
}
```

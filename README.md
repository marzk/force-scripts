# force-scripts

取`force.config.js`，若为数组则生成中间件、目标文件和manifest.json。

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
  entryCb: function :: (name, entry) => entry,
  publicPath: string,
  libEntry: string,
  disableLoaders: bool,
  ...rest
}
```

* `disableLoaders`用于去除默认配置自带的loader

### entryRules

entryRules一共接收四种形式的entry

* `string` 直接定位至某文件
* `glob` 根据glob规则返回文件列表，相对路径`config.src`
* `regex` 根据已有的文件列表进行过滤
* `function:: files => files` 传入当前文件列表，返回处理后的文件列表
* `array` 递归以上流程

建议用法为先使用`glob`过滤出相应的文件，再逐一处理

处理后的entry的key为相对于`config.src`的相对路径，value则为对应的数组，key不能改变，value可通过entryCb进行改变

### rest

多余的配置都会传入当做webpack的配置文件使用，基于`webpack-merge`

## getStaticFromEntry 

在中间件中直接使用`this.getStaticFromEntry`获取以下数据格式

```
{
  js: [],
  css: [],
}
```

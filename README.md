# iconfont-spanner

> 将本地 svg 文件转化为 iconfont

## 安装

```sh
npm i -D iconfont-spanner
```

## 使用

1. 项目根目录新建配置文件 `iconfont-spanner.config.js`

    1. 需配置 svg 资源文件夹路径
    2. 需配置资源输出信息
        1. 字体名称
        2. svg 组件生成规则（支持是否清除 svg 颜色）

2. 开启服务 `npx iconfont-spanner`，服务访问地址将在终端显示，打开地址可对图标进行编辑删除，重新生成 iconfont 操作。

## 配置说明

1. 只生成字体

```javascript
const path = require("path");
const { getSvgTSReactComponentContent, toBigCamelCase } = require("iconfont-spanner");

/** @type {import('iconfont-spanner').FontManagerOption} */
module.exports = {
    resourceDir: path.join(__dirname, "src/assets/svgs"),
    output: {
        dir: path.join(__dirname, "src/assets/font"),
        fontName: "iconfont",
    },
};
```

2. 只生成组件，这里以 react 组件为例，svg 颜色将清楚，只会继承 `font-color`

```javascript
const path = require("path");
const { getSvgTSReactComponentContent, toBigCamelCase } = require("iconfont-spanner");

/** @type {import('iconfont-spanner').FontManagerOption} */
module.exports = {
    resourceDir: path.join(__dirname, "src/assets/svgs"),
    output: {
        dir: path.join(__dirname, "src/assets/font"),
        component: {
            dir: "react-components", // 输出目录，相对 output.dir 的相对路径
            fileName: fileName => `Svg${toBigCamelCase(fileName)}.tsx`, // 组件文件名称
            name: fileName => `Svg${toBigCamelCase(fileName)}`, // 组件名称
            content: getSvgTSReactComponentContent, // 可自定义 svg 组件内容，实现方式可查看源码，非常简单
        },
    },
};
```

3. 只生成组件，这里以 react 组件为例，保留 svg 颜色

```javascript
const path = require("path");
const { getSvgTSReactComponentContent, toBigCamelCase } = require("iconfont-spanner");

/** @type {import('iconfont-spanner').FontManagerOption} */
module.exports = {
    resourceDir: path.join(__dirname, "src/assets/svgs"),
    output: {
        dir: path.join(__dirname, "src/assets/font"),
        component: {
            dir: "react-components", // 输出目录，相对 output.dir 的相对路径
            fileName: fileName => `Svg${toBigCamelCase(fileName.replace(/_oc$/, "_OC"))}.tsx`, // 组件文件名称
            name: fileName => `Svg${toBigCamelCase(fileName.replace(/_oc$/, "_OC"))}`, // 组件名称
            content: getSvgTSReactComponentContent,
            fillCurrentColor: fileName => !fileName.endsWith("_oc"), // 文件名以 _oc 结尾的 svg 组件不清除颜色，如：icon_oc.svg
        },
    },
};
```

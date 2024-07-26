# iconfont-spanner

> 将本地 svg 文件转化为 iconfont 或 svg 组件

## 安装

```sh
npm i -D iconfont-spanner
```

## 使用

1. 项目根目录新建配置文件 `iconfont.config.js`
2. 执行 `npx iconfont` 启动本地服务，访问地址将在终端显示，打开地址可对图标进行编辑删除，重新生成 iconfont 操作。

## 配置说明

1. 只生成字体

```javascript
const path = require("path");
const fs = require("fs");
const prettier = require("prettier");
const { getSvgTSReactComponentContent, toBigCamelCase } = require("iconfont-spanner");

const formatCode = (code, parser) => {
    return prettier.format(code, { ...JSON.parse(fs.readFileSync(path.resolve(__dirname, ".prettierrc"))).toString(), parser });
};

/** @type {import('iconfont-spanner').FontManagerOption} */
module.exports = {
    resourceDir: path.join(__dirname, "src/assets/svgs"),
    output: {
        dir: path.join(__dirname, "src/assets/font"),
        // <---------------------
        font: {
            name: "iconfont",
            format: formatCode,
        },
    },
};
```

2. 只生成组件，这里以 react 组件为例

```javascript
const path = require("path");
const fs = require("fs");
const prettier = require("prettier");
const { getSvgTSReactComponentContent, toBigCamelCase } = require("iconfont-spanner");

const formatCode = (code, parser) => {
    return prettier.format(code, { ...JSON.parse(fs.readFileSync(path.resolve(__dirname, ".prettierrc"))).toString(), parser });
};

/** @type {import('iconfont-spanner').FontManagerOption} */
module.exports = {
    resourceDir: path.join(__dirname, "src/assets/svgs"),
    output: {
        dir: path.join(__dirname, "src/assets/font"),
        // <---------------------
        component: {
            dir: "react-components", // 输出目录，相对 output.dir 的相对路径
            fileName: fileName => `Svg${toBigCamelCase(fileName)}.tsx`, // 组件文件名称
            name: fileName => `Svg${toBigCamelCase(fileName)}`, // 组件名称
            content: (...args) => formatCode(getSvgTSReactComponentContent(...args), "typescript"), // 组件代码内容, 并格式化
            fillCurrentColor: fileName => !fileName.endsWith("_oc"), // 文件名以 _oc 结尾的 svg 组件不清除颜色，如：icon_oc.svg
        },
    },
};
```

可自定义组件代码内容，已内置两个组件生成函数：

-   `getSvgTSReactComponentContent`,
-   `getSvgJSReactComponentContent`

```tsx
export const getSvgTSReactComponentContent = (name, svgString) => {
    return `
/* eslint-disable */

export interface ${name}Props extends React.SVGAttributes<SVGSVGElement> {}

export const ${name} = (props: ${name}Props) => {
	return (
		${svgString.replace(/<svg.+?>/gm, item => `${item.slice(0, item.length - 1)} {...props}>`)}
	)
};
`;
};
```

3. 检查图标在项目中的引用情况

```javascript
const path = require("path");
const fs = require("fs");
const prettier = require("prettier");
const { getSvgTSReactComponentContent, toBigCamelCase } = require("iconfont-spanner");

const formatCode = (code, parser) => {
    return prettier.format(code, { ...JSON.parse(fs.readFileSync(path.resolve(__dirname, ".prettierrc"))).toString(), parser });
};

/** @type {import('iconfont-spanner').FontManagerOption} */
module.exports = {
    resourceDir: path.join(__dirname, "src/assets/svgs"),
    output: {
        dir: path.join(__dirname, "src/assets/font"),
        component: {
            dir: "react-components", // 输出目录，相对 output.dir 的相对路径
            fileName: fileName => `Svg${toBigCamelCase(fileName)}.tsx`, // 组件文件名称
            name: fileName => `Svg${toBigCamelCase(fileName)}`, // 组件名称
            content: (...args) => formatCode(getSvgTSReactComponentContent(...args), "typescript"), // 组件代码内容, 并格式化
            fillCurrentColor: fileName => !fileName.endsWith("_oc"), // 文件名以 _oc 结尾的 svg 组件不清除颜色，如：icon_oc.svg
        },
    },
    // <------------------
    scanDir: {
        rootDir: process.cwd(), // 文件扫描根目录，默认 process.cwd()
        includes: ["src/**/*.{ts,tsx,js,jsx}"], // 扫描的文件
        excludes: ["src/assets/font/**/*", "**/*.d.ts"], // 排除的文件，一般会排除掉输出目录（output.dir）
    },
};
```

4. 支持同时生成字体与 svg 组件

## 输出内容

### 字体（font）

-   `{font.name}.ttf`
-   `{font.name}.woff`
-   `{font.name}.woff2`
-   `{font.name}.css` (可以引用到页面使用)
-   `{font.name}.ts` (含有类型声明，可根据这个文件封装 typescript 组件)

### 组件

根据文件名生成的 svg 组件，可直接引用使用

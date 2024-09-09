import path from "path";
import { optimize } from "svgo";
import { globSync } from "glob";
import type { FontMetadata, FontType } from "./Font.js";
import type { ComponentOption } from "./Component.js";

// ********************************************** 正则 *******************************************************

/** 正则集合 */
export const regex = {
    /** 字体名称 */
    fontName: /^[a-zA-Z][\w-]*$/,
    /** svg 文件名称 */
    fileName: /^[a-zA-Z][a-zA-Z-_\d]+$/,
    /** web 颜色 */
    colorString:
        /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b|rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)|rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|0?\.\d+|1(\.0)?)\s*\)|hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)|hsla\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(0|0?\.\d+|1(\.0)?)\s*\)/i,
    /** 已使用的关键词 */
    usageKeyword: (keyword: string) => new RegExp(`(?<!\\s*((\\/\\/|\\/\\*\\*|\\*|type\\s+\\w+\\s*=|\\w+\\s*:|^\\.).*?))${keyword}`), // TODO: 如果没有排除掉 输出目录，则全部都是未使用或者已使用，需要检查下
};

// ********************************************** node 工具函数 ***********************************************

/**
 * 转化为正斜杠路径
 * @param filePath 文件地址
 * @returns
 */
export const getPosixPath = (filePath: string) => filePath.split(path.sep).join(path.posix.sep);

/**
 * 扫描文件地址
 * @param ext 文件扩展名
 * @param dir 文件夹中搜索，如果传相对地址，则基于 process.cwd() 查询
 * @returns 文件绝对地址
 */
const scanFilePaths = (ext: string, dir = "") => {
    return globSync(getPosixPath(path.join(getAbsolutePath(dir), `**/*.${ext}`)));
};

/**
 * 扫描文件夹内的 svg 文件
 * @param dir 文件夹中搜索，如果传相对地址，则基于 process.cwd() 查询
 * @returns 文件绝对地址
 */
export const scanSvgFilePaths = (dir?: string) => scanFilePaths("svg", dir);

/**
 * 获取绝对路径
 * @param filePath 相对路径则以 cwd 为根路径，否则直接返回
 */
export const getAbsolutePath = (filePath: string) => {
    return path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
};

/**
 * 优化 svg 代码，修改 fill 与宽高等
 * @param svg svg 文件字符
 * @param clearColor 是否清楚颜色，将使用 currentColor 替换
 * @returns 优化后的 svg 字符
 */
export const optimizeSvgString = (svg: string, clearColor: boolean) => {
    const { data } = optimize(svg, {
        plugins: [
            {
                name: "preset-default",
                params: {
                    overrides: {
                        removeViewBox: false,
                    },
                },
            },
            {
                name: "modifySvgSizeAndColor",
                fn: () => {
                    return {
                        element: {
                            enter: node => {
                                if (node.name === "svg") {
                                    // eslint-disable-next-line no-param-reassign
                                    node.attributes.width = "1em";
                                    // eslint-disable-next-line no-param-reassign
                                    node.attributes.height = "1em";
                                    // eslint-disable-next-line no-param-reassign
                                    delete node.attributes.class;
                                }
                                if (clearColor) {
                                    Object.entries(node.attributes)
                                        .filter(([, value]) => regex.colorString.test(value))
                                        .forEach(([key]) => {
                                            node.attributes[key] = "currentColor";
                                        });
                                }
                            },
                        },
                    };
                },
            },
        ],
    });
    return data;
};

// ********************************************** 通用工具函数 ***********************************************

/** 提取重复字符 */
export const findRepeat = (arr: string[]) => {
    const charSet: Set<string> = new Set();
    const duplicates: string[] = [];
    arr.forEach(char => {
        if (charSet.has(char)) {
            duplicates.push(char);
        } else {
            charSet.add(char);
        }
    });
    return duplicates;
};

/** 大驼峰转换 */
export const toBigCamelCase = (str: string) => str.replace(/([^a-zA-Z0-9]|^)+(\w)/g, (_item, _$0, $1) => $1.toUpperCase());

/** 小驼峰转换 */
export const toCamelCase = (str: string) => str.replace(/[^a-zA-Z0-9]+(\w)/g, (_item, $0) => $0.toUpperCase());

/** 获取 unicode 显示字符串 */
export const getUnicodeDisplayString = (unicodeHex: number, type: "css" | "html") => {
    const unicodeHexString = unicodeHex.toString(16).toUpperCase();
    if (type === "css") return `\\${unicodeHexString}`;
    return `&#x${unicodeHexString};`;
};

// ********************************************** 模板文件生成工具函数 ***********************************************

/** 生成 typescript 类型声明 */
export const getTypeDeclarationString = (fontName: string, metadata: FontMetadata[]) => {
    return `
/** 字体 ${fontName} 类名 */
export type ${toBigCamelCase(fontName)}ClassName = ${metadata.map(font => `"${font.fileName}"`).join(" | ")};

/** unicode 编码集合，在 html 中显示 */
export const ${toCamelCase(fontName)}HTMLUnicode = {
    ${metadata.map(item => `"${item.fileName}": "${getUnicodeDisplayString(item.unicodeHex, "html")}"`).join(",\n\t")}
}
`;
};

export const getDefaultFontStyle = (fontName: string) => {
    return `
    font-family: "${fontName}" !important;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
`;
};

/** 生成 css 文件 */
export const getCssString = (fontName: string, fontTypes: FontType[], style: (fontName: string) => string, metadata: FontMetadata[]) => {
    const now = Date.now();
    return `
@font-face {
    font-family: "${fontName}";
    src: ${[
        fontTypes.includes("ttf") && `url("${fontName}.ttf?t=${now}") format("truetype")`,
        fontTypes.includes("woff") && `url("${fontName}.woff?t=${now}") format("woff")`,
        fontTypes.includes("woff2") && `url("${fontName}.woff2?t=${now}") format("woff2")`,
    ]
        .filter(Boolean)
        .join(",\n")};
}

.${fontName} {${style(fontName)}}
${metadata
    .map(item => {
        return `
.${item.fileName}::before {
    content: "${getUnicodeDisplayString(item.unicodeHex, "css")}";
}`;
    })
    .join("\n")}
`;
};

/** 获取 typescript 版本的 svg react 组件内容 */
export const getSvgTSReactComponentContent: ComponentOption["content"] = (name, svgString) => {
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

/** 获取 javascript 版本的 svg react 组件内容 */
export const getSvgJSReactComponentContent: ComponentOption["content"] = (name, svgString) => {
    return `
/* eslint-disable */

export const ${name} = (props) => {
    return (
        ${svgString.replace(/<svg.+?>/gm, item => `${item.slice(0, item.length - 1)} {...props}>`)}
    )
};
`;
};

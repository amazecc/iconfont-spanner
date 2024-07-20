import fs from "fs-extra";
import path from "path";
import { optimize } from "svgo";
import type { SvgFileMetadata, SvgReactComponentOption } from "./type";

// ********************************************** node 工具函数 ***********************************************

/** 遍历当前文件夹下的所有文件路径 */
export const walkFileSync = (currentPath: string, callback: (filePath: string, isFile: boolean) => void) => {
    const currentStat = fs.statSync(currentPath);
    if (currentStat.isFile()) {
        callback(currentPath, true);
        return;
    }
    fs.readdirSync(currentPath).forEach(name => {
        const filePath = path.join(currentPath, name);
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
            callback(filePath, true);
        } else if (stat.isDirectory()) {
            callback(filePath, false);
            walkFileSync(filePath, callback);
        }
    });
};

// ********************************************** 通用工具函数 ***********************************************

/** 提取重复字符 */
export const findDuplicates = (arr: string[]) => {
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
export const getTypeDeclarationString = (fontName: string, metadata: SvgFileMetadata[]) => {
    return `
/** 字体 ${fontName} 类名 */
export type ${toBigCamelCase(fontName)}ClassName = ${metadata.map(font => `"${font.fileName}"`).join(" | ")};

/** unicode 编码集合，在 html 中显示 */
export const ${toCamelCase(fontName)}HTMLUnicode = {
	${metadata.map(item => `"${item.fileName}": "${getUnicodeDisplayString(item.unicodeHex, "html")}"`).join(",\n\t")}
}
`;
};

/** 生成 css 文件 */
export const getCssString = (fontName: string, metadata: SvgFileMetadata[]) => {
    const now = Date.now();
    return `
@font-face {
    font-family: "${fontName}";
    src: ${`url("${fontName}.ttf?t=${now}") format("truetype"),
		url("${fontName}.woff?t=${now}") format("woff"),
		url("${fontName}.woff2?t=${now}") format("woff2")`};
}

.iconfont {
    font-family: "iconfont" !important;
    font-size: 16px;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
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

/** 获取预览html字符串 */
export const getPreviewHtmlString = (fontName: string, metadata: SvgFileMetadata[]) => {
    return `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${fontName} 预览</title>
        <link rel="stylesheet" href="${fontName}.css" />
        <style>
            body {
                width: 1024px;
                margin: 0 auto;
            }
            .${fontName} {
                font-size: 52px;
            }

            .grid {
                display: grid;
                grid-template-columns: repeat(8, 1fr);
                grid-gap: 20px;
            }
            .grid > * {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 8px;
                border-radius: 4px;
				transition: all 0.1s;
            }
            .grid > *:hover {
                background-color: aliceblue;
            }
        </style>
    </head>
    <body>
        <h1>${fontName} 预览</h1>
        <div class="grid">
			${metadata
                .map(item => {
                    return `
			<div>
				<span class="${fontName} ${item.fileName}"></span>
				<span>${item.fileName}</span>
				<span>&amp;#x${item.unicodeHex.toString(16)};</span>
				<span>${item.svgReactComponentName}</span>
			</div>
					`;
                })
                .join("")}
        </div>
    </body>
</html>	
`;
};

/**
 * 优化 svg 代码，修改 fill 与宽高等
 * @param svg svg 文件字符
 * @returns 优化后的 svg 字符
 */
export const optimizeSvgString = (svg: string, fillCurrentColor: boolean) => {
    const { data } = optimize(svg, {
        plugins: [
            {
                name: "preset-default",
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
                                if (node.name === "path" && fillCurrentColor) {
                                    // eslint-disable-next-line no-param-reassign
                                    node.attributes.fill = "currentColor";
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

/** 获取 typescript 版本的 svg react 组件内容 */
export const getSvgTSReactComponentContent: SvgReactComponentOption["content"] = (componentName, svgString) => {
    return `
export interface ${componentName}Props extends React.SVGAttributes<SVGSVGElement> {}

export const ${componentName} = (props: ${componentName}Props) => {
	return (
		${svgString.replace(/<svg.+?>/gm, item => `${item.slice(0, item.length - 1)} {...props}>`)}
	)
};
`;
};

/** 获取 javascript 版本的 svg react 组件内容 */
export const getSvgJSReactComponentContent: SvgReactComponentOption["content"] = (componentName, svgString) => {
    return `
export const ${componentName} = (props) => {
	return (
		${svgString.replace(/<svg.+?>/gm, item => `${item.slice(0, item.length - 1)} {...props}>`)}
	)
};
`;
};

export interface FontManagerOption {
    /** svg 源文件夹 */
    resourceDir: string;
    /** 资源输出 */
    output: {
        /** 资源输出文件夹 */
        dir: string;
        /** 字体名称 */
        fontName?: string;
        /** svg 组件生成配置 */
        svgComponent?: SvgReactComponentOption;
    };
}

export interface SvgReactComponentOption {
    /** 生成 react 组件 */
    type: "react";
    /** 组件放置的文件夹, 相对于 output.dir 的相对路径 */
    dir: string;
    /** 生成组件代码 */
    content: (componentName: string, svgString: string) => string;
}

// *********************************************************************************************************

export interface SvgFileMetadata {
    /** svg 文件绝对原始值 */
    path: string;
    /** svg 文件全称 */
    fileFullName: string;
    /** 文件名, 不包含后缀，该名称将作为图标类名 */
    fileName: string;
    /** svg react 组件名称 */
    svgReactComponentName: string;
	/** svg 优化后的字符 */
	svgOptimizeString: string;
    /** 字体 unicode 16 进制码点值 */
    unicodeHex: number;
    /** 是否使用 currentColor 填充 */
    fillCurrentColor: boolean;
}

// *********************************************************************************************************

/** 输出文件信息 */
export interface OutputFile {
    /** 基于 output.dir 的相对地址 */
    dir?: string;
    /** 文件名称， 默认为 fontName */
    name?: string;
    /** 传入则与 name 组合，未传入则只有 dir 生效 */
    ext?: string;
}

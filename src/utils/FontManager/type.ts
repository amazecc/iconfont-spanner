export interface FontManagerOption {
    /** svg 源文件夹 */
    resourceDir: string;
    /** 资源输出 */
    output: {
        /** 资源输出文件夹 */
        dir: string;
        /** 字体名称 */
        font?: FontOption;
        /** svg 组件生成配置 */
        component?: ComponentOption;
    };
    /**
     * 代码扫描文件夹，将在该文件夹内扫描图标使用情况
     */
    scanDir?: {
        /** 基于该目录扫表，默认 process.cwd() */
        rootDir?: string;
        /** 包含的文件夹 */
        includes: string[];
        /** 排除的文件夹, 一般要排除输出目录 output.dir */
        excludes?: string[];
    };
}

export interface ComponentOption {
    /** 组件放置的文件夹, 相对于 output.dir 的相对路径 */
    dir?: string;
    /** 组件文件名，需要带上后缀，比如：Demo.tsx */
    fileName: (fileName: string) => string;
    /** 组件名 */
    name: (fileName: string) => string;
    /** 组件代码 */
    content: (name: string, svgString: string, fileName: string) => string | Promise<string>;
    /**
     * 是否使用 currentColor 填充颜色，这将继承 fontColor
     * @default true
     */
    fillCurrentColor?: boolean | ((fileName: string) => boolean);
}

export type FontType = "ttf" | "woff" | "woff2";

export interface FontOption {
    /** 字体名称 */
    name: string;
    /**
     * 生成的字体类型
     * @default ["ttf", "woff", "woff2"]
     */
    types?: FontType[];
    /** 针对生成文件内容进行格式化 */
    format?: (content: string, type: "css" | "typescript") => string | Promise<string>;
}

// *********************************************************************************************************

/** 需要生成 svg 组件的信息 */
export interface SvgComponentMetadata {
    /** svg 文件绝对原始值 */
    filePath: string;
    /** 文件名, 不包含后缀，该名称将作为图标类名 */
    fileName: string;
    /** 组件名称 */
    name: string;
    /** svg 优化后的字符 */
    svgOptimizeString: string;
    /** 是否使用 currentColor 填充 */
    fillCurrentColor: boolean;
}

/** 需要生成字体的信息 */
export interface FontMetadata {
    /** svg 文件绝对原始值 */
    filePath: string;
    /** 文件名, 不包含后缀，该名称将作为图标类名 */
    fileName: string;
    /** 字体 unicode 16 进制码点值 */
    unicodeHex: number;
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

import fs from "fs-extra";
import path from "path";
import { getAbsolutePath, optimizeSvgString } from "./utils.js";

export interface ComponentOption {
    /** 组件放置的文件夹 */
    dir: string;
    /** 组件文件名，需要带上后缀，比如：Demo.tsx */
    fileFullName: (fileName: string) => string;
    /** 组件名 */
    name: (fileName: string) => string;
    /** 组件代码 */
    content: (name: string, svgString: string, fileName: string) => string | Promise<string>;
    /**
     * 是否将 svg 的所有颜色都清除掉，清除后可使用字体颜色控制该 svg 颜色
     * @default true
     */
    clearColor?: boolean | ((fileName: string) => boolean);
}

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
    /** 是否清除颜色，即使用 currentColor 替换所有颜色 */
    clearColor: boolean;
}

export class Component {
    readonly option: Required<ComponentOption>;

    /** svg 组件信息 */
    readonly metadata: SvgComponentMetadata[] = [];

    constructor(option: ComponentOption) {
        this.option = {
            clearColor: true,
            ...option,
            dir: getAbsolutePath(option.dir),
        };
    }

    /**
     * 获取组件输出地址
     * @param fileFullName 文件全称，包含扩展名，不传则返回输出文件目录地址
     * @returns
     */
    public getOutputPath(fileFullName?: string) {
        const { dir } = this.option;
        return path.resolve(getAbsolutePath(dir), fileFullName ?? "");
    }

    /**
     * 生成 svg react 组件文件
     */
    private async writeComponent() {
        this.metadata.forEach(item => {
            const fileFullName = this.option.fileFullName(item.fileName);
            const name = this.option.name(item.fileName);
            Promise.resolve(this.option.content(name, item.svgOptimizeString, item.fileName)).then(content => {
                fs.writeFile(this.getOutputPath(fileFullName), content);
            });
        });
    }

    /**
     * 添加 svg 信息
     * @param filePath svg 路径
     */
    public add(filePath: string) {
        const { name, clearColor } = this.option;
        const fileName = path.basename(filePath, ".svg");
        const clearColorValue = clearColor instanceof Function ? clearColor(fileName) : clearColor;
        const svg = fs.readFileSync(filePath, "utf-8");
        const svgOptimizeString = optimizeSvgString(svg, clearColorValue);
        this.metadata.push({
            filePath,
            fileName,
            name: name(fileName),
            svgOptimizeString,
            clearColor: clearColorValue,
        });
    }

    /** 生成字体等资源文件 */
    public async generate() {
        await fs.ensureDir(this.getOutputPath());
        await this.writeComponent();
    }
}

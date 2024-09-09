import path from "path";
import { findRepeat, scanSvgFilePaths, getAbsolutePath, regex } from "./utils.js";
import { Font, type FontOption } from "./Font.js";
import { Component, type ComponentOption } from "./Component.js";
import { Scanner, type ScanOption } from "./Scanner.js";

export interface FontManagerOption {
    /** svg 源文件夹 */
    resourceDir: string;
    /** 资源输出 */
    output: {
        /** 字体名称 */
        font?: FontOption;
        /** svg 组件生成配置 */
        component?: ComponentOption;
    };
    /**
     * 文件扫描文件夹配置，用于检查图标是否可用
     */
    scan?: ScanOption;
}

export class FontManager {
    /** 校验 svg 字体名（文件名称） */
    public static isValidFileName(name: string) {
        return regex.fileName.test(name);
    }

    /** 检查目录下的重复文件名 */
    private static validateRepeatFileName(resourceDir: string) {
        const filePaths = scanSvgFilePaths(resourceDir);
        const repeatFileNames = findRepeat(filePaths.map(item => path.basename(item)));
        if (repeatFileNames.length) {
            const repeatFilePaths = filePaths.filter(filePath => repeatFileNames.includes(path.basename(filePath)));
            throw new Error(`【ERROR】文件名重复：\n${repeatFilePaths.join("\n")}`);
        }
    }

    /** 在进行所有操作之前首先要进行校验 */
    public static validate(option: FontManagerOption) {
        if (!option.output.font && !option.output.component) {
            throw new Error("【ERROR】output.font 和 output.component 必须至少设置一个");
        }
        if (option.output.font) {
            Font.validate(option.output.font);
        }
        this.validateRepeatFileName(option.resourceDir);
    }

    readonly resourceDir: string;

    readonly font?: Font;

    readonly component?: Component;

    readonly scanner?: Scanner;

    constructor(option: FontManagerOption) {
        this.resourceDir = getAbsolutePath(option.resourceDir);
        if (option.scan) {
            this.scanner = new Scanner(option.scan);
        }
        if (option.output.font) {
            this.font = new Font(option.output.font);
        }
        if (option.output.component) {
            this.component = new Component(option.output.component);
        }
    }

    /** 读取文件资源 */
    public read() {
        scanSvgFilePaths(this.resourceDir).forEach(filePath => {
            this.font?.add(filePath);
            this.component?.add(filePath);
        });
    }

    /** 生成字体等资源文件 */
    public async generate() {
        this.font?.generate();
        this.component?.generate();
    }
}

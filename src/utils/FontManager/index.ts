import fs from "fs-extra";
import path from "path";
import SVGIcons2SVGFontStream, { type Metadata } from "svgicons2svgfont";
import svg2ttf from "svg2ttf";
import ttf2woff2 from "ttf2woff2";
import ttf2woff from "ttf2woff";
import { getTypeDeclarationString, getCssString, optimizeSvgString, findRepeat, scanSvgFilePaths } from "./utils";
import type { FontManagerOption, FontMetadata, SvgComponentMetadata, FontOption } from "./type";

// TODO: 支持 esModule

export class FontManager {
    /** 检查目录下的重复文件名 */
    private static validateRepeatFileName(resourceDir: string) {
        const filePaths = scanSvgFilePaths(resourceDir);
        const repeatFileNames = findRepeat(filePaths.map(item => path.basename(item)));
        if (repeatFileNames.length) {
            const repeatFilePaths = filePaths.filter(filePath => repeatFileNames.includes(path.basename(filePath)));
            throw new Error(`【ERROR】文件名重复：\n${repeatFilePaths.join("\n")}`);
        }
    }

    /** 校验字体配置 */
    private static validateFontOption(font: FontOption) {
        if (!/^[a-zA-Z][\w-]*$/.test(font.name)) {
            throw new Error("font.name 必须以字母开头，且只能包含字母、下划线和连字符");
        }
        if (font.types && font.types.length === 0) {
            throw new Error("【ERROR】font.types 至少设置一个字体类型");
        }
    }

    /** 校验 svg 字体名（文件名称） */
    public static isValidFileName(name: string) {
        return /^[a-zA-Z][a-zA-Z-_\d]+$/.test(name);
    }

    /** 在进行所有操作之前首先要进行检查 */
    public static check(option: FontManagerOption) {
        if (!option.output.font && !option.output.component) {
            throw new Error("【ERROR】output.font 和 output.component 必须至少设置一个");
        }
        if (option.output.font) {
            this.validateFontOption(option.output.font);
        }
        this.validateRepeatFileName(option.resourceDir);
    }

    /** 构造函数配置项 */
    readonly option: FontManagerOption;

    /** svg 组件信息 */
    readonly svgComponentMetadata: SvgComponentMetadata[] = [];

    /** 字体信息 */
    readonly fontMetadata: FontMetadata[] = [];

    constructor(option: FontManagerOption) {
        this.option = option;
    }

    /** 获取字体配置 */
    private getFontOption(): Required<FontOption> {
        const { font } = this.option.output;
        if (!font) {
            throw new Error("请在配置文件中配置字体");
        }
        return {
            types: ["ttf", "woff", "woff2"],
            format: content => content,
            ...font,
        };
    }

    /** 获取组件配置 */
    private getComponentOption() {
        const { component } = this.option.output;
        if (!component) {
            throw new Error("请在配置文件中配置组件");
        }
        return component;
    }

    /**
     * 生成 svg 字体 buffer, 用于生成 ttf, woff, woff2 buffer
     */
    private async generateSvgFontBuffer() {
        const fontStream = new SVGIcons2SVGFontStream({
            fontName: this.getFontOption().name, // 字体名称
            fontHeight: 1000, // 字体高度，1000是一个常用的值，确保图标清晰
            normalize: true, // 归一化图标大小
            log() {
                // 不做任何操作，清除内部打印内容
            },
        });
        return new Promise<Buffer>((resolve, reject) => {
            const chunks: Uint8Array[] = [];
            fontStream
                .on("data", chunk => {
                    chunks.push(chunk);
                })
                .on("end", () => {
                    resolve(Buffer.concat(chunks));
                })
                .on("error", reject);
            this.fontMetadata.forEach(item => {
                const glyph = fs.createReadStream(item.filePath) as fs.ReadStream & { metadata?: Metadata };
                glyph.metadata = {
                    unicode: [String.fromCharCode(item.unicodeHex)],
                    name: item.fileName,
                    path: item.filePath,
                    renamed: false,
                };
                fontStream.write(glyph);
            });
            fontStream.end();
        });
    }

    /**
     * 生成 svg react 组件文件
     */
    private async writeComponent() {
        const option = this.getComponentOption();
        this.svgComponentMetadata.forEach(item => {
            const fileFullName = option.fileFullName(item.fileName);
            const name = option.name(item.fileName);
            Promise.resolve(option.content(name, item.svgOptimizeString, item.fileName)).then(content => {
                fs.writeFile(this.getComponentOutputPath(fileFullName), content);
            });
        });
    }

    /** 写入 typescript 类型声明 */
    private async writeTypeDeclarationFile() {
        const { name, format } = this.getFontOption();
        const typeDeclarationString = await format(getTypeDeclarationString(name, this.fontMetadata), "typescript");
        fs.writeFileSync(this.getFontOutputPath("ts"), typeDeclarationString);
    }

    /** 写入 css 文件 */
    private async writeCSSFile() {
        const { name, types, format } = this.getFontOption();
        const cssString = await format(getCssString(name, types, this.fontMetadata), "css");
        fs.writeFileSync(this.getFontOutputPath("css"), cssString);
    }

    /** 写入 font 文件 */
    private async writeFontFiles() {
        const { types } = this.getFontOption();
        const { ttfBuffer, woffBuffer, woff2Buffer } = await this.generateFontBuffer();
        if (types.includes("ttf")) {
            // 写入 TTF 文件
            fs.writeFileSync(this.getFontOutputPath("ttf"), ttfBuffer);
        }
        if (types.includes("woff2")) {
            // 写入 WOFF2 文件
            fs.writeFileSync(this.getFontOutputPath("woff2"), woff2Buffer());
        }
        if (types.includes("woff")) {
            // 写入 WOFF 文件
            fs.writeFileSync(this.getFontOutputPath("woff"), woffBuffer());
        }
    }

    /**
     * 获取字体相关文件最终文件输出地址
     * @param ext 文件扩展名，如果不传，则返回输出目录地址
     * @returns 地址
     */
    public getFontOutputPath(ext?: string) {
        const { dir, name } = this.getFontOption();
        return path.resolve(dir, ext ? `${name}.${ext}` : ""); // TODO: 支持绝对地址，相对地址
    }

    /**
     * 获取组件输出地址
     * @param fileFullName 文件全称，包含扩展名，不传则返回输出文件目录地址
     * @returns
     */
    public getComponentOutputPath(fileFullName?: string) {
        const { dir } = this.getComponentOption();
        return path.resolve(dir, fileFullName ?? ""); // TODO: 支持绝对地址，相对地址
    }

    /** 读取文件资源 */
    public read() {
        const { font, component } = this.option.output;
        let initialUnicodeHex = 0xe000;
        scanSvgFilePaths(this.option.resourceDir).forEach(filePath => {
            const fileName = path.basename(filePath, ".svg");
            // 如果开启 font 生成
            if (font) {
                this.fontMetadata.push({
                    filePath,
                    fileName,
                    // eslint-disable-next-line no-plusplus
                    unicodeHex: ++initialUnicodeHex,
                });
            }
            // 如果开启 svg 组件生成
            if (component) {
                const fillCurrentColor = component.fillCurrentColor instanceof Function ? component.fillCurrentColor(fileName) : (component.fillCurrentColor ?? true);
                const svg = fs.readFileSync(filePath, "utf-8");
                const svgOptimizeString = optimizeSvgString(svg, fillCurrentColor);
                this.svgComponentMetadata.push({
                    filePath,
                    fileName,
                    name: component.name(fileName),
                    svgOptimizeString,
                    fillCurrentColor,
                });
            }
        });
    }

    /** 生成 font buffer */
    public async generateFontBuffer() {
        const svgBuffer = await this.generateSvgFontBuffer();
        const ttfUint8Array = svg2ttf(svgBuffer.toString()).buffer;
        const ttfBuffer = Buffer.from(ttfUint8Array);
        return {
            ttfBuffer,
            woffBuffer: () => Buffer.from(ttf2woff(ttfUint8Array)), // NOTE: ttf2woff 返回的是一个 Uint8Array 而不是 Buffer, 这里需要转化一下，否则上层使用会发生问题
            woff2Buffer: () => ttf2woff2(ttfBuffer),
        };
    }

    /** 生成字体等资源文件 */
    public async generate() {
        if (this.option.output.font) {
            await fs.ensureDir(this.getFontOutputPath());
            await this.writeFontFiles();
            await this.writeTypeDeclarationFile();
            await this.writeCSSFile();
        }
        if (this.option.output.component) {
            await fs.ensureDir(this.getComponentOutputPath());
            await this.writeComponent();
        }
    }
}

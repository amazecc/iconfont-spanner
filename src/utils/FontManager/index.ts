import fs from "fs-extra";
import path from "path";
import SVGIcons2SVGFontStream, { type Metadata } from "svgicons2svgfont";
import svg2ttf from "svg2ttf";
import ttf2woff2 from "ttf2woff2";
import ttf2woff from "ttf2woff";
import { walkFileSync, getTypeDeclarationString, getCssString, optimizeSvgString, findDuplicates } from "./utils";
import type { FontManagerOption, OutputFile, FontMetadata, SvgComponentMetadata, ComponentOption } from "./type";

export class FontManager {
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
    private getFont() {
        const { font } = this.option.output;
        if (!font) {
            throw new Error("请在配置文件中设置字体名称");
        }
        if (!/^[a-zA-Z][\w-]*$/.test(font.name)) {
            throw new Error("font.name 必须以字母开头，且只能包含字母、下划线和连字符");
        }
        return font;
    }

    /**
     * 获取最终文件输出位置
     * @param info 文件信息
     * @returns 文件绝对地址
     */
    private getOutputPath(info: OutputFile) {
        const { dir = "", name = this.option.output.font?.name, ext } = info;
        return path.resolve(this.option.output.dir, dir, ext && name ? `${name}.${ext}` : "");
    }

    /**
     * 生成 svg 字体 buffer, 用于生成 ttf, woff, woff2 buffer
     */
    private async generateSvgFontBuffer() {
        const fontStream = new SVGIcons2SVGFontStream({
            fontName: this.getFont().name, // 字体名称
            fontHeight: 1000, // 字体高度，1000是一个常用的值，确保图标清晰
            normalize: true, // 归一化图标大小
            centerHorizontally: true, // 水平居中图标
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
    private async writeComponent(option: ComponentOption) {
        await fs.ensureDir(this.getOutputPath({ dir: option.dir }));
        this.svgComponentMetadata.forEach(item => {
            const [fileName, ext] = option.fileName(item.fileName).split(".");
            const name = option.name(item.fileName);
            Promise.resolve(option.content(name, item.svgOptimizeString, item.fileName)).then(content => {
                fs.writeFile(this.getOutputPath({ dir: option.dir, name: fileName, ext }), content);
            });
        });
    }

    /** 写入 typescript 类型声明 */
    private async writeTypeDeclarationFile() {
        const { format = css => css } = this.getFont();
        const typeDeclarationString = await format(getTypeDeclarationString(this.getFont().name, this.fontMetadata), "typescript");
        fs.writeFileSync(this.getOutputPath({ ext: "ts" }), typeDeclarationString);
    }

    /** 写入 css 文件 */
    private async writeCSSFile() {
        const { name, format = css => css } = this.getFont();
        const cssString = await format(getCssString(name, this.fontMetadata), "css");
        fs.writeFileSync(this.getOutputPath({ ext: "css" }), cssString);
    }

    /** 写入 font 文件 */
    private async writeFontFiles() {
        const { ttfBuffer, woffBuffer, woff2Buffer } = await this.generateFontBuffer();
        // 写入 TTF 文件
        fs.writeFileSync(this.getOutputPath({ ext: "ttf" }), ttfBuffer);
        // 写入 WOFF2 文件
        fs.writeFileSync(this.getOutputPath({ ext: "woff2" }), woff2Buffer());
        // 写入 WOFF 文件
        fs.writeFileSync(this.getOutputPath({ ext: "woff" }), woffBuffer());
    }

    /** 读取文件资源 */
    public read() {
        const { font, component } = this.option.output;
        let initialUnicodeHex = 0xe000;
        walkFileSync(this.option.resourceDir, (filePath, isFile) => {
            if (isFile) {
                if (filePath && path.extname(filePath) === ".svg") {
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
                }
            }
        });
        if (this.svgComponentMetadata.length || this.fontMetadata.length) {
            const metadata = this.svgComponentMetadata || this.fontMetadata;
            const fileNames = metadata.map(item => item.fileName);
            const duplicatesFileNames = findDuplicates(fileNames);
            if (duplicatesFileNames.length) {
                const duplicatesFilePath = metadata.filter(item => duplicatesFileNames.includes(item.fileName)).map(item => item.filePath);
                console.error("【ERROR】文件名重复：\n");
                console.error(duplicatesFilePath.join("\n"));
                process.exit(1);
            }
        }
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
        if (!this.option.output.font && !this.option.output.component) {
            console.error("【ERROR】output.font 和 output.component 必须至少设置一个");
            process.exit(1);
        }
        await fs.ensureDir(this.option.output.dir);
        if (this.option.output.font) {
            await this.writeFontFiles();
            await this.writeTypeDeclarationFile();
            await this.writeCSSFile();
        }
        if (this.option.output.component) {
            await this.writeComponent(this.option.output.component);
        }
    }
}

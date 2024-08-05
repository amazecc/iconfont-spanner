import fs from "fs-extra";
import path from "path";
import SVGIcons2SVGFontStream, { type Metadata } from "svgicons2svgfont";
import svg2ttf from "svg2ttf";
import ttf2woff2 from "ttf2woff2";
import ttf2woff from "ttf2woff";
import { getTypeDeclarationString, getCssString, getAbsolutePath } from "./utils";

export type FontType = "ttf" | "woff" | "woff2";

export interface FontOption {
    /** 资源输出文件夹 */
    dir: string;
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

/** 需要生成字体的信息 */
export interface FontMetadata {
    /** svg 文件绝对原始值 */
    filePath: string;
    /** 文件名, 不包含扩展名，该名称将作为图标类名 */
    fileName: string;
    /** 字体 unicode 16 进制码点值 */
    unicodeHex: number;
}

export class Font {
    /** 校验字体配置 */
    public static validate(option: FontOption) {
        const { name, types } = option;
        if (!/^[a-zA-Z][\w-]*$/.test(name)) {
            throw new Error("font.name 必须以字母开头，且只能包含字母、下划线和连字符");
        }
        if (types && types.length === 0) {
            throw new Error("【ERROR】font.types 至少设置一个字体类型");
        }
    }

    private initialUnicodeHex = 0xe000;

    readonly option: Required<FontOption>;

    /** 字体信息 */
    readonly metadata: FontMetadata[] = [];

    constructor(option: FontOption) {
        this.option = {
            types: ["ttf", "woff", "woff2"],
            format: content => content,
            ...option,
            dir: getAbsolutePath(option.dir),
        };
    }

    /**
     * 生成 svg 字体 buffer, 用于生成 ttf, woff, woff2 buffer
     */
    private async generateSvgFontBuffer() {
        const fontStream = new SVGIcons2SVGFontStream({
            fontName: this.option.name, // 字体名称
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
            this.metadata.forEach(item => {
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

    /** 写入 typescript 类型声明 */
    private async writeTypeDeclarationFile() {
        const { name, format } = this.option;
        const typeDeclarationString = await format(getTypeDeclarationString(name, this.metadata), "typescript");
        fs.writeFileSync(this.getOutputPath("ts"), typeDeclarationString);
    }

    /** 写入 css 文件 */
    private async writeCSSFile() {
        const { name, types, format } = this.option;
        const cssString = await format(getCssString(name, types, this.metadata), "css");
        fs.writeFileSync(this.getOutputPath("css"), cssString);
    }

    /** 写入 font 文件 */
    private async writeFontFiles() {
        const { types } = this.option;
        const { ttfBuffer, woffBuffer, woff2Buffer } = await this.generateFontBuffer();
        if (types.includes("ttf")) {
            // 写入 TTF 文件
            fs.writeFileSync(this.getOutputPath("ttf"), ttfBuffer);
        }
        if (types.includes("woff2")) {
            // 写入 WOFF2 文件
            fs.writeFileSync(this.getOutputPath("woff2"), woff2Buffer());
        }
        if (types.includes("woff")) {
            // 写入 WOFF 文件
            fs.writeFileSync(this.getOutputPath("woff"), woffBuffer());
        }
    }

    /**
     * 获取字体相关文件最终文件输出地址
     * @param ext 文件扩展名，如果不传，则返回输出目录地址
     * @returns 地址
     */
    public getOutputPath(ext?: string) {
        const { dir, name } = this.option;
        return path.resolve(dir, ext ? `${name}.${ext}` : "");
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

    /**
     * 添加字体信息
     * @param filePath svg 文件地址
     */
    public add(filePath: string) {
        this.metadata.push({
            filePath,
            fileName: path.basename(filePath, ".svg"),
            unicodeHex: ++this.initialUnicodeHex,
        });
    }

    /** 生成字体等资源文件 */
    public async generate() {
        await fs.ensureDir(this.getOutputPath());
        await this.writeFontFiles();
        await this.writeTypeDeclarationFile();
        await this.writeCSSFile();
    }
}

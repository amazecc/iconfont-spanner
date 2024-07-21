import fs from "fs-extra";
import path from "path";
import SVGIcons2SVGFontStream, { type Metadata } from "svgicons2svgfont";
import svg2ttf from "svg2ttf";
import ttf2woff2 from "ttf2woff2";
import ttf2woff from "ttf2woff";
import { walkFileSync, getTypeDeclarationString, getCssString, toBigCamelCase, optimizeSvgString, findDuplicates, getPreviewHtmlString } from "./utils";
import type { FontManagerOption, OutputFile, SvgFileMetadata, SvgReactComponentOption } from "./type";

export class FontManager {
    /** 构造函数配置项 */
    private readonly option: FontManagerOption;

    /** 文件列表信息 */
    private readonly svgFileMetadata: SvgFileMetadata[] = [];

    constructor(option: FontManagerOption) {
        this.option = option;
    }

    /** 获取字体名称 */
    private getFontName() {
        const { fontName } = this.option.output;
        if (!fontName) {
            throw new Error("请在配置文件中设置字体名称");
        }
        return fontName;
    }

    /**
     * 获取最终文件输出位置
     * @param info 文件信息
     * @returns 文件绝对地址
     */
    private getOutputPath(info: OutputFile) {
        const { dir = "", name = this.option.output.fontName, ext } = info;
        return path.resolve(this.option.output.dir, dir, ext && name ? `${name}.${ext}` : "");
    }

    /**
     * 生成 svg 字体文件
     */
    private async generateSvgFont() {
        const fontStream = new SVGIcons2SVGFontStream({
            fontName: this.getFontName(), // 字体名称
            fontHeight: 1000, // 字体高度，1000是一个常用的值，确保图标清晰
            normalize: true, // 归一化图标大小
            centerHorizontally: true, // 水平居中图标
            log() {
                // 不做任何操作，清除内部打印内容
            },
        });
        return new Promise<void>((resolve, reject) => {
            fontStream
                .pipe(fs.createWriteStream(this.getOutputPath({ ext: "svg" })))
                .on("finish", resolve)
                .on("error", reject);
            this.svgFileMetadata.forEach(item => {
                const glyph = fs.createReadStream(item.path) as fs.ReadStream & { metadata?: Metadata };
                glyph.metadata = {
                    unicode: [String.fromCharCode(item.unicodeHex)],
                    name: item.fileName,
                    path: item.fileFullName,
                    renamed: false,
                };
                fontStream.write(glyph);
            });
            fontStream.end();
        });
    }

    /** 根据 svg font 生成 ttf,woff,woff2 字体 */
    private async generateFontBySvgFont() {
        // 读取生成的 SVG 文件
        const svgFont = fs.readFileSync(this.getOutputPath({ ext: "svg" }), "utf8");

        const ttfBuffer = Buffer.from(svg2ttf(svgFont).buffer);
        // 写入 TTF 文件
        fs.writeFileSync(this.getOutputPath({ ext: "ttf" }), ttfBuffer);
        // 写入 WOFF2 文件
        fs.writeFileSync(this.getOutputPath({ ext: "woff2" }), ttf2woff2(ttfBuffer));
        // 写入 WOFF 文件
        fs.writeFileSync(this.getOutputPath({ ext: "woff" }), ttf2woff(ttfBuffer));
    }

    /**
     * 生成 svg react 组件文件
     */
    private async generateSvgReactComponent(option: SvgReactComponentOption) {
        await fs.ensureDir(this.getOutputPath({ dir: option.dir }));
        this.svgFileMetadata.forEach(item => {
            fs.writeFile(this.getOutputPath({ dir: option.dir, name: item.svgReactComponentName, ext: "tsx" }), option.content(item.svgReactComponentName, item.svgOptimizeString));
        });
    }

    /** 生成 typescript 类型声明 */
    private async generateTypeDeclaration() {
        const typeDeclarationString = getTypeDeclarationString(this.getFontName(), this.svgFileMetadata);
        fs.writeFileSync(this.getOutputPath({ ext: "ts" }), typeDeclarationString);
    }

    /** 生成 css 文件 */
    private async generateCss() {
        const cssString = getCssString(this.getFontName(), this.svgFileMetadata);
        fs.writeFileSync(this.getOutputPath({ ext: "css" }), cssString);
    }

    /** 生成 html 预览文件 */
    private async generatePreviewHtml() {
        const htmlString = getPreviewHtmlString(this.getFontName(), this.svgFileMetadata);
        fs.writeFileSync(this.getOutputPath({ name: "preview", ext: "html" }), htmlString);
    }

    /** 读取文件资源 */
    read() {
        let initialUnicodeHex = 0xe000;
        walkFileSync(this.option.resourceDir, (filePath, isFile) => {
            if (isFile) {
                if (filePath && path.extname(filePath) === ".svg") {
                    const fileFullName = path.basename(filePath);
                    const fillCurrentColor = !fileFullName.endsWith("_oc.svg");
                    const svg = fs.readFileSync(filePath, "utf-8");
                    const svgOptimizeString = optimizeSvgString(svg, fillCurrentColor);
                    this.svgFileMetadata.push({
                        path: filePath,
                        fileFullName,
                        fileName: path.basename(filePath, ".svg"),
                        svgReactComponentName: toBigCamelCase(fileFullName.replace("oc", "OC")),
                        // eslint-disable-next-line no-plusplus
                        unicodeHex: ++initialUnicodeHex,
                        svgOptimizeString,
                        fillCurrentColor,
                    });
                }
            }
        });
        const fileFullNames = this.svgFileMetadata.map(item => item.fileFullName);
        const duplicatesFileFullNames = findDuplicates(fileFullNames);
        if (duplicatesFileFullNames.length) {
            const duplicatesFilePath = this.svgFileMetadata.filter(item => duplicatesFileFullNames.includes(item.fileFullName)).map(item => item.path);
            console.log("【异常】文件名重复：\n");
            console.log(duplicatesFilePath.join("\n"));
            process.exit(1);
        }
        return this.svgFileMetadata;
    }

    /** 生成字体等资源文件 */
    async generate() {
        await fs.ensureDir(this.option.output.dir);
        if (this.option.output.fontName) {
            await this.generateSvgFont();
            await this.generateFontBySvgFont();
            await this.generateTypeDeclaration();
            await this.generateCss();
            await this.generatePreviewHtml();
        }
        if (this.option.output.svgComponent?.type === "react") {
            await this.generateSvgReactComponent(this.option.output.svgComponent);
        }
    }
}

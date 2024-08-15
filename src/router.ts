import fs from "fs-extra";
import path from "path";
import Router from "@koa/router";
import { FontManager } from "./utils/FontManager/index.js";
import { getSvgFilePathByName, importConfig, renameFile } from "./utils/index.js";
import { findRepeat, scanSvgFilePaths } from "./utils/FontManager/utils.js";

const router = new Router();

router.get("/api/list", async ctx => {
    const config = await importConfig();
    const fontManager = new FontManager(config);
    fontManager.read();
    ctx.body = {
        success: true,
        data: {
            font: fontManager.font
                ? {
                      name: fontManager.font.option.name,
                      metadata: fontManager.font.metadata,
                  }
                : undefined,
            component: fontManager.component && {
                metadata: fontManager.component.metadata,
            },
        },
    };
});

router.post("/api/generate", async ctx => {
    const config = await importConfig();
    const fontManager = new FontManager(config);
    fontManager.read();
    if (fontManager.font) {
        fs.removeSync(fontManager.font.getOutputPath());
    }
    if (fontManager.component) {
        fs.removeSync(fontManager.component.getOutputPath());
    }
    fontManager.generate();
    ctx.body = { success: true };
});

router.post("/api/rename", async ctx => {
    const { oldName, newName } = ctx.request.body;
    if (FontManager.isValidFileName(newName)) {
        const oldPath = await getSvgFilePathByName(oldName);
        if (oldPath) {
            const newPath = oldPath.replace(`${oldName}.svg`, `${newName}.svg`);
            await renameFile(oldPath, newPath);
            ctx.body = { success: true };
        } else {
            ctx.body = { success: false, message: "该原始文件不存在，请刷新页面获取最新组件列表" };
        }
    } else {
        ctx.body = { success: false, message: "名称必须以字母开头，只能包含字母、数字、下划线和中划线" };
    }
});

router.post("/api/remove", async ctx => {
    const { name } = ctx.request.body;
    const filePath = await getSvgFilePathByName(name);
    if (filePath) {
        fs.removeSync(filePath);
        console.log(`[delete]: ${filePath}`);
    }
    ctx.body = { success: true };
});

type AddData = { name: string; svg: string }[];

router.post("/api/add", async ctx => {
    const config = await importConfig();
    const data = ctx.request.body.data as AddData;
    const fileNames = scanSvgFilePaths(config.resourceDir).map(filePath => path.basename(filePath, ".svg"));
    const repeatNames = findRepeat(data.map(item => item.name).concat(fileNames));
    const invalidNames = data.filter(item => !FontManager.isValidFileName(item.name));
    if (repeatNames.length > 0 || invalidNames.length > 0) {
        ctx.body = {
            success: true,
            data: {
                names: fileNames,
                repeatNames,
                invalidNames,
            },
        };
    } else {
        const tasks = data.map(item => {
            const filePath = path.join(config.resourceDir, `${item.name}.svg`);
            return {
                filePath,
                task: fs.writeFile(filePath, item.svg),
            };
        });
        await Promise.all(tasks.map(item => item.task));
        console.log(`[add]: \n${tasks.map(item => item.filePath).join("\n")}`);
        ctx.body = { success: true };
    }
});

router.get("/api/scan", async ctx => {
    const config = await importConfig();

    const fontManager = new FontManager(config);
    const { scanner } = fontManager;
    fontManager.read();
    if (scanner) {
        const getFontUsage = () => {
            if (fontManager.font) {
                return scanner.scanUsage(fontManager.font.metadata.map(metadata => metadata.fileName));
            }
            return undefined;
        };
        const getSvgUsage = async () => {
            if (fontManager.component) {
                const svgUsage = await scanner.scanUsage(fontManager.component.metadata.map(metadata => metadata.name));
                return {
                    used: fontManager.component.metadata.filter(metadata => svgUsage.used.includes(metadata.name)).map(item => item.fileName),
                    unused: fontManager.component.metadata.filter(metadata => svgUsage.unused.includes(metadata.name)).map(item => item.fileName),
                };
            }
            return undefined;
        };

        ctx.body = {
            success: true,
            data:
                config.output.font || config.output.component
                    ? {
                          font: await getFontUsage(),
                          component: await getSvgUsage(),
                      }
                    : null,
        };
    } else {
        ctx.body = {
            success: false,
            message: "请配置扫描目录",
        };
    }
});

router.get("/api/ttf", async ctx => {
    const config = await importConfig();
    const fontManager = new FontManager(config);
    if (fontManager.font) {
        fontManager.read();
        const { ttfBuffer } = await fontManager.font.generateFontBuffer();
        ctx.body = ttfBuffer;
        ctx.set("Content-Disposition", `inline; filename="${fontManager.font.option.name ?? "font"}.ttf"`);
        ctx.set("Content-Type", "font/ttf");
    } else {
        ctx.body = {
            success: false,
            message: "请配置 output.font",
        };
    }
});

router.get("/api/woff", async ctx => {
    const config = await importConfig();
    const fontManager = new FontManager(config);
    if (fontManager.font) {
        fontManager.read();
        const { woffBuffer } = await fontManager.font.generateFontBuffer();
        ctx.body = woffBuffer();
        ctx.set("Content-Disposition", `inline; filename="${fontManager.font.option.name ?? "font"}.woff"`);
        ctx.set("Content-Type", "font/woff");
    } else {
        ctx.body = {
            success: false,
            message: "请配置字体",
        };
    }
});

router.get("/api/woff2", async ctx => {
    const config = await importConfig();
    const fontManager = new FontManager(config);
    if (fontManager.font) {
        fontManager.read();
        const { woff2Buffer } = await fontManager.font.generateFontBuffer();
        ctx.body = woff2Buffer();
        ctx.set("Content-Disposition", `inline; filename="${fontManager.font.option.name ?? "font"}.woff2"`);
        ctx.set("Content-Type", "font/woff2");
    } else {
        ctx.body = {
            success: false,
            message: "请配置字体",
        };
    }
});

export { router };

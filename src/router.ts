import fs from "fs-extra";
import path from "path";
import { glob } from "glob";
import Router from "@koa/router";
import { FontManager } from "./utils/FontManager";
import { getSvgFilePathByName, importConfig, renameFile } from "./utils";
import { CodeScanner } from "./utils/CodeScanner";
import { findRepeat, getAbsolutePath, scanSvgFilePaths } from "./utils/FontManager/utils";

const router = new Router();

router.get("/api/list", async ctx => {
    const config = await importConfig();
    const fontManager = new FontManager(config);
    fontManager.read();
    ctx.body = {
        success: true,
        data: {
            font: fontManager.option.output.font?.name
                ? {
                      name: fontManager.option.output.font?.name,
                      metadata: fontManager.fontMetadata,
                  }
                : undefined,
            component: fontManager.option.output.component && {
                metadata: fontManager.svgComponentMetadata,
            },
        },
    };
});

router.post("/api/generate", async ctx => {
    const config = await importConfig();
    const fontManager = new FontManager(config);
    fontManager.read();
    if (fontManager.option.output.font) {
        fs.removeSync(fontManager.getFontOutputPath());
    }
    if (fontManager.option.output.component) {
        fs.removeSync(fontManager.getComponentOutputPath());
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
    const cwd = config.scanDir?.rootDir ? getAbsolutePath(config.scanDir.rootDir) : process.cwd();
    if (config.scanDir) {
        const fontManager = new FontManager(config);
        fontManager.read();
        const filePaths = await glob(config.scanDir.includes, { ignore: config.scanDir.excludes, cwd });
        const scanner = new CodeScanner(filePaths.map(filePath => path.join(cwd, filePath)));

        const getFontUsage = () => scanner.findUsage(fontManager.fontMetadata.map(metadata => metadata.fileName));
        const getSvgUsage = async () => {
            const svgUsage = await scanner.findUsage(fontManager.svgComponentMetadata.map(metadata => metadata.name));
            return {
                used: fontManager.svgComponentMetadata.filter(metadata => svgUsage.used.includes(metadata.name)).map(item => item.fileName),
                unused: fontManager.svgComponentMetadata.filter(metadata => svgUsage.unused.includes(metadata.name)).map(item => item.fileName),
            };
        };

        ctx.body = {
            success: true,
            data:
                config.output.font || config.output.component
                    ? {
                          font: config.output.font && (await getFontUsage()),
                          component: config.output.component && (await getSvgUsage()),
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
    fontManager.read();
    const { ttfBuffer } = await fontManager.generateFontBuffer();
    ctx.body = ttfBuffer;
    ctx.set("Content-Disposition", `inline; filename="${fontManager.option.output.font?.name ?? "font"}.ttf"`);
    ctx.set("Content-Type", "font/ttf");
});

router.get("/api/woff", async ctx => {
    const config = await importConfig();
    const fontManager = new FontManager(config);
    fontManager.read();
    const { woffBuffer } = await fontManager.generateFontBuffer();
    ctx.body = woffBuffer();
    ctx.set("Content-Disposition", `inline; filename="${fontManager.option.output.font?.name ?? "font"}.woff"`);
    ctx.set("Content-Type", "font/woff");
});

router.get("/api/woff2", async ctx => {
    const config = await importConfig();
    const fontManager = new FontManager(config);
    fontManager.read();
    const { woff2Buffer } = await fontManager.generateFontBuffer();
    ctx.body = woff2Buffer();
    ctx.set("Content-Disposition", `inline; filename="${fontManager.option.output.font?.name ?? "font"}.woff2"`);
    ctx.set("Content-Type", "font/woff2");
});

export { router };

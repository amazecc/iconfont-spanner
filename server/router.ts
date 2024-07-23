import fs from "fs-extra";
import Router from "@koa/router";
import { FontManager } from "./utils/FontManager";
import { getFilePathByName, importConfig, renameFile } from "./utils";

const router = new Router();

router.get("/api/list", async ctx => {
    const config = await importConfig();
    const fontManager = new FontManager(config);
    fontManager.read();
    ctx.body = {
        success: true,
        data: {
            font: fontManager.option.output.fontName
                ? {
                      name: fontManager.option.output.fontName,
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
    fs.removeSync(config.output.dir);
    fontManager.generate();
    ctx.body = { success: true };
});

router.post("/api/rename", async ctx => {
    const { oldName, newName } = ctx.request.body;
    if (/^[a-zA-Z-_]+$/.test(newName)) {
        const oldPath = await getFilePathByName(oldName);
        const newPath = oldPath.replace(`${oldName}.svg`, `${newName}.svg`);
        await renameFile(oldPath, newPath);
        ctx.body = { success: true };
    } else {
        ctx.body = { success: false, message: "名称只能包含字母、下划线和中划线" };
    }
});

router.post("/api/remove", async ctx => {
    const { name } = ctx.request.body;
    const filePath = await getFilePathByName(name);
    fs.removeSync(filePath);
    console.log(`[delete]: ${filePath}`);
    ctx.body = { success: true };
});

router.get("/api/ttf", async ctx => {
    const config = await importConfig();
    const fontManager = new FontManager(config);
    fontManager.read();
    const { ttfBuffer } = await fontManager.generateFontBuffer();
    ctx.body = ttfBuffer;
    ctx.set("Content-Disposition", `inline; filename="${fontManager.option.output.fontName ?? "font"}.ttf"`);
    ctx.set("Content-Type", "font/ttf");
});

router.get("/api/woff", async ctx => {
    const config = await importConfig();
    const fontManager = new FontManager(config);
    fontManager.read();
    const { woffBuffer } = await fontManager.generateFontBuffer();
    ctx.body = woffBuffer();
    ctx.set("Content-Disposition", `inline; filename="${fontManager.option.output.fontName ?? "font"}.woff"`);
    ctx.set("Content-Type", "font/woff");
});

router.get("/api/woff2", async ctx => {
    const config = await importConfig();
    const fontManager = new FontManager(config);
    fontManager.read();
    const { woff2Buffer } = await fontManager.generateFontBuffer();
    ctx.body = woff2Buffer();
    ctx.set("Content-Disposition", `inline; filename="${fontManager.option.output.fontName ?? "font"}.woff2"`);
    ctx.set("Content-Type", "font/woff2");
});

export { router };

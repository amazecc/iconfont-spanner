import fs from "fs-extra";
import path from "path";
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
                      fontName: fontManager.option.output.fontName,
                      fontMetadata: fontManager.fontMetadata,
                  }
                : undefined,
            component: fontManager.option.output.component && fontManager.svgComponentMetadata,
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
    ctx.body = { success: true };
});

router.get("/api/ttf", async ctx => {
    const data = fs.createReadStream(path.resolve(process.cwd(), "babel.config.js"));
	ctx.set("Content-Type", "application/javascript");
    ctx.body = data;
});

export { router };

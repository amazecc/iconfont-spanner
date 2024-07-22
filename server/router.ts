import fs from "fs-extra";
import Router from "@koa/router";
import { FontManager } from "./utils/FontManager";
import { getFilePathByName, importConfig, renameFile } from "./utils";

const router = new Router();

router.get("/api/list", async ctx => {
    const config = await importConfig();
    const fontManager = new FontManager(config);
    ctx.body = {
        success: true,
        data: fontManager.read(),
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

export { router };

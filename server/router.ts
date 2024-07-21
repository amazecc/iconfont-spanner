import path from "path";
import Router from "@koa/router";
import { FontManager } from "./utils/FontManager";
import { importConfig, renameFile } from "./utils";

const router = new Router();

router.get("/api/list", async ctx => {
    const config = await importConfig();
    const fontManager = new FontManager(config);
    ctx.body = fontManager.read();
});

router.post("/api/generate", async ctx => {
    const config = await importConfig();
    const fontManager = new FontManager(config);
    fontManager.read();
    fontManager.generate();
    ctx.status = 204;
});

router.get("/api/rename", async ctx => {
    const config = await importConfig();
    renameFile(path.resolve(config.resourceDir, `icon-area.svg`), path.resolve(config.resourceDir, `icon-area.svg`));
	ctx.status = 204;
});

export { router };

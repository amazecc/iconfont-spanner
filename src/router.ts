import fs from "fs-extra";
import path from "path";
import Router from "@koa/router";
import { FontManager } from "./utils/FontManager/index.js";
import { getSvgFilePathByName, importConfig, renameFile } from "./utils/index.js";
import { findRepeat, scanSvgFilePaths } from "./utils/FontManager/utils.js";
import { ResponseBody, ResponseError } from "./api/response.js";

const router = new Router();

router.get("/api/info", async ctx => {
    const config = await importConfig();
    ctx.body = new ResponseBody({
        title: config.title ?? "Iconfont-Spanner",
    });
});

router.get("/api/list", async ctx => {
    const config = await importConfig();
    const fontManager = new FontManager(config);
    fontManager.read();
    ctx.body = new ResponseBody({
        font: fontManager.font
            ? {
                  name: fontManager.font.option.name,
                  metadata: fontManager.font.metadata,
              }
            : undefined,
        component: fontManager.component && {
            metadata: fontManager.component.metadata,
        },
    });
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
    ctx.body = new ResponseBody(null);
});

router.post("/api/rename", async ctx => {
    const { oldName, newName } = ctx.request.body;
    if (FontManager.isValidFileName(newName)) {
        const oldPath = await getSvgFilePathByName(oldName);
        if (oldPath) {
            const newPath = oldPath.replace(`${oldName}.svg`, `${newName}.svg`);
            await renameFile(oldPath, newPath);
            ctx.body = new ResponseBody(null);
        } else {
            ctx.body = new ResponseError("该原始文件不存在，请刷新页面获取最新组件列表");
        }
    } else {
        ctx.body = new ResponseError("名称必须以字母开头，只能包含字母、数字、下划线和中划线");
    }
});

router.post("/api/remove", async ctx => {
    const { name } = ctx.request.body;
    const filePath = await getSvgFilePathByName(name);
    if (filePath) {
        fs.removeSync(filePath);
        console.log(`[delete]: ${filePath}`);
    }
    ctx.body = new ResponseBody(null);
});

type AddData = { name: string; svg: string }[];

router.post("/api/add", async ctx => {
    const config = await importConfig();
    const data = ctx.request.body.data as AddData;
    const fileNames = scanSvgFilePaths(config.resourceDir).map(filePath => path.basename(filePath, ".svg"));
    const repeatNames = findRepeat(data.map(item => item.name).concat(fileNames));
    const invalidNames = data.filter(item => !FontManager.isValidFileName(item.name));
    if (repeatNames.length > 0 || invalidNames.length > 0) {
        ctx.body = new ResponseBody({
            names: fileNames,
            repeatNames,
            invalidNames,
        });
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
        ctx.body = new ResponseBody(null);
    }
});

router.get("/api/scan", async ctx => {
    const config = await importConfig();

    const fontManager = new FontManager(config);
    const { scanner, font, component } = fontManager;
    fontManager.read();
    if (scanner) {
        const getFontUsage = () => {
            if (font) {
                return scanner.scanUsage(font.metadata.map(metadata => metadata.fileName));
            }
            return undefined;
        };
        const getSvgUsage = async () => {
            if (component) {
                const svgUsage = await scanner.scanUsage(component.metadata.map(metadata => metadata.name));
                return {
                    used: component.metadata.filter(metadata => svgUsage.used.includes(metadata.name)).map(item => item.fileName),
                    unused: component.metadata.filter(metadata => svgUsage.unused.includes(metadata.name)).map(item => item.fileName),
                };
            }
            return undefined;
        };

        ctx.body = new ResponseBody(
            font || component
                ? {
                      font: await getFontUsage(),
                      component: await getSvgUsage(),
                  }
                : null,
        );
    } else {
        ctx.body = new ResponseError("请配置扫描目录");
    }
});

router.post("/api/prefix", async ctx => {
    const config = await importConfig();
    const newPrefix = ctx.request.body.newPrefix as string;
    const oldPrefix = ctx.request.body.oldPrefix as string;
    const paths = scanSvgFilePaths(config.resourceDir)
        .filter(item => {
            const fileFullName = path.basename(item);
            // 1. 提取需要替换旧前缀，或者与新前缀不等的项
            return fileFullName.startsWith(oldPrefix) || !fileFullName.startsWith(newPrefix);
        })
        .map(item => {
            const dirname = path.dirname(item);
            const fileFullName = path.basename(item);
            const caseRegex = new RegExp(`^${newPrefix}`, "i");
            const isDifferentCase = caseRegex.test(fileFullName);

            const newFileFullName =
                oldPrefix && fileFullName.startsWith(oldPrefix)
                    ? fileFullName.replace(new RegExp(`^${oldPrefix}`), newPrefix) // 2. 替换旧前缀
                    : isDifferentCase
                      ? fileFullName.replace(caseRegex, newPrefix) // 3. 前缀大小写替换
                      : `${newPrefix}${fileFullName}`; // 4. 添加新前缀

            return {
                oldPath: item,
                newPath: path.join(dirname, newFileFullName),
            };
        });
    for (const { oldPath, newPath } of paths) {
        await renameFile(oldPath, newPath);
    }
    ctx.body = new ResponseBody(null);
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
        ctx.body = new ResponseError("请配置 output.font");
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
        ctx.body = new ResponseError("请配置字体");
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
        ctx.body = new ResponseError("请配置字体");
    }
});

export { router };

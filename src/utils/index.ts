import path from "path";
import fs from "fs-extra";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { exec } from "child_process";
import { scanSvgFilePaths } from "./FontManager/utils.js";
import type { FontManagerOption } from "./FontManager/index.js";
import { fileURLToPath } from "url";

const isCommonJS = typeof require !== "undefined" && typeof module !== "undefined";
// @ts-ignore
const _filename = isCommonJS ? __filename : fileURLToPath(import.meta.url);
// const _dirname = isCommonJS ? __filename : path.dirname(_filename);

/**
 * 导入根目录文件
 * @param fileName 根目录文件名,可以是嵌套文件
 * @returns 返回文件木模块
 */
export const importRootFile = async (fileName: string) => {
    const backToCwdRelativePath = path.relative(path.dirname(_filename), process.cwd()); // 回退到 cwd 的地址字符，如 ../..
    const filePath = path.join(backToCwdRelativePath, fileName).split(path.sep).join(path.posix.sep); // 强制转换为 linux 下的正斜杠路径，遵循 javascript 模块地址标准
    return import(filePath);
};

/** 导入配置项 */
export const importConfig = (): Promise<FontManagerOption> => importRootFile("iconfont.config.js").then(res => res.default);

/** 根据名称获取 svg 文件绝对地址 */
export const getSvgFilePathByName = async (name: string) => {
    const config = await importConfig();
    return scanSvgFilePaths(config.resourceDir).find(item => path.basename(item, ".svg") === name);
};

/**
 * 执行 shell 命令并返回一个 Promise
 */
export const execCommand = async (cmd: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(stderr);
            } else {
                resolve(stdout.trim());
            }
        });
    });
};

/**
 * 重命名文件
 */
export const renameFile = async (oldPath: string, newPath: string) => {
    fs.renameSync(oldPath, newPath);

    // 大小写变化，则 git mv 处理
    const oldFileName = path.basename(oldPath);
    const newFileName = path.basename(newPath);

    if (oldFileName !== newFileName && oldFileName.toLocaleLowerCase() === newFileName.toLocaleLowerCase()) {
        await execCommand(`git mv ${oldPath} ${newPath}`)
            .then(() => {
                console.log(`[rename]: ${oldFileName} -> ${newFileName}（大小写变化，追加 git mv 处理）`);
            })
            .catch(() => {
                // 不做处理
            });
    } else {
        console.log(`[rename]: ${oldFileName} -> ${newFileName}`);
    }
};

/**
 * 获取命令行参数
 * @example
 * ```sh
 * yarn build dev --url=www.example.com -D  // getCommandLineParams().array = ["dev"]; getCommandLineParams().object = { url: "www.example.com", D: true }
 * ```
 */
export const getCommandLineParams = <A extends string[] = string[], O extends Record<string, any> = Record<string, any>>() => {
    const { _: paramsArray, ...restParams } = yargs(hideBin(process.argv)).argv as any;
    return {
        array: paramsArray as A,
        object: restParams as O,
    };
};

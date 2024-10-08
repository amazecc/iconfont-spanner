import { pathToFileURL } from "url";
import path from "path";
import fs from "fs-extra";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { exec } from "child_process";
import { getPosixPath, scanSvgFilePaths } from "./FontManager/utils.js";
import type { Config } from "./type.js";

/**
 * 导入根目录文件
 * @param fileName 根目录文件名,可以是嵌套文件
 * @returns 返回文件木模块
 */
export const importRootFile = async (fileName: string) => import(pathToFileURL(getPosixPath(path.resolve(process.cwd(), fileName))).href);

/** 导入配置项 */
export const importConfig = async (): Promise<Config> =>
    importRootFile("iconfont.config.mjs")
        .catch(() => importRootFile("iconfont.config.js"))
        .then(config => config.default);

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
        await execCommand(`git mv ${getPosixPath(oldPath)} ${getPosixPath(newPath)}`)
            .then(() => {
                console.log(`[rename]: ${oldFileName} -> ${newFileName} 成功，大小写变化，追加 git mv 处理`);
            })
            .catch(() => {
                // 不做处理
            });
    } else {
        console.log(`[rename]: ${oldFileName} -> ${newFileName} 成功`);
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

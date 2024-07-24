import path from "path";
import fs from "fs-extra";
import { exec } from "child_process";
import { FontManagerOption } from "./FontManager/type";
import { walkFileSync } from "./FontManager/utils";

/**
 * 导入根目录文件
 * @param fileName 根目录文件名,可以是嵌套文件
 * @returns 返回文件木模块
 */
export const importRootFile = async (fileName: string) => {
    const backToPwdPath = path.relative(path.dirname(__filename), process.cwd()); // 回退到 pwd 的地址字符，如 ../..
    const filePath = path.join(backToPwdPath, fileName);
    return import(filePath);
};

/** 导入配置项 */
export const importConfig = (): Promise<FontManagerOption> => importRootFile("iconfont.config.js").then(res => res.default);

/** 根据名称获取文件绝对地址 */
export const getFilePathByName = async (name: string) => {
    const config = await importConfig();
    let fileAbsolutePath = "";
    walkFileSync(config.resourceDir, (filePath, isFile) => {
        if (isFile) {
            if (filePath && path.extname(filePath) === ".svg") {
                const fileName = path.basename(filePath, ".svg");
                if (fileName === name) {
                    fileAbsolutePath = filePath;
                }
            }
        }
    });
    return fileAbsolutePath;
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

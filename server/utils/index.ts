import path from "path";
import fs from "fs-extra";
import { exec } from "child_process";
import { FontManagerOption } from "./FontManager/type";

// TODO: 找到准确方案
/**
 * 导入根目录文件
 * @param fileName 根目录文件名
 * @param currentFilename 运行该函数文件绝对地址
 * @returns 返回文件资源
 */
export const importRootFile = async (fileName: string, currentFilename: string) => {
    const backToPwdPath = path.relative(currentFilename, process.cwd()); // 回退到 pwd 的地址字符，如 ../..
    const filePath = path.join(backToPwdPath, fileName);
    const result = await import(filePath);
	return result;
};

/** 导入配置项 */
export const importConfig = (): Promise<FontManagerOption> => importRootFile("iconfont.config.js", __dirname).then(res => res.default);

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
 * 检查当前目录是否在 Git 仓库中
 */
export const isGitRepository = async () => {
    try {
        await execCommand("git rev-parse --is-inside-work-tree");
        return true;
    } catch (err) {
        return false;
    }
};

/**
 * 重命名文件或目录
 */
export const renameFile = async (oldPath: string, newPath: string) => {
    const isGitRepo = await isGitRepository();
    if (isGitRepo) {
        await execCommand(`git mv ${oldPath} ${newPath}`);
    } else {
        fs.renameSync(oldPath, newPath);
    }
};

import path from "path";
import fs from "fs-extra";
import { spawnSync } from "child_process";
import yargs from "yargs";
import prettier, { Options } from "prettier";
import { hideBin } from "yargs/helpers";

/** 执行 shell 命令 */
export const exec = (command: string) => {
    const arrayCommand = command.split(" ");
    const result = spawnSync(arrayCommand[0]!, arrayCommand.slice(1), { stdio: "inherit" });
    if (result.error) {
        console.error(result.error);
        process.exit(1);
    }

    if (result.status !== 0) {
        console.error(`non-zero exit code returned, code=${result.status}, command=${command}`);
        process.exit(1);
    }
};

/** 遍历当前文件夹下的所有文件路径 */
export const walkFileSync = (currentPath: string, callback: (filePath: string, isFile: boolean) => void) => {
    const currentStat = fs.statSync(currentPath);
    if (currentStat.isFile()) {
        callback(currentPath, true);
        return;
    }
    fs.readdirSync(currentPath).forEach(name => {
        const filePath = path.join(currentPath, name);
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
            callback(filePath, true);
        } else if (stat.isDirectory()) {
            callback(filePath, false);
            walkFileSync(filePath, callback);
        }
    });
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

/** 使用 prettier 格式化代码 */
export const formatCode = (code: string, parser: Options["parser"] = "typescript") => {
    return prettier.format(code, { ...JSON.parse(fs.readFileSync(path.resolve(process.cwd(), ".prettierrc")).toString()), parser });
};

/** 大写第一个字符 */
export const lowerCaseFirstLetter = (str: string) => str.replace(/^[A-Z]/, item => item.toLowerCase());

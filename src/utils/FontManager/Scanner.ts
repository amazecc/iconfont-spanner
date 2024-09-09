import readline from "readline";
import fs from "fs";
import { glob } from "glob";
import { getAbsolutePath, regex } from "./utils.js";
import path from "path";

/** 文件扫描文件夹配置 */
export interface ScanOption {
    /** 包含的文件夹 */
    includes: string[];
    /** 排除的文件夹, 一般要排除输出目录 output.dir */
    excludes?: string[];
    /** 基于该目录扫表，默认 process.cwd() */
    rootDir?: string;
}

/** 代码扫描，查询关键词在代码中的使用情况 */
export class Scanner {
    private static async readlinePromise(filePath: string, listener: (input: string) => void) {
        const readStream = fs.createReadStream(filePath);
        return new Promise<void>(resolve => {
            const rl = readline.createInterface({ input: readStream });
            rl.on("line", listener);
            rl.on("close", resolve);
        });
    }

    /**
     * 扫描，输出关键词列表，返回没有使用的关键词列表
     * @param keywords
     */
    private static async scanUsageByPaths(filePaths: string[], keywords: string[]) {
        const usedSet: Set<string> = new Set();
        await Promise.all(
            filePaths.map(filePath =>
                Scanner.readlinePromise(filePath, line => {
                    keywords.forEach(keyword => {
                        if (regex.usageKeyword(keyword).test(line)) {
                            usedSet.add(keyword);
                        }
                    });
                }),
            ),
        );
        const unused = keywords.filter(keyword => !usedSet.has(keyword));
        return { used: [...usedSet], unused };
    }

    private readonly option: Required<ScanOption>;

    constructor(option: ScanOption) {
        this.option = {
            excludes: [],
            ...option,
            rootDir: option.rootDir ? getAbsolutePath(option.rootDir) : process.cwd(),
        };
    }

    /** 扫描关键词使用情况 */
    public async scanUsage(keywords: string[]) {
        const { includes, excludes, rootDir } = this.option;
        const filePaths = await glob(includes, { ignore: excludes, cwd: rootDir });

        return Scanner.scanUsageByPaths(
            filePaths.map(filePath => path.join(rootDir, filePath)),
            keywords,
        );
    }
}

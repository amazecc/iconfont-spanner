import readline from "readline";
import fs from "fs";

export class CodeScanner {
    private static async readlinePromise(filePath: string, listener: (input: string) => void) {
        const readStream = fs.createReadStream(filePath);
        return new Promise<void>(resolve => {
            const rl = readline.createInterface({ input: readStream });
            rl.on("line", listener);
            rl.on("close", resolve);
        });
    }

    private filePaths: string[];

    constructor(filePaths: string[]) {
        this.filePaths = filePaths;
    }

    /**
     * 扫描，输出关键词列表，返回没有使用的关键词列表
     * @param keywords
     */
    public async findUsage(keywords: string[]) {
        const usedSet: Set<string> = new Set();
        await Promise.all(
            this.filePaths.map(filePath =>
                CodeScanner.readlinePromise(filePath, line => {
                    keywords.forEach(keyword => {
                        if (line.includes(keyword)) {
                            usedSet.add(keyword);
                        }
                    });
                }),
            ),
        );
        const unused = keywords.filter(keyword => !usedSet.has(keyword));
        return { used: [...usedSet], unused };
    }
}

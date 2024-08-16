import { spawnSync } from "child_process";

/** 执行 shell 命令 */
export const runShell = (command: string) => {
    const arrayCommand = command.split(" ");
    const result = spawnSync(arrayCommand[0], arrayCommand.slice(1), { stdio: "inherit", shell: true });
    if (result.error) {
        console.error(result.error);
        process.exit(1);
    }

    if (result.status !== 0) {
        console.error(`non-zero exit code returned, code=${result.status}, command=${command}`);
        process.exit(1);
    }
};

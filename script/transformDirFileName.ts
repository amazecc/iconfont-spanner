import path from "path";
import fs from "fs-extra";
import { globSync } from "glob";

globSync(path.resolve(process.cwd(), "out/cjs/**/*.js")).forEach(absolutePath => {
    const content = fs.readFileSync(absolutePath, "utf-8").toString();
    fs.writeFileSync(
        absolutePath,
        content.replace(/((?:const|let|var)\s+(__FILENAME|__DIRNAME)).+?$/gm, (_, $1, $2) => {
            return `${$1} = ${$2.toLowerCase()};`;
        }),
    );
});

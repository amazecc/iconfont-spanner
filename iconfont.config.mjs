import path from "path";
import fs from "fs";
import prettier from "prettier";
import { getSvgTSReactComponentContent, toBigCamelCase } from "./src/index.js";
import { fileURLToPath } from "url";

const _dirname = path.dirname(fileURLToPath(import.meta.url));

const formatCode = (code, parser) => {
    return prettier.format(code, { ...JSON.parse(fs.readFileSync(path.resolve(_dirname, ".prettierrc"))).toString(), parser });
};

/** @type {import('./src/index.js').Config} */
export default {
    title: "Iconfont Preview",
    resourceDir: "client/src/svg",
    output: {
        font: {
            dir: "client/src/font",
            name: "iconfont",
            format: formatCode,
        },
        component: {
            dir: "client/src/font/components",
            fileFullName: fileName => `${toBigCamelCase(fileName.replace(/_oc$/, "_OC"))}.tsx`,
            name: fileName => toBigCamelCase(fileName.replace(/_oc$/, "_OC")),
            content: (...args) => formatCode(getSvgTSReactComponentContent(...args), "typescript"),
            clearColor: fileName => !fileName.endsWith("_oc"),
        },
    },
    scan: {
        rootDir: "client",
        includes: ["src/**/*.{ts,tsx,js,jsx}"],
        excludes: ["src/font/**/*", "**/*.d.ts"],
    },
};

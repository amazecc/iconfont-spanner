const path = require("path");
const fs = require("fs");
const prettier = require("prettier");
const { getSvgTSReactComponentContent, toBigCamelCase } = require("./src");

const formatCode = (code, parser) => {
    return prettier.format(code, { ...JSON.parse(fs.readFileSync(path.resolve(__dirname, ".prettierrc"))).toString(), parser });
};

/** @type {import('./src').FontManagerOption} */
module.exports = {
    resourceDir: path.join(process.cwd(), "client/src/svg"),
    output: {
        font: {
            dir: path.join(process.cwd(), "client/src/font"),
            name: "iconfont",
            format: formatCode,
        },
        component: {
            dir: path.join(process.cwd(), "client/src/font/react-components"),
            fileFullName: fileName => `${toBigCamelCase(fileName.replace(/_oc$/, "_OC"))}.tsx`,
            name: fileName => toBigCamelCase(fileName.replace(/_oc$/, "_OC")),
            content: (...args) => formatCode(getSvgTSReactComponentContent(...args), "typescript"),
            fillCurrentColor: fileName => !fileName.endsWith("_oc"),
        },
    },
    scanDir: {
        rootDir: path.join(process.cwd(), "client"),
        includes: ["src/**/*.{ts,tsx,js,jsx}"],
        excludes: ["src/font/**/*", "**/*.d.ts"],
    },
};

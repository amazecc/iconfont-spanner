const path = require("path");
const fs = require("fs");
const prettier = require("prettier");
const { getSvgTSReactComponentContent, toBigCamelCase } = require("./src");

const formatCode = (code, parser) => {
    return prettier.format(code, { ...JSON.parse(fs.readFileSync(path.resolve(__dirname, ".prettierrc"))).toString(), parser });
};

/** @type {import('./src').FontManagerOption} */
module.exports = {
    resourceDir: "client/src/svg",
    output: {
        font: {
            dir: "client/src/font",
            name: "iconfont",
            format: formatCode,
        },
        component: {
            dir: "client/src/font/react-components",
            fileFullName: fileName => `${toBigCamelCase(fileName.replace(/_oc$/, "_OC"))}.tsx`,
            name: fileName => toBigCamelCase(fileName.replace(/_oc$/, "_OC")),
            content: (...args) => formatCode(getSvgTSReactComponentContent(...args), "typescript"),
            fillCurrentColor: fileName => !fileName.endsWith("_oc"),
        },
    },
    scanDir: {
        rootDir: "client",
        includes: ["src/**/*.{ts,tsx,js,jsx}"],
        excludes: ["src/font/**/*", "**/*.d.ts"],
    },
};

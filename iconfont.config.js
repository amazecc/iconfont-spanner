const path = require("path");
const fs = require("fs");
const prettier = require("prettier");
const { getSvgTSReactComponentContent, toBigCamelCase } = require("./server/src");

const formatCode = (code, parser) => {
    return prettier.format(code, { ...JSON.parse(fs.readFileSync(path.resolve(__dirname, ".prettierrc"))).toString(), parser });
};

/** @type {import('./server/src').FontManagerOption} */
module.exports = {
    resourceDir: path.join(process.cwd(), "client/src/svg"),
    output: {
        dir: path.join(process.cwd(), "client/src/font"),
        font: {
            name: "iconfont",
            format: (content, type) => formatCode(content, type),
        },
        component: {
            dir: "react-components",
            fileName: fileName => `${toBigCamelCase(fileName.replace(/_oc$/, "_OC"))}.tsx`,
            name: fileName => toBigCamelCase(fileName.replace(/_oc$/, "_OC")),
            content: (...args) => formatCode(getSvgTSReactComponentContent(...args), "typescript"),
            fillCurrentColor: fileName => !fileName.endsWith("_oc"),
        },
    },
};

const path = require("path");
const { getSvgTSReactComponentContent, toBigCamelCase } = require("./server/src");

/** @type {import('./server').FontManagerOption} */
module.exports = {
    resourceDir: path.join(process.cwd(), "client/src/svg"),
    output: {
        dir: path.join(process.cwd(), "client/src/font"),
        fontName: "iconfont",
        component: {
            dir: "react-components",
            fileName: fileName => `${toBigCamelCase(fileName.replace(/_oc$/, "_OC"))}.tsx`,
            name: fileName => toBigCamelCase(fileName.replace(/_oc$/, "_OC")),
            content: getSvgTSReactComponentContent,
            fillCurrentColor: fileName => !fileName.endsWith("_oc"),
        },
    },
};

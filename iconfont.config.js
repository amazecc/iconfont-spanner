import path from "path";
import { getSvgTSReactComponentContent, toBigCamelCase } from "./server/utils/FontManager/utils";

/** @type {import('./server/utils/FontManager/type').FontManagerOption} */
export default {
    resourceDir: path.join(process.cwd(), "src/svg"),
    output: {
        dir: path.join(process.cwd(), "src/font"),
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

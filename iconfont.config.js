import path from "path";
import { getSvgTSReactComponentContent } from "./server/utils/FontManager/utils";

/** @type {import('./server/utils/FontManager/type').FontManagerOption} */
export default {
    resourceDir: path.join(process.cwd(), "src/svg"),
    output: {
        dir: path.join(process.cwd(), "src/font"),
        fontName: "iconfont",
        svgComponent: {
            type: "react",
            dir: "react-components",
            content: getSvgTSReactComponentContent,
        },
    },
};

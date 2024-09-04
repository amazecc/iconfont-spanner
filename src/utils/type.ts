import type { FontManagerOption } from "./FontManager/index.js";

/** 配置文件定义 */
export interface Config extends FontManagerOption {
    /**
     * 名称，作为网页标题显示
     * @default Iconfont-Spanner
     */
    title?: string;
}

import type { SvgComponentMetadata } from "server/utils/FontManager/Component";
import type { FontMetadata } from "server/utils/FontManager/Font";
import { request } from "src/utils/request";

export interface FontData {
    font?: {
        name: string;
        metadata: FontMetadata[];
    };
    component?: {
        metadata: SvgComponentMetadata[];
    };
}

export const getIconList = (): Promise<FontData> => {
    return request("/api/list", { method: "GET" });
};

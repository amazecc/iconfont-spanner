import type { SvgComponentMetadata } from "server/utils/FontManager/Component";
import type { FontMetadata } from "server/utils/FontManager/Font";

export interface FontData {
    font?: {
        name: string;
        metadata: FontMetadata[];
    };
    component?: {
        metadata: SvgComponentMetadata[];
    };
}

export const getIconList = async () => {
    return fetch("/api/list")
        .then(res => res.json())
        .then(res => res.data as FontData);
};

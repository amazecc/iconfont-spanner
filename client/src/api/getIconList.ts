import type { SvgComponentMetadata, FontMetadata } from "@/utils/FontManager/type";

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

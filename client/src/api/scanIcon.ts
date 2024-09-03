import { request } from "src/utils/request";

export interface FontUsage {
    font?: {
        used: string[];
        unused: string[];
    };
    component?: {
        used: string[];
        unused: string[];
    };
}

export const scanIcon = (): Promise<FontUsage> => {
    return request("/api/scan", {
        method: "GET",
    });
};

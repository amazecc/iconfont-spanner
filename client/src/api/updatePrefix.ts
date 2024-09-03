import { request } from "src/utils/request";

export const updatePrefix = (newPrefix: string, oldPrefix?: string): Promise<void> => {
    return request("/api/prefix", {
        method: "POST",
        body: JSON.stringify({ newPrefix, oldPrefix }),
    });
};

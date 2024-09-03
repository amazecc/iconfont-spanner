import { request } from "src/utils/request";

export const generateIcon = (): Promise<void> => {
    return request("/api/generate", {
        method: "POST",
    });
};

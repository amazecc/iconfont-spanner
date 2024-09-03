import { request } from "src/utils/request";

export const removeIcon = (name: string): Promise<void> => {
    return request("/api/remove", {
        method: "POST",
        body: JSON.stringify({ name }),
    });
};

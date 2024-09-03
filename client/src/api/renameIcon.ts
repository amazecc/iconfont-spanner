import { request } from "src/utils/request";

export const renameIcon = (oldName: string, newName: string): Promise<void> => {
    return request("/api/rename", {
        method: "POST",
        body: JSON.stringify({ oldName, newName }),
    });
};

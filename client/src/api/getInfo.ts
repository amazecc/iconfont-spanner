import { request } from "src/utils/request";

export interface Info {
    title: string;
}

export const getInfo = (): Promise<Info> => {
    return request("/api/info", { method: "GET" });
};

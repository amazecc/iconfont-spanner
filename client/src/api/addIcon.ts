import { request } from "src/utils/request";

export interface AddIconBody {
    data: { name: string; svg: string }[];
}

/** 返回重复的名称 */
export type AddIconResponse =
    | {
          names: string[];
          repeatNames: string[];
          invalidNames: string[];
      }
    | undefined;

export const addIcon = (body: AddIconBody): Promise<AddIconResponse> => {
    return request("/api/add", {
        method: "POST",
        body: JSON.stringify(body),
    });
};

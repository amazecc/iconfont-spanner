export interface AddIconBody {
    data: { name: string; svg: string }[];
}

/** 返回重复的名称 */
export type AddIconResponse =
    | {
          names: string[];
          repeatNames: string[];
      }
    | undefined;

export const addIcon = async (body: AddIconBody): Promise<AddIconResponse> => {
    return fetch("/api/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json", // 设置请求头，指明请求体格式为 JSON
        },
        body: JSON.stringify(body),
    })
        .then(res => res.json())
        .then(res => res.data);
};

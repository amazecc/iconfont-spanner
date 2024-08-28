export const updatePrefix = async (newPrefix: string, oldPrefix?: string) => {
    return fetch("/api/prefix", {
        method: "POST",
        headers: {
            "Content-Type": "application/json", // 设置请求头，指明请求体格式为 JSON
        },
        body: JSON.stringify({ newPrefix, oldPrefix }),
    });
};

export const removeIcon = async (name: string) => {
    return fetch("/api/remove", {
        method: "POST",
        headers: {
            "Content-Type": "application/json", // 设置请求头，指明请求体格式为 JSON
        },
        body: JSON.stringify({ name }),
    }).then(res => res.json());
};

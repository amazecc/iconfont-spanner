export const renameIcon = async (oldName: string, newName: string) => {
    return fetch("/api/rename", {
        method: "POST",
        headers: {
            "Content-Type": "application/json", // 设置请求头，指明请求体格式为 JSON
        },
        body: JSON.stringify({ oldName, newName }),
    })
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                return res.data;
            }
            throw new Error(res.message);
        });
};

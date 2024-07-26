export interface FontUsage {
    font?: {
        used: string[];
        unused: string[];
    };
    component?: {
        used: string[];
        unused: string[];
    };
}

export const scanIcon = async () => {
    return fetch("/api/scan", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                return res.data as FontUsage;
            }
            throw new Error(res.message);
        });
};

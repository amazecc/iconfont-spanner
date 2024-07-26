export const generateIcon = () => {
    return fetch("/api/generate", { method: "POST" });
};

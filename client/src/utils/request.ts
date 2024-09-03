import { APIException } from "./exception";

export const request = async <R>(url: string, init?: RequestInit): Promise<R> => {
    return fetch(url, {
        ...init,
        headers: {
            ...init?.headers,
            "Content-Type": "application/json",
        },
    })
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                return res.data as R;
            }
            throw new APIException(res.message);
        });
};

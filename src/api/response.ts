export interface ResponsePayload<T> {
    success: boolean;
    message: string;
    data: T;
}

/** 异常返回 */
export class ResponseError implements ResponsePayload<null> {
    readonly success = false;

    readonly message: string;

    readonly data = null;

    constructor(message: string) {
        this.message = message;
    }
}

/** 正常返回 */
export class ResponseBody<T> implements ResponsePayload<T> {
    readonly success = true;

    readonly message = "";

    readonly data: T;

    constructor(data: T) {
        this.data = data;
    }
}

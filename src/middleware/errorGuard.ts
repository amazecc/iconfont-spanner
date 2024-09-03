import { Middleware } from "koa";
import { ResponseError } from "../api/response.js";

export const errorGuard: Middleware = async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        if (err instanceof Error && err.message.includes("operation not permitted, lstat")) {
            ctx.body = new ResponseError("操作失败，文件可能被其他进程锁定，建议关闭项目开发服务器再重试！");
        } else {
            ctx.body = new ResponseError("服务异常，可查看终端日志反馈到 issue");
            console.error("Error caught:", err); // 可以记录到日志系统
        }
    }
};

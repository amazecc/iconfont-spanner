import path from "path";
import Koa from "koa";
import serve from "koa-static";
import history from "koa2-connect-history-api-fallback";
import cors from "@koa/cors";
import { bodyParser } from "@koa/bodyparser";
import { router } from "./router";

const app = new Koa();

app.use(bodyParser())
    .use(cors())
    .use(router.routes())
    .use(router.allowedMethods())
    .use(serve(path.resolve(__dirname, "static")))
    .use(history);

export const start = (port = 3000) => {
    const server = app.listen(port, () => {
        console.log(`server: http://localhost:${port}`);
    });

    server.on("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
            console.log(`Port ${port} is in use, trying another port...`);
            start(port + 1);
        } else {
            console.error(`Server error: ${err}`);
        }
    });
};

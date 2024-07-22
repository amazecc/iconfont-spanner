import path from "path";
import Koa from "koa";
import serve from "koa-static";
import history from "koa2-connect-history-api-fallback";
import cors from "@koa/cors";
import { bodyParser } from "@koa/bodyparser";
import { router } from "./router";

const app = new Koa();

app.use(cors())
    .use(bodyParser())
    .use(router.routes())
    .use(router.allowedMethods())
    .use(serve(path.resolve(process.cwd(), "client")))
    .use(history);

export const startServer = (port = 3000) => {
    const server = app.listen(port, () => {
        console.log(`server: http://localhost:${port}`);
    });

    server.on("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
            console.log(`Port ${port} is in use, trying another port...`);
            startServer(port + 1);
        } else {
            console.error(`Server error: ${err}`);
        }
    });
};

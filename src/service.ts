import path from "path";
import Koa from "koa";
import serve from "koa-static";
import { historyApiFallback } from "koa2-connect-history-api-fallback";
import cors from "@koa/cors";
import { bodyParser } from "@koa/bodyparser";
import { router } from "./router.js";
import { fileURLToPath } from "url";

const app = new Koa();

const isCommonJS = typeof require !== "undefined" && typeof module !== "undefined";
// @ts-ignore
const _filename = isCommonJS ? __filename : fileURLToPath(import.meta.url);
const _dirname = isCommonJS ? __dirname : path.dirname(_filename);

app.use(bodyParser())
    .use(cors())
    .use(router.routes())
    .use(router.allowedMethods())
    .use(serve(path.resolve(_dirname, "../static")))
    .use(historyApiFallback);

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

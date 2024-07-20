import path from "path";
import Koa from "koa";
import Router from "@koa/router";
import serve from "koa-static";
import history from "koa2-connect-history-api-fallback";

const app = new Koa();

const router = new Router();

router.get("/aa", ctx => {
    ctx.body = "Hello, World!";
});

app.use(router.routes())
    .use(router.allowedMethods())
    .use(serve(path.resolve(process.cwd(), "client")))
    .use(history);

const startServer = (port = 3000) => {
    const server = app.listen(port, () => {
        console.log(`visit server: http://localhost:${port}`);
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

startServer();

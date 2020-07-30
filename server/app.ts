import * as colors from "https://deno.land/std@0.56.0/fmt/colors.ts";
import { Application, send } from "https://deno.land/x/oak/mod.ts";
import * as db from "./db.ts";
import { TheRouter } from "./router.ts";
import { SocketServer } from "https://deno.land/x/sockets@master/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

  db.create("./db.db");
  const router = TheRouter();

  const app = new Application({
    keys: ["- The super duper awesome secret! -"],
  });

  // Logger
  app.use(async (ctx, next) => {
    await next();
    const rt = ctx.response.headers.get("X-Response-Time");
    console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
  });

  // Timing
  app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.response.headers.set("X-Response-Time", `${ms}ms`);
  });

  app.use(oakCors({ origin: /^.+localhost:(3000|5000)$/ }));//{ origin: /^.+localhost:(5000|3000)$/, optionsSuccessStatus: 200 }));
  app.use(router.routes());
  app.use(router.allowedMethods());

  app.use(async (ctx) => {
    await send(ctx, ctx.request.url.pathname, {
      root: `${Deno.cwd()}/../static`,
      index: "index.html",
    });
  });

  app.addEventListener("listen", ({ hostname, port }) => {
    console.log(
      colors.bold("Start listening on ") + colors.yellow(`${hostname}:${port}`),
    );
  });

  await app.listen({ hostname: "127.0.0.1", port: 3000 });
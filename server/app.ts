import {
  green,
  cyan,
  bold,
  yellow,
  red,
} from "https://deno.land/std@0.56.0/fmt/colors.ts"
import { Application, send } from "https://deno.land/x/oak/mod.ts"
//import { mongo } from "./mongo.ts"
import { CttsRouter } from "./router.ts"
import { SocketServer } from "https://deno.land/x/sockets@master/mod.ts";

//const db = mongo("mongodb://localhost:27017");
const db = {};
const router = CttsRouter(db);

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
    bold("Start listening on ") + yellow(`${hostname}:${port}`),
  );
});

await app.listen({ hostname: "192.168.0.1", port: 8000 });

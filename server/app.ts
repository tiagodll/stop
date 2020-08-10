import * as colors from "https://deno.land/std@0.56.0/fmt/colors.ts";
import { Application, send, Context, Status, isHttpError } from "https://deno.land/x/oak/mod.ts";
import * as db from "./db.ts";
import { TheRouter } from "./router.ts";
import { SocketServer } from "https://deno.land/x/sockets@master/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

const env = Deno.env.toObject()

db.create(env.CONNECTION_STRING);
const router = TheRouter(db);

const app = new Application({
  keys: ["-=# The super duper awesome secret! #=-"],
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

app.use(oakCors());//{ origin: "/^.+localhost:(3000|5000)$/" }));//{ origin: /^.+localhost:(5000|3000)$/, optionsSuccessStatus: 200 }));
app.use(router.routes());
app.use(router.allowedMethods());

app.use(async (ctx) => {
  await send(ctx, ctx.request.url.pathname, {
    root: `${Deno.cwd()}/../client/public`,
    index: "index.html",
  });
});

// Error handler
app.use(async (context, next) => {
  try {
    await next();
  } catch (err) {
    if (isHttpError(err)) {
      context.response.status = err.status;
      const { message, status, stack } = err;
      if (context.request.accepts("json")) {
        context.response.body = { message, status, stack };
        context.response.type = "json";
      } else {
        context.response.body = `${status} ${message}\n\n${stack ?? ""}`;
        context.response.type = "text/plain";
      }
    } else {
      console.log(err);
      throw err;
    }
  }
});

// A basic 404 page
function notFound(ctx: Context) {
  ctx.response.status = Status.NotFound;
  ctx.response.body = `<html><body><h1>404 - Not Found</h1><p>Path <code>${ctx.request.url}</code> not found.`;
}
app.use(notFound);

app.addEventListener("listen", ({ hostname, port }) => {
  console.log(
    colors.bold("Start listening on ") + colors.yellow(`${hostname}:${port}`),
  );
});

await app.listen({ hostname: "127.0.0.1", port: 3000 });
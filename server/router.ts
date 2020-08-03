import { Application, Context, isHttpError, Router, ServerSentEvent, Status, ServerSentEventTarget, RouterContext, } from "https://deno.land/x/oak/mod.ts";
import * as colors from "https://deno.land/std@0.56.0/fmt/colors.ts";
import nanoid from "https://deno.land/x/nanoid/mod.ts";
import * as db from "./db.ts";

export function TheRouter(singleton : any) {
  let sse : ServerSentEventTarget;
  singleton.counter = 0;

  const router = new Router();
  // const db = sqlite.connect(connection_string);
  router
    .post("/api/create_game", async (ctx:Context) => {
      if (!ctx.request.hasBody) {
        ctx.throw(Status.BadRequest, "Bad Request");
      }

      const params = JSON.parse(await (await ctx.request.body()).value || "");
      console.log(params);

      let game = {
        id: nanoid(6),
        password: nanoid(4),
        host: params.player,
        topics: params.topics
      }

      ctx.assert(ctx.request.accepts("text/event-stream"), Status.UnsupportedMediaType);
      
      const connection = `${
        (ctx.request.serverRequest.conn.remoteAddr as Deno.NetAddr).hostname
      }:${(ctx.request.serverRequest.conn.remoteAddr as Deno.NetAddr).port}`;
      console.log(connection)
      
      // const sse = ctx.sendEvents();
      // console.log(`${colors.green("SSE create_game connect")} ${colors.cyan(connection)}`);
      
      sse.dispatchEvent(new ServerSentEvent("message", { game: game.id }, { id: singleton.counter++ }));
      
      // sse.addEventListener("close", () => {
      //   console.log(`${colors.green("SSE create_game disconnect")} ${colors.cyan(connection)}`);
      //   // clearInterval(id);
      // });

      
      ctx.response.body = game;

      // console.log(email, password);

      // let user = await getUser(email);

      // ctx.cookies.set("authenticated", user.email,
      // { overwrite: true, maxAge: 31557600000, httpOnly: false });
      // ctx.response.body = user.password == password ? user : "";
    })
    .get("/api/game/:id", async (ctx) => {
      if (ctx.params && ctx.params.id) {
        const game = await db.fetchGame(ctx.params.id);
        console.log(game);
        ctx.response.body = game;
      } else {
        ctx.response.body = null;
      }
    })
    .get("/api/last_round/:id", async (ctx) => {
      if (ctx.params && ctx.params.id) {
        ctx.response.body = await db.fetchLastRound(ctx.params.id);
      } else {
        ctx.response.body = null;
      }
    })
    .get("/ping", async (ctx) => {
      ctx.response.body = "pong";
    })
    .get("/sse/:thePort", (ctx: RouterContext) => {
      let port = ctx.params.thePort;
      console.log(port)
      ctx.assert(
        ctx.request.accepts("text/event-stream"),
        Status.UnsupportedMediaType,
      );
      // ctx.request.accepts("text/event-stream")
      // ctx.response.headers.set("Content-Type", "text/event-stream");
      // ctx.response.headers.set('Access-Control-Allow-Origin', "*");
      // ctx.response.headers.set('Access-Control-Allow-Credentials', "true");

      const connection = `${
        (ctx.request.serverRequest.conn.remoteAddr as Deno.NetAddr).hostname
      }:${(ctx.request.serverRequest.conn.remoteAddr as Deno.NetAddr).port}`;
      // const connection = `${
      //   (ctx.request.serverRequest.conn.remoteAddr as Deno.NetAddr).hostname
      // }:${port}`;
      console.log(connection)
      
      const sse = ctx.sendEvents();
      console.log(`${colors.green("SSE connect")} ${colors.cyan(connection)}`);
      
      let counter = 0;      
      // const id = setInterval(() => {
      //   const evt = new ServerSentEvent("message", { hello: "world " + singleton.counter }, { id: singleton.counter++ });
      //   sse.dispatchEvent(evt);
      // }, 2000);

      sse.addEventListener("close", () => {
        console.log(`${colors.green("SSE disconnect")} ${colors.cyan(connection)}`);
        // clearInterval(id);
      });
    });
  return router;
}

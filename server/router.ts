import { Application, Context, isHttpError, Router, ServerSentEvent, Status, ServerSentEventTarget, RouterContext, } from "https://deno.land/x/oak/mod.ts";
import * as colors from "https://deno.land/std@0.56.0/fmt/colors.ts";
import nanoid from "https://deno.land/x/nanoid/mod.ts";
import * as db from "./db.ts";
import { IGame, IRound } from "./interfaces.ts";

export function TheRouter(sqlite : any) {
  // let sse : ServerSentEventTarget;

  const router = new Router();
  router
  .get("/play", async (ctx) => {
    const file = await Deno.open(`../client/public/index.html`, {read: true});
    const myFileContent = await Deno.readAll(file);
    Deno.close(file.rid);
    ctx.response.body = myFileContent;
  })
  .get("/ping", async (ctx) => {
    ctx.response.body = "pong";
  })
  .post("/api/create_game", async (ctx:Context) => {
    if (!ctx.request.hasBody) {
      ctx.throw(Status.BadRequest, "Bad Request");
    }

    const params = JSON.parse(await (await ctx.request.body()).value || "");
    console.log(params);

    let game : IGame = {
      id: nanoid(6),
      password: nanoid(4),
      players: [params.player],
      topics: params.topics
    }

    ctx.assert(ctx.request.accepts("text/event-stream"), Status.UnsupportedMediaType);
    
    const connection = `${
      (ctx.request.serverRequest.conn.remoteAddr as Deno.NetAddr).hostname
    }:${(ctx.request.serverRequest.conn.remoteAddr as Deno.NetAddr).port}`;
    console.log(connection)
    
    // const sse = ctx.sendEvents();
    // console.log(`${colors.green("SSE create_game connect")} ${colors.cyan(connection)}`);
    // try {
    //   sse.dispatchEvent(new ServerSentEvent("message", { game: game.id }, { id: singleton.counter++ }));
    // } catch (error) {
    //   console.log(error)
    // }
    
    // sse.addEventListener("close", () => {
    //   console.log(`${colors.green("SSE create_game disconnect")} ${colors.cyan(connection)}`);
    //   // clearInterval(id);
    // });

    db.saveGame(game)
    ctx.response.body = game;
  })
  .post("/api/game/:id/join", async (ctx) => {
    if (ctx.params && ctx.params.id && ctx.params.player) {
      console.log(`${ctx.params.player} has joined ${ctx.params.id}`)
      const game = await db.fetchGame(ctx.params.id);
      game.players.push(ctx.params.player);
      db.saveGame(game)

      console.log(game);
      ctx.response.body = game;
    } else {
      ctx.response.body = null;
    }
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
  .get("/api/game/:id/round/:letter", async (ctx) => {
    if (ctx.params && ctx.params.id && ctx.params.letter) {
      ctx.response.body = await db.fetchRound(ctx.params.id, ctx.params.letter);
    } else {
      ctx.response.body = null;
    }
  })
  // .get("/sse/:thePort", (ctx: RouterContext) => {
  //   let port = ctx.params.thePort;
  //   console.log(port)
  //   ctx.assert(
  //     ctx.request.accepts("text/event-stream"),
  //     Status.UnsupportedMediaType,
  //   );
  //   // ctx.request.accepts("text/event-stream")
  //   // ctx.response.headers.set("Content-Type", "text/event-stream");
  //   // ctx.response.headers.set('Access-Control-Allow-Origin', "*");
  //   // ctx.response.headers.set('Access-Control-Allow-Credentials', "true");

  //   const connection = `${
  //     (ctx.request.serverRequest.conn.remoteAddr as Deno.NetAddr).hostname
  //   }:${(ctx.request.serverRequest.conn.remoteAddr as Deno.NetAddr).port}`;
  //   // const connection = `${
  //   //   (ctx.request.serverRequest.conn.remoteAddr as Deno.NetAddr).hostname
  //   // }:${port}`;
  //   console.log(connection)
    
  //   const sse = ctx.sendEvents();
  //   console.log(`${colors.green("SSE connect")} ${colors.cyan(connection)}`);
    
  //   let counter = 0;      
  //   const id = setInterval(() => {
  //     for (const msg of singleton.messages) {
  //       const evt = new ServerSentEvent("message", msg, { id: singleton.counter++ });
  //       sse.dispatchEvent(evt);
  //     }
  //     singleton.messages = [];        
  //   }, 1000);

  //   sse.addEventListener("close", () => {
  //     console.log(`${colors.green("SSE disconnect")} ${colors.cyan(connection)}`);
  //     // clearInterval(id);
  //   });
  // });
  return router;
}

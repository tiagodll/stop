import { Application, Context, isHttpError, Router, ServerSentEvent, Status, ServerSentEventTarget, RouterContext, } from "https://deno.land/x/oak/mod.ts";
import * as colors from "https://deno.land/std@0.56.0/fmt/colors.ts";
import nanoid from "https://deno.land/x/nanoid/mod.ts";
import * as db from "./db.ts";
import { IGame, IRound } from "./interfaces.ts";

async function renderFile(ctx:any, filename:string){
  const file = await Deno.open(filename, {read: true});
  const myFileContent = await Deno.readAll(file);
  Deno.close(file.rid);
  ctx.response.body = myFileContent;
}

export function TheRouter(sqlite : any) {
  // let sse : ServerSentEventTarget;

  const router = new Router();
  router
  .get("/ping", async (ctx) => {
    ctx.response.body = "pong";
  })
  .get("/play", async (ctx) => {
    await renderFile(ctx, `static/index.html`);
  })
  .get("/host", async (ctx) => {
    await renderFile(ctx, `static/index.html`);
  })
  .post("/api/create-game", async (ctx:Context) => {
    if (!ctx.request.hasBody) {
      ctx.throw(Status.BadRequest, "Bad Request");
    }

    const params = JSON.parse(await (await ctx.request.body()).value || "");
    console.log(params);

    let game : IGame = {
      id: nanoid(6),
      password: nanoid(4),
      players: params.players,
      topics: params.topics
    }

    // ctx.assert(ctx.request.accepts("text/event-stream"), Status.UnsupportedMediaType);
    
    // const connection = `${
    //   (ctx.request.serverRequest.conn.remoteAddr as Deno.NetAddr).hostname
    // }:${(ctx.request.serverRequest.conn.remoteAddr as Deno.NetAddr).port}`;
    // console.log(connection)
    
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
  .get("/api/game/:id/join", async (ctx) => {
    console.log(ctx.params)
    let player = ctx.request.url.searchParams.get("player");
    if (ctx.params && ctx.params.id && player) {
      console.log(`${player} has joined ${ctx.params.id}`)
      const game = await db.fetchGame(ctx.params.id);
      game.players.push(player);
      db.saveGame(game)

      console.log(game);
      ctx.response.body = game;
    } else {
      notFound(ctx);
    }
  })
  .get("/api/game/:id", async (ctx) => {
    if (ctx.params && ctx.params.id) {
      const game = await db.fetchGame(ctx.params.id);
      console.log(game);
      if(game == null)
        notFound(ctx);
      else
        ctx.response.body = game;
    } else {
      notFound(ctx);
    }
  })
  .post("/api/game/:id/end-game", async (ctx) => {
    if (ctx.request.hasBody && ctx.params && ctx.params.id) {

      const params = JSON.parse(await (await ctx.request.body()).value || "");
      params.forEach((round:IRound) => {
        db.saveRound(round);
      });
      console.log(params);

      const game = await db.fetchGame(ctx.params.id);
      game.letter = "$";
      db.saveGame(game);
      ctx.response.body = game;
    }else{
      ctx.throw(Status.BadRequest, "Bad Request");
    }
  })
  .delete("/api/game/:id", async (ctx) => {
    if (ctx.params && ctx.params.id) {

      db.deleteGame(ctx.params.id);
      ctx.response.body = true;
    }else{
      ctx.throw(Status.BadRequest, "Bad Request");
    }
  })
  .post("/api/game/:id/next-round", async (ctx) => {
    if (ctx.request.hasBody && ctx.params && ctx.params.id) {

      const params = JSON.parse(await (await ctx.request.body()).value || "");
      params.forEach((round:IRound) => {
        db.saveRound(round);
      });
      console.log(params);

      const game = await db.fetchGame(ctx.params.id);
      game.letter = String.fromCharCode(Math.ceil(Math.random() * 25) + 65);
      db.saveGame(game)
      console.log(game);
      ctx.response.body = game;
    }else{
      ctx.throw(Status.BadRequest, "Bad Request");
    }
  })
  .get("/api/game/:id/finish-round", async (ctx) => {
    let player = ctx.request.url.searchParams.get("player");
    console.log(player)
    if (ctx.params && ctx.params.id && player) {
      const game = await db.fetchGame(ctx.params.id);
      game.letter = `${game.letter}_${player}`;
      db.saveGame(game)
      ctx.response.body = game;
    } else {
      notFound(ctx);
    }
  })
  .post("/api/game/:id/save-answers", async (ctx:Context) => {
    if (!ctx.request.hasBody) { ctx.throw(Status.BadRequest, "Bad Request") }

    const params = JSON.parse(await (await ctx.request.body()).value || "");
    
    let round : IRound = {
      game_id: params.game_id,
      letter: params.letter,
      player: params.player,
      answers: params.answers,
      score: params.score
    }

    db.saveRound(round)
    ctx.response.body = round;
  })
  .get("/api/game/:id/round/:letter", async (ctx) => {
    if (ctx.params && ctx.params.id && ctx.params.letter) {
      if(ctx.params.letter == "$")
        ctx.response.body = await db.fetchAllRounds(ctx.params.id);
      else
        ctx.response.body = await db.fetchRound(ctx.params.id, ctx.params.letter);
    } else {
      notFound(ctx);
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

function notFound(ctx: Context) {
  ctx.response.status = Status.NotFound;
}
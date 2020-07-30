import { Application, Router, send, Status } from "https://deno.land/x/oak/mod.ts";
import nanoid from "https://deno.land/x/nanoid/mod.ts";
import * as db from "./db.ts";

export function TheRouter() {
  const router = new Router();
  // const db = sqlite.connect(connection_string);
  router
    .post("/api/create_game", async (ctx) => {
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
    });
  return router;
}

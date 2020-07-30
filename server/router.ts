import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import nanoid from "https://deno.land/x/nanoid/mod.ts";
import * as db from "./db.ts";

export function TheRouter() {
  const router = new Router();
  // const db = sqlite.connect(connection_string);
  router
    .post("/api/create_game", async (ctx) => {
      // let {
      //   value: { topics }
      // } = await ctx.request.body();

      // let game = {
      //   id: nanoid(6),
      //   password: nanoid(4),
      //   topics: topics
      // }

      // const {
      //   value: { email, password },
      // } = await ctx.request.body();

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

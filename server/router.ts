import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import nanoid from "https://deno.land/x/nanoid/mod.ts"
import { getUser, getUsers, getProfile, getRequests } from "./mongo.ts"

export function CttsRouter(db: any) {

  const router = new Router();
  router
    .post("/api/create_game", async ctx => {
      let {
        value: { topics }
      } = await ctx.request.body();

      let game = {
        id: nanoid(6),
        password: nanoid(4),
        topics: topics
      }
      
      // const {
      //   value: { email, password },
      // } = await ctx.request.body();

      // console.log(email, password);
      
      // let user = await getUser(db, email);

      // ctx.cookies.set("authenticated", user.email, 
      // { overwrite: true, maxAge: 31557600000, httpOnly: false });
      // ctx.response.body = user.password == password ? user : "";
    })
    .post("/api/logout", async ctx => {
      ctx.cookies.delete("authenticated");
      ctx.response.body = "";
    })
    .post("/api/load_user", async ctx => {
      let email = ctx.cookies.get("authenticated") || "";
      let user = await getUser(db, email);
      ctx.response.body = user;
    })
    .get("/users", async ctx => {
      const user = await getUsers(db);
      ctx.response.body = user;
    })
    .get("/user/:email", async ctx => {
      if (ctx.params && ctx.params.email) {
        console.log(ctx.params.email);
        ctx.response.body = await getUser(db, ctx.params.email);
      } else {
        ctx.response.body = null;
      }
    })
    .get("/profile/:id", async ctx => {
      if (ctx.params && ctx.params.id) {
        ctx.response.body = await getProfile(db, ctx.params.id);
      } else {
        ctx.response.body = null;
      }
    })
    .get("/requests/:id", async ctx => {
      if (ctx.params && ctx.params.id) {
        ctx.response.body = await getRequests(db, ctx.params.id);
      } else {
        ctx.response.body = null;
      }
    })
  return router;
}
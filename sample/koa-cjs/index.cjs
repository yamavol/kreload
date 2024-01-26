const path = require("node:path");
const Koa = require("koa");
const KoaStatic = require("koa-static");
const KoaRouter = require("@koa/router");
const middlewares = require("./middlewares.cjs");


async function main() {
  
  const kreload = await import("../../lib/kreload.js");

  const STATIC_DIR = path.join(__dirname, "../koa/static");
  const TEMPLATE_DIR = path.join(__dirname, "../koa/template");
  
  kreload.startWatcher({
    watch: [ STATIC_DIR, TEMPLATE_DIR]
  });
  
  const router = new KoaRouter();
  router.get("/", async (ctx) => {
    await ctx.render("index.html", {});
  });
  
  
  const app = new Koa();
  app.use(middlewares.KoaReload());
  app.use(middlewares.KoaTemplate(TEMPLATE_DIR));
  app.use(KoaStatic(STATIC_DIR));
  app.use(router.routes());
  app.listen(3001);
}

main()
  .catch(e => console.error(e));



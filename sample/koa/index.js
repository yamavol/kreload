import Router from "@koa/router";
import Koa from "koa";
import KoaStatic from "koa-static";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { startWatcher } from "../../lib/kreload.js";
import { KoaReload, KoaTemplate } from "./middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STATIC_DIR = path.join(__dirname, "static");
const TEMPLATE_DIR = path.join(__dirname, "templates");

async function main() {

  startWatcher({
    verbose: true,
    watch: [
      STATIC_DIR, TEMPLATE_DIR
    ]
  });

  const router = new Router();

  router.get("/", async (ctx) => {
    ctx.body = "";
  });

  router.get("/html", async (ctx) => {
    await ctx.render("index.html", {});
  });

  const app = new Koa();
  app.use(KoaReload());
  app.use(KoaStatic(STATIC_DIR));
  app.use(KoaTemplate(TEMPLATE_DIR));
  app.use(router.routes());
  app.listen(3000);
}

main()
  .catch(e => console.error(e));
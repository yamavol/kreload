import KoaRouter from "@koa/router";
import Koa from "koa";
import KoaStatic from "koa-static";
import { startWatcher } from "kreload";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { KoaReload, KoaTemplate } from "./middlewares.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STATIC_DIR = path.join(__dirname, "static");
const TEMPLATE_DIR = path.join(__dirname, "templates");

const router = new KoaRouter();

router.get("/", async (ctx) => {
  await ctx.render("index.html", {});
});

const app = new Koa();
app.use(KoaStatic(STATIC_DIR));
app.use(KoaReload());
app.use(KoaTemplate(TEMPLATE_DIR));
app.use(router.routes());
app.listen(3000);

startWatcher({
  watch: [TEMPLATE_DIR]
});

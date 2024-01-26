import { getReloadScript } from "kreload";
import { promisify } from "node:util";
import nunjucks from "nunjucks";

/**
 * HTML TemplateEngine renderer (nunjucks)
 * @param {string} templateDir  path to the folder with templates
 */
export const KoaTemplate = function (templateDir) {

  const env = nunjucks.configure(templateDir, {
    noCache: true,
  });
  env.render = promisify(env.render);
  env.renderString = promisify(env.renderString);

  return async function middleware(ctx, next) {
    /**
     * @param {string} view   name of the HTML template
     * @param {object} params parameters
     */
    async function render(view, params) {
      const context = Object.assign({}, ctx, params);

      try {
        const html = await env.render(view, context);
        ctx.type = ctx.type ? ctx.type : "text/html";
        ctx.body = html;
      } catch(e) {
        ctx.type = "text/html";
        ctx.body = `<html><body>${e}</body></html>`;
      }
      
    }

    // attach render function to the context, then call next middleware
    ctx.render = render;
    await next();
  };
};


/**
 * A middleware which injects a reload script to the page
 */
export const KoaReload = function () {
  return async function middleware(ctx, next) {
    await next();
    if (ctx.type === "text/html") {
      const inject = await getReloadScript({
        verbose: true
      });
      ctx.body += "\n" + `<script>${inject}</script>`;
    }
  };
};
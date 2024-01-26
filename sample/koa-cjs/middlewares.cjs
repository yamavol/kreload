const util = require("node:util");
const nunjucks = require("nunjucks");
const { promisify } = util;

/**
 * HTML TemplateEngine renderer (nunjucks)
 * 
 * @param {string} templateDir  path to the folder with templates
 */
const KoaTemplate = function (templateDir) {

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
      const html = await env.render(view, context);
      ctx.type = ctx.type ? ctx.type : "text/html";
      ctx.body = html;
    }

    // attach render function to the context, then call next middleware
    ctx.render = render;
    await next();
  };
};


/**
 * A middleware which injects a reload script to the page
 */
const KoaReload = async function () {

  const kreload = await import("../../lib/kreload");

  return async function middleware(ctx, next) {
    await next();
    if (ctx.type === "text/html") {
      ctx.body += "\n" + 
        "<script>\n" +
        await kreload.getReloadScript({
          verbose: true
        }) + 
        "</script>\n";
    }
  };
};


module.exports = {
  KoaTemplate,
  KoaReload
};
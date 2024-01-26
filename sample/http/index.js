import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nunjucks from "nunjucks";
import { getReloadScript, startWatcher } from "../../lib/kreload.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REL_DIR = path.join(__dirname, "../koa");
const TEMPLATE_DIR = path.join(REL_DIR, "templates");

const PORT = 3000;
const env = nunjucks.configure(TEMPLATE_DIR, { noCache: true });

async function main() {
  startWatcher({
    verbose: true,
    watch: [TEMPLATE_DIR]
  });
  
  const server = http.createServer(async (req, res) => {

    try {
      if (req.url === "/") {
        const html = env.render("index.html", {});
        const code = await getReloadScript({ verbose: true });
  
        const inject = `<script>${code}</script>`;
        const body = html + "\n" + inject;
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(body);
      } else {
        res.writeHead(404);
        res.end("Not Found");
      }
    } catch (e) {
      res.writeHead(500);
      res.end("Internal Server Error: " + e);
    }
  });
  
  server.listen(PORT, () => {
    console.log(`http://localhost:${PORT}/`);
  }); 
}

main()
  .catch(e => console.error(e));


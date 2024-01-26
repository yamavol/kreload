# kreload

A small javascript library to support browser live reloading. 

## Install

```
npm install kreload
```

## About this package

The initial motivation of this package was to integrate the live-reloading feature in existing koa.js service. It should make your template-engine based development a bit easier. 

For open-sourcing, the package was restructured to remove any web application framework dependencies. In such design, you can integrate this library in any framework (but with node.js). The integration guide below should help you.

To note, this work was not written for production services. Any improvements/suggestions are welcome.

## Integration Guide

Hot reloading feature works by

1. browser HTML page connecting to backend server (using WebSockets)
2. server sends "file-changed" event to the front-end

To use this package, you need to

1. inject client-side  code (`getReloadScript()`) into your HTML page
2. call `startWatcher()` to launch WebSocket server & monitor FileSystem

**Sample**

```js
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nunjucks from "nunjucks";
import { getReloadScript, startWatcher } from "../../lib/kreload.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_DIR = path.join(__dirname, "templates");

const PORT = 3000;
const env = nunjucks.configure(TEMPLATE_DIR, { noCache: true });

async function main() {

  // this launches the WebSocket server + FileSystem monitoring
  startWatcher({
    verbose: true,
    watch: [TEMPLATE_DIR]
  });
  
  const server = http.createServer(async (req, res) => {

    try {
      if (req.url === "/") {
        // get client side javascript code
        const code = await getReloadScript({ verbose: true });
        
        // wrap it inside script tag
        const inject = `<script>${code}</script>`;
  
        // append to the original content (note: this is not a proper HTML)
        const html = env.render("index.html", {});
        const body = html + "\n" + inject;

        // respond
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
```

## Configuration

TBD

## License

MIT License [LICENSE](./LICENSE)

## Acknowledgement

Reference implementation from [reload](https://github.com/alallier/reload)
import * as chokidar from "chokidar";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RELOAD_JS = path.join(__dirname, "reload-client.js");

export interface ClientOptions {
  port?: number
  verbose?: boolean
}

export interface WatcherOptions {
  port?: number
  watch: string[]
  verbose?: boolean
}

/** 
 * Return a client-side javascript code for hot-reloading
 */
export async function getReloadScript(options: ClientOptions = {}) {
  let js = await fs.readFile(RELOAD_JS, "utf-8");

  if (options.verbose === true) {
    js = js.replace("verboseLogging = false", "verboseLogging = true");
  }
  if (options.port !== undefined) {
    js = js.replace("9765", options.port.toString());
  }

  return js;
}


/**
 * Launch WebSocketServer and start FileSystem monitoring.
 */
export function startWatcher(option: WatcherOptions){

  const verboseLogging = option.verbose ?? false;
  const port = option.port ?? 9765;

  function dprint(...msg) {
    if (verboseLogging) {
      console.debug(...msg);
    }
  }

  /**
   * WebSocket server  
   */
  const server = new WebSocketServer({ port });
  server.on("connection", (socket) => {
    dprint("ws connected");
    socket.on("close", () => dprint("Client disconnected"));
  });


  function dispatchMessage(msg: string) {
    server.clients.forEach(conn => {
      if (conn.OPEN) {
        conn.send(msg);
      }
    });
  }

  /**
   * FS Watcher
   */
  const watcher = chokidar.watch(option.watch);

  if (verboseLogging) {
    watcher.on("ready", () => {
      dprint("watcher started");
      const watchFiles = watcher.getWatched();
      for (const key of Object.keys(watchFiles)) {
        dprint(watchFiles[key]);
      }
    });
  }

  watcher.on("change", (path, _stats) => {
    dprint(path);
    dispatchMessage("reload");
  });
}
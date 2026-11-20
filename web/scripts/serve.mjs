import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { handleClawBot } from "./clawbot.mjs";

const root = fileURLToPath(new URL("../dist", import.meta.url));
const port = Number(process.env.PORT ?? 3131);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};

createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const pathname = decodeURIComponent(url.pathname);
    if (pathname === "/api/clawbot") return await handleClawBot(request, response, url);
    const page = pathname === "/" || pathname === "/chat-tab" || pathname === "/chat-tab/";
    const file = resolve(root, page ? "index.html" : `.${pathname}`);
    if (!file.startsWith(root + sep) || !(await stat(file)).isFile()) {
      response.writeHead(404).end();
      return;
    }
    response.setHeader("Content-Type", types[extname(file)] ?? "application/octet-stream");
    response.setHeader("X-Content-Type-Options", "nosniff");
    if (request.method === "HEAD") response.end();
    else createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404).end();
  }
}).listen(port, "127.0.0.1", () => console.log(`Soker is running at http://127.0.0.1:${port}`));

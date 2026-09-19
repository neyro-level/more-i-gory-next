import { createServer } from "node:http";

const port = Number(process.env.PORT ?? "3000");
const host = process.env.HOSTNAME ?? "127.0.0.1";

const server = createServer((request, response) => {
  const path = request.url?.split("?")[0] ?? "";
  if (request.method === "GET" && (path === "/api/health" || path === "/api/health/")) {
    response.writeHead(200, { "cache-control": "no-store", "content-type": "application/json" });
    response.end(JSON.stringify({ ok: true }));
    return;
  }

  response.writeHead(503, { "content-type": "text/plain" });
  response.end("bootstrap");
});

server.listen(port, host);

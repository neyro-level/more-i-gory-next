import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(projectRoot, "out");
const port = Number.parseInt(process.env.PORT ?? "3000", 10);

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"],
  [".xml", "application/xml; charset=utf-8"],
]);

function resolveRequest(url) {
  const pathname = decodeURIComponent(new URL(url, "http://localhost").pathname);
  const relativePath = pathname.replace(/^\/+/, "");
  const candidate = path.resolve(outDir, relativePath);

  if (!candidate.startsWith(`${outDir}${path.sep}`) && candidate !== outDir) return null;
  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;

  const indexFile = path.join(candidate, "index.html");
  return existsSync(indexFile) ? indexFile : null;
}

function sendFile(response, file, status = 200) {
  response.writeHead(status, {
    "Cache-Control": file.endsWith(".html") ? "no-cache" : "public, max-age=3600",
    "Content-Type": contentTypes.get(path.extname(file).toLowerCase()) ?? "application/octet-stream",
  });
  createReadStream(file).pipe(response);
}

if (!existsSync(outDir)) throw new Error("out/ is missing. Run pnpm build first.");

createServer((request, response) => {
  const file = resolveRequest(request.url ?? "/");
  if (file) return sendFile(response, file);

  const notFoundFile = path.join(outDir, "404.html");
  if (existsSync(notFoundFile)) return sendFile(response, notFoundFile, 404);

  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("Not Found");
}).listen(port, "127.0.0.1", () => {
  console.log(`Static artifact: http://127.0.0.1:${port}`);
});

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const loopbackHosts = new Set(["127.0.0.1", "::1", "localhost"]);

export function assertRuntimeReleaseOrigin(source = process.env) {
  if (!new Set(["staging", "production"]).has(source.AMS_RUNTIME_CONTOUR)) {
    throw new Error("Runtime release requires an explicit staging or production contour.");
  }
  const url = new URL(source.NEXT_PUBLIC_SERVER_URL ?? "");
  if (!/^https?:$/.test(url.protocol) || loopbackHosts.has(url.hostname.toLowerCase()) || url.origin !== source.NEXT_PUBLIC_SERVER_URL) {
    throw new Error("Runtime release requires a non-loopback exact NEXT_PUBLIC_SERVER_URL origin.");
  }
  return url.origin;
}

function filesUnder(root) {
  if (!existsSync(root)) return [];
  return readdirSync(root).flatMap((name) => {
    const path = join(root, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

export function assertNoLoopbackInBuiltHtml(root = ".next/server/app") {
  const offenders = filesUnder(root).filter((path) => /\.(?:html|rsc|body|json)$/u.test(path)).filter((path) => {
    const text = readFileSync(path, "utf8");
    return /https?:\/\/(?:127\.0\.0\.1|localhost|\[::1\])/iu.test(text);
  });
  if (offenders.length > 0) throw new Error(`Built route output contains loopback origin: ${offenders.join(", ")}`);
}

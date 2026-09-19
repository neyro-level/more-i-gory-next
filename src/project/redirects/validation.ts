export type RedirectEntry = Readonly<{
  destination: string;
  permanent: boolean;
  source: string;
}>;

export function normalizeRedirectPath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed.startsWith("/")) throw new Error(`Redirect path must start with "/": ${path}`);
  if (trimmed.startsWith("//")) throw new Error(`Redirect path must be an internal path: ${path}`);
  if (trimmed.includes("?") || trimmed.includes("#")) throw new Error(`Redirect path must not include query or hash: ${path}`);

  return trimmed === "/" ? "/" : `/${trimmed.replace(/^\/+/, "").replace(/\/+$/, "")}/`;
}

export const genericRedirectDestinations = new Set(["/", "/obekty/"]);

export function isGenericRedirectDestination(path: string): boolean {
  return genericRedirectDestinations.has(normalizeRedirectPath(path));
}

export function validateRedirectEntries(entries: readonly RedirectEntry[], knownTargets: ReadonlySet<string>): void {
  const bySource = new Map<string, RedirectEntry>();

  for (const entry of entries) {
    const source = normalizeRedirectPath(entry.source);
    const destination = normalizeRedirectPath(entry.destination);

    if (source === destination) throw new Error(`Redirect loop: ${source} redirects to itself.`);
    if (isGenericRedirectDestination(destination)) {
      throw new Error(`Redirect to generic home is not allowed: ${source} -> ${destination}`);
    }
    if (bySource.has(source)) throw new Error(`Duplicate redirect source: ${source}`);
    bySource.set(source, { ...entry, destination, source });
  }

  for (const entry of bySource.values()) {
    if (bySource.has(entry.destination)) {
      throw new Error(`Redirect chain is not allowed: ${entry.source} -> ${entry.destination}`);
    }
    if (!knownTargets.has(entry.destination)) {
      throw new Error(`Redirect destination is not a known target: ${entry.destination}`);
    }
  }
}

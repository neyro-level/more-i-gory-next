function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function textContent(value) {
  return decodeHtml(value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim());
}

export function parseSitemapLocations(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => decodeHtml(match[1]));
}

export function inspectSeoDocument(html) {
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  const robots = html.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? "index, follow";
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((match) => textContent(match[1]));
  const internalLinks = [...new Set(
    [...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)]
      .map((match) => decodeHtml(match[1]))
      .filter((href) => href.startsWith("/")),
  )];
  const breadcrumbScript = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => match[1])
    .find((value) => value.includes('"@type":"BreadcrumbList"'));
  const breadcrumbNames = breadcrumbScript
    ? JSON.parse(breadcrumbScript).itemListElement.map((item) => item.name)
    : [];
  const breadcrumbNav = html.match(/<nav[^>]*aria-label="breadcrumb"[^>]*>([\s\S]*?)<\/nav>/)?.[1];

  return {
    breadcrumbNames,
    breadcrumbVisibleText: breadcrumbNav ? textContent(breadcrumbNav) : "",
    canonical: canonical ? decodeHtml(canonical) : undefined,
    description: description ? decodeHtml(description) : undefined,
    h1s,
    internalLinks,
    robots: robots.toLowerCase(),
    title: title ? textContent(title) : undefined,
  };
}

export function assertBreadcrumbAgreement(document, pathname) {
  if (document.breadcrumbNames.length === 0) return;
  if (!document.breadcrumbVisibleText) throw new Error(`Structured breadcrumbs have no visible breadcrumb on ${pathname}`);
  for (const name of document.breadcrumbNames) {
    if (!document.breadcrumbVisibleText.includes(name)) {
      throw new Error(`Breadcrumb JSON-LD and visible hierarchy disagree on ${pathname}: ${name}`);
    }
  }
}

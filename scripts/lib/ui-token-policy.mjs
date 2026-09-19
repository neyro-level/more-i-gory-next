const utilityPrefixes = {
  color: ["bg", "text", "border", "ring", "fill", "stroke"],
  radius: ["rounded"],
  container: ["max-w"],
  spacing: ["p", "px", "py", "pt", "pb", "pl", "pr", "m", "mx", "my", "mt", "mb", "ml", "mr", "gap", "gap-x", "gap-y", "w", "h", "min-w", "max-w", "min-h", "max-h"],
  text: ["text"],
  tracking: ["tracking"],
  font: ["font"],
  ease: ["ease"],
  aspect: ["aspect"],
  shadow: ["shadow"],
};

export function themeTokens(globalsCss) {
  const theme = globalsCss.match(/@theme inline \{([\s\S]*?)\n\}/)?.[1] ?? "";
  return [...theme.matchAll(/^\s*(--(color|radius|container|spacing|text|tracking|font|ease|aspect|shadow)-([a-z0-9-]+)):/gm)]
    .filter((match) => !match[3].includes("--"))
    .map((match) => ({ token: match[1], category: match[2], name: match[3] }));
}

export function tokenHasConsumer(token, source) {
  if (source.includes(`var(${token.token})`)) return true;
  return utilityPrefixes[token.category].some((prefix) => {
    const pattern = new RegExp(`(?:^|[^a-z0-9-])${prefix}-${token.name}(?![a-z0-9-])`);
    return pattern.test(source);
  });
}

export function findDeadThemeTokens({ globalsCss, source, reservations }) {
  const reserved = new Set((reservations?.reservations ?? []).map((entry) => entry.token));
  return themeTokens(globalsCss)
    .filter((token) => !tokenHasConsumer(token, source) && !reserved.has(token.token))
    .map((token) => token.token);
}

export function parseActiveLeadChannels(value: string | undefined): string[] {
  if (!value) return [];

  return [
    ...new Set(
      value
        .split(",")
        .map((channel) => channel.trim())
        .filter((channel) => /^[a-z0-9-]{2,40}$/.test(channel)),
    ),
  ].sort();
}

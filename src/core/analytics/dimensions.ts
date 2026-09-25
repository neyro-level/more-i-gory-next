const analyticsDimensionKeys = [
  "page_key",
  "region_slug",
  "city_slug",
  "project_slug",
  "source_surface",
] as const;

export type AnalyticsDimensionKey = (typeof analyticsDimensionKeys)[number];

export type AnalyticsDimensions = Readonly<Partial<Record<AnalyticsDimensionKey, string>>>;

const safeDimensionValue = /^[a-z0-9][a-z0-9_-]{0,79}$/;

export function buildAnalyticsDimensions(input: AnalyticsDimensions): AnalyticsDimensions {
  return Object.fromEntries(
    analyticsDimensionKeys.flatMap((key) => {
      const value = input[key]?.trim().toLowerCase();
      return value && safeDimensionValue.test(value) ? [[key, value]] : [];
    }),
  );
}

export function analyticsDataAttributes(input: AnalyticsDimensions): Readonly<Record<string, string>> {
  return Object.fromEntries(
    Object.entries(buildAnalyticsDimensions(input)).map(([key, value]) => [
      `data-analytics-${key.replaceAll("_", "-")}`,
      value,
    ]),
  );
}

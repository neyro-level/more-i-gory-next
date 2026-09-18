import {
  propertyCategories,
  propertyCategorySchema,
  propertyDealTypeSchema,
  propertyDealTypes,
  type PropertyCategory,
  type PropertyDealType,
} from "@more-i-gory/contracts";

const categoryAliases: Record<string, PropertyCategory> = {
  apartment: "apartment",
  commercial: "commercial",
  house: "house",
  land: "land",
  квартира: "apartment",
  коммерческая: "commercial",
  дом: "house",
  участок: "land",
};

const dealTypeAliases: Record<string, PropertyDealType> = {
  rent: "rent",
  sale: "sale",
  аренда: "rent",
  продажа: "sale",
};

export const propertyCategoryOptions = propertyCategories.map((value) => ({
  label: value,
  value,
}));

export const propertyDealTypeOptions = propertyDealTypes.map((value) => ({
  label: value,
  value,
}));

function normalizeAlias(value: unknown): string | null {
  if (value == null) return null;
  const normalized = String(value).trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

export function isAllowedPropertyCategory(value: unknown): value is PropertyCategory {
  return propertyCategorySchema.safeParse(value).success;
}

export function isAllowedPropertyDealType(value: unknown): value is PropertyDealType {
  return propertyDealTypeSchema.safeParse(value).success;
}

export function validatePropertyCategoryField(value: unknown): true | string {
  if (value == null || value === "") return true;
  return isAllowedPropertyCategory(value)
    ? true
    : `category must be one of: ${propertyCategories.join(", ")}.`;
}

export function validatePropertyDealTypeField(value: unknown): true | string {
  if (value == null || value === "") return true;
  return isAllowedPropertyDealType(value)
    ? true
    : `dealType must be one of: ${propertyDealTypes.join(", ")}.`;
}

export function mapFeedPropertyCategory(value: unknown): PropertyCategory | null {
  const normalized = normalizeAlias(value);
  if (!normalized) return null;
  return categoryAliases[normalized] ?? null;
}

export function mapFeedPropertyDealType(value: unknown): PropertyDealType | null {
  const normalized = normalizeAlias(value);
  if (!normalized) return null;
  return dealTypeAliases[normalized] ?? null;
}

export function resolveFeedPropertyEnums(source: Record<string, string>): {
  rejected: Array<{ field: "category" | "dealType"; raw: string }>;
  values: { category?: PropertyCategory; dealType?: PropertyDealType };
} {
  const rejected: Array<{ field: "category" | "dealType"; raw: string }> = [];
  const values: { category?: PropertyCategory; dealType?: PropertyDealType } = {};

  const rawCategory = source.category ?? source["property-type"] ?? "";
  if (rawCategory.trim()) {
    const mapped = mapFeedPropertyCategory(rawCategory);
    if (mapped) values.category = mapped;
    else rejected.push({ field: "category", raw: rawCategory });
  }

  const rawDealType = source.type ?? source["deal-type"] ?? "";
  if (rawDealType.trim()) {
    const mapped = mapFeedPropertyDealType(rawDealType);
    if (mapped) values.dealType = mapped;
    else rejected.push({ field: "dealType", raw: rawDealType });
  }

  return { rejected, values };
}

export function outOfContractPropertyEnumSql(): string {
  const categories = propertyCategories.map((value) => `'${value}'`).join(", ");
  const dealTypes = propertyDealTypes.map((value) => `'${value}'`).join(", ");
  return `SELECT id, category, deal_type
FROM properties
WHERE (category IS NOT NULL AND category <> '' AND category NOT IN (${categories}))
   OR (deal_type IS NOT NULL AND deal_type <> '' AND deal_type NOT IN (${dealTypes}))
ORDER BY id;`;
}

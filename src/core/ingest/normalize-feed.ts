import { resolveFeedPropertyEnums } from "../catalog/property-enums.ts";
import type { FeedParseIssue, FeedParserResult, ParsedFeedOffer } from "./parsers/types.ts";
import type { PropertyCategory, PropertyDealType } from "@more-i-gory/contracts";
import { z } from "zod";

export type NormalizedFeedOffer = {
  category: PropertyCategory | null;
  currency: string | null;
  dealType: PropertyDealType | null;
  district: string | null;
  externalBuildingId: string | null;
  externalComplexId: string | null;
  externalComplexName: string | null;
  externalId: string;
  externalLayoutId: string | null;
  floor: number | null;
  floors: number | null;
  house: string | null;
  kitchenArea: number | null;
  lat: number | null;
  livingArea: number | null;
  lng: number | null;
  locality: string | null;
  priceMinor: number | null;
  pricePerMeterMinor: number | null;
  publicAddress: string | null;
  rooms: number | null;
  street: string | null;
  title: string;
  totalArea: number | null;
};

export type NormalizeFeedResult = {
  issues: FeedParseIssue[];
  offers: NormalizedFeedOffer[];
};

const nullableText = z.string().min(1).nullable();
const nullableInteger = z.number().int().nonnegative().nullable();
const nullableArea = z.number().positive().multipleOf(0.01).nullable();
const normalizedFeedOfferSchema = z.object({
  category: z.enum(["apartment", "house", "land", "commercial"]).nullable(),
  currency: nullableText,
  dealType: z.enum(["sale", "rent"]).nullable(),
  district: nullableText,
  externalBuildingId: nullableText,
  externalComplexId: nullableText,
  externalComplexName: nullableText,
  externalId: z.string().min(1),
  externalLayoutId: nullableText,
  floor: nullableInteger,
  floors: nullableInteger,
  house: nullableText,
  kitchenArea: nullableArea,
  lat: z.number().finite().min(-90).max(90).nullable(),
  livingArea: nullableArea,
  lng: z.number().finite().min(-180).max(180).nullable(),
  locality: nullableText,
  priceMinor: z.number().int().positive().max(2_147_483_647).nullable(),
  pricePerMeterMinor: z.number().int().positive().max(2_147_483_647).nullable(),
  publicAddress: nullableText,
  rooms: nullableInteger,
  street: nullableText,
  title: z.string().min(1),
  totalArea: nullableArea,
});

function text(source: Record<string, string>, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = source[key]?.trim();
    if (value) return value;
  }
  return null;
}

function decimalParts(value: string): { fraction: string; whole: string } | null {
  const compact = value.trim().replace(/\s+/g, "").replace(",", ".");
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(compact);
  return match ? { fraction: match[2] ?? "", whole: match[1] } : null;
}

function moneyMinor(value: string | undefined): number | null | "invalid" {
  if (value == null || value.trim() === "") return null;
  const parts = decimalParts(value);
  if (!parts) return "invalid";
  const minor = Number(parts.whole) * 100 + Number(parts.fraction.padEnd(2, "0"));
  return Number.isSafeInteger(minor) && minor > 0 && minor <= 2_147_483_647 ? minor : "invalid";
}

function squareMeters(value: string | null): number | null | "invalid" {
  if (value == null) return null;
  const parts = decimalParts(value);
  if (!parts) return "invalid";
  const area = Number(`${parts.whole}.${parts.fraction || "0"}`);
  return Number.isFinite(area) && area > 0 ? area : "invalid";
}

function integer(value: string | null): number | null | "invalid" {
  if (value == null) return null;
  return /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) ? Number(value) : "invalid";
}

function coordinate(value: string | null): number | null | "invalid" {
  if (value == null) return null;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : "invalid";
}

function bankersRound(value: number): number {
  const lower = Math.floor(value);
  const fraction = value - lower;
  if (Math.abs(fraction - 0.5) < Number.EPSILON * Math.max(1, Math.abs(value))) {
    return lower % 2 === 0 ? lower : lower + 1;
  }
  return Math.round(value);
}

function invalidNumericIssue(offer: ParsedFeedOffer, field: string): FeedParseIssue {
  return {
    code: "normalize-numeric-invalid",
    externalId: offer.externalId,
    message: `Invalid raw ${field} value rejected the offer before write.`,
    path: `offer.${field}`,
    severity: "error",
  };
}

export function normalizeParsedOffers(parsed: FeedParserResult): NormalizeFeedResult {
  const issues: FeedParseIssue[] = [];
  const offers: NormalizedFeedOffer[] = [];
  for (const offer of parsed.offers) {
    const enums = resolveFeedPropertyEnums(offer.source);
    for (const rejected of enums.rejected) {
      issues.push({
        code: "normalize-enum-rejected",
        externalId: offer.externalId,
        message: `Rejected raw ${rejected.field} value was not written.`,
        path: `offer.${rejected.field}`,
        severity: "warning",
      });
    }

    const totalArea = squareMeters(text(offer.source, "area", "total-area"));
    const livingArea = squareMeters(text(offer.source, "living-space", "living-area"));
    const kitchenArea = squareMeters(text(offer.source, "kitchen-space", "kitchen-area"));
    const priceMinor = moneyMinor(offer.price);
    const rooms = integer(text(offer.source, "rooms"));
    const floor = integer(text(offer.source, "floor"));
    const floors = integer(text(offer.source, "floors-total", "floors"));
    const lat = coordinate(text(offer.source, "latitude", "lat"));
    const lng = coordinate(text(offer.source, "longitude", "lng"));
    const numericValues = { floor, floors, kitchenArea, lat, livingArea, lng, priceMinor, rooms, totalArea };
    const invalid = Object.entries(numericValues).find(([, value]) => value === "invalid");
    if (invalid) {
      issues.push(invalidNumericIssue(offer, invalid[0]));
      continue;
    }

    const normalized = {
      category: enums.values.category ?? null,
      currency: priceMinor == null ? null : (text(offer.source, "currency") ?? "RUB").toUpperCase(),
      dealType: enums.values.dealType ?? null,
      district: text(offer.source, "district", "sub-locality-name"),
      externalBuildingId: text(offer.source, "building-id"),
      externalComplexId: text(offer.source, "complex-id"),
      externalComplexName: text(offer.source, "complex-name"),
      externalId: offer.externalId,
      externalLayoutId: text(offer.source, "layout-id"),
      floor,
      floors,
      house: text(offer.source, "house"),
      kitchenArea,
      lat,
      livingArea,
      lng,
      locality: text(offer.source, "locality-name", "locality"),
      priceMinor,
      pricePerMeterMinor:
        typeof priceMinor === "number" && typeof totalArea === "number"
          ? bankersRound(priceMinor / totalArea)
          : null,
      publicAddress: offer.address?.trim() || null,
      rooms,
      street: text(offer.source, "street"),
      title: offer.title?.trim() ?? "",
      totalArea,
    };
    const validated = normalizedFeedOfferSchema.safeParse(normalized);
    if (!validated.success) {
      issues.push({
        code: "normalize-offer-invalid",
        externalId: offer.externalId,
        message: "Normalized offer contract rejected the offer before write.",
        severity: "error",
      });
      continue;
    }
    offers.push(validated.data);
  }

  return { issues, offers };
}

export function createNormalizeFeedHandler() {
  return async (context: {
    state: { parse?: FeedParserResult; normalize?: NormalizeFeedResult };
  }) => {
    if (!context.state.parse) {
      return { continue: false, status: "failed" as const };
    }

    context.state.normalize = normalizeParsedOffers(context.state.parse);
    return { continue: true, status: "running" as const };
  };
}

export type FieldOwner =
  | { kind: "empty" }
  | { kind: "feed"; feedSourceId: string }
  | { kind: "manual" };

export type ExistingFeedOwnedRecord = {
  feedSource?: string | number | null;
  origin: "feed" | "manual";
};

export type FieldOwnershipDecision =
  | { allow: true; reason: "empty-field" | "explicit-feed-owner" | "owning-feed" }
  | { allow: false; reason: "manual-origin" | "manual-field-owner" | "different-explicit-feed-owner" | "different-owning-feed" };

function isEmptyValue(value: unknown): boolean {
  return value == null || value === "";
}

export function decideFeedFieldWrite(args: {
  currentValue: unknown;
  explicitOwner?: FieldOwner | null;
  importingFeedSourceId: string;
  record: ExistingFeedOwnedRecord;
}): FieldOwnershipDecision {
  if (args.record.origin === "manual") {
    return { allow: false, reason: "manual-origin" };
  }

  if (args.explicitOwner?.kind === "manual") {
    return { allow: false, reason: "manual-field-owner" };
  }

  if (args.explicitOwner?.kind === "feed") {
    return args.explicitOwner.feedSourceId === args.importingFeedSourceId
      ? { allow: true, reason: "explicit-feed-owner" }
      : { allow: false, reason: "different-explicit-feed-owner" };
  }

  if (args.explicitOwner?.kind === "empty" || isEmptyValue(args.currentValue)) {
    return { allow: true, reason: "empty-field" };
  }

  if (args.record.feedSource != null && String(args.record.feedSource) === args.importingFeedSourceId) {
    return { allow: true, reason: "owning-feed" };
  }

  return { allow: false, reason: "different-owning-feed" };
}

export function applyFeedFieldOwnership<T extends Record<string, unknown>>(args: {
  current: T;
  explicitOwners?: Partial<Record<keyof T & string, FieldOwner>>;
  incoming: Partial<T>;
  importingFeedSourceId: string;
  record: ExistingFeedOwnedRecord;
}): {
  denied: Array<{ field: keyof T & string; reason: Exclude<FieldOwnershipDecision, { allow: true }>["reason"] }>;
  patch: Partial<T>;
} {
  const denied: Array<{ field: keyof T & string; reason: Exclude<FieldOwnershipDecision, { allow: true }>["reason"] }> = [];
  const patch: Partial<T> = {};

  for (const [field, value] of Object.entries(args.incoming) as Array<[keyof T & string, unknown]>) {
    const decision = decideFeedFieldWrite({
      currentValue: args.current[field],
      explicitOwner: args.explicitOwners?.[field],
      importingFeedSourceId: args.importingFeedSourceId,
      record: args.record,
    });

    if (decision.allow) {
      patch[field] = value as T[keyof T & string];
    } else {
      denied.push({ field, reason: decision.reason });
    }
  }

  return { denied, patch };
}

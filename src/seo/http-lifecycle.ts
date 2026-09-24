import { notFound, permanentRedirect } from "next/navigation.js";

import type { EffectiveSeoState } from "./seo-state.ts";

export const goneHttpFallbackStatus = 404 as const;

export function materializeSeoHttpState(
  state: Pick<EffectiveSeoState, "httpStatus" | "redirectIntent">,
): void {
  if (state.redirectIntent) {
    permanentRedirect(state.redirectIntent.target);
  }

  if (state.httpStatus === 404 || state.httpStatus === 410) {
    notFound();
  }
}

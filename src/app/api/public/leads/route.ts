import { createLead } from "@/core/data-access/system/create-lead";
import { parseActiveLeadChannels } from "@/core/leads/channels";
import { handlePublicLeadRequest } from "@/core/leads/intake-endpoint";
import { createRedactingLogger } from "@/core/security/redaction";
import { env } from "@/project/env";
import { ACTIVE_CONSENT_VERSION } from "@more-i-gory/contracts";

export const runtime = "nodejs";
const activeChannelIds = parseActiveLeadChannels(env.LEAD_CHANNELS);
const logger = createRedactingLogger(console);

export async function POST(request: Request) {
  return handlePublicLeadRequest(request, {
    activeChannelIds,
    consentVersion: ACTIVE_CONSENT_VERSION,
    createLead,
    enabled: env.NEXT_PUBLIC_LEADS_ENABLED === "true",
    logger,
  });
}

export function GET(request: Request) {
  return handlePublicLeadRequest(request, {
    activeChannelIds,
    consentVersion: ACTIVE_CONSENT_VERSION,
    createLead,
    enabled: env.NEXT_PUBLIC_LEADS_ENABLED === "true",
    logger,
  });
}

export { GET as DELETE, GET as OPTIONS, GET as PATCH, GET as PUT };

import { createLead } from "@/core/data-access/system/create-lead";
import { parseActiveLeadChannels } from "@/core/leads/channels";
import { handlePublicLeadRequest } from "@/core/leads/intake-endpoint";
import { env } from "@/project/env";

export const runtime = "nodejs";
const activeChannelIds = parseActiveLeadChannels(env.LEAD_CHANNELS);

export async function POST(request: Request) {
  return handlePublicLeadRequest(request, {
    activeChannelIds,
    createLead,
    enabled: env.NEXT_PUBLIC_LEADS_ENABLED === "true",
    logger: console,
  });
}

export function GET(request: Request) {
  return handlePublicLeadRequest(request, {
    activeChannelIds,
    createLead,
    enabled: env.NEXT_PUBLIC_LEADS_ENABLED === "true",
    logger: console,
  });
}

export { GET as DELETE, GET as OPTIONS, GET as PATCH, GET as PUT };

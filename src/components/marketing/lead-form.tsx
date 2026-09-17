import { LeadFormClient } from "@/ui/interactive/lead-form-client";
import { env } from "@/project/env";

const consentVersion = "pdn-consent-2026-09-17";
const leadsEnabled = env.NEXT_PUBLIC_LEADS_ENABLED === "true";

type LeadFormProps = {
  formId?: string;
  sourcePath: string;
};

export function LeadForm({
  formId = "lead-form",
  sourcePath,
}: LeadFormProps) {
  return (
    <LeadFormClient
      consentVersion={consentVersion}
      enabled={leadsEnabled}
      formId={formId}
      sourcePath={sourcePath}
    />
  );
}

import { LeadFormClient } from "@/components/marketing/forms/lead-form-client";
import { ACTIVE_CONSENT_VERSION } from "@more-i-gory/contracts";

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
      consentVersion={ACTIVE_CONSENT_VERSION}
      formId={formId}
      sourcePath={sourcePath}
    />
  );
}

import { LeadFormClient } from "@/ui/interactive/lead-form-client";

const consentVersion = "pdn-consent-2026-09-17";

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
      formId={formId}
      sourcePath={sourcePath}
    />
  );
}

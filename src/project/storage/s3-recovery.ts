import { TIMEWEB_S3_CONTRACT } from "./s3.ts";

export const TIMEWEB_S3_RECOVERY_CONTRACT = {
  bucket: TIMEWEB_S3_CONTRACT.bucket,
  providerIndependentCopy: "required",
  region: TIMEWEB_S3_CONTRACT.region,
  restoreProcedure: [
    "Identify the object key under media/ from the Payload media document filename.",
    "Restore the previous version in Timeweb S3 (console or CopyObject from VersionId) onto the same key.",
    "Do not rebuild or copy files from the VPS disk; Payload URLs stay path-style S3 URLs.",
    "Confirm public GET of the restored object, then reload the page that references it.",
  ],
  retention: "keep noncurrent object versions at least 30 days; do not empty the bucket as a cleanup shortcut",
  versioning: "enabled",
} as const;

export function assertTimewebS3RecoveryContract(): void {
  if (TIMEWEB_S3_RECOVERY_CONTRACT.versioning !== "enabled") {
    throw new Error("Timeweb S3 versioning must be enabled for media recovery.");
  }
  if (TIMEWEB_S3_RECOVERY_CONTRACT.providerIndependentCopy !== "required") {
    throw new Error("A provider-independent media copy is required while storage is single-region.");
  }
  if (!TIMEWEB_S3_RECOVERY_CONTRACT.retention.includes("30 days")) {
    throw new Error("S3 noncurrent version retention must be explicit.");
  }
  if (!TIMEWEB_S3_RECOVERY_CONTRACT.restoreProcedure.some((step) => /do not rebuild/i.test(step))) {
    throw new Error("S3 restore must explicitly forbid rebuilding from VPS disk.");
  }
}

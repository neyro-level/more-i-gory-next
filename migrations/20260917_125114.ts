import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_leads_retention_status" AS ENUM('active', 'pii_anonymized');
  ALTER TABLE "leads" ADD COLUMN "retention_status" "enum_leads_retention_status" DEFAULT 'active' NOT NULL;
  ALTER TABLE "leads" ADD COLUMN "pii_anonymized_at" timestamp(3) with time zone;
  ALTER TABLE "leads" ADD COLUMN "history_purge_at" timestamp(3) with time zone;
  CREATE INDEX "leads_retention_status_idx" ON "leads" USING btree ("retention_status");
  CREATE INDEX "leads_pii_anonymized_at_idx" ON "leads" USING btree ("pii_anonymized_at");
  CREATE INDEX "leads_history_purge_at_idx" ON "leads" USING btree ("history_purge_at");
  CREATE INDEX "retentionStatus_historyPurgeAt_idx" ON "leads" USING btree ("retention_status","history_purge_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "leads_retention_status_idx";
  DROP INDEX "leads_pii_anonymized_at_idx";
  DROP INDEX "leads_history_purge_at_idx";
  DROP INDEX "retentionStatus_historyPurgeAt_idx";
  ALTER TABLE "leads" DROP COLUMN "retention_status";
  ALTER TABLE "leads" DROP COLUMN "pii_anonymized_at";
  ALTER TABLE "leads" DROP COLUMN "history_purge_at";
  DROP TYPE "public"."enum_leads_retention_status";`)
}

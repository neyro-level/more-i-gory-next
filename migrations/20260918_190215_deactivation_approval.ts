import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_feed_sources_deactivation_approval_decision" AS ENUM('approved', 'rejected');
  ALTER TABLE "feed_sources" ADD COLUMN "deactivation_approval_run_id" varchar;
  ALTER TABLE "feed_sources" ADD COLUMN "deactivation_approval_approved_by" varchar;
  ALTER TABLE "feed_sources" ADD COLUMN "deactivation_approval_approved_at" timestamp(3) with time zone;
  ALTER TABLE "feed_sources" ADD COLUMN "deactivation_approval_expires_at" timestamp(3) with time zone;
  ALTER TABLE "feed_sources" ADD COLUMN "deactivation_approval_decision" "enum_feed_sources_deactivation_approval_decision";
  DROP INDEX "feed_sources_deactivation_approval_idx";
  ALTER TABLE "feed_sources" DROP COLUMN "deactivation_approval";
  DROP TYPE "public"."enum_feed_sources_deactivation_approval";
  CREATE INDEX "feed_sources_deactivation_approval_deactivation_approval_idx" ON "feed_sources" USING btree ("deactivation_approval_run_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_feed_sources_deactivation_approval" AS ENUM('required', 'approved', 'rejected');
  ALTER TABLE "feed_sources" ADD COLUMN "deactivation_approval" "enum_feed_sources_deactivation_approval" DEFAULT 'required' NOT NULL;
  CREATE INDEX "feed_sources_deactivation_approval_idx" ON "feed_sources" USING btree ("deactivation_approval");
  DROP INDEX "feed_sources_deactivation_approval_deactivation_approval_idx";
  ALTER TABLE "feed_sources" DROP COLUMN "deactivation_approval_decision";
  ALTER TABLE "feed_sources" DROP COLUMN "deactivation_approval_expires_at";
  ALTER TABLE "feed_sources" DROP COLUMN "deactivation_approval_approved_at";
  ALTER TABLE "feed_sources" DROP COLUMN "deactivation_approval_approved_by";
  ALTER TABLE "feed_sources" DROP COLUMN "deactivation_approval_run_id";
  DROP TYPE "public"."enum_feed_sources_deactivation_approval_decision";`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'deliverLead';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'deliverLead';
  CREATE TABLE "lead_deliveries_manual_retry_audit" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"requested_at" timestamp(3) with time zone NOT NULL,
  	"actor_ref" varchar NOT NULL,
  	"reason_redacted" varchar
  );
  
  ALTER TABLE "lead_deliveries_manual_retry_audit" ADD CONSTRAINT "lead_deliveries_manual_retry_audit_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lead_deliveries"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "lead_deliveries_manual_retry_audit_order_idx" ON "lead_deliveries_manual_retry_audit" USING btree ("_order");
  CREATE INDEX "lead_deliveries_manual_retry_audit_parent_id_idx" ON "lead_deliveries_manual_retry_audit" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "lead_deliveries_manual_retry_audit" CASCADE;
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'systemHealth', 'dispatchDueFeeds', 'importFeed');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'systemHealth', 'dispatchDueFeeds', 'importFeed');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";`)
}

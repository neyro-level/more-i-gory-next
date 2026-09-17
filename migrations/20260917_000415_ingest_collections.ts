import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_feed_sources_deactivation_approval" AS ENUM('required', 'approved', 'rejected');
  CREATE TYPE "public"."enum_import_runs_status" AS ENUM('queued', 'running', 'completed', 'suspicious', 'failed', 'skipped');
  CREATE TYPE "public"."enum_import_runs_mode" AS ENUM('incremental', 'full');
  CREATE TYPE "public"."enum_import_issues_severity" AS ENUM('info', 'warning', 'error', 'critical');
  CREATE TABLE "import_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"feed_source_id" integer NOT NULL,
	"status" "enum_import_runs_status" DEFAULT 'queued' NOT NULL,
	"mode" "enum_import_runs_mode" DEFAULT 'incremental' NOT NULL,
	"job_id" varchar,
	"started_at" timestamp(3) with time zone,
	"finished_at" timestamp(3) with time zone,
	"feed_hash" varchar,
	"etag" varchar,
	"last_modified" varchar,
	"offered_count" numeric,
	"created_count" numeric DEFAULT 0 NOT NULL,
	"updated_count" numeric DEFAULT 0 NOT NULL,
	"skipped_count" numeric DEFAULT 0 NOT NULL,
	"deactivated_count" numeric DEFAULT 0 NOT NULL,
	"issue_count" numeric DEFAULT 0 NOT NULL,
	"summary" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "import_issues" (
	"id" serial PRIMARY KEY NOT NULL,
	"feed_source_id" integer NOT NULL,
	"import_run_id" integer NOT NULL,
	"severity" "enum_import_issues_severity" DEFAULT 'warning' NOT NULL,
	"code" varchar NOT NULL,
	"external_id" varchar,
	"path" varchar,
	"message" varchar NOT NULL,
	"details" jsonb,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "feed_sources" ADD COLUMN "refresh_interval_minutes" numeric DEFAULT 60 NOT NULL;
  ALTER TABLE "feed_sources" ADD COLUMN "next_due_at" timestamp(3) with time zone;
  ALTER TABLE "feed_sources" ADD COLUMN "last_attempt_at" timestamp(3) with time zone;
  ALTER TABLE "feed_sources" ADD COLUMN "last_successful_run_at" timestamp(3) with time zone;
  ALTER TABLE "feed_sources" ADD COLUMN "last_full_run_at" timestamp(3) with time zone;
  ALTER TABLE "feed_sources" ADD COLUMN "safety_threshold_percent" numeric DEFAULT 20 NOT NULL;
  ALTER TABLE "feed_sources" ADD COLUMN "max_deactivations_per_run" numeric DEFAULT 0 NOT NULL;
  ALTER TABLE "feed_sources" ADD COLUMN "last_offer_count" numeric;
  ALTER TABLE "feed_sources" ADD COLUMN "last_etag" varchar;
  ALTER TABLE "feed_sources" ADD COLUMN "last_modified" varchar;
  ALTER TABLE "feed_sources" ADD COLUMN "last_feed_hash" varchar;
  ALTER TABLE "feed_sources" ADD COLUMN "deactivation_approval" "enum_feed_sources_deactivation_approval" DEFAULT 'required' NOT NULL;
  ALTER TABLE "import_runs" ADD CONSTRAINT "import_runs_feed_source_id_feed_sources_id_fk" FOREIGN KEY ("feed_source_id") REFERENCES "public"."feed_sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "import_issues" ADD CONSTRAINT "import_issues_feed_source_id_feed_sources_id_fk" FOREIGN KEY ("feed_source_id") REFERENCES "public"."feed_sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "import_issues" ADD CONSTRAINT "import_issues_import_run_id_import_runs_id_fk" FOREIGN KEY ("import_run_id") REFERENCES "public"."import_runs"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "import_runs_feed_source_idx" ON "import_runs" USING btree ("feed_source_id");
  CREATE INDEX "import_runs_status_idx" ON "import_runs" USING btree ("status");
  CREATE INDEX "import_runs_job_id_idx" ON "import_runs" USING btree ("job_id");
  CREATE INDEX "import_runs_started_at_idx" ON "import_runs" USING btree ("started_at");
  CREATE INDEX "import_runs_updated_at_idx" ON "import_runs" USING btree ("updated_at");
  CREATE INDEX "import_runs_created_at_idx" ON "import_runs" USING btree ("created_at");
  CREATE INDEX "feedSource_status_idx" ON "import_runs" USING btree ("feed_source_id","status");
  CREATE INDEX "feedSource_startedAt_idx" ON "import_runs" USING btree ("feed_source_id","started_at");
  CREATE INDEX "import_issues_feed_source_idx" ON "import_issues" USING btree ("feed_source_id");
  CREATE INDEX "import_issues_import_run_idx" ON "import_issues" USING btree ("import_run_id");
  CREATE INDEX "import_issues_severity_idx" ON "import_issues" USING btree ("severity");
  CREATE INDEX "import_issues_code_idx" ON "import_issues" USING btree ("code");
  CREATE INDEX "import_issues_external_id_idx" ON "import_issues" USING btree ("external_id");
  CREATE INDEX "import_issues_updated_at_idx" ON "import_issues" USING btree ("updated_at");
  CREATE INDEX "import_issues_created_at_idx" ON "import_issues" USING btree ("created_at");
  CREATE INDEX "importRun_severity_idx" ON "import_issues" USING btree ("import_run_id","severity");
  CREATE INDEX "feedSource_code_idx" ON "import_issues" USING btree ("feed_source_id","code");
  CREATE INDEX "feed_sources_parser_idx" ON "feed_sources" USING btree ("parser");
  CREATE INDEX "feed_sources_market_idx" ON "feed_sources" USING btree ("market");
  CREATE INDEX "feed_sources_next_due_at_idx" ON "feed_sources" USING btree ("next_due_at");
  CREATE INDEX "feed_sources_deactivation_approval_idx" ON "feed_sources" USING btree ("deactivation_approval");
  CREATE INDEX "enabled_nextDueAt_idx" ON "feed_sources" USING btree ("enabled","next_due_at");
  CREATE INDEX "market_parser_idx" ON "feed_sources" USING btree ("market","parser");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "import_runs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "import_issues" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "import_runs" CASCADE;
  DROP TABLE "import_issues" CASCADE;
  DROP INDEX "feed_sources_parser_idx";
  DROP INDEX "feed_sources_market_idx";
  DROP INDEX "feed_sources_next_due_at_idx";
  DROP INDEX "feed_sources_deactivation_approval_idx";
  DROP INDEX "enabled_nextDueAt_idx";
  DROP INDEX "market_parser_idx";
  ALTER TABLE "feed_sources" DROP COLUMN "refresh_interval_minutes";
  ALTER TABLE "feed_sources" DROP COLUMN "next_due_at";
  ALTER TABLE "feed_sources" DROP COLUMN "last_attempt_at";
  ALTER TABLE "feed_sources" DROP COLUMN "last_successful_run_at";
  ALTER TABLE "feed_sources" DROP COLUMN "last_full_run_at";
  ALTER TABLE "feed_sources" DROP COLUMN "safety_threshold_percent";
  ALTER TABLE "feed_sources" DROP COLUMN "max_deactivations_per_run";
  ALTER TABLE "feed_sources" DROP COLUMN "last_offer_count";
  ALTER TABLE "feed_sources" DROP COLUMN "last_etag";
  ALTER TABLE "feed_sources" DROP COLUMN "last_modified";
  ALTER TABLE "feed_sources" DROP COLUMN "last_feed_hash";
  ALTER TABLE "feed_sources" DROP COLUMN "deactivation_approval";
  DROP TYPE "public"."enum_feed_sources_deactivation_approval";
  DROP TYPE "public"."enum_import_runs_status";
  DROP TYPE "public"."enum_import_runs_mode";
  DROP TYPE "public"."enum_import_issues_severity";`)
}

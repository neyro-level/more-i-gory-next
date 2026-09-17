import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_import_runs_status" ADD VALUE 'interrupted';
  ALTER TABLE "import_runs" ADD COLUMN "heartbeat_at" timestamp(3) with time zone;
  CREATE INDEX "import_runs_heartbeat_at_idx" ON "import_runs" USING btree ("heartbeat_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "import_runs" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "import_runs" ALTER COLUMN "status" SET DEFAULT 'queued'::text;
  DROP TYPE "public"."enum_import_runs_status";
  CREATE TYPE "public"."enum_import_runs_status" AS ENUM('queued', 'running', 'completed', 'suspicious', 'failed', 'skipped');
  ALTER TABLE "import_runs" ALTER COLUMN "status" SET DEFAULT 'queued'::"public"."enum_import_runs_status";
  ALTER TABLE "import_runs" ALTER COLUMN "status" SET DATA TYPE "public"."enum_import_runs_status" USING "status"::"public"."enum_import_runs_status";
  DROP INDEX "import_runs_heartbeat_at_idx";
  ALTER TABLE "import_runs" DROP COLUMN "heartbeat_at";`)
}

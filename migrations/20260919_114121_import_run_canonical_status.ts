import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$
  DECLARE ambiguous_skipped integer;
  BEGIN
    SELECT count(*) INTO ambiguous_skipped
    FROM "import_runs"
    WHERE "status" = 'skipped'
      AND "summary" IS DISTINCT FROM 'Feed unchanged (HTTP 304).';
    IF ambiguous_skipped > 0 THEN
      RAISE EXCEPTION 'import-run status migration blocked: % ambiguous skipped rows', ambiguous_skipped;
    END IF;
  END $$;
  ALTER TABLE "import_runs" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "import_runs" ALTER COLUMN "status" SET DEFAULT 'queued'::text;
  UPDATE "import_runs" SET "status" = 'success' WHERE "status" = 'completed';
  UPDATE "import_runs"
    SET "status" = 'unchanged'
    WHERE "status" = 'skipped' AND "summary" = 'Feed unchanged (HTTP 304).';
  DROP TYPE "public"."enum_import_runs_status";
  CREATE TYPE "public"."enum_import_runs_status" AS ENUM('queued', 'running', 'success', 'unchanged', 'suspicious', 'failed', 'interrupted');
  ALTER TABLE "import_runs" ALTER COLUMN "status" SET DEFAULT 'queued'::"public"."enum_import_runs_status";
  ALTER TABLE "import_runs" ALTER COLUMN "status" SET DATA TYPE "public"."enum_import_runs_status" USING "status"::"public"."enum_import_runs_status";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "import_runs" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "import_runs" ALTER COLUMN "status" SET DEFAULT 'queued'::text;
  UPDATE "import_runs" SET "status" = 'completed' WHERE "status" = 'success';
  UPDATE "import_runs" SET "status" = 'skipped' WHERE "status" = 'unchanged';
  DROP TYPE "public"."enum_import_runs_status";
  CREATE TYPE "public"."enum_import_runs_status" AS ENUM('queued', 'running', 'completed', 'suspicious', 'failed', 'skipped', 'interrupted');
  ALTER TABLE "import_runs" ALTER COLUMN "status" SET DEFAULT 'queued'::"public"."enum_import_runs_status";
  ALTER TABLE "import_runs" ALTER COLUMN "status" SET DATA TYPE "public"."enum_import_runs_status" USING "status"::"public"."enum_import_runs_status";`)
}

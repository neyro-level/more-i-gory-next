import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_developers_publication_status" AS ENUM('hidden', 'published', 'archived');
  CREATE TYPE "public"."enum_complexes_publication_status" AS ENUM('hidden', 'published', 'archived');
  ALTER TABLE "developers" ALTER COLUMN "status" DROP DEFAULT;
  ALTER TABLE "developers" ALTER COLUMN "status" SET DATA TYPE "public"."enum_developers_publication_status" USING "status"::text::"public"."enum_developers_publication_status";
  ALTER TABLE "developers" ALTER COLUMN "status" SET DEFAULT 'hidden';
  ALTER TABLE "_developers_v" ALTER COLUMN "version_status" DROP DEFAULT;
  ALTER TABLE "_developers_v" ALTER COLUMN "version_status" SET DATA TYPE "public"."enum_developers_publication_status" USING "version_status"::text::"public"."enum_developers_publication_status";
  ALTER TABLE "_developers_v" ALTER COLUMN "version_status" SET DEFAULT 'hidden';
  ALTER TABLE "complexes" ALTER COLUMN "status" DROP DEFAULT;
  ALTER TABLE "complexes" ALTER COLUMN "status" SET DATA TYPE "public"."enum_complexes_publication_status" USING "status"::text::"public"."enum_complexes_publication_status";
  ALTER TABLE "complexes" ALTER COLUMN "status" SET DEFAULT 'hidden';
  ALTER TABLE "_complexes_v" ALTER COLUMN "version_status" DROP DEFAULT;
  ALTER TABLE "_complexes_v" ALTER COLUMN "version_status" SET DATA TYPE "public"."enum_complexes_publication_status" USING "version_status"::text::"public"."enum_complexes_publication_status";
  ALTER TABLE "_complexes_v" ALTER COLUMN "version_status" SET DEFAULT 'hidden';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "developers" ALTER COLUMN "status" DROP DEFAULT;
  ALTER TABLE "developers" ALTER COLUMN "status" SET DATA TYPE "public"."enum_developers_status" USING "status"::text::"public"."enum_developers_status";
  ALTER TABLE "developers" ALTER COLUMN "status" SET DEFAULT 'hidden';
  ALTER TABLE "_developers_v" ALTER COLUMN "version_status" DROP DEFAULT;
  ALTER TABLE "_developers_v" ALTER COLUMN "version_status" SET DATA TYPE "public"."enum__developers_v_version_status" USING "version_status"::text::"public"."enum__developers_v_version_status";
  ALTER TABLE "_developers_v" ALTER COLUMN "version_status" SET DEFAULT 'hidden';
  ALTER TABLE "complexes" ALTER COLUMN "status" DROP DEFAULT;
  ALTER TABLE "complexes" ALTER COLUMN "status" SET DATA TYPE "public"."enum_complexes_status" USING "status"::text::"public"."enum_complexes_status";
  ALTER TABLE "complexes" ALTER COLUMN "status" SET DEFAULT 'hidden';
  ALTER TABLE "_complexes_v" ALTER COLUMN "version_status" DROP DEFAULT;
  ALTER TABLE "_complexes_v" ALTER COLUMN "version_status" SET DATA TYPE "public"."enum__complexes_v_version_status" USING "version_status"::text::"public"."enum__complexes_v_version_status";
  ALTER TABLE "_complexes_v" ALTER COLUMN "version_status" SET DEFAULT 'hidden';
  DROP TYPE "public"."enum_developers_publication_status";
  DROP TYPE "public"."enum_complexes_publication_status";`)
}

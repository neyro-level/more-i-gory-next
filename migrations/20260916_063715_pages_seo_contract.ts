import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_seo_robots" AS ENUM('index-follow', 'noindex-follow');
  CREATE TYPE "public"."enum_pages_seo_priority" AS ENUM('P1', 'P2', 'P3');
  CREATE TYPE "public"."enum__pages_v_version_seo_robots" AS ENUM('index-follow', 'noindex-follow');
  CREATE TYPE "public"."enum__pages_v_version_seo_priority" AS ENUM('P1', 'P2', 'P3');
  ALTER TABLE "pages" ADD COLUMN "seo_title" varchar;
  ALTER TABLE "pages" ADD COLUMN "seo_description" varchar;
  ALTER TABLE "pages" ADD COLUMN "seo_canonical_override" varchar;
  ALTER TABLE "pages" ADD COLUMN "seo_og_image_path" varchar;
  ALTER TABLE "pages" ADD COLUMN "seo_robots" "enum_pages_seo_robots" DEFAULT 'index-follow';
  ALTER TABLE "pages" ADD COLUMN "seo_priority" "enum_pages_seo_priority" DEFAULT 'P2';
  ALTER TABLE "_pages_v" ADD COLUMN "version_seo_title" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_seo_description" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_seo_canonical_override" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_seo_og_image_path" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_seo_robots" "enum__pages_v_version_seo_robots" DEFAULT 'index-follow';
  ALTER TABLE "_pages_v" ADD COLUMN "version_seo_priority" "enum__pages_v_version_seo_priority" DEFAULT 'P2';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DROP COLUMN "seo_title";
  ALTER TABLE "pages" DROP COLUMN "seo_description";
  ALTER TABLE "pages" DROP COLUMN "seo_canonical_override";
  ALTER TABLE "pages" DROP COLUMN "seo_og_image_path";
  ALTER TABLE "pages" DROP COLUMN "seo_robots";
  ALTER TABLE "pages" DROP COLUMN "seo_priority";
  ALTER TABLE "_pages_v" DROP COLUMN "version_seo_title";
  ALTER TABLE "_pages_v" DROP COLUMN "version_seo_description";
  ALTER TABLE "_pages_v" DROP COLUMN "version_seo_canonical_override";
  ALTER TABLE "_pages_v" DROP COLUMN "version_seo_og_image_path";
  ALTER TABLE "_pages_v" DROP COLUMN "version_seo_robots";
  ALTER TABLE "_pages_v" DROP COLUMN "version_seo_priority";
  DROP TYPE "public"."enum_pages_seo_robots";
  DROP TYPE "public"."enum_pages_seo_priority";
  DROP TYPE "public"."enum__pages_v_version_seo_robots";
  DROP TYPE "public"."enum__pages_v_version_seo_priority";`)
}

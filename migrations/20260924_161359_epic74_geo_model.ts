import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_regions_page_key" AS ENUM('REGION', 'CITY');
  CREATE TYPE "public"."enum__regions_v_version_page_key" AS ENUM('REGION', 'CITY');
  ALTER TABLE "regions" ADD COLUMN "page_key" "enum_regions_page_key";
  ALTER TABLE "regions" ADD COLUMN "verified_at" timestamp(3) with time zone;
  ALTER TABLE "_regions_v" ADD COLUMN "version_page_key" "enum__regions_v_version_page_key";
  ALTER TABLE "_regions_v" ADD COLUMN "version_verified_at" timestamp(3) with time zone;
  ALTER TABLE "properties" ADD COLUMN "city_or_area_id" integer;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_city_or_area_id_regions_id_fk" FOREIGN KEY ("city_or_area_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;
  UPDATE "regions" SET "page_key" = CASE WHEN "kind" = 'region' THEN 'REGION'::"enum_regions_page_key" WHEN "kind" = 'locality' THEN 'CITY'::"enum_regions_page_key" ELSE NULL END WHERE "slug" IN ('krym', 'yalta', 'sevastopol', 'evpatoriya', 'alushta');
  UPDATE "_regions_v" SET "version_page_key" = CASE WHEN "version_kind" = 'region' THEN 'REGION'::"enum__regions_v_version_page_key" WHEN "version_kind" = 'locality' THEN 'CITY'::"enum__regions_v_version_page_key" ELSE NULL END WHERE "version_slug" IN ('krym', 'yalta', 'sevastopol', 'evpatoriya', 'alushta');
  CREATE UNIQUE INDEX "regions_slug_idx" ON "regions" USING btree ("slug");
  CREATE INDEX "_regions_v_version_version_slug_idx" ON "_regions_v" USING btree ("version_slug");
  CREATE INDEX "properties_city_or_area_idx" ON "properties" USING btree ("city_or_area_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "properties" DROP CONSTRAINT "properties_city_or_area_id_regions_id_fk";

  DROP INDEX "regions_slug_idx";
  DROP INDEX "_regions_v_version_version_slug_idx";
  DROP INDEX "properties_city_or_area_idx";
  ALTER TABLE "regions" DROP COLUMN "page_key";
  ALTER TABLE "regions" DROP COLUMN "verified_at";
  ALTER TABLE "_regions_v" DROP COLUMN "version_page_key";
  ALTER TABLE "_regions_v" DROP COLUMN "version_verified_at";
  ALTER TABLE "properties" DROP COLUMN "city_or_area_id";
  DROP TYPE "public"."enum_regions_page_key";
  DROP TYPE "public"."enum__regions_v_version_page_key";`)
}

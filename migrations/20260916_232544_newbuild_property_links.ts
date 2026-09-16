import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "properties" ADD COLUMN "complex_id" integer;
  ALTER TABLE "properties" ADD COLUMN "building_id" integer;
  ALTER TABLE "properties" ADD COLUMN "layout_id" integer;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_complex_id_complexes_id_fk" FOREIGN KEY ("complex_id") REFERENCES "public"."complexes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_layout_id_layouts_id_fk" FOREIGN KEY ("layout_id") REFERENCES "public"."layouts"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "properties_complex_idx" ON "properties" USING btree ("complex_id");
  CREATE INDEX "properties_building_idx" ON "properties" USING btree ("building_id");
  CREATE INDEX "properties_layout_idx" ON "properties" USING btree ("layout_id");
  CREATE INDEX "complex_building_layout_idx" ON "properties" USING btree ("complex_id","building_id","layout_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "properties" DROP CONSTRAINT "properties_complex_id_complexes_id_fk";

  ALTER TABLE "properties" DROP CONSTRAINT "properties_building_id_buildings_id_fk";

  ALTER TABLE "properties" DROP CONSTRAINT "properties_layout_id_layouts_id_fk";

  DROP INDEX "properties_complex_idx";
  DROP INDEX "properties_building_idx";
  DROP INDEX "properties_layout_idx";
  DROP INDEX "complex_building_layout_idx";
  ALTER TABLE "properties" DROP COLUMN "complex_id";
  ALTER TABLE "properties" DROP COLUMN "building_id";
  ALTER TABLE "properties" DROP COLUMN "layout_id";`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_properties_category" AS ENUM('apartment', 'house', 'land', 'commercial');
  CREATE TYPE "public"."enum_properties_deal_type" AS ENUM('sale', 'rent');
  ALTER TABLE "properties" ALTER COLUMN "category" SET DATA TYPE "public"."enum_properties_category" USING "category"::"public"."enum_properties_category";
  ALTER TABLE "properties" ALTER COLUMN "deal_type" SET DATA TYPE "public"."enum_properties_deal_type" USING "deal_type"::"public"."enum_properties_deal_type";
  CREATE INDEX "properties_category_idx" ON "properties" USING btree ("category");
  CREATE INDEX "properties_deal_type_idx" ON "properties" USING btree ("deal_type");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "properties_category_idx";
  DROP INDEX "properties_deal_type_idx";
  ALTER TABLE "properties" ALTER COLUMN "category" SET DATA TYPE varchar;
  ALTER TABLE "properties" ALTER COLUMN "deal_type" SET DATA TYPE varchar;
  DROP TYPE "public"."enum_properties_category";
  DROP TYPE "public"."enum_properties_deal_type";`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "properties" ALTER COLUMN "price_minor" SET DATA TYPE integer;
  ALTER TABLE "properties" ALTER COLUMN "price_per_meter_minor" SET DATA TYPE integer;
  ALTER TABLE "properties" ALTER COLUMN "total_area" SET DATA TYPE numeric(10, 2);
  ALTER TABLE "properties" ALTER COLUMN "living_area" SET DATA TYPE numeric(10, 2);
  ALTER TABLE "properties" ALTER COLUMN "kitchen_area" SET DATA TYPE numeric(10, 2);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "properties" ALTER COLUMN "price_minor" SET DATA TYPE numeric;
  ALTER TABLE "properties" ALTER COLUMN "price_per_meter_minor" SET DATA TYPE numeric;
  ALTER TABLE "properties" ALTER COLUMN "total_area" SET DATA TYPE numeric;
  ALTER TABLE "properties" ALTER COLUMN "living_area" SET DATA TYPE numeric;
  ALTER TABLE "properties" ALTER COLUMN "kitchen_area" SET DATA TYPE numeric;`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE UNIQUE INDEX "feedSource_externalId_idx" ON "properties" USING btree ("feed_source_id","external_id");
  CREATE INDEX "origin_status_publishedAt_idx" ON "properties" USING btree ("origin","status","published_at");
  CREATE INDEX "market_region_idx" ON "properties" USING btree ("market","region_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "feedSource_externalId_idx";
  DROP INDEX "origin_status_publishedAt_idx";
  DROP INDEX "market_region_idx";`)
}

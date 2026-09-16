import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_feed_sources_market" AS ENUM('secondary', 'newbuild');
  CREATE TYPE "public"."enum_properties_origin" AS ENUM('feed', 'manual');
  CREATE TYPE "public"."enum_properties_status" AS ENUM('active', 'archived');
  CREATE TYPE "public"."enum_properties_market" AS ENUM('secondary', 'newbuild');
  CREATE TABLE "feed_sources" (
    "id" serial PRIMARY KEY NOT NULL,
    "code" varchar NOT NULL,
    "parser" varchar,
    "market" "enum_feed_sources_market" DEFAULT 'newbuild' NOT NULL,
    "feed_url_ref" varchar,
    "enabled" boolean DEFAULT false NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "properties_facts" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar NOT NULL,
    "value" varchar NOT NULL
  );

  CREATE TABLE "properties_sources" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar NOT NULL,
    "url" varchar
  );

  CREATE TABLE "properties" (
    "id" serial PRIMARY KEY NOT NULL,
    "origin" "enum_properties_origin" DEFAULT 'manual' NOT NULL,
    "feed_source_id" integer,
    "external_id" varchar,
    "import_hash" varchar,
    "first_seen_at" timestamp(3) with time zone,
    "last_seen_at" timestamp(3) with time zone,
    "last_import_run" varchar,
    "external_complex_id" varchar,
    "external_complex_name" varchar,
    "external_building_id" varchar,
    "external_layout_id" varchar,
    "status" "enum_properties_status" DEFAULT 'active' NOT NULL,
    "deactivated_at" timestamp(3) with time zone,
    "deactivated_by_run" varchar,
    "needs_review" boolean DEFAULT false NOT NULL,
    "published_at" timestamp(3) with time zone,
    "slug" varchar,
    "market" "enum_properties_market" DEFAULT 'secondary' NOT NULL,
    "category" varchar,
    "deal_type" varchar,
    "price_minor" numeric,
    "currency" varchar DEFAULT 'RUB',
    "price_per_meter_minor" numeric,
    "rooms" numeric,
    "total_area" numeric,
    "living_area" numeric,
    "kitchen_area" numeric,
    "floor" numeric,
    "floors" numeric,
    "region_id" integer,
    "locality" varchar,
    "district" varchar,
    "street" varchar,
    "house" varchar,
    "public_address" varchar,
    "lat" numeric,
    "lng" numeric,
    "title" varchar NOT NULL,
    "description" varchar,
    "unit_number" varchar,
    "cadastral_number" varchar,
    "internal_comment" varchar,
    "owner_contact" varchar,
    "verdict" varchar,
    "budget_note" varchar,
    "risk_summary" varchar,
    "verified_at" timestamp(3) with time zone,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "properties_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "media_id" integer
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "feed_sources_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "properties_id" integer;
  ALTER TABLE "properties_facts" ADD CONSTRAINT "properties_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "properties_sources" ADD CONSTRAINT "properties_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_feed_source_id_feed_sources_id_fk" FOREIGN KEY ("feed_source_id") REFERENCES "public"."feed_sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties_rels" ADD CONSTRAINT "properties_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "properties_rels" ADD CONSTRAINT "properties_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "feed_sources_code_idx" ON "feed_sources" USING btree ("code");
  CREATE INDEX "feed_sources_updated_at_idx" ON "feed_sources" USING btree ("updated_at");
  CREATE INDEX "feed_sources_created_at_idx" ON "feed_sources" USING btree ("created_at");
  CREATE INDEX "properties_facts_order_idx" ON "properties_facts" USING btree ("_order");
  CREATE INDEX "properties_facts_parent_id_idx" ON "properties_facts" USING btree ("_parent_id");
  CREATE INDEX "properties_sources_order_idx" ON "properties_sources" USING btree ("_order");
  CREATE INDEX "properties_sources_parent_id_idx" ON "properties_sources" USING btree ("_parent_id");
  CREATE INDEX "properties_origin_idx" ON "properties" USING btree ("origin");
  CREATE INDEX "properties_feed_source_idx" ON "properties" USING btree ("feed_source_id");
  CREATE INDEX "properties_status_idx" ON "properties" USING btree ("status");
  CREATE INDEX "properties_published_at_idx" ON "properties" USING btree ("published_at");
  CREATE UNIQUE INDEX "properties_slug_idx" ON "properties" USING btree ("slug");
  CREATE INDEX "properties_market_idx" ON "properties" USING btree ("market");
  CREATE INDEX "properties_region_idx" ON "properties" USING btree ("region_id");
  CREATE INDEX "properties_updated_at_idx" ON "properties" USING btree ("updated_at");
  CREATE INDEX "properties_created_at_idx" ON "properties" USING btree ("created_at");
  CREATE INDEX "properties_rels_order_idx" ON "properties_rels" USING btree ("order");
  CREATE INDEX "properties_rels_parent_idx" ON "properties_rels" USING btree ("parent_id");
  CREATE INDEX "properties_rels_path_idx" ON "properties_rels" USING btree ("path");
  CREATE INDEX "properties_rels_media_id_idx" ON "properties_rels" USING btree ("media_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_feed_sources_fk" FOREIGN KEY ("feed_sources_id") REFERENCES "public"."feed_sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_properties_fk" FOREIGN KEY ("properties_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_feed_sources_id_idx" ON "payload_locked_documents_rels" USING btree ("feed_sources_id");
  CREATE INDEX "payload_locked_documents_rels_properties_id_idx" ON "payload_locked_documents_rels" USING btree ("properties_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "feed_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "properties_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "properties_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "properties" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "properties_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "feed_sources" CASCADE;
  DROP TABLE "properties_facts" CASCADE;
  DROP TABLE "properties_sources" CASCADE;
  DROP TABLE "properties" CASCADE;
  DROP TABLE "properties_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_feed_sources_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_properties_fk";

  DROP INDEX "payload_locked_documents_rels_feed_sources_id_idx";
  DROP INDEX "payload_locked_documents_rels_properties_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "feed_sources_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "properties_id";
  DROP TYPE "public"."enum_feed_sources_market";
  DROP TYPE "public"."enum_properties_origin";
  DROP TYPE "public"."enum_properties_status";
  DROP TYPE "public"."enum_properties_market";`)
}

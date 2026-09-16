import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_regions_kind" AS ENUM('region', 'locality', 'segment');
  CREATE TYPE "public"."enum_regions_seo_robots" AS ENUM('index-follow', 'noindex-follow');
  CREATE TYPE "public"."enum_regions_seo_priority" AS ENUM('P1', 'P2', 'P3');
  CREATE TYPE "public"."enum_regions_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__regions_v_version_kind" AS ENUM('region', 'locality', 'segment');
  CREATE TYPE "public"."enum__regions_v_version_seo_robots" AS ENUM('index-follow', 'noindex-follow');
  CREATE TYPE "public"."enum__regions_v_version_seo_priority" AS ENUM('P1', 'P2', 'P3');
  CREATE TYPE "public"."enum__regions_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "regions_blocks_hero" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"eyebrow" varchar,
	"title" varchar,
	"lead" varchar,
	"primary_cta_label" varchar,
	"primary_cta_href" varchar,
	"secondary_cta_label" varchar,
	"secondary_cta_href" varchar,
	"proof" varchar,
	"image_path" varchar,
	"image_alt" varchar,
	"block_name" varchar
  );

  CREATE TABLE "regions_blocks_lead" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"eyebrow" varchar,
	"title" varchar,
	"text" varchar,
	"block_name" varchar
  );

  CREATE TABLE "regions_blocks_thesis_items" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar
  );

  CREATE TABLE "regions_blocks_thesis" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"block_name" varchar
  );

  CREATE TABLE "regions_blocks_risk_block" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar,
	"block_name" varchar
  );

  CREATE TABLE "regions_blocks_numbered_steps_steps" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar
  );

  CREATE TABLE "regions_blocks_numbered_steps" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"eyebrow" varchar,
	"title" varchar,
	"lead" varchar,
	"block_name" varchar
  );

  CREATE TABLE "regions_blocks_proof_block" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"proof" varchar,
	"block_name" varchar
  );

  CREATE TABLE "regions_blocks_scenario_table_rows" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"scenario" varchar,
	"assumption" varchar,
	"investor_question" varchar
  );

  CREATE TABLE "regions_blocks_scenario_table" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"block_name" varchar
  );

  CREATE TABLE "regions_blocks_cards_grid_cards" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar,
	"link_label" varchar,
	"link_href" varchar
  );

  CREATE TABLE "regions_blocks_cards_grid" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"lead" varchar,
	"block_name" varchar
  );

  CREATE TABLE "regions_blocks_object_cards_items" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"href" varchar,
	"location" varchar,
	"status" varchar,
	"thesis" varchar,
	"risk" varchar,
	"image_path" varchar,
	"image_alt" varchar
  );

  CREATE TABLE "regions_blocks_object_cards" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"lead" varchar,
	"block_name" varchar
  );

  CREATE TABLE "regions_blocks_cta" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar,
	"primary_cta_label" varchar,
	"primary_cta_href" varchar,
	"secondary_cta_label" varchar,
	"secondary_cta_href" varchar,
	"block_name" varchar
  );

  CREATE TABLE "regions_blocks_rich_text" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"content" jsonb,
	"block_name" varchar
  );

  CREATE TABLE "regions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"slug" varchar,
	"kind" "enum_regions_kind",
	"parent_id" integer,
	"order" numeric DEFAULT 0,
	"lead" varchar,
	"investment_thesis" varchar,
	"risk_summary" varchar,
	"hero_media_id" integer,
	"seo_title" varchar,
	"seo_description" varchar,
	"seo_canonical_override" varchar,
	"seo_og_image_path" varchar,
	"seo_robots" "enum_regions_seo_robots" DEFAULT 'index-follow',
	"seo_priority" "enum_regions_seo_priority" DEFAULT 'P2',
	"status" varchar DEFAULT 'hidden',
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"_status" "enum_regions_status" DEFAULT 'draft'
  );

  CREATE TABLE "_regions_v_blocks_hero" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"eyebrow" varchar,
	"title" varchar,
	"lead" varchar,
	"primary_cta_label" varchar,
	"primary_cta_href" varchar,
	"secondary_cta_label" varchar,
	"secondary_cta_href" varchar,
	"proof" varchar,
	"image_path" varchar,
	"image_alt" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_regions_v_blocks_lead" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"eyebrow" varchar,
	"title" varchar,
	"text" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_regions_v_blocks_thesis_items" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_regions_v_blocks_thesis" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_regions_v_blocks_risk_block" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_regions_v_blocks_numbered_steps_steps" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_regions_v_blocks_numbered_steps" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"eyebrow" varchar,
	"title" varchar,
	"lead" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_regions_v_blocks_proof_block" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"proof" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_regions_v_blocks_scenario_table_rows" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"scenario" varchar,
	"assumption" varchar,
	"investor_question" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_regions_v_blocks_scenario_table" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_regions_v_blocks_cards_grid_cards" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar,
	"link_label" varchar,
	"link_href" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_regions_v_blocks_cards_grid" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"lead" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_regions_v_blocks_object_cards_items" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"href" varchar,
	"location" varchar,
	"status" varchar,
	"thesis" varchar,
	"risk" varchar,
	"image_path" varchar,
	"image_alt" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_regions_v_blocks_object_cards" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"lead" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_regions_v_blocks_cta" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar,
	"primary_cta_label" varchar,
	"primary_cta_href" varchar,
	"secondary_cta_label" varchar,
	"secondary_cta_href" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_regions_v_blocks_rich_text" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"content" jsonb,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_regions_v" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer,
	"version_title" varchar,
	"version_slug" varchar,
	"version_kind" "enum__regions_v_version_kind",
	"version_parent_id" integer,
	"version_order" numeric DEFAULT 0,
	"version_lead" varchar,
	"version_investment_thesis" varchar,
	"version_risk_summary" varchar,
	"version_hero_media_id" integer,
	"version_seo_title" varchar,
	"version_seo_description" varchar,
	"version_seo_canonical_override" varchar,
	"version_seo_og_image_path" varchar,
	"version_seo_robots" "enum__regions_v_version_seo_robots" DEFAULT 'index-follow',
	"version_seo_priority" "enum__regions_v_version_seo_priority" DEFAULT 'P2',
	"version_status" varchar DEFAULT 'hidden',
	"version_updated_at" timestamp(3) with time zone,
	"version_created_at" timestamp(3) with time zone,
	"version__status" "enum__regions_v_version_status" DEFAULT 'draft',
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"latest" boolean
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "regions_id" integer;
  ALTER TABLE "regions_blocks_hero" ADD CONSTRAINT "regions_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "regions_blocks_lead" ADD CONSTRAINT "regions_blocks_lead_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "regions_blocks_thesis_items" ADD CONSTRAINT "regions_blocks_thesis_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."regions_blocks_thesis"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "regions_blocks_thesis" ADD CONSTRAINT "regions_blocks_thesis_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "regions_blocks_risk_block" ADD CONSTRAINT "regions_blocks_risk_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "regions_blocks_numbered_steps_steps" ADD CONSTRAINT "regions_blocks_numbered_steps_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."regions_blocks_numbered_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "regions_blocks_numbered_steps" ADD CONSTRAINT "regions_blocks_numbered_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "regions_blocks_proof_block" ADD CONSTRAINT "regions_blocks_proof_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "regions_blocks_scenario_table_rows" ADD CONSTRAINT "regions_blocks_scenario_table_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."regions_blocks_scenario_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "regions_blocks_scenario_table" ADD CONSTRAINT "regions_blocks_scenario_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "regions_blocks_cards_grid_cards" ADD CONSTRAINT "regions_blocks_cards_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."regions_blocks_cards_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "regions_blocks_cards_grid" ADD CONSTRAINT "regions_blocks_cards_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "regions_blocks_object_cards_items" ADD CONSTRAINT "regions_blocks_object_cards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."regions_blocks_object_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "regions_blocks_object_cards" ADD CONSTRAINT "regions_blocks_object_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "regions_blocks_cta" ADD CONSTRAINT "regions_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "regions_blocks_rich_text" ADD CONSTRAINT "regions_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "regions" ADD CONSTRAINT "regions_parent_id_regions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "regions" ADD CONSTRAINT "regions_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_regions_v_blocks_hero" ADD CONSTRAINT "_regions_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_regions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_regions_v_blocks_lead" ADD CONSTRAINT "_regions_v_blocks_lead_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_regions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_regions_v_blocks_thesis_items" ADD CONSTRAINT "_regions_v_blocks_thesis_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_regions_v_blocks_thesis"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_regions_v_blocks_thesis" ADD CONSTRAINT "_regions_v_blocks_thesis_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_regions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_regions_v_blocks_risk_block" ADD CONSTRAINT "_regions_v_blocks_risk_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_regions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_regions_v_blocks_numbered_steps_steps" ADD CONSTRAINT "_regions_v_blocks_numbered_steps_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_regions_v_blocks_numbered_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_regions_v_blocks_numbered_steps" ADD CONSTRAINT "_regions_v_blocks_numbered_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_regions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_regions_v_blocks_proof_block" ADD CONSTRAINT "_regions_v_blocks_proof_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_regions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_regions_v_blocks_scenario_table_rows" ADD CONSTRAINT "_regions_v_blocks_scenario_table_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_regions_v_blocks_scenario_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_regions_v_blocks_scenario_table" ADD CONSTRAINT "_regions_v_blocks_scenario_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_regions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_regions_v_blocks_cards_grid_cards" ADD CONSTRAINT "_regions_v_blocks_cards_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_regions_v_blocks_cards_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_regions_v_blocks_cards_grid" ADD CONSTRAINT "_regions_v_blocks_cards_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_regions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_regions_v_blocks_object_cards_items" ADD CONSTRAINT "_regions_v_blocks_object_cards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_regions_v_blocks_object_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_regions_v_blocks_object_cards" ADD CONSTRAINT "_regions_v_blocks_object_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_regions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_regions_v_blocks_cta" ADD CONSTRAINT "_regions_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_regions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_regions_v_blocks_rich_text" ADD CONSTRAINT "_regions_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_regions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_regions_v" ADD CONSTRAINT "_regions_v_parent_id_regions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_regions_v" ADD CONSTRAINT "_regions_v_version_parent_id_regions_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_regions_v" ADD CONSTRAINT "_regions_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "regions_blocks_hero_order_idx" ON "regions_blocks_hero" USING btree ("_order");
  CREATE INDEX "regions_blocks_hero_parent_id_idx" ON "regions_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "regions_blocks_hero_path_idx" ON "regions_blocks_hero" USING btree ("_path");
  CREATE INDEX "regions_blocks_lead_order_idx" ON "regions_blocks_lead" USING btree ("_order");
  CREATE INDEX "regions_blocks_lead_parent_id_idx" ON "regions_blocks_lead" USING btree ("_parent_id");
  CREATE INDEX "regions_blocks_lead_path_idx" ON "regions_blocks_lead" USING btree ("_path");
  CREATE INDEX "regions_blocks_thesis_items_order_idx" ON "regions_blocks_thesis_items" USING btree ("_order");
  CREATE INDEX "regions_blocks_thesis_items_parent_id_idx" ON "regions_blocks_thesis_items" USING btree ("_parent_id");
  CREATE INDEX "regions_blocks_thesis_order_idx" ON "regions_blocks_thesis" USING btree ("_order");
  CREATE INDEX "regions_blocks_thesis_parent_id_idx" ON "regions_blocks_thesis" USING btree ("_parent_id");
  CREATE INDEX "regions_blocks_thesis_path_idx" ON "regions_blocks_thesis" USING btree ("_path");
  CREATE INDEX "regions_blocks_risk_block_order_idx" ON "regions_blocks_risk_block" USING btree ("_order");
  CREATE INDEX "regions_blocks_risk_block_parent_id_idx" ON "regions_blocks_risk_block" USING btree ("_parent_id");
  CREATE INDEX "regions_blocks_risk_block_path_idx" ON "regions_blocks_risk_block" USING btree ("_path");
  CREATE INDEX "regions_blocks_numbered_steps_steps_order_idx" ON "regions_blocks_numbered_steps_steps" USING btree ("_order");
  CREATE INDEX "regions_blocks_numbered_steps_steps_parent_id_idx" ON "regions_blocks_numbered_steps_steps" USING btree ("_parent_id");
  CREATE INDEX "regions_blocks_numbered_steps_order_idx" ON "regions_blocks_numbered_steps" USING btree ("_order");
  CREATE INDEX "regions_blocks_numbered_steps_parent_id_idx" ON "regions_blocks_numbered_steps" USING btree ("_parent_id");
  CREATE INDEX "regions_blocks_numbered_steps_path_idx" ON "regions_blocks_numbered_steps" USING btree ("_path");
  CREATE INDEX "regions_blocks_proof_block_order_idx" ON "regions_blocks_proof_block" USING btree ("_order");
  CREATE INDEX "regions_blocks_proof_block_parent_id_idx" ON "regions_blocks_proof_block" USING btree ("_parent_id");
  CREATE INDEX "regions_blocks_proof_block_path_idx" ON "regions_blocks_proof_block" USING btree ("_path");
  CREATE INDEX "regions_blocks_scenario_table_rows_order_idx" ON "regions_blocks_scenario_table_rows" USING btree ("_order");
  CREATE INDEX "regions_blocks_scenario_table_rows_parent_id_idx" ON "regions_blocks_scenario_table_rows" USING btree ("_parent_id");
  CREATE INDEX "regions_blocks_scenario_table_order_idx" ON "regions_blocks_scenario_table" USING btree ("_order");
  CREATE INDEX "regions_blocks_scenario_table_parent_id_idx" ON "regions_blocks_scenario_table" USING btree ("_parent_id");
  CREATE INDEX "regions_blocks_scenario_table_path_idx" ON "regions_blocks_scenario_table" USING btree ("_path");
  CREATE INDEX "regions_blocks_cards_grid_cards_order_idx" ON "regions_blocks_cards_grid_cards" USING btree ("_order");
  CREATE INDEX "regions_blocks_cards_grid_cards_parent_id_idx" ON "regions_blocks_cards_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "regions_blocks_cards_grid_order_idx" ON "regions_blocks_cards_grid" USING btree ("_order");
  CREATE INDEX "regions_blocks_cards_grid_parent_id_idx" ON "regions_blocks_cards_grid" USING btree ("_parent_id");
  CREATE INDEX "regions_blocks_cards_grid_path_idx" ON "regions_blocks_cards_grid" USING btree ("_path");
  CREATE INDEX "regions_blocks_object_cards_items_order_idx" ON "regions_blocks_object_cards_items" USING btree ("_order");
  CREATE INDEX "regions_blocks_object_cards_items_parent_id_idx" ON "regions_blocks_object_cards_items" USING btree ("_parent_id");
  CREATE INDEX "regions_blocks_object_cards_order_idx" ON "regions_blocks_object_cards" USING btree ("_order");
  CREATE INDEX "regions_blocks_object_cards_parent_id_idx" ON "regions_blocks_object_cards" USING btree ("_parent_id");
  CREATE INDEX "regions_blocks_object_cards_path_idx" ON "regions_blocks_object_cards" USING btree ("_path");
  CREATE INDEX "regions_blocks_cta_order_idx" ON "regions_blocks_cta" USING btree ("_order");
  CREATE INDEX "regions_blocks_cta_parent_id_idx" ON "regions_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "regions_blocks_cta_path_idx" ON "regions_blocks_cta" USING btree ("_path");
  CREATE INDEX "regions_blocks_rich_text_order_idx" ON "regions_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "regions_blocks_rich_text_parent_id_idx" ON "regions_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "regions_blocks_rich_text_path_idx" ON "regions_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "regions_parent_idx" ON "regions" USING btree ("parent_id");
  CREATE INDEX "regions_hero_media_idx" ON "regions" USING btree ("hero_media_id");
  CREATE INDEX "regions_updated_at_idx" ON "regions" USING btree ("updated_at");
  CREATE INDEX "regions_created_at_idx" ON "regions" USING btree ("created_at");
  CREATE INDEX "regions__status_idx" ON "regions" USING btree ("_status");
  CREATE INDEX "_regions_v_blocks_hero_order_idx" ON "_regions_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_regions_v_blocks_hero_parent_id_idx" ON "_regions_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_regions_v_blocks_hero_path_idx" ON "_regions_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_regions_v_blocks_lead_order_idx" ON "_regions_v_blocks_lead" USING btree ("_order");
  CREATE INDEX "_regions_v_blocks_lead_parent_id_idx" ON "_regions_v_blocks_lead" USING btree ("_parent_id");
  CREATE INDEX "_regions_v_blocks_lead_path_idx" ON "_regions_v_blocks_lead" USING btree ("_path");
  CREATE INDEX "_regions_v_blocks_thesis_items_order_idx" ON "_regions_v_blocks_thesis_items" USING btree ("_order");
  CREATE INDEX "_regions_v_blocks_thesis_items_parent_id_idx" ON "_regions_v_blocks_thesis_items" USING btree ("_parent_id");
  CREATE INDEX "_regions_v_blocks_thesis_order_idx" ON "_regions_v_blocks_thesis" USING btree ("_order");
  CREATE INDEX "_regions_v_blocks_thesis_parent_id_idx" ON "_regions_v_blocks_thesis" USING btree ("_parent_id");
  CREATE INDEX "_regions_v_blocks_thesis_path_idx" ON "_regions_v_blocks_thesis" USING btree ("_path");
  CREATE INDEX "_regions_v_blocks_risk_block_order_idx" ON "_regions_v_blocks_risk_block" USING btree ("_order");
  CREATE INDEX "_regions_v_blocks_risk_block_parent_id_idx" ON "_regions_v_blocks_risk_block" USING btree ("_parent_id");
  CREATE INDEX "_regions_v_blocks_risk_block_path_idx" ON "_regions_v_blocks_risk_block" USING btree ("_path");
  CREATE INDEX "_regions_v_blocks_numbered_steps_steps_order_idx" ON "_regions_v_blocks_numbered_steps_steps" USING btree ("_order");
  CREATE INDEX "_regions_v_blocks_numbered_steps_steps_parent_id_idx" ON "_regions_v_blocks_numbered_steps_steps" USING btree ("_parent_id");
  CREATE INDEX "_regions_v_blocks_numbered_steps_order_idx" ON "_regions_v_blocks_numbered_steps" USING btree ("_order");
  CREATE INDEX "_regions_v_blocks_numbered_steps_parent_id_idx" ON "_regions_v_blocks_numbered_steps" USING btree ("_parent_id");
  CREATE INDEX "_regions_v_blocks_numbered_steps_path_idx" ON "_regions_v_blocks_numbered_steps" USING btree ("_path");
  CREATE INDEX "_regions_v_blocks_proof_block_order_idx" ON "_regions_v_blocks_proof_block" USING btree ("_order");
  CREATE INDEX "_regions_v_blocks_proof_block_parent_id_idx" ON "_regions_v_blocks_proof_block" USING btree ("_parent_id");
  CREATE INDEX "_regions_v_blocks_proof_block_path_idx" ON "_regions_v_blocks_proof_block" USING btree ("_path");
  CREATE INDEX "_regions_v_blocks_scenario_table_rows_order_idx" ON "_regions_v_blocks_scenario_table_rows" USING btree ("_order");
  CREATE INDEX "_regions_v_blocks_scenario_table_rows_parent_id_idx" ON "_regions_v_blocks_scenario_table_rows" USING btree ("_parent_id");
  CREATE INDEX "_regions_v_blocks_scenario_table_order_idx" ON "_regions_v_blocks_scenario_table" USING btree ("_order");
  CREATE INDEX "_regions_v_blocks_scenario_table_parent_id_idx" ON "_regions_v_blocks_scenario_table" USING btree ("_parent_id");
  CREATE INDEX "_regions_v_blocks_scenario_table_path_idx" ON "_regions_v_blocks_scenario_table" USING btree ("_path");
  CREATE INDEX "_regions_v_blocks_cards_grid_cards_order_idx" ON "_regions_v_blocks_cards_grid_cards" USING btree ("_order");
  CREATE INDEX "_regions_v_blocks_cards_grid_cards_parent_id_idx" ON "_regions_v_blocks_cards_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "_regions_v_blocks_cards_grid_order_idx" ON "_regions_v_blocks_cards_grid" USING btree ("_order");
  CREATE INDEX "_regions_v_blocks_cards_grid_parent_id_idx" ON "_regions_v_blocks_cards_grid" USING btree ("_parent_id");
  CREATE INDEX "_regions_v_blocks_cards_grid_path_idx" ON "_regions_v_blocks_cards_grid" USING btree ("_path");
  CREATE INDEX "_regions_v_blocks_object_cards_items_order_idx" ON "_regions_v_blocks_object_cards_items" USING btree ("_order");
  CREATE INDEX "_regions_v_blocks_object_cards_items_parent_id_idx" ON "_regions_v_blocks_object_cards_items" USING btree ("_parent_id");
  CREATE INDEX "_regions_v_blocks_object_cards_order_idx" ON "_regions_v_blocks_object_cards" USING btree ("_order");
  CREATE INDEX "_regions_v_blocks_object_cards_parent_id_idx" ON "_regions_v_blocks_object_cards" USING btree ("_parent_id");
  CREATE INDEX "_regions_v_blocks_object_cards_path_idx" ON "_regions_v_blocks_object_cards" USING btree ("_path");
  CREATE INDEX "_regions_v_blocks_cta_order_idx" ON "_regions_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_regions_v_blocks_cta_parent_id_idx" ON "_regions_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_regions_v_blocks_cta_path_idx" ON "_regions_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_regions_v_blocks_rich_text_order_idx" ON "_regions_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_regions_v_blocks_rich_text_parent_id_idx" ON "_regions_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_regions_v_blocks_rich_text_path_idx" ON "_regions_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_regions_v_parent_idx" ON "_regions_v" USING btree ("parent_id");
  CREATE INDEX "_regions_v_version_version_parent_idx" ON "_regions_v" USING btree ("version_parent_id");
  CREATE INDEX "_regions_v_version_version_hero_media_idx" ON "_regions_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_regions_v_version_version_updated_at_idx" ON "_regions_v" USING btree ("version_updated_at");
  CREATE INDEX "_regions_v_version_version_created_at_idx" ON "_regions_v" USING btree ("version_created_at");
  CREATE INDEX "_regions_v_version_version__status_idx" ON "_regions_v" USING btree ("version__status");
  CREATE INDEX "_regions_v_created_at_idx" ON "_regions_v" USING btree ("created_at");
  CREATE INDEX "_regions_v_updated_at_idx" ON "_regions_v" USING btree ("updated_at");
  CREATE INDEX "_regions_v_latest_idx" ON "_regions_v" USING btree ("latest");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_regions_fk" FOREIGN KEY ("regions_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_regions_id_idx" ON "payload_locked_documents_rels" USING btree ("regions_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "regions_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "regions_blocks_lead" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "regions_blocks_thesis_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "regions_blocks_thesis" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "regions_blocks_risk_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "regions_blocks_numbered_steps_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "regions_blocks_numbered_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "regions_blocks_proof_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "regions_blocks_scenario_table_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "regions_blocks_scenario_table" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "regions_blocks_cards_grid_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "regions_blocks_cards_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "regions_blocks_object_cards_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "regions_blocks_object_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "regions_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "regions_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "regions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_regions_v_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_regions_v_blocks_lead" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_regions_v_blocks_thesis_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_regions_v_blocks_thesis" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_regions_v_blocks_risk_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_regions_v_blocks_numbered_steps_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_regions_v_blocks_numbered_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_regions_v_blocks_proof_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_regions_v_blocks_scenario_table_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_regions_v_blocks_scenario_table" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_regions_v_blocks_cards_grid_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_regions_v_blocks_cards_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_regions_v_blocks_object_cards_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_regions_v_blocks_object_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_regions_v_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_regions_v_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_regions_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "regions_blocks_hero" CASCADE;
  DROP TABLE "regions_blocks_lead" CASCADE;
  DROP TABLE "regions_blocks_thesis_items" CASCADE;
  DROP TABLE "regions_blocks_thesis" CASCADE;
  DROP TABLE "regions_blocks_risk_block" CASCADE;
  DROP TABLE "regions_blocks_numbered_steps_steps" CASCADE;
  DROP TABLE "regions_blocks_numbered_steps" CASCADE;
  DROP TABLE "regions_blocks_proof_block" CASCADE;
  DROP TABLE "regions_blocks_scenario_table_rows" CASCADE;
  DROP TABLE "regions_blocks_scenario_table" CASCADE;
  DROP TABLE "regions_blocks_cards_grid_cards" CASCADE;
  DROP TABLE "regions_blocks_cards_grid" CASCADE;
  DROP TABLE "regions_blocks_object_cards_items" CASCADE;
  DROP TABLE "regions_blocks_object_cards" CASCADE;
  DROP TABLE "regions_blocks_cta" CASCADE;
  DROP TABLE "regions_blocks_rich_text" CASCADE;
  DROP TABLE "regions" CASCADE;
  DROP TABLE "_regions_v_blocks_hero" CASCADE;
  DROP TABLE "_regions_v_blocks_lead" CASCADE;
  DROP TABLE "_regions_v_blocks_thesis_items" CASCADE;
  DROP TABLE "_regions_v_blocks_thesis" CASCADE;
  DROP TABLE "_regions_v_blocks_risk_block" CASCADE;
  DROP TABLE "_regions_v_blocks_numbered_steps_steps" CASCADE;
  DROP TABLE "_regions_v_blocks_numbered_steps" CASCADE;
  DROP TABLE "_regions_v_blocks_proof_block" CASCADE;
  DROP TABLE "_regions_v_blocks_scenario_table_rows" CASCADE;
  DROP TABLE "_regions_v_blocks_scenario_table" CASCADE;
  DROP TABLE "_regions_v_blocks_cards_grid_cards" CASCADE;
  DROP TABLE "_regions_v_blocks_cards_grid" CASCADE;
  DROP TABLE "_regions_v_blocks_object_cards_items" CASCADE;
  DROP TABLE "_regions_v_blocks_object_cards" CASCADE;
  DROP TABLE "_regions_v_blocks_cta" CASCADE;
  DROP TABLE "_regions_v_blocks_rich_text" CASCADE;
  DROP TABLE "_regions_v" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_regions_fk";

  DROP INDEX "payload_locked_documents_rels_regions_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "regions_id";
  DROP TYPE "public"."enum_regions_kind";
  DROP TYPE "public"."enum_regions_seo_robots";
  DROP TYPE "public"."enum_regions_seo_priority";
  DROP TYPE "public"."enum_regions_status";
  DROP TYPE "public"."enum__regions_v_version_kind";
  DROP TYPE "public"."enum__regions_v_version_seo_robots";
  DROP TYPE "public"."enum__regions_v_version_seo_priority";
  DROP TYPE "public"."enum__regions_v_version_status";`)
}

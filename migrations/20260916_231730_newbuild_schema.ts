import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_developers_seo_robots" AS ENUM('index-follow', 'noindex-follow');
  CREATE TYPE "public"."enum_developers_seo_priority" AS ENUM('P1', 'P2', 'P3');
  CREATE TYPE "public"."enum_developers_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__developers_v_version_seo_robots" AS ENUM('index-follow', 'noindex-follow');
  CREATE TYPE "public"."enum__developers_v_version_seo_priority" AS ENUM('P1', 'P2', 'P3');
  CREATE TYPE "public"."enum__developers_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_complexes_seo_robots" AS ENUM('index-follow', 'noindex-follow');
  CREATE TYPE "public"."enum_complexes_seo_priority" AS ENUM('P1', 'P2', 'P3');
  CREATE TYPE "public"."enum_complexes_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__complexes_v_version_seo_robots" AS ENUM('index-follow', 'noindex-follow');
  CREATE TYPE "public"."enum__complexes_v_version_seo_priority" AS ENUM('P1', 'P2', 'P3');
  CREATE TYPE "public"."enum__complexes_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_buildings_status" AS ENUM('hidden', 'published', 'archived');
  CREATE TYPE "public"."enum_layouts_status" AS ENUM('hidden', 'published', 'archived');
  CREATE TABLE "developers" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar,
	"title" varchar,
	"description" varchar,
	"seo_title" varchar,
	"seo_description" varchar,
	"seo_canonical_override" varchar,
	"seo_og_image_path" varchar,
	"seo_robots" "enum_developers_seo_robots" DEFAULT 'index-follow',
	"seo_priority" "enum_developers_seo_priority" DEFAULT 'P2',
	"status" "enum_developers_status" DEFAULT 'hidden',
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"_status" "enum_developers_status" DEFAULT 'draft'
  );

  CREATE TABLE "developers_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"media_id" integer
  );

  CREATE TABLE "_developers_v" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer,
	"version_slug" varchar,
	"version_title" varchar,
	"version_description" varchar,
	"version_seo_title" varchar,
	"version_seo_description" varchar,
	"version_seo_canonical_override" varchar,
	"version_seo_og_image_path" varchar,
	"version_seo_robots" "enum__developers_v_version_seo_robots" DEFAULT 'index-follow',
	"version_seo_priority" "enum__developers_v_version_seo_priority" DEFAULT 'P2',
	"version_status" "enum__developers_v_version_status" DEFAULT 'hidden',
	"version_updated_at" timestamp(3) with time zone,
	"version_created_at" timestamp(3) with time zone,
	"version__status" "enum__developers_v_version_status" DEFAULT 'draft',
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"latest" boolean
  );

  CREATE TABLE "_developers_v_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"media_id" integer
  );

  CREATE TABLE "complexes_blocks_hero" (
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

  CREATE TABLE "complexes_blocks_lead" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"eyebrow" varchar,
	"title" varchar,
	"text" varchar,
	"block_name" varchar
  );

  CREATE TABLE "complexes_blocks_thesis_items" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar
  );

  CREATE TABLE "complexes_blocks_thesis" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"block_name" varchar
  );

  CREATE TABLE "complexes_blocks_risk_block" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar,
	"block_name" varchar
  );

  CREATE TABLE "complexes_blocks_numbered_steps_steps" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar
  );

  CREATE TABLE "complexes_blocks_numbered_steps" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"eyebrow" varchar,
	"title" varchar,
	"lead" varchar,
	"block_name" varchar
  );

  CREATE TABLE "complexes_blocks_proof_block" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"proof" varchar,
	"block_name" varchar
  );

  CREATE TABLE "complexes_blocks_scenario_table_rows" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"scenario" varchar,
	"assumption" varchar,
	"investor_question" varchar
  );

  CREATE TABLE "complexes_blocks_scenario_table" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"block_name" varchar
  );

  CREATE TABLE "complexes_blocks_cards_grid_cards" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar,
	"link_label" varchar,
	"link_href" varchar
  );

  CREATE TABLE "complexes_blocks_cards_grid" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"lead" varchar,
	"block_name" varchar
  );

  CREATE TABLE "complexes_blocks_object_cards_items" (
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

  CREATE TABLE "complexes_blocks_object_cards" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"lead" varchar,
	"block_name" varchar
  );

  CREATE TABLE "complexes_blocks_cta" (
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

  CREATE TABLE "complexes_blocks_rich_text" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"content" jsonb,
	"block_name" varchar
  );

  CREATE TABLE "complexes" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar,
	"title" varchar,
	"developer_id" integer,
	"region_id" integer,
	"feed_source_id" integer,
	"external_complex_id" varchar,
	"address_locality" varchar,
	"address_district" varchar,
	"address_street" varchar,
	"address_house" varchar,
	"address_public_address" varchar,
	"address_lat" numeric,
	"address_lng" numeric,
	"seo_title" varchar,
	"seo_description" varchar,
	"seo_canonical_override" varchar,
	"seo_og_image_path" varchar,
	"seo_robots" "enum_complexes_seo_robots" DEFAULT 'index-follow',
	"seo_priority" "enum_complexes_seo_priority" DEFAULT 'P2',
	"status" "enum_complexes_status" DEFAULT 'hidden',
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"_status" "enum_complexes_status" DEFAULT 'draft'
  );

  CREATE TABLE "complexes_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"media_id" integer
  );

  CREATE TABLE "_complexes_v_blocks_hero" (
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

  CREATE TABLE "_complexes_v_blocks_lead" (
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

  CREATE TABLE "_complexes_v_blocks_thesis_items" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_complexes_v_blocks_thesis" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_complexes_v_blocks_risk_block" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_complexes_v_blocks_numbered_steps_steps" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_complexes_v_blocks_numbered_steps" (
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

  CREATE TABLE "_complexes_v_blocks_proof_block" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"proof" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_complexes_v_blocks_scenario_table_rows" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"scenario" varchar,
	"assumption" varchar,
	"investor_question" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_complexes_v_blocks_scenario_table" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_complexes_v_blocks_cards_grid_cards" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar,
	"link_label" varchar,
	"link_href" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_complexes_v_blocks_cards_grid" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"lead" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_complexes_v_blocks_object_cards_items" (
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

  CREATE TABLE "_complexes_v_blocks_object_cards" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"lead" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_complexes_v_blocks_cta" (
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

  CREATE TABLE "_complexes_v_blocks_rich_text" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"content" jsonb,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_complexes_v" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer,
	"version_slug" varchar,
	"version_title" varchar,
	"version_developer_id" integer,
	"version_region_id" integer,
	"version_feed_source_id" integer,
	"version_external_complex_id" varchar,
	"version_address_locality" varchar,
	"version_address_district" varchar,
	"version_address_street" varchar,
	"version_address_house" varchar,
	"version_address_public_address" varchar,
	"version_address_lat" numeric,
	"version_address_lng" numeric,
	"version_seo_title" varchar,
	"version_seo_description" varchar,
	"version_seo_canonical_override" varchar,
	"version_seo_og_image_path" varchar,
	"version_seo_robots" "enum__complexes_v_version_seo_robots" DEFAULT 'index-follow',
	"version_seo_priority" "enum__complexes_v_version_seo_priority" DEFAULT 'P2',
	"version_status" "enum__complexes_v_version_status" DEFAULT 'hidden',
	"version_updated_at" timestamp(3) with time zone,
	"version_created_at" timestamp(3) with time zone,
	"version__status" "enum__complexes_v_version_status" DEFAULT 'draft',
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"latest" boolean
  );

  CREATE TABLE "_complexes_v_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"media_id" integer
  );

  CREATE TABLE "buildings" (
	"id" serial PRIMARY KEY NOT NULL,
	"complex_id" integer NOT NULL,
	"external_building_id" varchar,
	"name" varchar NOT NULL,
	"completion_deadline" varchar,
	"status" "enum_buildings_status" DEFAULT 'hidden' NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "layouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"complex_id" integer NOT NULL,
	"building_id" integer,
	"external_layout_id" varchar NOT NULL,
	"rooms" numeric,
	"total_area" numeric,
	"plan_id" integer,
	"status" "enum_layouts_status" DEFAULT 'hidden' NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "developers_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "complexes_id" integer;
  ALTER TABLE "developers_rels" ADD CONSTRAINT "developers_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."developers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "developers_rels" ADD CONSTRAINT "developers_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_developers_v" ADD CONSTRAINT "_developers_v_parent_id_developers_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."developers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_developers_v_rels" ADD CONSTRAINT "_developers_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_developers_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_developers_v_rels" ADD CONSTRAINT "_developers_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "complexes_blocks_hero" ADD CONSTRAINT "complexes_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."complexes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "complexes_blocks_lead" ADD CONSTRAINT "complexes_blocks_lead_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."complexes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "complexes_blocks_thesis_items" ADD CONSTRAINT "complexes_blocks_thesis_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."complexes_blocks_thesis"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "complexes_blocks_thesis" ADD CONSTRAINT "complexes_blocks_thesis_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."complexes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "complexes_blocks_risk_block" ADD CONSTRAINT "complexes_blocks_risk_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."complexes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "complexes_blocks_numbered_steps_steps" ADD CONSTRAINT "complexes_blocks_numbered_steps_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."complexes_blocks_numbered_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "complexes_blocks_numbered_steps" ADD CONSTRAINT "complexes_blocks_numbered_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."complexes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "complexes_blocks_proof_block" ADD CONSTRAINT "complexes_blocks_proof_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."complexes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "complexes_blocks_scenario_table_rows" ADD CONSTRAINT "complexes_blocks_scenario_table_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."complexes_blocks_scenario_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "complexes_blocks_scenario_table" ADD CONSTRAINT "complexes_blocks_scenario_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."complexes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "complexes_blocks_cards_grid_cards" ADD CONSTRAINT "complexes_blocks_cards_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."complexes_blocks_cards_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "complexes_blocks_cards_grid" ADD CONSTRAINT "complexes_blocks_cards_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."complexes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "complexes_blocks_object_cards_items" ADD CONSTRAINT "complexes_blocks_object_cards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."complexes_blocks_object_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "complexes_blocks_object_cards" ADD CONSTRAINT "complexes_blocks_object_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."complexes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "complexes_blocks_cta" ADD CONSTRAINT "complexes_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."complexes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "complexes_blocks_rich_text" ADD CONSTRAINT "complexes_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."complexes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "complexes" ADD CONSTRAINT "complexes_developer_id_developers_id_fk" FOREIGN KEY ("developer_id") REFERENCES "public"."developers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "complexes" ADD CONSTRAINT "complexes_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "complexes" ADD CONSTRAINT "complexes_feed_source_id_feed_sources_id_fk" FOREIGN KEY ("feed_source_id") REFERENCES "public"."feed_sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "complexes_rels" ADD CONSTRAINT "complexes_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."complexes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "complexes_rels" ADD CONSTRAINT "complexes_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_complexes_v_blocks_hero" ADD CONSTRAINT "_complexes_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_complexes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_complexes_v_blocks_lead" ADD CONSTRAINT "_complexes_v_blocks_lead_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_complexes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_complexes_v_blocks_thesis_items" ADD CONSTRAINT "_complexes_v_blocks_thesis_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_complexes_v_blocks_thesis"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_complexes_v_blocks_thesis" ADD CONSTRAINT "_complexes_v_blocks_thesis_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_complexes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_complexes_v_blocks_risk_block" ADD CONSTRAINT "_complexes_v_blocks_risk_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_complexes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_complexes_v_blocks_numbered_steps_steps" ADD CONSTRAINT "_complexes_v_blocks_numbered_steps_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_complexes_v_blocks_numbered_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_complexes_v_blocks_numbered_steps" ADD CONSTRAINT "_complexes_v_blocks_numbered_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_complexes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_complexes_v_blocks_proof_block" ADD CONSTRAINT "_complexes_v_blocks_proof_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_complexes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_complexes_v_blocks_scenario_table_rows" ADD CONSTRAINT "_complexes_v_blocks_scenario_table_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_complexes_v_blocks_scenario_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_complexes_v_blocks_scenario_table" ADD CONSTRAINT "_complexes_v_blocks_scenario_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_complexes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_complexes_v_blocks_cards_grid_cards" ADD CONSTRAINT "_complexes_v_blocks_cards_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_complexes_v_blocks_cards_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_complexes_v_blocks_cards_grid" ADD CONSTRAINT "_complexes_v_blocks_cards_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_complexes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_complexes_v_blocks_object_cards_items" ADD CONSTRAINT "_complexes_v_blocks_object_cards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_complexes_v_blocks_object_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_complexes_v_blocks_object_cards" ADD CONSTRAINT "_complexes_v_blocks_object_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_complexes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_complexes_v_blocks_cta" ADD CONSTRAINT "_complexes_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_complexes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_complexes_v_blocks_rich_text" ADD CONSTRAINT "_complexes_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_complexes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_complexes_v" ADD CONSTRAINT "_complexes_v_parent_id_complexes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."complexes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_complexes_v" ADD CONSTRAINT "_complexes_v_version_developer_id_developers_id_fk" FOREIGN KEY ("version_developer_id") REFERENCES "public"."developers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_complexes_v" ADD CONSTRAINT "_complexes_v_version_region_id_regions_id_fk" FOREIGN KEY ("version_region_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_complexes_v" ADD CONSTRAINT "_complexes_v_version_feed_source_id_feed_sources_id_fk" FOREIGN KEY ("version_feed_source_id") REFERENCES "public"."feed_sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_complexes_v_rels" ADD CONSTRAINT "_complexes_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_complexes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_complexes_v_rels" ADD CONSTRAINT "_complexes_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "buildings" ADD CONSTRAINT "buildings_complex_id_complexes_id_fk" FOREIGN KEY ("complex_id") REFERENCES "public"."complexes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "layouts" ADD CONSTRAINT "layouts_complex_id_complexes_id_fk" FOREIGN KEY ("complex_id") REFERENCES "public"."complexes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "layouts" ADD CONSTRAINT "layouts_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "layouts" ADD CONSTRAINT "layouts_plan_id_media_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "developers_slug_idx" ON "developers" USING btree ("slug");
  CREATE INDEX "developers_status_idx" ON "developers" USING btree ("status");
  CREATE INDEX "developers_updated_at_idx" ON "developers" USING btree ("updated_at");
  CREATE INDEX "developers_created_at_idx" ON "developers" USING btree ("created_at");
  CREATE INDEX "developers__status_idx" ON "developers" USING btree ("_status");
  CREATE INDEX "developers_rels_order_idx" ON "developers_rels" USING btree ("order");
  CREATE INDEX "developers_rels_parent_idx" ON "developers_rels" USING btree ("parent_id");
  CREATE INDEX "developers_rels_path_idx" ON "developers_rels" USING btree ("path");
  CREATE INDEX "developers_rels_media_id_idx" ON "developers_rels" USING btree ("media_id");
  CREATE INDEX "_developers_v_parent_idx" ON "_developers_v" USING btree ("parent_id");
  CREATE INDEX "_developers_v_version_version_slug_idx" ON "_developers_v" USING btree ("version_slug");
  CREATE INDEX "_developers_v_version_version_status_idx" ON "_developers_v" USING btree ("version_status");
  CREATE INDEX "_developers_v_version_version_updated_at_idx" ON "_developers_v" USING btree ("version_updated_at");
  CREATE INDEX "_developers_v_version_version_created_at_idx" ON "_developers_v" USING btree ("version_created_at");
  CREATE INDEX "_developers_v_version_version__status_idx" ON "_developers_v" USING btree ("version__status");
  CREATE INDEX "_developers_v_created_at_idx" ON "_developers_v" USING btree ("created_at");
  CREATE INDEX "_developers_v_updated_at_idx" ON "_developers_v" USING btree ("updated_at");
  CREATE INDEX "_developers_v_latest_idx" ON "_developers_v" USING btree ("latest");
  CREATE INDEX "_developers_v_rels_order_idx" ON "_developers_v_rels" USING btree ("order");
  CREATE INDEX "_developers_v_rels_parent_idx" ON "_developers_v_rels" USING btree ("parent_id");
  CREATE INDEX "_developers_v_rels_path_idx" ON "_developers_v_rels" USING btree ("path");
  CREATE INDEX "_developers_v_rels_media_id_idx" ON "_developers_v_rels" USING btree ("media_id");
  CREATE INDEX "complexes_blocks_hero_order_idx" ON "complexes_blocks_hero" USING btree ("_order");
  CREATE INDEX "complexes_blocks_hero_parent_id_idx" ON "complexes_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "complexes_blocks_hero_path_idx" ON "complexes_blocks_hero" USING btree ("_path");
  CREATE INDEX "complexes_blocks_lead_order_idx" ON "complexes_blocks_lead" USING btree ("_order");
  CREATE INDEX "complexes_blocks_lead_parent_id_idx" ON "complexes_blocks_lead" USING btree ("_parent_id");
  CREATE INDEX "complexes_blocks_lead_path_idx" ON "complexes_blocks_lead" USING btree ("_path");
  CREATE INDEX "complexes_blocks_thesis_items_order_idx" ON "complexes_blocks_thesis_items" USING btree ("_order");
  CREATE INDEX "complexes_blocks_thesis_items_parent_id_idx" ON "complexes_blocks_thesis_items" USING btree ("_parent_id");
  CREATE INDEX "complexes_blocks_thesis_order_idx" ON "complexes_blocks_thesis" USING btree ("_order");
  CREATE INDEX "complexes_blocks_thesis_parent_id_idx" ON "complexes_blocks_thesis" USING btree ("_parent_id");
  CREATE INDEX "complexes_blocks_thesis_path_idx" ON "complexes_blocks_thesis" USING btree ("_path");
  CREATE INDEX "complexes_blocks_risk_block_order_idx" ON "complexes_blocks_risk_block" USING btree ("_order");
  CREATE INDEX "complexes_blocks_risk_block_parent_id_idx" ON "complexes_blocks_risk_block" USING btree ("_parent_id");
  CREATE INDEX "complexes_blocks_risk_block_path_idx" ON "complexes_blocks_risk_block" USING btree ("_path");
  CREATE INDEX "complexes_blocks_numbered_steps_steps_order_idx" ON "complexes_blocks_numbered_steps_steps" USING btree ("_order");
  CREATE INDEX "complexes_blocks_numbered_steps_steps_parent_id_idx" ON "complexes_blocks_numbered_steps_steps" USING btree ("_parent_id");
  CREATE INDEX "complexes_blocks_numbered_steps_order_idx" ON "complexes_blocks_numbered_steps" USING btree ("_order");
  CREATE INDEX "complexes_blocks_numbered_steps_parent_id_idx" ON "complexes_blocks_numbered_steps" USING btree ("_parent_id");
  CREATE INDEX "complexes_blocks_numbered_steps_path_idx" ON "complexes_blocks_numbered_steps" USING btree ("_path");
  CREATE INDEX "complexes_blocks_proof_block_order_idx" ON "complexes_blocks_proof_block" USING btree ("_order");
  CREATE INDEX "complexes_blocks_proof_block_parent_id_idx" ON "complexes_blocks_proof_block" USING btree ("_parent_id");
  CREATE INDEX "complexes_blocks_proof_block_path_idx" ON "complexes_blocks_proof_block" USING btree ("_path");
  CREATE INDEX "complexes_blocks_scenario_table_rows_order_idx" ON "complexes_blocks_scenario_table_rows" USING btree ("_order");
  CREATE INDEX "complexes_blocks_scenario_table_rows_parent_id_idx" ON "complexes_blocks_scenario_table_rows" USING btree ("_parent_id");
  CREATE INDEX "complexes_blocks_scenario_table_order_idx" ON "complexes_blocks_scenario_table" USING btree ("_order");
  CREATE INDEX "complexes_blocks_scenario_table_parent_id_idx" ON "complexes_blocks_scenario_table" USING btree ("_parent_id");
  CREATE INDEX "complexes_blocks_scenario_table_path_idx" ON "complexes_blocks_scenario_table" USING btree ("_path");
  CREATE INDEX "complexes_blocks_cards_grid_cards_order_idx" ON "complexes_blocks_cards_grid_cards" USING btree ("_order");
  CREATE INDEX "complexes_blocks_cards_grid_cards_parent_id_idx" ON "complexes_blocks_cards_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "complexes_blocks_cards_grid_order_idx" ON "complexes_blocks_cards_grid" USING btree ("_order");
  CREATE INDEX "complexes_blocks_cards_grid_parent_id_idx" ON "complexes_blocks_cards_grid" USING btree ("_parent_id");
  CREATE INDEX "complexes_blocks_cards_grid_path_idx" ON "complexes_blocks_cards_grid" USING btree ("_path");
  CREATE INDEX "complexes_blocks_object_cards_items_order_idx" ON "complexes_blocks_object_cards_items" USING btree ("_order");
  CREATE INDEX "complexes_blocks_object_cards_items_parent_id_idx" ON "complexes_blocks_object_cards_items" USING btree ("_parent_id");
  CREATE INDEX "complexes_blocks_object_cards_order_idx" ON "complexes_blocks_object_cards" USING btree ("_order");
  CREATE INDEX "complexes_blocks_object_cards_parent_id_idx" ON "complexes_blocks_object_cards" USING btree ("_parent_id");
  CREATE INDEX "complexes_blocks_object_cards_path_idx" ON "complexes_blocks_object_cards" USING btree ("_path");
  CREATE INDEX "complexes_blocks_cta_order_idx" ON "complexes_blocks_cta" USING btree ("_order");
  CREATE INDEX "complexes_blocks_cta_parent_id_idx" ON "complexes_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "complexes_blocks_cta_path_idx" ON "complexes_blocks_cta" USING btree ("_path");
  CREATE INDEX "complexes_blocks_rich_text_order_idx" ON "complexes_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "complexes_blocks_rich_text_parent_id_idx" ON "complexes_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "complexes_blocks_rich_text_path_idx" ON "complexes_blocks_rich_text" USING btree ("_path");
  CREATE UNIQUE INDEX "complexes_slug_idx" ON "complexes" USING btree ("slug");
  CREATE INDEX "complexes_developer_idx" ON "complexes" USING btree ("developer_id");
  CREATE INDEX "complexes_region_idx" ON "complexes" USING btree ("region_id");
  CREATE INDEX "complexes_feed_source_idx" ON "complexes" USING btree ("feed_source_id");
  CREATE INDEX "complexes_status_idx" ON "complexes" USING btree ("status");
  CREATE INDEX "complexes_updated_at_idx" ON "complexes" USING btree ("updated_at");
  CREATE INDEX "complexes_created_at_idx" ON "complexes" USING btree ("created_at");
  CREATE INDEX "complexes__status_idx" ON "complexes" USING btree ("_status");
  CREATE UNIQUE INDEX "feedSource_externalComplexId_idx" ON "complexes" USING btree ("feed_source_id","external_complex_id");
  CREATE INDEX "status_region_idx" ON "complexes" USING btree ("status","region_id");
  CREATE INDEX "developer_region_idx" ON "complexes" USING btree ("developer_id","region_id");
  CREATE INDEX "complexes_rels_order_idx" ON "complexes_rels" USING btree ("order");
  CREATE INDEX "complexes_rels_parent_idx" ON "complexes_rels" USING btree ("parent_id");
  CREATE INDEX "complexes_rels_path_idx" ON "complexes_rels" USING btree ("path");
  CREATE INDEX "complexes_rels_media_id_idx" ON "complexes_rels" USING btree ("media_id");
  CREATE INDEX "_complexes_v_blocks_hero_order_idx" ON "_complexes_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_complexes_v_blocks_hero_parent_id_idx" ON "_complexes_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_complexes_v_blocks_hero_path_idx" ON "_complexes_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_complexes_v_blocks_lead_order_idx" ON "_complexes_v_blocks_lead" USING btree ("_order");
  CREATE INDEX "_complexes_v_blocks_lead_parent_id_idx" ON "_complexes_v_blocks_lead" USING btree ("_parent_id");
  CREATE INDEX "_complexes_v_blocks_lead_path_idx" ON "_complexes_v_blocks_lead" USING btree ("_path");
  CREATE INDEX "_complexes_v_blocks_thesis_items_order_idx" ON "_complexes_v_blocks_thesis_items" USING btree ("_order");
  CREATE INDEX "_complexes_v_blocks_thesis_items_parent_id_idx" ON "_complexes_v_blocks_thesis_items" USING btree ("_parent_id");
  CREATE INDEX "_complexes_v_blocks_thesis_order_idx" ON "_complexes_v_blocks_thesis" USING btree ("_order");
  CREATE INDEX "_complexes_v_blocks_thesis_parent_id_idx" ON "_complexes_v_blocks_thesis" USING btree ("_parent_id");
  CREATE INDEX "_complexes_v_blocks_thesis_path_idx" ON "_complexes_v_blocks_thesis" USING btree ("_path");
  CREATE INDEX "_complexes_v_blocks_risk_block_order_idx" ON "_complexes_v_blocks_risk_block" USING btree ("_order");
  CREATE INDEX "_complexes_v_blocks_risk_block_parent_id_idx" ON "_complexes_v_blocks_risk_block" USING btree ("_parent_id");
  CREATE INDEX "_complexes_v_blocks_risk_block_path_idx" ON "_complexes_v_blocks_risk_block" USING btree ("_path");
  CREATE INDEX "_complexes_v_blocks_numbered_steps_steps_order_idx" ON "_complexes_v_blocks_numbered_steps_steps" USING btree ("_order");
  CREATE INDEX "_complexes_v_blocks_numbered_steps_steps_parent_id_idx" ON "_complexes_v_blocks_numbered_steps_steps" USING btree ("_parent_id");
  CREATE INDEX "_complexes_v_blocks_numbered_steps_order_idx" ON "_complexes_v_blocks_numbered_steps" USING btree ("_order");
  CREATE INDEX "_complexes_v_blocks_numbered_steps_parent_id_idx" ON "_complexes_v_blocks_numbered_steps" USING btree ("_parent_id");
  CREATE INDEX "_complexes_v_blocks_numbered_steps_path_idx" ON "_complexes_v_blocks_numbered_steps" USING btree ("_path");
  CREATE INDEX "_complexes_v_blocks_proof_block_order_idx" ON "_complexes_v_blocks_proof_block" USING btree ("_order");
  CREATE INDEX "_complexes_v_blocks_proof_block_parent_id_idx" ON "_complexes_v_blocks_proof_block" USING btree ("_parent_id");
  CREATE INDEX "_complexes_v_blocks_proof_block_path_idx" ON "_complexes_v_blocks_proof_block" USING btree ("_path");
  CREATE INDEX "_complexes_v_blocks_scenario_table_rows_order_idx" ON "_complexes_v_blocks_scenario_table_rows" USING btree ("_order");
  CREATE INDEX "_complexes_v_blocks_scenario_table_rows_parent_id_idx" ON "_complexes_v_blocks_scenario_table_rows" USING btree ("_parent_id");
  CREATE INDEX "_complexes_v_blocks_scenario_table_order_idx" ON "_complexes_v_blocks_scenario_table" USING btree ("_order");
  CREATE INDEX "_complexes_v_blocks_scenario_table_parent_id_idx" ON "_complexes_v_blocks_scenario_table" USING btree ("_parent_id");
  CREATE INDEX "_complexes_v_blocks_scenario_table_path_idx" ON "_complexes_v_blocks_scenario_table" USING btree ("_path");
  CREATE INDEX "_complexes_v_blocks_cards_grid_cards_order_idx" ON "_complexes_v_blocks_cards_grid_cards" USING btree ("_order");
  CREATE INDEX "_complexes_v_blocks_cards_grid_cards_parent_id_idx" ON "_complexes_v_blocks_cards_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "_complexes_v_blocks_cards_grid_order_idx" ON "_complexes_v_blocks_cards_grid" USING btree ("_order");
  CREATE INDEX "_complexes_v_blocks_cards_grid_parent_id_idx" ON "_complexes_v_blocks_cards_grid" USING btree ("_parent_id");
  CREATE INDEX "_complexes_v_blocks_cards_grid_path_idx" ON "_complexes_v_blocks_cards_grid" USING btree ("_path");
  CREATE INDEX "_complexes_v_blocks_object_cards_items_order_idx" ON "_complexes_v_blocks_object_cards_items" USING btree ("_order");
  CREATE INDEX "_complexes_v_blocks_object_cards_items_parent_id_idx" ON "_complexes_v_blocks_object_cards_items" USING btree ("_parent_id");
  CREATE INDEX "_complexes_v_blocks_object_cards_order_idx" ON "_complexes_v_blocks_object_cards" USING btree ("_order");
  CREATE INDEX "_complexes_v_blocks_object_cards_parent_id_idx" ON "_complexes_v_blocks_object_cards" USING btree ("_parent_id");
  CREATE INDEX "_complexes_v_blocks_object_cards_path_idx" ON "_complexes_v_blocks_object_cards" USING btree ("_path");
  CREATE INDEX "_complexes_v_blocks_cta_order_idx" ON "_complexes_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_complexes_v_blocks_cta_parent_id_idx" ON "_complexes_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_complexes_v_blocks_cta_path_idx" ON "_complexes_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_complexes_v_blocks_rich_text_order_idx" ON "_complexes_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_complexes_v_blocks_rich_text_parent_id_idx" ON "_complexes_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_complexes_v_blocks_rich_text_path_idx" ON "_complexes_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_complexes_v_parent_idx" ON "_complexes_v" USING btree ("parent_id");
  CREATE INDEX "_complexes_v_version_version_slug_idx" ON "_complexes_v" USING btree ("version_slug");
  CREATE INDEX "_complexes_v_version_version_developer_idx" ON "_complexes_v" USING btree ("version_developer_id");
  CREATE INDEX "_complexes_v_version_version_region_idx" ON "_complexes_v" USING btree ("version_region_id");
  CREATE INDEX "_complexes_v_version_version_feed_source_idx" ON "_complexes_v" USING btree ("version_feed_source_id");
  CREATE INDEX "_complexes_v_version_version_status_idx" ON "_complexes_v" USING btree ("version_status");
  CREATE INDEX "_complexes_v_version_version_updated_at_idx" ON "_complexes_v" USING btree ("version_updated_at");
  CREATE INDEX "_complexes_v_version_version_created_at_idx" ON "_complexes_v" USING btree ("version_created_at");
  CREATE INDEX "_complexes_v_version_version__status_idx" ON "_complexes_v" USING btree ("version__status");
  CREATE INDEX "_complexes_v_created_at_idx" ON "_complexes_v" USING btree ("created_at");
  CREATE INDEX "_complexes_v_updated_at_idx" ON "_complexes_v" USING btree ("updated_at");
  CREATE INDEX "_complexes_v_latest_idx" ON "_complexes_v" USING btree ("latest");
  CREATE INDEX "version_feedSource_version_externalComplexId_idx" ON "_complexes_v" USING btree ("version_feed_source_id","version_external_complex_id");
  CREATE INDEX "version_status_version_region_idx" ON "_complexes_v" USING btree ("version_status","version_region_id");
  CREATE INDEX "version_developer_version_region_idx" ON "_complexes_v" USING btree ("version_developer_id","version_region_id");
  CREATE INDEX "_complexes_v_rels_order_idx" ON "_complexes_v_rels" USING btree ("order");
  CREATE INDEX "_complexes_v_rels_parent_idx" ON "_complexes_v_rels" USING btree ("parent_id");
  CREATE INDEX "_complexes_v_rels_path_idx" ON "_complexes_v_rels" USING btree ("path");
  CREATE INDEX "_complexes_v_rels_media_id_idx" ON "_complexes_v_rels" USING btree ("media_id");
  CREATE INDEX "buildings_complex_idx" ON "buildings" USING btree ("complex_id");
  CREATE INDEX "buildings_status_idx" ON "buildings" USING btree ("status");
  CREATE INDEX "buildings_updated_at_idx" ON "buildings" USING btree ("updated_at");
  CREATE INDEX "buildings_created_at_idx" ON "buildings" USING btree ("created_at");
  CREATE UNIQUE INDEX "complex_externalBuildingId_idx" ON "buildings" USING btree ("complex_id","external_building_id");
  CREATE INDEX "status_complex_idx" ON "buildings" USING btree ("status","complex_id");
  CREATE INDEX "layouts_complex_idx" ON "layouts" USING btree ("complex_id");
  CREATE INDEX "layouts_building_idx" ON "layouts" USING btree ("building_id");
  CREATE INDEX "layouts_plan_idx" ON "layouts" USING btree ("plan_id");
  CREATE INDEX "layouts_status_idx" ON "layouts" USING btree ("status");
  CREATE INDEX "layouts_updated_at_idx" ON "layouts" USING btree ("updated_at");
  CREATE INDEX "layouts_created_at_idx" ON "layouts" USING btree ("created_at");
  CREATE UNIQUE INDEX "complex_building_externalLayoutId_idx" ON "layouts" USING btree ("complex_id","building_id","external_layout_id");
  CREATE INDEX "status_complex_1_idx" ON "layouts" USING btree ("status","complex_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_developers_fk" FOREIGN KEY ("developers_id") REFERENCES "public"."developers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_residential_complexes_fk" FOREIGN KEY ("complexes_id") REFERENCES "public"."complexes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_developers_id_idx" ON "payload_locked_documents_rels" USING btree ("developers_id");
  CREATE INDEX "payload_locked_documents_rels_complexes_id_idx" ON "payload_locked_documents_rels" USING btree ("complexes_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "developers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "developers_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_developers_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_developers_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "complexes_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "complexes_blocks_lead" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "complexes_blocks_thesis_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "complexes_blocks_thesis" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "complexes_blocks_risk_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "complexes_blocks_numbered_steps_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "complexes_blocks_numbered_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "complexes_blocks_proof_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "complexes_blocks_scenario_table_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "complexes_blocks_scenario_table" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "complexes_blocks_cards_grid_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "complexes_blocks_cards_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "complexes_blocks_object_cards_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "complexes_blocks_object_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "complexes_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "complexes_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "complexes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "complexes_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_complexes_v_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_complexes_v_blocks_lead" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_complexes_v_blocks_thesis_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_complexes_v_blocks_thesis" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_complexes_v_blocks_risk_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_complexes_v_blocks_numbered_steps_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_complexes_v_blocks_numbered_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_complexes_v_blocks_proof_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_complexes_v_blocks_scenario_table_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_complexes_v_blocks_scenario_table" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_complexes_v_blocks_cards_grid_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_complexes_v_blocks_cards_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_complexes_v_blocks_object_cards_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_complexes_v_blocks_object_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_complexes_v_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_complexes_v_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_complexes_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_complexes_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "buildings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "layouts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "developers" CASCADE;
  DROP TABLE "developers_rels" CASCADE;
  DROP TABLE "_developers_v" CASCADE;
  DROP TABLE "_developers_v_rels" CASCADE;
  DROP TABLE "complexes_blocks_hero" CASCADE;
  DROP TABLE "complexes_blocks_lead" CASCADE;
  DROP TABLE "complexes_blocks_thesis_items" CASCADE;
  DROP TABLE "complexes_blocks_thesis" CASCADE;
  DROP TABLE "complexes_blocks_risk_block" CASCADE;
  DROP TABLE "complexes_blocks_numbered_steps_steps" CASCADE;
  DROP TABLE "complexes_blocks_numbered_steps" CASCADE;
  DROP TABLE "complexes_blocks_proof_block" CASCADE;
  DROP TABLE "complexes_blocks_scenario_table_rows" CASCADE;
  DROP TABLE "complexes_blocks_scenario_table" CASCADE;
  DROP TABLE "complexes_blocks_cards_grid_cards" CASCADE;
  DROP TABLE "complexes_blocks_cards_grid" CASCADE;
  DROP TABLE "complexes_blocks_object_cards_items" CASCADE;
  DROP TABLE "complexes_blocks_object_cards" CASCADE;
  DROP TABLE "complexes_blocks_cta" CASCADE;
  DROP TABLE "complexes_blocks_rich_text" CASCADE;
  DROP TABLE "complexes" CASCADE;
  DROP TABLE "complexes_rels" CASCADE;
  DROP TABLE "_complexes_v_blocks_hero" CASCADE;
  DROP TABLE "_complexes_v_blocks_lead" CASCADE;
  DROP TABLE "_complexes_v_blocks_thesis_items" CASCADE;
  DROP TABLE "_complexes_v_blocks_thesis" CASCADE;
  DROP TABLE "_complexes_v_blocks_risk_block" CASCADE;
  DROP TABLE "_complexes_v_blocks_numbered_steps_steps" CASCADE;
  DROP TABLE "_complexes_v_blocks_numbered_steps" CASCADE;
  DROP TABLE "_complexes_v_blocks_proof_block" CASCADE;
  DROP TABLE "_complexes_v_blocks_scenario_table_rows" CASCADE;
  DROP TABLE "_complexes_v_blocks_scenario_table" CASCADE;
  DROP TABLE "_complexes_v_blocks_cards_grid_cards" CASCADE;
  DROP TABLE "_complexes_v_blocks_cards_grid" CASCADE;
  DROP TABLE "_complexes_v_blocks_object_cards_items" CASCADE;
  DROP TABLE "_complexes_v_blocks_object_cards" CASCADE;
  DROP TABLE "_complexes_v_blocks_cta" CASCADE;
  DROP TABLE "_complexes_v_blocks_rich_text" CASCADE;
  DROP TABLE "_complexes_v" CASCADE;
  DROP TABLE "_complexes_v_rels" CASCADE;
  DROP TABLE "buildings" CASCADE;
  DROP TABLE "layouts" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_developers_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_residential_complexes_fk";

  DROP INDEX "payload_locked_documents_rels_developers_id_idx";
  DROP INDEX "payload_locked_documents_rels_complexes_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "developers_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "complexes_id";
  DROP TYPE "public"."enum_developers_seo_robots";
  DROP TYPE "public"."enum_developers_seo_priority";
  DROP TYPE "public"."enum_developers_status";
  DROP TYPE "public"."enum__developers_v_version_seo_robots";
  DROP TYPE "public"."enum__developers_v_version_seo_priority";
  DROP TYPE "public"."enum__developers_v_version_status";
  DROP TYPE "public"."enum_complexes_seo_robots";
  DROP TYPE "public"."enum_complexes_seo_priority";
  DROP TYPE "public"."enum_complexes_status";
  DROP TYPE "public"."enum__complexes_v_version_seo_robots";
  DROP TYPE "public"."enum__complexes_v_version_seo_priority";
  DROP TYPE "public"."enum__complexes_v_version_status";
  DROP TYPE "public"."enum_buildings_status";
  DROP TYPE "public"."enum_layouts_status";`)
}

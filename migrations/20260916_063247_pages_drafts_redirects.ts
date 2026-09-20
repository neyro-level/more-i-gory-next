import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "_pages_v_blocks_hero" (
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
  
  CREATE TABLE "_pages_v_blocks_lead" (
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
  
  CREATE TABLE "_pages_v_blocks_thesis_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_thesis" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_risk_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_numbered_steps_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_numbered_steps" (
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
  
  CREATE TABLE "_pages_v_blocks_proof_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"proof" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_scenario_table_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"scenario" varchar,
  	"assumption" varchar,
  	"investor_question" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_scenario_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cards_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"link_label" varchar,
  	"link_href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cards_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"lead" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_object_cards_items" (
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
  
  CREATE TABLE "_pages_v_blocks_object_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"lead" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta" (
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
  
  CREATE TABLE "_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_path" varchar,
  	"version_status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"version_summary" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" varchar NOT NULL,
  	"destination" varchar NOT NULL,
  	"permanent" boolean DEFAULT true NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "pages" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "pages" ALTER COLUMN "status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum_pages_status";
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  ALTER TABLE "pages" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."enum_pages_status";
  ALTER TABLE "pages" ALTER COLUMN "status" SET DATA TYPE "public"."enum_pages_status" USING "status"::"public"."enum_pages_status";
  ALTER TABLE "pages_blocks_hero" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "pages_blocks_hero" ALTER COLUMN "lead" DROP NOT NULL;
  ALTER TABLE "pages_blocks_lead" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "pages_blocks_lead" ALTER COLUMN "text" DROP NOT NULL;
  ALTER TABLE "pages_blocks_thesis_items" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "pages_blocks_thesis_items" ALTER COLUMN "text" DROP NOT NULL;
  ALTER TABLE "pages_blocks_thesis" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "pages_blocks_risk_block" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "pages_blocks_risk_block" ALTER COLUMN "text" DROP NOT NULL;
  ALTER TABLE "pages_blocks_numbered_steps_steps" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "pages_blocks_numbered_steps_steps" ALTER COLUMN "text" DROP NOT NULL;
  ALTER TABLE "pages_blocks_numbered_steps" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "pages_blocks_proof_block" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "pages_blocks_proof_block" ALTER COLUMN "proof" DROP NOT NULL;
  ALTER TABLE "pages_blocks_scenario_table_rows" ALTER COLUMN "scenario" DROP NOT NULL;
  ALTER TABLE "pages_blocks_scenario_table_rows" ALTER COLUMN "assumption" DROP NOT NULL;
  ALTER TABLE "pages_blocks_scenario_table_rows" ALTER COLUMN "investor_question" DROP NOT NULL;
  ALTER TABLE "pages_blocks_scenario_table" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "pages_blocks_cards_grid_cards" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "pages_blocks_cards_grid_cards" ALTER COLUMN "text" DROP NOT NULL;
  ALTER TABLE "pages_blocks_cards_grid" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "pages_blocks_object_cards_items" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "pages_blocks_object_cards_items" ALTER COLUMN "href" DROP NOT NULL;
  ALTER TABLE "pages_blocks_object_cards_items" ALTER COLUMN "location" DROP NOT NULL;
  ALTER TABLE "pages_blocks_object_cards_items" ALTER COLUMN "status" DROP NOT NULL;
  ALTER TABLE "pages_blocks_object_cards_items" ALTER COLUMN "thesis" DROP NOT NULL;
  ALTER TABLE "pages_blocks_object_cards_items" ALTER COLUMN "risk" DROP NOT NULL;
  ALTER TABLE "pages_blocks_object_cards" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "pages_blocks_cta" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "pages_blocks_cta" ALTER COLUMN "text" DROP NOT NULL;
  ALTER TABLE "pages_blocks_cta" ALTER COLUMN "primary_cta_label" DROP NOT NULL;
  ALTER TABLE "pages_blocks_cta" ALTER COLUMN "primary_cta_href" DROP NOT NULL;
  ALTER TABLE "pages_blocks_rich_text" ALTER COLUMN "content" DROP NOT NULL;
  ALTER TABLE "pages" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "pages" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "pages" ALTER COLUMN "path" DROP NOT NULL;
  ALTER TABLE "pages" ALTER COLUMN "status" DROP NOT NULL;
  ALTER TABLE "pages" ADD COLUMN "_status" "enum_pages_status" DEFAULT 'draft';
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "redirects_id" integer;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_lead" ADD CONSTRAINT "_pages_v_blocks_lead_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_thesis_items" ADD CONSTRAINT "_pages_v_blocks_thesis_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_thesis"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_thesis" ADD CONSTRAINT "_pages_v_blocks_thesis_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_risk_block" ADD CONSTRAINT "_pages_v_blocks_risk_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_numbered_steps_steps" ADD CONSTRAINT "_pages_v_blocks_numbered_steps_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_numbered_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_numbered_steps" ADD CONSTRAINT "_pages_v_blocks_numbered_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_proof_block" ADD CONSTRAINT "_pages_v_blocks_proof_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_scenario_table_rows" ADD CONSTRAINT "_pages_v_blocks_scenario_table_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_scenario_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_scenario_table" ADD CONSTRAINT "_pages_v_blocks_scenario_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cards_grid_cards" ADD CONSTRAINT "_pages_v_blocks_cards_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cards_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cards_grid" ADD CONSTRAINT "_pages_v_blocks_cards_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_object_cards_items" ADD CONSTRAINT "_pages_v_blocks_object_cards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_object_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_object_cards" ADD CONSTRAINT "_pages_v_blocks_object_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rich_text" ADD CONSTRAINT "_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "_pages_v_blocks_hero_order_idx" ON "_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_parent_id_idx" ON "_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_path_idx" ON "_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_lead_order_idx" ON "_pages_v_blocks_lead" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_lead_parent_id_idx" ON "_pages_v_blocks_lead" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_lead_path_idx" ON "_pages_v_blocks_lead" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_thesis_items_order_idx" ON "_pages_v_blocks_thesis_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_thesis_items_parent_id_idx" ON "_pages_v_blocks_thesis_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_thesis_order_idx" ON "_pages_v_blocks_thesis" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_thesis_parent_id_idx" ON "_pages_v_blocks_thesis" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_thesis_path_idx" ON "_pages_v_blocks_thesis" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_risk_block_order_idx" ON "_pages_v_blocks_risk_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_risk_block_parent_id_idx" ON "_pages_v_blocks_risk_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_risk_block_path_idx" ON "_pages_v_blocks_risk_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_numbered_steps_steps_order_idx" ON "_pages_v_blocks_numbered_steps_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_numbered_steps_steps_parent_id_idx" ON "_pages_v_blocks_numbered_steps_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_numbered_steps_order_idx" ON "_pages_v_blocks_numbered_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_numbered_steps_parent_id_idx" ON "_pages_v_blocks_numbered_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_numbered_steps_path_idx" ON "_pages_v_blocks_numbered_steps" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_proof_block_order_idx" ON "_pages_v_blocks_proof_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_proof_block_parent_id_idx" ON "_pages_v_blocks_proof_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_proof_block_path_idx" ON "_pages_v_blocks_proof_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_scenario_table_rows_order_idx" ON "_pages_v_blocks_scenario_table_rows" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_scenario_table_rows_parent_id_idx" ON "_pages_v_blocks_scenario_table_rows" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_scenario_table_order_idx" ON "_pages_v_blocks_scenario_table" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_scenario_table_parent_id_idx" ON "_pages_v_blocks_scenario_table" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_scenario_table_path_idx" ON "_pages_v_blocks_scenario_table" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cards_grid_cards_order_idx" ON "_pages_v_blocks_cards_grid_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cards_grid_cards_parent_id_idx" ON "_pages_v_blocks_cards_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cards_grid_order_idx" ON "_pages_v_blocks_cards_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cards_grid_parent_id_idx" ON "_pages_v_blocks_cards_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cards_grid_path_idx" ON "_pages_v_blocks_cards_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_object_cards_items_order_idx" ON "_pages_v_blocks_object_cards_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_object_cards_items_parent_id_idx" ON "_pages_v_blocks_object_cards_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_object_cards_order_idx" ON "_pages_v_blocks_object_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_object_cards_parent_id_idx" ON "_pages_v_blocks_object_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_object_cards_path_idx" ON "_pages_v_blocks_object_cards" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cta_order_idx" ON "_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_parent_id_idx" ON "_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_path_idx" ON "_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_rich_text_order_idx" ON "_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_rich_text_parent_id_idx" ON "_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_path_idx" ON "_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_path_idx" ON "_pages_v" USING btree ("version_path");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE UNIQUE INDEX "redirects_source_idx" ON "redirects" USING btree ("source");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_status" ADD VALUE 'archived';
  ALTER TABLE "_pages_v_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_lead" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_thesis_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_thesis" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_risk_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_numbered_steps_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_numbered_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_proof_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_scenario_table_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_scenario_table" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cards_grid_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cards_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_object_cards_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_object_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "redirects" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "_pages_v_blocks_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_lead" CASCADE;
  DROP TABLE "_pages_v_blocks_thesis_items" CASCADE;
  DROP TABLE "_pages_v_blocks_thesis" CASCADE;
  DROP TABLE "_pages_v_blocks_risk_block" CASCADE;
  DROP TABLE "_pages_v_blocks_numbered_steps_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_numbered_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_proof_block" CASCADE;
  DROP TABLE "_pages_v_blocks_scenario_table_rows" CASCADE;
  DROP TABLE "_pages_v_blocks_scenario_table" CASCADE;
  DROP TABLE "_pages_v_blocks_cards_grid_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_cards_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_object_cards_items" CASCADE;
  DROP TABLE "_pages_v_blocks_object_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "redirects" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_redirects_fk";
  
  DROP INDEX "pages__status_idx";
  DROP INDEX "payload_locked_documents_rels_redirects_id_idx";
  ALTER TABLE "pages_blocks_hero" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "pages_blocks_hero" ALTER COLUMN "lead" SET NOT NULL;
  ALTER TABLE "pages_blocks_lead" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "pages_blocks_lead" ALTER COLUMN "text" SET NOT NULL;
  ALTER TABLE "pages_blocks_thesis_items" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "pages_blocks_thesis_items" ALTER COLUMN "text" SET NOT NULL;
  ALTER TABLE "pages_blocks_thesis" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "pages_blocks_risk_block" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "pages_blocks_risk_block" ALTER COLUMN "text" SET NOT NULL;
  ALTER TABLE "pages_blocks_numbered_steps_steps" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "pages_blocks_numbered_steps_steps" ALTER COLUMN "text" SET NOT NULL;
  ALTER TABLE "pages_blocks_numbered_steps" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "pages_blocks_proof_block" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "pages_blocks_proof_block" ALTER COLUMN "proof" SET NOT NULL;
  ALTER TABLE "pages_blocks_scenario_table_rows" ALTER COLUMN "scenario" SET NOT NULL;
  ALTER TABLE "pages_blocks_scenario_table_rows" ALTER COLUMN "assumption" SET NOT NULL;
  ALTER TABLE "pages_blocks_scenario_table_rows" ALTER COLUMN "investor_question" SET NOT NULL;
  ALTER TABLE "pages_blocks_scenario_table" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "pages_blocks_cards_grid_cards" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "pages_blocks_cards_grid_cards" ALTER COLUMN "text" SET NOT NULL;
  ALTER TABLE "pages_blocks_cards_grid" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "pages_blocks_object_cards_items" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "pages_blocks_object_cards_items" ALTER COLUMN "href" SET NOT NULL;
  ALTER TABLE "pages_blocks_object_cards_items" ALTER COLUMN "location" SET NOT NULL;
  ALTER TABLE "pages_blocks_object_cards_items" ALTER COLUMN "status" SET NOT NULL;
  ALTER TABLE "pages_blocks_object_cards_items" ALTER COLUMN "thesis" SET NOT NULL;
  ALTER TABLE "pages_blocks_object_cards_items" ALTER COLUMN "risk" SET NOT NULL;
  ALTER TABLE "pages_blocks_object_cards" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "pages_blocks_cta" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "pages_blocks_cta" ALTER COLUMN "text" SET NOT NULL;
  ALTER TABLE "pages_blocks_cta" ALTER COLUMN "primary_cta_label" SET NOT NULL;
  ALTER TABLE "pages_blocks_cta" ALTER COLUMN "primary_cta_href" SET NOT NULL;
  ALTER TABLE "pages_blocks_rich_text" ALTER COLUMN "content" SET NOT NULL;
  ALTER TABLE "pages" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "pages" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "pages" ALTER COLUMN "path" SET NOT NULL;
  ALTER TABLE "pages" ALTER COLUMN "status" SET NOT NULL;
  ALTER TABLE "pages" DROP COLUMN "_status";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "redirects_id";
  DROP TYPE "public"."enum__pages_v_version_status";`)
}

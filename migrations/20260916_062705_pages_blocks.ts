import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published', 'archived');
  CREATE TABLE "pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar NOT NULL,
  	"lead" varchar NOT NULL,
  	"primary_cta_label" varchar,
  	"primary_cta_href" varchar,
  	"secondary_cta_label" varchar,
  	"secondary_cta_href" varchar,
  	"proof" varchar,
  	"image_path" varchar,
  	"image_alt" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_lead" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_thesis_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_thesis" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_risk_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_numbered_steps_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_numbered_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar NOT NULL,
  	"lead" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_proof_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"proof" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_scenario_table_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"scenario" varchar NOT NULL,
  	"assumption" varchar NOT NULL,
  	"investor_question" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_scenario_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cards_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"link_label" varchar,
  	"link_href" varchar
  );
  
  CREATE TABLE "pages_blocks_cards_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"lead" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_object_cards_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"location" varchar NOT NULL,
  	"status" varchar NOT NULL,
  	"thesis" varchar NOT NULL,
  	"risk" varchar NOT NULL,
  	"image_path" varchar,
  	"image_alt" varchar
  );
  
  CREATE TABLE "pages_blocks_object_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"lead" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"primary_cta_label" varchar NOT NULL,
  	"primary_cta_href" varchar NOT NULL,
  	"secondary_cta_label" varchar,
  	"secondary_cta_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"path" varchar NOT NULL,
  	"status" "enum_pages_status" DEFAULT 'draft' NOT NULL,
  	"summary" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_lead" ADD CONSTRAINT "pages_blocks_lead_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_thesis_items" ADD CONSTRAINT "pages_blocks_thesis_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_thesis"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_thesis" ADD CONSTRAINT "pages_blocks_thesis_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_risk_block" ADD CONSTRAINT "pages_blocks_risk_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_numbered_steps_steps" ADD CONSTRAINT "pages_blocks_numbered_steps_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_numbered_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_numbered_steps" ADD CONSTRAINT "pages_blocks_numbered_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_proof_block" ADD CONSTRAINT "pages_blocks_proof_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_scenario_table_rows" ADD CONSTRAINT "pages_blocks_scenario_table_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_scenario_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_scenario_table" ADD CONSTRAINT "pages_blocks_scenario_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cards_grid_cards" ADD CONSTRAINT "pages_blocks_cards_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cards_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cards_grid" ADD CONSTRAINT "pages_blocks_cards_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_object_cards_items" ADD CONSTRAINT "pages_blocks_object_cards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_object_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_object_cards" ADD CONSTRAINT "pages_blocks_object_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rich_text" ADD CONSTRAINT "pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_hero_order_idx" ON "pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_lead_order_idx" ON "pages_blocks_lead" USING btree ("_order");
  CREATE INDEX "pages_blocks_lead_parent_id_idx" ON "pages_blocks_lead" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_lead_path_idx" ON "pages_blocks_lead" USING btree ("_path");
  CREATE INDEX "pages_blocks_thesis_items_order_idx" ON "pages_blocks_thesis_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_thesis_items_parent_id_idx" ON "pages_blocks_thesis_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_thesis_order_idx" ON "pages_blocks_thesis" USING btree ("_order");
  CREATE INDEX "pages_blocks_thesis_parent_id_idx" ON "pages_blocks_thesis" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_thesis_path_idx" ON "pages_blocks_thesis" USING btree ("_path");
  CREATE INDEX "pages_blocks_risk_block_order_idx" ON "pages_blocks_risk_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_risk_block_parent_id_idx" ON "pages_blocks_risk_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_risk_block_path_idx" ON "pages_blocks_risk_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_numbered_steps_steps_order_idx" ON "pages_blocks_numbered_steps_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_numbered_steps_steps_parent_id_idx" ON "pages_blocks_numbered_steps_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_numbered_steps_order_idx" ON "pages_blocks_numbered_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_numbered_steps_parent_id_idx" ON "pages_blocks_numbered_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_numbered_steps_path_idx" ON "pages_blocks_numbered_steps" USING btree ("_path");
  CREATE INDEX "pages_blocks_proof_block_order_idx" ON "pages_blocks_proof_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_proof_block_parent_id_idx" ON "pages_blocks_proof_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_proof_block_path_idx" ON "pages_blocks_proof_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_scenario_table_rows_order_idx" ON "pages_blocks_scenario_table_rows" USING btree ("_order");
  CREATE INDEX "pages_blocks_scenario_table_rows_parent_id_idx" ON "pages_blocks_scenario_table_rows" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_scenario_table_order_idx" ON "pages_blocks_scenario_table" USING btree ("_order");
  CREATE INDEX "pages_blocks_scenario_table_parent_id_idx" ON "pages_blocks_scenario_table" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_scenario_table_path_idx" ON "pages_blocks_scenario_table" USING btree ("_path");
  CREATE INDEX "pages_blocks_cards_grid_cards_order_idx" ON "pages_blocks_cards_grid_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_cards_grid_cards_parent_id_idx" ON "pages_blocks_cards_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cards_grid_order_idx" ON "pages_blocks_cards_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_cards_grid_parent_id_idx" ON "pages_blocks_cards_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cards_grid_path_idx" ON "pages_blocks_cards_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_object_cards_items_order_idx" ON "pages_blocks_object_cards_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_object_cards_items_parent_id_idx" ON "pages_blocks_object_cards_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_object_cards_order_idx" ON "pages_blocks_object_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_object_cards_parent_id_idx" ON "pages_blocks_object_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_object_cards_path_idx" ON "pages_blocks_object_cards" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_order_idx" ON "pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_parent_id_idx" ON "pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_path_idx" ON "pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "pages_blocks_rich_text_order_idx" ON "pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_rich_text_parent_id_idx" ON "pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_path_idx" ON "pages_blocks_rich_text" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE UNIQUE INDEX "pages_path_idx" ON "pages" USING btree ("path");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_lead" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_thesis_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_thesis" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_risk_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_numbered_steps_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_numbered_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_proof_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_scenario_table_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_scenario_table" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cards_grid_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cards_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_object_cards_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_object_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_hero" CASCADE;
  DROP TABLE "pages_blocks_lead" CASCADE;
  DROP TABLE "pages_blocks_thesis_items" CASCADE;
  DROP TABLE "pages_blocks_thesis" CASCADE;
  DROP TABLE "pages_blocks_risk_block" CASCADE;
  DROP TABLE "pages_blocks_numbered_steps_steps" CASCADE;
  DROP TABLE "pages_blocks_numbered_steps" CASCADE;
  DROP TABLE "pages_blocks_proof_block" CASCADE;
  DROP TABLE "pages_blocks_scenario_table_rows" CASCADE;
  DROP TABLE "pages_blocks_scenario_table" CASCADE;
  DROP TABLE "pages_blocks_cards_grid_cards" CASCADE;
  DROP TABLE "pages_blocks_cards_grid" CASCADE;
  DROP TABLE "pages_blocks_object_cards_items" CASCADE;
  DROP TABLE "pages_blocks_object_cards" CASCADE;
  DROP TABLE "pages_blocks_cta" CASCADE;
  DROP TABLE "pages_blocks_rich_text" CASCADE;
  DROP TABLE "pages" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pages_fk";
  
  DROP INDEX "payload_locked_documents_rels_pages_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pages_id";
  DROP TYPE "public"."enum_pages_status";`)
}

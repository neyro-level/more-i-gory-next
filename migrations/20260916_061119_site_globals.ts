import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_settings_default_seo_robots" AS ENUM('index-follow', 'noindex-follow');
  CREATE TYPE "public"."enum__site_settings_v_version_default_seo_robots" AS ENUM('index-follow', 'noindex-follow');
  CREATE TABLE "site_settings_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'Море и Горы' NOT NULL,
  	"short_name" varchar DEFAULT 'МГ' NOT NULL,
  	"tagline" varchar DEFAULT 'инвестиционное бюро',
  	"canonical_domain" varchar,
  	"contacts_phone" varchar,
  	"contacts_email" varchar,
  	"contacts_telegram" varchar,
  	"contacts_whatsapp" varchar,
  	"contacts_address" varchar,
  	"contacts_working_hours" varchar,
  	"default_seo_title" varchar,
  	"default_seo_description" varchar,
  	"default_seo_og_image_path" varchar,
  	"default_seo_robots" "enum_site_settings_default_seo_robots" DEFAULT 'index-follow' NOT NULL,
  	"legal_notice" varchar DEFAULT 'Материалы сайта не являются индивидуальной инвестиционной рекомендацией.',
  	"analytics_yandex_metrika_id" varchar,
  	"analytics_vk_pixel_id" varchar,
  	"analytics_call_tracking_id" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_site_settings_v_version_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_site_name" varchar DEFAULT 'Море и Горы' NOT NULL,
  	"version_short_name" varchar DEFAULT 'МГ' NOT NULL,
  	"version_tagline" varchar DEFAULT 'инвестиционное бюро',
  	"version_canonical_domain" varchar,
  	"version_contacts_phone" varchar,
  	"version_contacts_email" varchar,
  	"version_contacts_telegram" varchar,
  	"version_contacts_whatsapp" varchar,
  	"version_contacts_address" varchar,
  	"version_contacts_working_hours" varchar,
  	"version_default_seo_title" varchar,
  	"version_default_seo_description" varchar,
  	"version_default_seo_og_image_path" varchar,
  	"version_default_seo_robots" "enum__site_settings_v_version_default_seo_robots" DEFAULT 'index-follow' NOT NULL,
  	"version_legal_notice" varchar DEFAULT 'Материалы сайта не являются индивидуальной инвестиционной рекомендацией.',
  	"version_analytics_yandex_metrika_id" varchar,
  	"version_analytics_vk_pixel_id" varchar,
  	"version_analytics_call_tracking_id" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "navigation_header" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"open_in_new_tab" boolean DEFAULT false,
  	"nofollow" boolean DEFAULT false
  );
  
  CREATE TABLE "navigation_footer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"open_in_new_tab" boolean DEFAULT false,
  	"nofollow" boolean DEFAULT false
  );
  
  CREATE TABLE "navigation_legal" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"open_in_new_tab" boolean DEFAULT false,
  	"nofollow" boolean DEFAULT false
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"header_cta_label" varchar,
  	"header_cta_href" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_navigation_v_version_header" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"open_in_new_tab" boolean DEFAULT false,
  	"nofollow" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_navigation_v_version_footer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"open_in_new_tab" boolean DEFAULT false,
  	"nofollow" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_navigation_v_version_legal" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"open_in_new_tab" boolean DEFAULT false,
  	"nofollow" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_navigation_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_header_cta_label" varchar,
  	"version_header_cta_href" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "site_settings_social_links" ADD CONSTRAINT "site_settings_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_legal_links" ADD CONSTRAINT "site_settings_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_social_links" ADD CONSTRAINT "_site_settings_v_version_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_legal_links" ADD CONSTRAINT "_site_settings_v_version_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_header" ADD CONSTRAINT "navigation_header_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer" ADD CONSTRAINT "navigation_footer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_legal" ADD CONSTRAINT "navigation_legal_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_header" ADD CONSTRAINT "_navigation_v_version_header_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_footer" ADD CONSTRAINT "_navigation_v_version_footer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_legal" ADD CONSTRAINT "_navigation_v_version_legal_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_social_links_order_idx" ON "site_settings_social_links" USING btree ("_order");
  CREATE INDEX "site_settings_social_links_parent_id_idx" ON "site_settings_social_links" USING btree ("_parent_id");
  CREATE INDEX "site_settings_legal_links_order_idx" ON "site_settings_legal_links" USING btree ("_order");
  CREATE INDEX "site_settings_legal_links_parent_id_idx" ON "site_settings_legal_links" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_social_links_order_idx" ON "_site_settings_v_version_social_links" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_social_links_parent_id_idx" ON "_site_settings_v_version_social_links" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_legal_links_order_idx" ON "_site_settings_v_version_legal_links" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_legal_links_parent_id_idx" ON "_site_settings_v_version_legal_links" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_created_at_idx" ON "_site_settings_v" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_updated_at_idx" ON "_site_settings_v" USING btree ("updated_at");
  CREATE INDEX "navigation_header_order_idx" ON "navigation_header" USING btree ("_order");
  CREATE INDEX "navigation_header_parent_id_idx" ON "navigation_header" USING btree ("_parent_id");
  CREATE INDEX "navigation_footer_order_idx" ON "navigation_footer" USING btree ("_order");
  CREATE INDEX "navigation_footer_parent_id_idx" ON "navigation_footer" USING btree ("_parent_id");
  CREATE INDEX "navigation_legal_order_idx" ON "navigation_legal" USING btree ("_order");
  CREATE INDEX "navigation_legal_parent_id_idx" ON "navigation_legal" USING btree ("_parent_id");
  CREATE INDEX "_navigation_v_version_header_order_idx" ON "_navigation_v_version_header" USING btree ("_order");
  CREATE INDEX "_navigation_v_version_header_parent_id_idx" ON "_navigation_v_version_header" USING btree ("_parent_id");
  CREATE INDEX "_navigation_v_version_footer_order_idx" ON "_navigation_v_version_footer" USING btree ("_order");
  CREATE INDEX "_navigation_v_version_footer_parent_id_idx" ON "_navigation_v_version_footer" USING btree ("_parent_id");
  CREATE INDEX "_navigation_v_version_legal_order_idx" ON "_navigation_v_version_legal" USING btree ("_order");
  CREATE INDEX "_navigation_v_version_legal_parent_id_idx" ON "_navigation_v_version_legal" USING btree ("_parent_id");
  CREATE INDEX "_navigation_v_created_at_idx" ON "_navigation_v" USING btree ("created_at");
  CREATE INDEX "_navigation_v_updated_at_idx" ON "_navigation_v" USING btree ("updated_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_settings_social_links" CASCADE;
  DROP TABLE "site_settings_legal_links" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "_site_settings_v_version_social_links" CASCADE;
  DROP TABLE "_site_settings_v_version_legal_links" CASCADE;
  DROP TABLE "_site_settings_v" CASCADE;
  DROP TABLE "navigation_header" CASCADE;
  DROP TABLE "navigation_footer" CASCADE;
  DROP TABLE "navigation_legal" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TABLE "_navigation_v_version_header" CASCADE;
  DROP TABLE "_navigation_v_version_footer" CASCADE;
  DROP TABLE "_navigation_v_version_legal" CASCADE;
  DROP TABLE "_navigation_v" CASCADE;
  DROP TYPE "public"."enum_site_settings_default_seo_robots";
  DROP TYPE "public"."enum__site_settings_v_version_default_seo_robots";`)
}

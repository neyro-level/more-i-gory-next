import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_leads_status" AS ENUM('new', 'processing', 'closed', 'spam');
  CREATE TYPE "public"."enum_lead_deliveries_attempt_log_outcome" AS ENUM('pending', 'sending', 'sent', 'failed', 'abandoned');
  CREATE TYPE "public"."enum_lead_deliveries_status" AS ENUM('pending', 'sending', 'sent', 'failed', 'abandoned');
  CREATE TABLE "leads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_leads_status" DEFAULT 'new' NOT NULL,
  	"name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"email" varchar,
  	"message" varchar NOT NULL,
  	"source_path" varchar NOT NULL,
  	"form_id" varchar,
  	"consent_accepted" boolean DEFAULT false NOT NULL,
  	"consent_version" varchar NOT NULL,
  	"consent_accepted_at" timestamp(3) with time zone NOT NULL,
  	"utm" jsonb,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "lead_deliveries_attempt_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"attempted_at" timestamp(3) with time zone NOT NULL,
  	"outcome" "enum_lead_deliveries_attempt_log_outcome" NOT NULL,
  	"safe_code" varchar,
  	"redacted_message" varchar
  );
  
  CREATE TABLE "lead_deliveries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"lead_id" integer NOT NULL,
  	"channel_id" varchar NOT NULL,
  	"status" "enum_lead_deliveries_status" DEFAULT 'pending' NOT NULL,
  	"attempts" numeric DEFAULT 0 NOT NULL,
  	"next_attempt_at" timestamp(3) with time zone,
  	"idempotency_key" varchar NOT NULL,
  	"external_ref" varchar,
  	"last_error_redacted" varchar,
  	"claimed_at" timestamp(3) with time zone,
  	"heartbeat_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "lead_deliveries_attempt_log" ADD CONSTRAINT "lead_deliveries_attempt_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lead_deliveries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lead_deliveries" ADD CONSTRAINT "lead_deliveries_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "leads_status_idx" ON "leads" USING btree ("status");
  CREATE INDEX "leads_source_path_idx" ON "leads" USING btree ("source_path");
  CREATE INDEX "leads_form_id_idx" ON "leads" USING btree ("form_id");
  CREATE INDEX "leads_updated_at_idx" ON "leads" USING btree ("updated_at");
  CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");
  CREATE INDEX "status_createdAt_idx" ON "leads" USING btree ("status","created_at");
  CREATE INDEX "sourcePath_createdAt_idx" ON "leads" USING btree ("source_path","created_at");
  CREATE INDEX "lead_deliveries_attempt_log_order_idx" ON "lead_deliveries_attempt_log" USING btree ("_order");
  CREATE INDEX "lead_deliveries_attempt_log_parent_id_idx" ON "lead_deliveries_attempt_log" USING btree ("_parent_id");
  CREATE INDEX "lead_deliveries_lead_idx" ON "lead_deliveries" USING btree ("lead_id");
  CREATE INDEX "lead_deliveries_channel_id_idx" ON "lead_deliveries" USING btree ("channel_id");
  CREATE INDEX "lead_deliveries_status_idx" ON "lead_deliveries" USING btree ("status");
  CREATE INDEX "lead_deliveries_next_attempt_at_idx" ON "lead_deliveries" USING btree ("next_attempt_at");
  CREATE UNIQUE INDEX "lead_deliveries_idempotency_key_idx" ON "lead_deliveries" USING btree ("idempotency_key");
  CREATE INDEX "lead_deliveries_external_ref_idx" ON "lead_deliveries" USING btree ("external_ref");
  CREATE INDEX "lead_deliveries_claimed_at_idx" ON "lead_deliveries" USING btree ("claimed_at");
  CREATE INDEX "lead_deliveries_heartbeat_at_idx" ON "lead_deliveries" USING btree ("heartbeat_at");
  CREATE INDEX "lead_deliveries_updated_at_idx" ON "lead_deliveries" USING btree ("updated_at");
  CREATE INDEX "lead_deliveries_created_at_idx" ON "lead_deliveries" USING btree ("created_at");
  CREATE INDEX "status_nextAttemptAt_idx" ON "lead_deliveries" USING btree ("status","next_attempt_at");
  CREATE UNIQUE INDEX "lead_channelId_idx" ON "lead_deliveries" USING btree ("lead_id","channel_id");
  CREATE INDEX "status_claimedAt_idx" ON "lead_deliveries" USING btree ("status","claimed_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "leads" CASCADE;
  DROP TABLE "lead_deliveries_attempt_log" CASCADE;
  DROP TABLE "lead_deliveries" CASCADE;
  DROP TYPE "public"."enum_leads_status";
  DROP TYPE "public"."enum_lead_deliveries_attempt_log_outcome";
  DROP TYPE "public"."enum_lead_deliveries_status";`)
}

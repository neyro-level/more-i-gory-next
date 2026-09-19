import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_lead_deliveries_attempt_log_delivery_certainty" AS ENUM('not-delivered', 'unknown', 'delivered');
  ALTER TABLE "lead_deliveries_attempt_log" ALTER COLUMN "outcome" SET DATA TYPE text;
  UPDATE "lead_deliveries_attempt_log" SET "outcome" = 'delivered' WHERE "outcome" = 'sent';
  DROP TYPE "public"."enum_lead_deliveries_attempt_log_outcome";
  CREATE TYPE "public"."enum_lead_deliveries_attempt_log_outcome" AS ENUM('pending', 'sending', 'delivered', 'failed', 'abandoned');
  ALTER TABLE "lead_deliveries_attempt_log" ALTER COLUMN "outcome" SET DATA TYPE "public"."enum_lead_deliveries_attempt_log_outcome" USING "outcome"::"public"."enum_lead_deliveries_attempt_log_outcome";
  ALTER TABLE "lead_deliveries" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "lead_deliveries" ALTER COLUMN "status" SET DEFAULT 'pending'::text;
  UPDATE "lead_deliveries" SET "status" = 'delivered' WHERE "status" = 'sent';
  DROP TYPE "public"."enum_lead_deliveries_status";
  CREATE TYPE "public"."enum_lead_deliveries_status" AS ENUM('pending', 'sending', 'delivered', 'failed', 'abandoned');
  ALTER TABLE "lead_deliveries" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."enum_lead_deliveries_status";
  ALTER TABLE "lead_deliveries" ALTER COLUMN "status" SET DATA TYPE "public"."enum_lead_deliveries_status" USING "status"::"public"."enum_lead_deliveries_status";
  ALTER TABLE "lead_deliveries_attempt_log" ADD COLUMN "delivery_certainty" "enum_lead_deliveries_attempt_log_delivery_certainty" DEFAULT 'unknown' NOT NULL;
  ALTER TABLE "lead_deliveries_attempt_log" ALTER COLUMN "delivery_certainty" DROP DEFAULT;
  ALTER TABLE "lead_deliveries" ADD COLUMN "delivered_at" timestamp(3) with time zone;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "lead_deliveries_attempt_log" ALTER COLUMN "outcome" SET DATA TYPE text;
  UPDATE "lead_deliveries_attempt_log" SET "outcome" = 'sent' WHERE "outcome" = 'delivered';
  DROP TYPE "public"."enum_lead_deliveries_attempt_log_outcome";
  CREATE TYPE "public"."enum_lead_deliveries_attempt_log_outcome" AS ENUM('pending', 'sending', 'sent', 'failed', 'abandoned');
  ALTER TABLE "lead_deliveries_attempt_log" ALTER COLUMN "outcome" SET DATA TYPE "public"."enum_lead_deliveries_attempt_log_outcome" USING "outcome"::"public"."enum_lead_deliveries_attempt_log_outcome";
  ALTER TABLE "lead_deliveries" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "lead_deliveries" ALTER COLUMN "status" SET DEFAULT 'pending'::text;
  UPDATE "lead_deliveries" SET "status" = 'sent' WHERE "status" = 'delivered';
  DROP TYPE "public"."enum_lead_deliveries_status";
  CREATE TYPE "public"."enum_lead_deliveries_status" AS ENUM('pending', 'sending', 'sent', 'failed', 'abandoned');
  ALTER TABLE "lead_deliveries" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."enum_lead_deliveries_status";
  ALTER TABLE "lead_deliveries" ALTER COLUMN "status" SET DATA TYPE "public"."enum_lead_deliveries_status" USING "status"::"public"."enum_lead_deliveries_status";
  ALTER TABLE "lead_deliveries_attempt_log" DROP COLUMN "delivery_certainty";
  ALTER TABLE "lead_deliveries" DROP COLUMN "delivered_at";
  DROP TYPE "public"."enum_lead_deliveries_attempt_log_delivery_certainty";`)
}

-- DRAFT TASK 24.1b — do not apply until out-of-contract row count is 0
-- or the owner unblocks EPIC 34. TASK 24.1a does not register this in
-- migrations/index.ts.

CREATE TYPE "public"."enum_properties_category" AS ENUM('apartment', 'house', 'land', 'commercial');
CREATE TYPE "public"."enum_properties_deal_type" AS ENUM('sale', 'rent');

ALTER TABLE "properties"
  ALTER COLUMN "category" SET DATA TYPE "public"."enum_properties_category"
  USING "category"::"public"."enum_properties_category";

ALTER TABLE "properties"
  ALTER COLUMN "deal_type" SET DATA TYPE "public"."enum_properties_deal_type"
  USING "deal_type"::"public"."enum_properties_deal_type";

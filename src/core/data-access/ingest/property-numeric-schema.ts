import type { PostgresAdapterArgs } from "@payloadcms/db-postgres";
import { integer, numeric } from "@payloadcms/db-postgres/drizzle/pg-core";

type PropertyNumericSchemaHook = NonNullable<PostgresAdapterArgs["afterSchemaInit"]>[number];

export const applyPropertyNumericDbContract: PropertyNumericSchemaHook = ({ extendTable, schema }) => {
  extendTable({
    columns: {
      kitchenArea: numeric("kitchen_area", { mode: "number", precision: 10, scale: 2 }),
      livingArea: numeric("living_area", { mode: "number", precision: 10, scale: 2 }),
      priceMinor: integer("price_minor"),
      pricePerMeterMinor: integer("price_per_meter_minor"),
      totalArea: numeric("total_area", { mode: "number", precision: 10, scale: 2 }),
    },
    table: schema.tables.properties,
  });
  return schema;
};

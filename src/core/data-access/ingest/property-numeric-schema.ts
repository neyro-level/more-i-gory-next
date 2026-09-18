import type { PostgresAdapterArgs } from "@payloadcms/db-postgres";
import { integer, numeric } from "@payloadcms/db-postgres/drizzle/pg-core";

type PropertyNumericSchemaHook = NonNullable<PostgresAdapterArgs["afterSchemaInit"]>[number];

export const applyPropertyNumericDbContract: PropertyNumericSchemaHook = ({ extendTable, schema }) => {
  extendTable({
    columns: {
      kitchen_area: numeric("kitchen_area", { mode: "number", precision: 10, scale: 2 }),
      living_area: numeric("living_area", { mode: "number", precision: 10, scale: 2 }),
      price_minor: integer("price_minor"),
      price_per_meter_minor: integer("price_per_meter_minor"),
      total_area: numeric("total_area", { mode: "number", precision: 10, scale: 2 }),
    },
    table: schema.tables.properties,
  });
  return schema;
};

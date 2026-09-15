import { z } from "zod";
import { existsSync } from "node:fs";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const { bootstrapOwner } = await import("../src/core/data-access/system/bootstrap-owner.ts");

const input = z
  .object({
    email: z.email(),
    password: z.string().min(12),
  })
  .parse({
    email: process.env.BOOTSTRAP_OWNER_EMAIL,
    password: process.env.BOOTSTRAP_OWNER_PASSWORD,
  });

const result = await bootstrapOwner(input);
console.log(`Owner bootstrap: ${result.status}.`);
process.exit(0);

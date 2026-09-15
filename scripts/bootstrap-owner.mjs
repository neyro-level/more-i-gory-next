import { z } from "zod";
import { existsSync } from "node:fs";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const { runSystemOperation } = await import("../src/core/data-access/system/index.ts");

const input = z
  .object({
    email: z.email(),
    password: z.string().min(12),
  })
  .parse({
    email: process.env.BOOTSTRAP_OWNER_EMAIL,
    password: process.env.BOOTSTRAP_OWNER_PASSWORD,
  });

const result = await runSystemOperation({ input, operation: "bootstrap.owner" });
console.log(`Owner bootstrap: ${result.outcome}.`);
process.exit(0);

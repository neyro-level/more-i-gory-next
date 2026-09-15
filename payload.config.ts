import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Users } from "./src/project/collections/users.ts";
import { env } from "./src/project/env.ts";
import { systemHealthTask } from "./src/project/jobs/system-health.ts";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaVerifyDir = process.env.PAYLOAD_SCHEMA_VERIFY_DIR;

if (schemaVerifyDir && process.env.NODE_ENV === "production") {
  throw new Error("PAYLOAD_SCHEMA_VERIFY_DIR is forbidden in production.");
}

export default buildConfig({
  admin: {
    importMap: { baseDir: path.resolve(dirname, "src") },
    user: Users.slug,
  },
  collections: [Users],
  db: postgresAdapter({
    migrationDir: schemaVerifyDir ? path.resolve(schemaVerifyDir, "migrations") : path.resolve(dirname, "migrations"),
    pool: { connectionString: env.DATABASE_URI },
    push: false,
  }),
  editor: lexicalEditor(),
  graphQL: { disable: true },
  jobs: {
    access: {
      cancel: ({ req }) => req.user?.collection === "users" && req.user.role === "owner",
      queue: ({ req }) => req.user?.collection === "users" && req.user.role === "owner",
      run: ({ req }) => req.user?.collection === "users" && req.user.role === "owner",
    },
    enableConcurrencyControl: true,
    tasks: [systemHealthTask],
  },
  secret: env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: schemaVerifyDir
      ? path.resolve(schemaVerifyDir, "payload-types.ts")
      : path.resolve(dirname, "src/payload-types.ts"),
  },
});

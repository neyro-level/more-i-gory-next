import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Buildings } from "./src/project/collections/buildings.ts";
import { Developers } from "./src/project/collections/developers.ts";
import { FeedSources } from "./src/project/collections/feed-sources.ts";
import { Layouts } from "./src/project/collections/layouts.ts";
import { Media } from "./src/project/collections/media.ts";
import { Pages } from "./src/project/collections/pages.ts";
import { Properties } from "./src/project/collections/properties.ts";
import { Regions } from "./src/project/collections/regions.ts";
import { Redirects } from "./src/project/collections/redirects.ts";
import { ResidentialComplexes } from "./src/project/collections/residential-complexes.ts";
import { Users } from "./src/project/collections/users.ts";
import { env } from "./src/project/env.ts";
import { Navigation, SiteSettings } from "./src/project/globals/index.ts";
import { createJobsConfig } from "./src/project/jobs/config.ts";
import { createStoragePlugins } from "./src/project/storage/s3.ts";

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
  collections: [
    Users,
    Media,
    Pages,
    Regions,
    Redirects,
    FeedSources,
    Properties,
    Developers,
    ResidentialComplexes,
    Buildings,
    Layouts,
  ],
  db: postgresAdapter({
    migrationDir: schemaVerifyDir ? path.resolve(schemaVerifyDir, "migrations") : path.resolve(dirname, "migrations"),
    pool: { connectionString: env.DATABASE_URI },
    push: false,
  }),
  editor: lexicalEditor(),
  graphQL: { disable: true },
  globals: [SiteSettings, Navigation],
  jobs: createJobsConfig(env.JOBS_AUTORUN),
  plugins: createStoragePlugins(env),
  secret: env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: schemaVerifyDir
      ? path.resolve(schemaVerifyDir, "payload-types.ts")
      : path.resolve(dirname, "src/payload-types.ts"),
  },
});

import { spawnSync } from "node:child_process";

const pnpmCli = process.env.npm_execpath;
if (!pnpmCli) throw new Error("verify:risk:runtime-release must be started through pnpm.");

const verificationEnv = {
  ...process.env,
  AMS_PROFILE: process.env.AMS_PROFILE ?? "REALTY_BASE",
  AMS_RUNTIME_CONTOUR: process.env.AMS_RUNTIME_CONTOUR ?? "staging",
  DATABASE_URI: process.env.DATABASE_URI ?? "postgresql://verify:verify@127.0.0.1:5432/moreigory_verify",
  JOBS_AUTORUN: process.env.JOBS_AUTORUN ?? "false",
  NEXT_PUBLIC_LEADS_ENABLED: process.env.NEXT_PUBLIC_LEADS_ENABLED ?? "false",
  NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL ?? "http://127.0.0.1:4311",
  PAYLOAD_SECRET: process.env.PAYLOAD_SECRET ?? "ci-validation-only-payload-secret-not-for-production",
  TZ: process.env.TZ ?? "Europe/Moscow",
};

for (const script of [
  "build",
  "verify:runtime",
  "test:runtime-topology",
  "test:pack-release",
  "test:install-release",
  "test:rollback-release",
  "test:release-evidence",
]) {
  const result = spawnSync(process.execPath, [pnpmCli, script], {
    env: verificationEnv,
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

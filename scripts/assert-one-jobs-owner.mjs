import { readFileSync } from "node:fs";

import { assertJobsOwnerContract, readJobsAutorunFromEnvText } from "./lib/jobs-owner-contract.mjs";

function parseArgs(argv) {
  const args = { files: [], mode: "steady", values: [] };

  for (const item of argv) {
    if (item.startsWith("--mode=")) {
      args.mode = item.slice("--mode=".length);
      continue;
    }
    if (item.startsWith("--values=")) {
      args.values = item.slice("--values=".length).split(",").filter(Boolean);
      continue;
    }
    if (item.startsWith("--from-env-files=")) {
      args.files = item.slice("--from-env-files=".length).split(",").filter(Boolean);
      continue;
    }
  }

  return args;
}

const args = parseArgs(process.argv.slice(2));
const flags = [
  ...args.values,
  ...args.files.map((file) => {
    const value = readJobsAutorunFromEnvText(readFileSync(file, "utf8"));
    if (value !== "true" && value !== "false") {
      throw new Error(`JOBS_AUTORUN missing or invalid in ${file}`);
    }
    return value;
  }),
];

if (flags.length === 0) {
  throw new Error("Pass --values=true,false and/or --from-env-files=path,path");
}

const result = assertJobsOwnerContract(args.mode, flags);
console.log(`jobs-owner ${result.mode} PASS owners=${result.owners}`);

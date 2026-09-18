export function countJobsOwners(flags) {
  return flags.filter((value) => value === "true").length;
}

export function assertJobsOwnerContract(mode, flags) {
  const owners = countJobsOwners(flags);

  if (mode === "handover-none") {
    if (owners !== 0) {
      throw new Error(`Handover requires zero JOBS_AUTORUN=true runtimes, got ${owners}`);
    }
    return { mode, owners };
  }

  if (mode !== "steady") {
    throw new Error(`Unknown jobs-owner mode: ${mode}`);
  }

  if (owners !== 1) {
    throw new Error(`Steady state requires exactly one JOBS_AUTORUN=true runtime, got ${owners}`);
  }

  return { mode, owners };
}

export function readJobsAutorunFromEnvText(text) {
  const match = String(text).match(/^\s*JOBS_AUTORUN\s*=\s*(true|false)\s*$/m);
  return match?.[1] ?? null;
}

export const JOBS_HANDOVER_STEPS = [
  "new runtime JOBS_AUTORUN=false",
  "readiness",
  "stop old jobs owner",
  "assert no owner",
  "start new owner JOBS_AUTORUN=true",
  "health",
];

export function assertStagingCannotPromoteJobs({ contour, jobsAutorun }) {
  if (contour === "staging" && jobsAutorun === "true") {
    throw new Error("Staging contour must not become JOBS_AUTORUN=true while ingest is frozen.");
  }
}

export function nextHandoverAssertMode(step) {
  if (step === "assert no owner") return "handover-none";
  if (step === "start new owner JOBS_AUTORUN=true") return "steady";
  return null;
}

export function listTestScripts(scripts) {
  return Object.keys(scripts).filter((name) => name.startsWith("test:"));
}

export function listVerifyQuickTestSteps(verifyQuick) {
  return String(verifyQuick)
    .split("&&")
    .map((step) => step.trim())
    .filter((step) => /^pnpm test:[^\s]+$/.test(step))
    .map((step) => step.slice("pnpm ".length));
}

export function findUncoveredTestScripts({ scripts, exclusions = {} }) {
  const included = new Set(listVerifyQuickTestSteps(scripts["verify:quick"] ?? ""));
  const missing = [];

  for (const [name, reason] of Object.entries(exclusions)) {
    if (!name.startsWith("test:")) {
      throw new Error(`Exclusion ${name} is not a test:* script.`);
    }
    if (!(name in scripts)) {
      throw new Error(`Exclusion ${name} is not defined in package.json scripts.`);
    }
    if (typeof reason !== "string" || reason.trim().length === 0) {
      throw new Error(`Exclusion ${name} must record a non-empty reason.`);
    }
  }

  for (const name of listTestScripts(scripts)) {
    if (included.has(name)) {
      continue;
    }

    const reason = exclusions[name];
    if (typeof reason === "string" && reason.trim().length > 0) {
      continue;
    }

    missing.push(name);
  }

  return missing;
}

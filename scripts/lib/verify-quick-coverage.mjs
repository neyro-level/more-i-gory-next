export function listTestScripts(scripts) {
  return Object.keys(scripts).filter((name) => name.startsWith("test:"));
}

function requireScript(scripts, name, field) {
  if (!(name in scripts)) {
    throw new Error(`${field} references undefined package script ${name}.`);
  }
}

export function buildVerifyQuickPlan({ scripts, manifest }) {
  if (manifest?.schemaVersion !== 1) {
    throw new Error("verify:quick manifest schemaVersion must be 1.");
  }
  if (
    manifest.testSelection?.includePrefix !== "test:" ||
    manifest.testSelection?.order !== "package-json" ||
    manifest.testSelection?.runtimeMetadataSource !== "package-script"
  ) {
    throw new Error("verify:quick manifest must select test:* in package order using package-script runtime metadata.");
  }

  const exclusions = manifest.excludedTests ?? {};
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

  const preTestScripts = manifest.preTestScripts ?? [];
  const postTestScripts = manifest.postTestScripts ?? [];
  for (const name of [...preTestScripts, ...postTestScripts]) {
    requireScript(scripts, name, "verify:quick manifest");
  }

  const tests = listTestScripts(scripts).filter((name) => !(name in exclusions));
  return [...preTestScripts, ...tests, ...postTestScripts];
}

export function findUncoveredTestScripts({ scripts, manifest }) {
  const included = new Set(buildVerifyQuickPlan({ scripts, manifest }));
  return listTestScripts(scripts).filter(
    (name) => !included.has(name) && !(name in (manifest.excludedTests ?? {})),
  );
}

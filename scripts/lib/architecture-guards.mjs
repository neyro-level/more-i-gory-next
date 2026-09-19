const codeFilePattern = /\.(?:[cm]?[jt]sx?)$/;
const exactVersionPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const privilegedSystemFiles = new Set([
  "src/core/data-access/system/bootstrap-owner.ts",
  "src/core/data-access/system/catalog-lifecycle.ts",
  "src/core/data-access/system/create-lead.ts",
  "src/core/data-access/system/lead-delivery.ts",
  "src/core/data-access/system/load-lead-delivery.ts",
  "src/core/data-access/system/jobs.ts",
  "src/core/data-access/system/jobs-janitor.ts",
  "src/core/data-access/system/lead-retention.ts",
  "src/core/data-access/system/dispatch-due-feeds.ts",
  "src/core/data-access/system/import-feed-run.ts",
  "src/core/data-access/system/load-feed-source-market.ts",
  "src/core/data-access/system/load-feed-source-url-ref.ts",
  "src/core/data-access/system/load-feed-source-conditional.ts",
  "src/core/data-access/system/load-feed-source-parser.ts",
  "src/core/data-access/system/apply-feed-upsert.ts",
  "src/core/data-access/system/create-import-issue.ts",
  "src/core/data-access/system/apply-safe-deactivation.ts",
]);
const privateFieldPattern = /\b(?:apartmentNumber|cadastralNumber|internalComment|ownerContact|credentials|diagnosticRawData)\b/;
const lowLevelDbImportPattern = /(?:from\s+|import\s*\(|require\s*\()\s*["'](?:@payloadcms\/db-postgres|drizzle-orm(?:\/[^"']*)?|pg|postgres)["']/;
const payloadJobsCollectionAccessPattern = /\bcollection\s*:\s*["']payload-jobs["']/;
const localApiCallPattern =
  /\b(?:req\.)?payload(?:\?\.|\.)(?:jobs(?:\?\.|\.))?(?:findByID|findGlobal|find|create|update|delete|queue)\s*(?:\?\.)?\s*\(/g;
const moduleSpecifierPattern =
  /(?:import\s+(?:type\s+)?[^"'()]*?\s+from\s+|export\s+(?:type\s+)?[^"']*?\s+from\s+|import\s*\(\s*|require\s*\(\s*)["']([^"']+)["']/g;
const darkVariantPattern = /(?:^|[\s"'`])(?:[\w!*\-[\]():/>&=.]+:)*dark:/;
const rawDesignColorPattern = /#[0-9a-f]{3,8}\b|\brgb\(|\bhsl\(|\boklch\(/i;
const arbitraryDesignLiteralPattern =
  /(?:^|[\s"'`])((?:[\w!*\-[\]():/>&=.]+:)*(?:aspect|bg|border|gap|grid-cols|max-w|min-h|px|py|ring|rounded|text)-\[[^\]\s]+\])/g;

function normalizePath(filePath) {
  return filePath.replaceAll("\\", "/");
}

function isProductionCode(filePath) {
  return (
    filePath === "src/app/(site)/globals.css" ||
    codeFilePattern.test(filePath) &&
    (filePath.startsWith("src/") ||
      filePath.startsWith("packages/") ||
      filePath.startsWith("migrations/") ||
      filePath === "payload.config.ts" ||
      filePath === "next.config.ts")
  );
}

function addViolation(violations, guard, filePath, message) {
  violations.push(`Guard ${guard}: ${message}: ${filePath}`);
}

function extractFirstObjectLiteral(source, fromIndex) {
  const start = source.indexOf("{", fromIndex);
  if (start < 0) return null;

  let depth = 0;
  let inString = null;
  let escaped = false;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === inString) inString = null;
      continue;
    }
    if (char === "'" || char === '"') {
      inString = char;
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }

  return null;
}

function isExactDependencyVersion(name, version) {
  if (name.startsWith("@more-i-gory/") && version === "workspace:*") return true;
  return exactVersionPattern.test(version);
}

function configurableFetchArguments(content) {
  return [...content.matchAll(/\bfetch\s*\(\s*([^,\n)]+)/g)]
    .map((match) => match[1].trim())
    .filter((argument) => {
      if (/^["'][^"']*["']$/.test(argument)) return false;
      if (/^`[^`$]*`$/.test(argument)) return false;
      return true;
    });
}

function processEnvKeys(content) {
  const keys = [];
  for (const match of content.matchAll(/\bprocess\.env(?:\.([A-Z0-9_]+)|\[["']([A-Z0-9_]+)["']\])/g)) {
    keys.push(match[1] ?? match[2]);
  }
  return keys;
}

function moduleSpecifiers(content) {
  return [...content.matchAll(moduleSpecifierPattern)].map((match) => match[1]);
}

function isRelativeSpecifier(specifier) {
  return specifier.startsWith(".");
}

function isForbiddenUiSpecifier(specifier) {
  return (
    specifier === "@payload-config" ||
    specifier === "payload" ||
    specifier.startsWith("payload/") ||
    specifier.startsWith("@payloadcms/") ||
    specifier === "pg" ||
    specifier.startsWith("pg/") ||
    specifier === "postgres" ||
    specifier.startsWith("postgres/") ||
    specifier === "drizzle-orm" ||
    specifier.startsWith("drizzle-orm/") ||
    specifier === "@prisma/client" ||
    specifier === "prisma" ||
    specifier.startsWith("@/project/") ||
    specifier.startsWith("@/core/data-access/")
  );
}

const registeredPresentationAdapters = new Set();

function isPresentationLayer(filePath) {
  return filePath.startsWith("src/components/") || filePath.startsWith("src/ui/");
}

function isForbiddenPresentationSpecifier(specifier) {
  return (
    specifier === "@/payload-types" ||
    specifier.startsWith("@/payload-types/") ||
    specifier === "payload" ||
    specifier.startsWith("payload/") ||
    specifier.startsWith("@payloadcms/") ||
    specifier.startsWith("@/project/") ||
    specifier.startsWith("@/core/data-access/")
  );
}

function isForbiddenSeoSpecifier(specifier) {
  return (
    specifier === "@payload-config" ||
    specifier === "payload" ||
    specifier.startsWith("payload/") ||
    specifier.startsWith("@payloadcms/") ||
    /(?:^|\/)payload\.config(?:\.[cm]?[jt]s)?$/.test(specifier)
  );
}

function isForbiddenUiDependency(name) {
  return (
    name === "payload" ||
    name.startsWith("@payloadcms/") ||
    name === "pg" ||
    name === "postgres" ||
    name === "drizzle-orm" ||
    name === "@prisma/client" ||
    name === "prisma"
  );
}

function arbitraryDesignLiterals(content) {
  return [...content.matchAll(arbitraryDesignLiteralPattern)]
    .map((match) => match[1])
    .filter((token) => !isAllowedStructuralLiteral(token));
}

function isAllowedStructuralLiteral(token) {
  return (
    /grid-cols-\[(?:\d+(?:\.\d+)?fr|auto)(?:_(?:\d+(?:\.\d+)?fr|auto))*\]$/.test(token) ||
    /rounded-\[min\(var\(--radius-md\),\d+px\)\]$/.test(token) ||
    /rounded-\[4px\]$/.test(token) ||
    /text-\[0\.8rem\]$/.test(token) ||
    /ring-\[3px\]$/.test(token)
  );
}

export function findArchitectureGuardViolations({ files, manifests }) {
  const violations = [];

  for (const entry of files) {
    const filePath = normalizePath(entry.path);
    const content = entry.content;
    if (!isProductionCode(filePath)) continue;

    if (/\boverrideAccess\s*:\s*true\b/.test(content) && !privilegedSystemFiles.has(filePath)) {
      addViolation(violations, 1, filePath, "overrideAccess:true outside registered System Gateway");
    }

    localApiCallPattern.lastIndex = 0;
    for (const match of content.matchAll(localApiCallPattern)) {
      const objectLiteral = extractFirstObjectLiteral(content, match.index ?? 0);
      if (!objectLiteral || !/\boverrideAccess\s*:\s*(true|false)\b/.test(objectLiteral)) {
        addViolation(violations, 1, filePath, "Local API call without explicit overrideAccess");
      }
    }

    if (
      payloadJobsCollectionAccessPattern.test(content) &&
      filePath !== "src/core/data-access/system/jobs.ts"
    ) {
      addViolation(violations, 1, filePath, "payload-jobs access must go through trusted System Gateway jobs recovery");
    }

    const lowLevelDbAllowed =
      filePath.startsWith("src/core/data-access/ingest/") ||
      filePath.startsWith("src/core/data-access/optimized-read/") ||
      filePath.startsWith("migrations/") ||
      filePath === "payload.config.ts";
    if (!lowLevelDbAllowed && lowLevelDbImportPattern.test(content)) {
      addViolation(violations, 2, filePath, "low-level DB import is outside approved data-access layers");
    }

    const publicContractPath =
      filePath.startsWith("src/core/data-access/public/") ||
      filePath.startsWith("packages/contracts/");
    if (publicContractPath && privateFieldPattern.test(content)) {
      addViolation(violations, 3, filePath, "private field is present in a public DTO or select");
    }

    const hasWildcardCors =
      /\bcors\s*:\s*(?:["']\*["']|\[\s*["']\*["']\s*\])/.test(content) ||
      /\borigin\s*:\s*["']\*["']/.test(content) ||
      /Access-Control-Allow-Origin["']?\s*[:,]\s*["']\*/.test(content);
    if (hasWildcardCors) {
      addViolation(violations, 4, filePath, "wildcard CORS is forbidden");
    }

    if (
      (filePath.startsWith("src/") || filePath.startsWith("packages/")) &&
      !filePath.startsWith("src/core/security/outbound-http/") &&
      configurableFetchArguments(content).length > 0
    ) {
      addViolation(violations, 6, filePath, "configurable fetch must use Safe Outbound Client");
    }

    const envKeys = processEnvKeys(content);
    if (envKeys.length > 0) {
      const approvedEnvLayer =
        filePath === "src/project/env.ts" ||
        filePath === "payload.config.ts" ||
        (filePath === "next.config.ts" && envKeys.every((key) => ["S3_BUCKET", "S3_ENDPOINT"].includes(key))) ||
        (filePath.startsWith("src/ui/interactive/") && envKeys.every((key) => key.startsWith("NEXT_PUBLIC_")));
      if (!approvedEnvLayer) {
        addViolation(
          violations,
          7,
          filePath,
          `process.env access is outside approved env layer (${envKeys.join(", ")})`,
        );
      }
    }

    const nextHeadersRestricted =
      filePath.startsWith("src/core/ingest/") ||
      filePath.startsWith("src/core/cache/") ||
      filePath.includes("/jobs/") ||
      /(?:^|\/)job-handler\.(?:ts|tsx)$/.test(filePath);
    if (nextHeadersRestricted && /from\s+["']next\/headers["']/.test(content)) {
      addViolation(violations, 8, filePath, "next/headers is forbidden in cache, ingest and job handlers");
    }

    if (filePath.startsWith("packages/contracts/")) {
      for (const specifier of moduleSpecifiers(content)) {
        if (!isRelativeSpecifier(specifier) && specifier !== "zod") {
          addViolation(violations, 9, filePath, `packages/contracts may import only relative modules and zod, got ${specifier}`);
        }
      }
    }

    if (filePath.startsWith("packages/ui/")) {
      for (const specifier of moduleSpecifiers(content)) {
        if (isForbiddenUiSpecifier(specifier)) {
          addViolation(violations, 9, filePath, `packages/ui must not depend on persistence or project data layers, got ${specifier}`);
        }
      }
    }

    if (isPresentationLayer(filePath) && !registeredPresentationAdapters.has(filePath)) {
      for (const specifier of moduleSpecifiers(content)) {
        if (isForbiddenPresentationSpecifier(specifier)) {
          addViolation(
            violations,
            9,
            filePath,
            `presentation layer must not import Payload, project env or Public Gateway, got ${specifier}`,
          );
        }
      }
    }

    if (filePath.startsWith("src/seo/")) {
      for (const specifier of moduleSpecifiers(content)) {
        if (isForbiddenSeoSpecifier(specifier)) {
          addViolation(violations, 12, filePath, `SEO layer must read CMS data through Public Gateway, got ${specifier}`);
        }
      }
    }

    const isPublicRegionsReader =
      filePath.startsWith("src/core/data-access/public/") &&
      /\bcollection\s*:\s*["']regions["']/.test(content) &&
      /\bpayload(?:\?\.|\.)find\s*(?:\?\.)?\s*\(/.test(content);
    if (isPublicRegionsReader && !/\bstatus\s*:\s*\{\s*equals\s*:\s*["']published["']\s*\}/s.test(content)) {
      addViolation(violations, 13, filePath, "public regions reader requires status=published at the query boundary");
    }

    if (darkVariantPattern.test(content)) {
      addViolation(violations, 10, filePath, "dark variant is forbidden while project dark mode is disabled");
    }

    const isGlobalsCss = filePath === "src/app/(site)/globals.css";
    if (isGlobalsCss && /@custom-variant\s+dark|^\.dark\s*\{/m.test(content)) {
      addViolation(violations, 10, filePath, "dark-mode foundation is forbidden while project dark mode is disabled");
    }

    if (!isGlobalsCss) {
      const arbitraryLiterals = arbitraryDesignLiterals(content);
      if (rawDesignColorPattern.test(content) || arbitraryLiterals.length > 0) {
        addViolation(
          violations,
          11,
          filePath,
          `design literals must live in globals.css or the structural allowlist (${arbitraryLiterals.join(", ") || "raw color"})`,
        );
      }
    }
  }

  for (const entry of manifests) {
    const filePath = normalizePath(entry.path);
    for (const section of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
      for (const [name, version] of Object.entries(entry.manifest[section] ?? {})) {
        if (!isExactDependencyVersion(name, version)) {
          addViolation(violations, 5, filePath, `${section}.${name} must use an exact version, got ${version}`);
        }

        if (filePath === "packages/contracts/package.json" && name !== "zod") {
          addViolation(violations, 9, filePath, `packages/contracts package dependencies are limited to zod, got ${name}`);
        }

        if (filePath === "packages/ui/package.json" && isForbiddenUiDependency(name)) {
          addViolation(violations, 9, filePath, `packages/ui package.json must not depend on persistence packages, got ${name}`);
        }
      }
    }
  }

  return violations;
}

export function assertArchitectureGuards(snapshot) {
  const violations = findArchitectureGuardViolations(snapshot);
  if (violations.length > 0) {
    throw new Error(violations.join("\n"));
  }
}

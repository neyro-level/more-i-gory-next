#!/usr/bin/env bash
set -eu

required_docs=(
  AGENTS.md
  docs/README.md
  docs/01_PRD.md
  docs/02_PRODUCT_STRUCTURE.md
  docs/03_ARCHITECTURE.md
  docs/04_BACKLOG.md
  docs/05_RELEASE_CHECKLIST.md
  docs/06_DESIGN_SYSTEM.md
  docs/PROJECT.md
  docs/DESIGN.md
  docs/OPERATIONS.md
  docs/adr/ADR-004-realty-platform-runtime.md
  docs/adr/ADR-005-crimea-core-ia.md
  docs/adr/ADR-006-regions-collection.md
  docs/adr/ADR-007-link-runtime-policy.md
  docs/adr/ADR-008-image-pipeline.md
  docs/adr/ADR-009-deferred-ingest.md
  docs/adr/ADR-010-analytics-journal-module.md
)

for document in "${required_docs[@]}"; do
  test -f "$document" || { echo "Missing required document: $document"; exit 1; }
done

echo "Required project documents are present."

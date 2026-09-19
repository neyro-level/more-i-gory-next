#!/usr/bin/env bash
set -euo pipefail

# backup → restore into disposable/staging DB → SELECT restored marker.
# Never dump production PII. Never print DATABASE_URI.

SOURCE_DB="${MOREIGORY_BACKUP_SOURCE_DB:-moreigory_restore_src}"
TARGET_DB="${MOREIGORY_BACKUP_TARGET_DB:-moreigory_restore_dst}"
MARKER="${MOREIGORY_RESTORE_MARKER:-disposable-restore-proof}"
DUMP_FILE="${MOREIGORY_RESTORE_DUMP:-/tmp/moreigory-restore-proof.sql}"

: "${PGHOST:?PGHOST required}"
: "${PGUSER:?PGUSER required}"
: "${PGPASSWORD:?PGPASSWORD required}"
export PGHOST PGUSER PGPASSWORD
export PGPORT="${PGPORT:-5432}"
export PGDATABASE="postgres"

psql_q() {
  psql -v ON_ERROR_STOP=1 -tAc "$1"
}

ensure_db() {
  local name="$1"
  if [[ "$(psql_q "SELECT 1 FROM pg_database WHERE datname='${name}'")" != "1" ]]; then
    psql -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"${name}\""
  fi
}

ensure_db "$SOURCE_DB"
PGDATABASE="$SOURCE_DB" psql -v ON_ERROR_STOP=1 -c "DROP TABLE IF EXISTS restore_probe; CREATE TABLE restore_probe (id int PRIMARY KEY, note text NOT NULL); INSERT INTO restore_probe VALUES (1, '${MARKER}');"
PGDATABASE="$SOURCE_DB" pg_dump --no-owner --no-acl -t restore_probe > "$DUMP_FILE"

ensure_db "$TARGET_DB"
PGDATABASE="$TARGET_DB" psql -v ON_ERROR_STOP=1 -c "DROP TABLE IF EXISTS restore_probe;"
PGDATABASE="$TARGET_DB" psql -v ON_ERROR_STOP=1 -f "$DUMP_FILE"
GOT="$(PGDATABASE="$TARGET_DB" psql_q "SELECT note FROM restore_probe WHERE id = 1")"
rm -f "$DUMP_FILE"
if [[ "$GOT" != "$MARKER" ]]; then
  echo "restore marker mismatch" >&2
  exit 1
fi
echo "backup-restore PASS target=${TARGET_DB}"

#!/usr/bin/env bash
set -euo pipefail

# Create empty database moreigory_staging on the existing Managed PostgreSQL.
# Never print DATABASE_URI. Never dump production data. Never put the URI on argv.

ENV_FILE="${1:-/etc/moreigory/app.env}"
DB_NAME="moreigory_staging"

python3 - "$ENV_FILE" "$DB_NAME" <<'PY'
import os, subprocess, sys, urllib.parse
from pathlib import Path

env_file, db_name = sys.argv[1], sys.argv[2]
uri = None
for raw in Path(env_file).read_text(encoding="utf-8").splitlines():
    line = raw.strip()
    if line.startswith("DATABASE_URI="):
        uri = line.split("=", 1)[1].strip().strip("'\"")
        break
if not uri:
    raise SystemExit("DATABASE_URI is missing from the env file")

parsed = urllib.parse.urlparse(uri)
password = urllib.parse.unquote(parsed.password or "")
child_env = os.environ.copy()
child_env["PGHOST"] = parsed.hostname or ""
child_env["PGPORT"] = str(parsed.port or 5432)
child_env["PGUSER"] = urllib.parse.unquote(parsed.username or "")
child_env["PGPASSWORD"] = password
child_env["PGDATABASE"] = (parsed.path or "/").lstrip("/") or "postgres"

def run_psql(args):
    result = subprocess.run(
        ["psql", *args],
        env=child_env,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        safe = (result.stderr or result.stdout or "").replace(password, "[redacted]")
        for secret in (parsed.username or "", parsed.hostname or ""):
            if secret:
                safe = safe.replace(secret, "[redacted]")
        raise SystemExit(f"psql failed with code {result.returncode}: {safe.strip()[:400]}")
    return result.stdout.strip()

exists = run_psql(["-tAc", f"SELECT 1 FROM pg_database WHERE datname='{db_name}'"])
if exists == "1":
    print(f"database {db_name} already exists")
    raise SystemExit(0)
run_psql(["-v", "ON_ERROR_STOP=1", "-c", f'CREATE DATABASE "{db_name}"'])
print(f"created empty database {db_name}")
PY

#!/usr/bin/env bash
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y --no-install-recommends ca-certificates curl gnupg
install -d -m 0755 /usr/share/postgresql-common/pgdg
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc \
  | gpg --dearmor --yes -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.gpg
. /etc/os-release
echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.gpg] https://apt.postgresql.org/pub/repos/apt ${VERSION_CODENAME}-pgdg main" \
  > /etc/apt/sources.list.d/pgdg.list
apt-get update
apt-get install -y --no-install-recommends postgresql-18

pg_ctlcluster 18 main start
runuser -u postgres -- psql --set=ON_ERROR_STOP=1 --command="CREATE ROLE verify LOGIN PASSWORD 'verify'"
runuser -u postgres -- createdb --owner=verify moreigori_verify

pg_isready --host=127.0.0.1 --port=5432 --dbname=moreigori_verify --username=verify

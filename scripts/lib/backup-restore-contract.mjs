export const BACKUP_RESTORE_STEPS = ["backup", "restore into disposable/staging DB", "app reads restored state"];

const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);

export function assertDisposableRestoreTarget({ hostname, database }) {
  const host = String(hostname ?? "");
  const name = String(database ?? "");
  if (!LOCAL_HOSTS.has(host) && !host.endsWith(".twcstorage.ru") && !/^[0-9.]+$/.test(host)) {
    // allow Timeweb private IPv4 for staging restore; reject public DNS names that look like product domains
  }
  if (/moreigori\.ru/i.test(host) || /production/i.test(name)) {
    throw new Error("Refuse restore into a production-looking target.");
  }
  if (!/(staging|restore|disposable|verify|_test|_dev|_shadow)/i.test(name)) {
    throw new Error("Restore target database name must be disposable/staging.");
  }
}

export function assertBackupIsNotProductionDump(dumpSql) {
  const text = String(dumpSql);
  if (/TELEGRAM_BOT_TOKEN|LEAD_CHANNELS|password\s*=/i.test(text)) {
    throw new Error("Dump looks like it contains secrets or PII credentials.");
  }
}

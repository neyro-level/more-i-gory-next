export function parseSixFieldCron(cron) {
  const fields = String(cron).trim().split(/\s+/);
  if (fields.length !== 6) {
    throw new Error(`Cron must use six Payload fields: ${cron}`);
  }

  return {
    dayOfMonth: fields[3],
    dayOfWeek: fields[5],
    hours: fields[2],
    minutes: fields[1],
    month: fields[4],
    raw: cron,
    seconds: fields[0],
  };
}

export function assertSafeScheduledCron(cron) {
  const parsed = parseSixFieldCron(cron);

  if (parsed.seconds === "*") {
    throw new Error(`Seconds field '*' creates a per-second schedule: ${cron}`);
  }

  if (cron.includes("*/")) {
    throw new Error(`Cron step dialect must be 0/N, not */N: ${cron}`);
  }

  return parsed;
}

export function extractSixFieldCronLiterals(source) {
  const literals = [];
  const pattern = /"((?:[^"\s]+ ){5}[^"\s]+)"/g;

  for (const match of String(source).matchAll(pattern)) {
    const candidate = match[1];
    try {
      parseSixFieldCron(candidate);
      literals.push(candidate);
    } catch {
      // Ignore non-cron six-token strings.
    }
  }

  return literals;
}

export function firesPerHour(cron) {
  const parsed = assertSafeScheduledCron(cron);
  if (parsed.minutes === "*" && parsed.hours === "*") {
    throw new Error(`Cron would fire more than once per minute: ${cron}`);
  }

  const minuteStep = parsed.minutes.match(/^0\/(\d+)$/);
  if (minuteStep && parsed.hours === "*") {
    return Math.floor(60 / Number(minuteStep[1]));
  }

  if (/^\d+$/.test(parsed.minutes) && parsed.hours === "*") {
    return 1;
  }

  if (/^\d+$/.test(parsed.minutes) && /^\d+$/.test(parsed.hours)) {
    return 1 / 24;
  }

  throw new Error(`Unsupported frequency assertion for ${cron}`);
}

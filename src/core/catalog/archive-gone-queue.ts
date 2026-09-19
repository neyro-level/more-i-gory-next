import type { ArchivedPropertyAction } from "../data-access/public/properties-contract.ts";

const ARCHIVE_GONE_HEADING = "## TASK 28.4 — Archived 410 URLs";

export function archiveGonePaths(
  entries: readonly Readonly<{ action: ArchivedPropertyAction; slug: string }>[],
): readonly string[] {
  return entries
    .filter((entry) => entry.action.kind === "gone")
    .map((entry) => `/obekty/${entry.slug}/`);
}

export function formatArchiveGoneOwnerQueue(paths: readonly string[]): string {
  const rows =
    paths.length === 0
      ? "| — | — | Правило 410 действует; expired URL без однозначной замены пока нет | Точечный 301 после EPIC 32 | нет |"
      : paths
          .map(
            (path) =>
              `| TASK 28.4 | Назначить точечный 301 для \`${path}\`, если нужна замена | Автономно выдан 410, без массового редиректа на \`/obekty/\` | После owner URL — отдельный redirect | нет |`,
          )
          .join("\n");

  return `${ARCHIVE_GONE_HEADING}

Список URL, где после retention нет однозначной замены (тот же тип + тот же комплекс или регион). Массовый 301 на листинг запрещён.

| Источник | Что требуется | Что уже сделано автономно | После решения | Блокирует release |
|---|---|---|---|---|
${rows}
`;
}

export function upsertArchiveGoneOwnerQueue(markdown: string, paths: readonly string[]): string {
  const section = formatArchiveGoneOwnerQueue(paths);
  if (markdown.includes(ARCHIVE_GONE_HEADING)) {
    return markdown.replace(new RegExp(`${ARCHIVE_GONE_HEADING}[\\s\\S]*?(?=\\n## |$)`), `${section.trimEnd()}\n\n`);
  }
  return `${markdown.trimEnd()}\n\n${section}`;
}

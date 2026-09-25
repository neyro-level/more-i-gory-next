# ADR-014: Code-owned и Payload-owned content

Status: Accepted
Date: 2026-09-25

## Context

Проект одновременно содержит проверенный code-owned контент и редакционные
сущности Payload. Неявный fallback между ними скрывал недоступность CMS и мог
показывать seed вместо фактического staging-состояния.

## Decision

- `src/content/**` владеет только явно code-owned материалами: статическими
  текстами, редакционными seed fixtures и подтверждёнными публичными фактами.
- Payload владеет изменяемыми редакционными сущностями: regions, properties,
  newbuilds, developers и site chrome.
- Staging editorial preview по умолчанию использует Payload через Public
  Gateway и `overrideAccess: false`.
- `AMS_EDITORIAL_PREVIEW=seed` разрешён только локально, без production contour
  и без database connection. Seed создаёт отсутствующее и не перезаписывает
  существующее.
- Недоступность Payload в payload-mode является наблюдаемой ошибкой и не
  маскируется code-owned seed.

## Consequences

- редактор видит в preview фактическое CMS-состояние;
- URL остаются одинаковыми для preview и будущего production;
- изменение ownership требует отдельного ADR или обновления этого решения;
- production, real leads и jobs этим ADR не разрешаются.

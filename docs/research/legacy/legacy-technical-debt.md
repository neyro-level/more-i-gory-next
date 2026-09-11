# Technical Debt Register — «Море и Горы»

**Статус:** Superseded — technical debt перенесён в `../../04_BACKLOG.md`
**Версия:** 1.1
**Дата:** 2026-09-11

Будущая функция не считается техническим долгом. Здесь только сознательные
компромиссы уже существующей реализации.

## TD-001 — Custom post-export Next runtime stripping

Status: Accepted
Severity: Medium

Маркетинговые HTML-файлы освобождаются от Next runtime после сборки. Это даёт
нулевой initial JS на server-only routes, но является проектным post-processing,
а не официальным режимом Next.js.

Контроль: только обычные document links, artifact validation, browser/hydration
smoke перед release. Пересмотреть при смене Next.js или появлении интерактивности
на server-only маршрутах.

## TD-002 — Release automation is not implemented

Status: Open
Severity: High for production, none for local development

Есть static artifact и пример Nginx, но нет доказанного versioned upload,
atomic switch и rollback runbook. Production запрещён до отдельного release
stream и proof на целевом сервере.

## TD-003 — Draft article shells exist in preview artifact

Status: Accepted during content stage
Severity: Low

Пять первых экранов статей собираются для согласования, но имеют `noindex` и не
попадают в sitemap. Перед production каждый материал либо проходит editorial
gate, либо исключается из release artifact.

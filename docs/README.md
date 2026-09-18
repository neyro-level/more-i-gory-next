# Документация проекта «Море и Горы»

**Статус:** Active
**Версия:** 2.3 After EPIC 12
**Дата:** 2026-09-18
**Стандарт:** AMS Product Development Standard 2.0

## Что создаём

«Море и Горы» — публичный Next.js-сайт инвестиционного бюро
курортной недвижимости. Он помогает сравнить регионы и проекты, проверить
экономику, риски и сценарий выхода, а затем перейти к персональному разбору.

## Бизнес-цель

Получать релевантный органический спрос по инвестиционной курортной недвижимости
и превращать его в квалифицированные обращения без неподтверждённых обещаний
доходности, кейсов или рыночного лидерства.

## Текущий статус

- `origin/main` закрыт по EPIC 12: Payload/PostgreSQL, gateways, media/S3,
  regions, properties, newbuild/ingest/catalog, leads/delivery/maintenance и
  standalone artifact;
- публичный `ContentService` всё ещё читает локальные JSON/Markdown adapters;
  `PayloadContentRepository` зарезервирован и не включён;
- production не выпускался; technical preview — `more-previu.tw1.ru`;
- коммерческие и аналитические страницы остаются под content/trust/index gate;
- Managed PostgreSQL staging/production и Nginx cutover — EPIC 13 / human gates.

## Audit / remediation baseline

Программа `more-i-gory-remediation-2026-09` v6 идёт **поверх** этого SHA, а не
вместо него. Новые ветки эпиков 19–33 и 13 ответвляются от актуального
`origin/main`, который на момент фиксации совпадает с baseline.

```text
BASE_SHA=27ea4c2393e970797da50c7dc78b614f815820bb
PROFILE=REALTY_BASE
TARGET_CORE=AMS Realty Platform 5.5
UI_CORE=AMS UI Core 5.0
```

| Поле | Значение |
|---|---|
| Canonical main | SourceCraft `integrator-p/more-i-gory-next` @ `27ea4c2` |
| Профиль | `AMS_PROFILE=REALTY_BASE`, режим BUILD |
| Техническая конституция | [`AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md`](AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md) |
| UI-конституция | [`AMS_UI_CORE_v5.0_FINAL.md`](AMS_UI_CORE_v5.0_FINAL.md) |
| Мастер-план | [`More-i-gory-plan №2.md`](More-i-gory-plan%20№2.md) v6 APPROVED |

Нельзя описывать последующую работу как «до Payload» или как новый foundation
ниже этого SHA.

## Platform contract

Текущее реализованное состояние — Next.js + Payload в одном Node.js runtime,
Payload Admin, users/jobs schema и migrations-only PostgreSQL adapter. Целевая
модель — `AMS_PROFILE=REALTY_BASE`, Managed PostgreSQL + S3; решение
зафиксировано в [`ADR-004`](adr/ADR-004-realty-platform-runtime.md). Переходный
статус и exact-версии находятся в [`03_ARCHITECTURE.md`](03_ARCHITECTURE.md).

`DELIVERY_PROFILE = COMMERCIAL`.

## Source of Truth

| Область | Source of Truth |
|---|---|
| Продукт, аудитория, требования и ключевые риски | [`01_PRD.md`](01_PRD.md) |
| Страницы, URL, SEO, навигация, формы и user flows | [`02_PRODUCT_STRUCTURE.md`](02_PRODUCT_STRUCTURE.md) |
| Stack, modules, content/data, integrations, security и production | [`03_ARCHITECTURE.md`](03_ARCHITECTURE.md) |
| Project-specific профиль Realty Platform, среды, модули и human gates | [`PROJECT.md`](PROJECT.md) |
| Юридические и публичные контактные данные владельца сайта | [`LEGAL_DETAILS.md`](LEGAL_DETAILS.md) |
| Короткие UI-relevant runtime facts и verification cadence | [`TECHNICAL_CORE.md`](TECHNICAL_CORE.md) |
| NOW / NEXT / LATER, Epic, Task и technical debt | [`04_BACKLOG.md`](04_BACKLOG.md) |
| Release readiness и post-deploy proof | [`05_RELEASE_CHECKLIST.md`](05_RELEASE_CHECKLIST.md) |
| Визуальный язык, tokens и UI-компоненты | [`06_DESIGN_SYSTEM.md`](06_DESIGN_SYSTEM.md) |
| Адаптер дизайн-решений Realty Platform к визуальному канону проекта | [`DESIGN.md`](DESIGN.md) |
| Операционный runbook: deploy, rollback, backup, imports, leads и incidents | [`OPERATIONS.md`](OPERATIONS.md) |
| Труднообратимые решения | [`adr/`](adr/) |
| Исследования и исторические evidence | [`research/`](research/) |
| Техническая конституция стека | [`AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md`](AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md) |
| UI-конституция | [`AMS_UI_CORE_v5.0_FINAL.md`](AMS_UI_CORE_v5.0_FINAL.md) |
| Очередь отложенных решений | [`OWNER_QUEUE.md`](OWNER_QUEUE.md) |

Research объясняет причины решений, но не является параллельным Source of Truth.
Встроенные статусы старых файлов внутри `research/legacy/` являются историческими
и отменены общим статусом каталога.

## Approved exceptions

Сознательное отклонение от конституций допускается (ориентир — редкие проектные
исключения), но только письменно: что отклонено, почему, где зафиксировано.
Молчаливое расхождение — дефект. Живые записи ведутся в [`OWNER_QUEUE.md`](OWNER_QUEUE.md)
и профильном ADR; этот раздел не копирует конституции.

Пока записей нет.

## Как работать с проектом

1. Прочитать корневой `AGENTS.md`.
2. Прочитать эту карту.
3. Открыть только профильный Source of Truth текущей задачи.
4. Проверить READY Task в `04_BACKLOG.md`.
5. При труднообратимом решении открыть профильный ADR.

Новый индексируемый URL сначала фиксируется в `02_PRODUCT_STRUCTURE.md`.
Изменение stack, runtime, CMS, storage, auth или production topology сначала
фиксируется в `03_ARCHITECTURE.md` и при необходимости в ADR.

## Current Focus

NOW: EPIC 13 — Nginx, runtime, backup/restore и operations proof на preview-домене.
Следующие эпики — только по dependency graph; EPIC 14/18 и production release
не стартуют из этого документа автоматически.
Атомарное состояние программы ведётся в локальном Beads-графе, Backlog остаётся
верхним source of truth. Production не выпускался и текущим потоком не разрешён.

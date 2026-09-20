# Документация проекта «Море и Горы»

**Статус:** Active
**Версия:** 3.1 — Plan №3 v2 production-readiness program
**Дата:** 2026-09-20
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

- execution baseline Plan №3 v2 — exact `origin/main`
  `c824e9fa02ecfe370c859a851e3c0e0cedd48667` перед EPIC 45; он включает
  EPIC 43, content fact foundation EPIC 51 и migration repair EPIC 44;
- публичный read идёт через Public Gateway / Payload Local API и DTO;
  при недоступности БД действует безопасный fallback, не local JSON adapters;
- production не выпускался; technical preview — `more-previu.tw1.ru`;
- коммерческие и аналитические страницы остаются под content/trust/index gate;
- чистая цепочка из 26 migrations и upgrade fixture доказаны; staging/restore
  ресурс, property enum drift, ротация credentials и cutover `moreigori.ru`
  остаются в [`OWNER_QUEUE.md`](OWNER_QUEUE.md);
- production относится только к EPIC 55–56 и не разрешён текущей программой.

## Audit / remediation baseline

Plan №3 v2 **APPROVED** исполняется по EPIC 44–54. EPIC 55–56 остаются
вне текущего implementation-loop и требуют отдельной release-команды владельца.

```text
CODE_BASELINE=c824e9fa02ecfe370c859a851e3c0e0cedd48667  # exact origin/main после EPIC 44
PROFILE=REALTY_BASE
TARGET_CORE=AMS Realty Platform 5.5
UI_CORE=AMS UI Core 5.0
```

| Поле | Значение |
|---|---|
| Code baseline | SourceCraft `integrator-p/more-i-gory-next` @ `c824e9fa02ecfe370c859a851e3c0e0cedd48667` |
| Профиль | `AMS_PROFILE=REALTY_BASE`, режим BUILD |
| Техническая конституция | [`AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md`](AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md) |
| UI-конституция | [`AMS_UI_CORE_v5.0_FINAL.md`](AMS_UI_CORE_v5.0_FINAL.md) |
| Активный мастер-план | [`MORE_I_GORY_PLAN_№ 3.md`](MORE_I_GORY_PLAN_№%203.md) v2 APPROVED |
| Активный машинный inventory | [`task-manager-inventory.plan3.v2.json`](task-manager-inventory.plan3.v2.json); consumer: `Invoke-AmsMasterPlan.ps1` → Beads `.beads` |
| История | [`More-i-gory-plan №2.md`](More-i-gory-plan%20№2.md) и `task-manager-inventory.v6.json`; новые задачи из них не создаются |
| Указатель волны | [`DELIVERY_STATE.yaml`](DELIVERY_STATE.yaml) |

Нельзя описывать текущий `main` как «до Payload» или как состояние после EPIC 12.

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
| Труднообратимые решения | [`adr/README.md`](adr/README.md) |
| Очередь отложенных решений перед production | [`OWNER_QUEUE.md`](OWNER_QUEUE.md) |
| Техническая конституция стека | [`AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md`](AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md) |
| UI-конституция | [`AMS_UI_CORE_v5.0_FINAL.md`](AMS_UI_CORE_v5.0_FINAL.md) |

Research объясняет причины решений, но не является параллельным Source of Truth.
Встроенные статусы старых файлов внутри `research/legacy/` являются историческими
и отменены общим статусом каталога.

Текущий входящий пакет недостающих business facts —
[`CONTENT_FACT_PACKET.md`](CONTENT_FACT_PACKET.md). Это рабочий evidence intake,
а не Source of Truth; подтверждённые сведения переносятся в канон или Payload
entity.

## Approved exceptions

Активные исключения и их владельцы перечислены в [`DESIGN.md`](DESIGN.md).
Текущее исключение: experimental `globalNotFound` для двух root layouts;
обоснование и условие пересмотра зафиксированы там же. Молчаливое расхождение
с конституциями остаётся дефектом.

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

NOW: Plan №3 v2 EPIC 45–54 — canonical state, staging/security, preview,
observability, content and release-candidate evidence. EPIC 44 и EPIC 51 уже
смержены; отдельные внешние решения перечислены в [`OWNER_QUEUE.md`](OWNER_QUEUE.md).
EPIC 55–56 и production не стартуют из этого документа автоматически.
Атомарное состояние программы ведётся в локальном Beads-графе, Backlog остаётся
верхним source of truth. Production не выпускался и текущим потоком не разрешён.

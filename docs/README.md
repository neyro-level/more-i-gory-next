# Документация проекта «Море и Горы»

**Статус:** Active
**Версия:** 3.7 — Plan №4 technical implementation complete
**Дата:** 2026-09-23
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

- Plan №4 EPIC 60–66 смержены; technical-preview candidate собран из
  `cfcc784f61bf9cbfe03f06dc4b724c8dac8b3452`;
- публичный read идёт через Public Gateway / Payload Local API и DTO;
  при недоступности БД действует безопасный fallback, не local JSON adapters;
- production не выпускался; technical preview — `more-previu.tw1.ru`;
- коммерческие и аналитические страницы остаются под content/trust/index gate;
- цепочка из 27 migrations, upgrade fixture, single-DB application proof,
  credential rotation, immutable preview runtime и rollback доказаны;
  единственная новая migration Payload применена на preview, owner login и
  live smoke прошли;
  restore явно отложен решением владельца в Plan №3 v3;
  актуальные deferred и next-plan inputs собраны в
  [`OWNER_QUEUE.md`](OWNER_QUEUE.md);
- exact-main RISKY gate 163, single-build run 164, digest, installed path и
  smoke зафиксированы в
  [`research/plan4-final-verification-evidence.md`](research/plan4-final-verification-evidence.md);
- production не разрешён; domain cutover, jobs, outbound channels и страницы
  не активировались.

## Audit / remediation baseline

Plan №4 v1 прошёл реализацию EPIC 60–67 и финальную техническую проверку.
SourceCraft API/Git восстановлены; exact-main candidate собран один раз и
установлен на существующий technical preview. Production планом не разрешён.

```text
CODE_BASELINE=cfcc784f61bf9cbfe03f06dc4b724c8dac8b3452  # Plan №4 EPIC 60–66 merged candidate
PROFILE=REALTY_BASE
TARGET_CORE=AMS Realty Platform 5.5
UI_CORE=AMS UI Core 5.0
```

| Поле | Значение |
|---|---|
| Code baseline | SourceCraft `integrator-p/more-i-gory-next` @ `b253bf50b40d76b75fdfe1aca235c55763db97a2` |
| Профиль | `AMS_PROFILE=REALTY_BASE`, режим BUILD |
| Техническая конституция | [`AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md`](AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md) |
| UI-конституция | [`AMS_UI_CORE_v5.0_FINAL.md`](AMS_UI_CORE_v5.0_FINAL.md) |
| Последний утверждённый мастер-план | [`AMS_MORE_I_GORY_GEO_FIRST_REMEDIATION_MASTER_PLAN_V5_0.md`](AMS_MORE_I_GORY_GEO_FIRST_REMEDIATION_MASTER_PLAN_V5_0.md) v1 APPROVED; execution active |
| Предыдущий план | [`MORE_I_GORY_PLAN_№ 4.md`](MORE_I_GORY_PLAN_№%204.md) v1 APPROVED / implementation complete |
| Машинный inventory текущего плана | [`task-manager-inventory.geo-first.v1.json`](task-manager-inventory.geo-first.v1.json); Plan ID `AMS-MORE-I-GORY-GEO-FIRST-INVESTMENT-REMEDIATION`, prefix `mggeo` |
| Исторический машинный inventory | [`task-manager-inventory.plan3.v3.json`](task-manager-inventory.plan3.v3.json); повторно не импортировать |
| История | [`MORE_I_GORY_PLAN_№ 3.md`](MORE_I_GORY_PLAN_№%203.md), [`More-i-gory-plan №2.md`](More-i-gory-plan%20№2.md) и `task-manager-inventory.v6.json`; новые задачи из них не создаются |
| Указатель волны | [`DELIVERY_STATE.yaml`](DELIVERY_STATE.yaml) |
| Baseline EPIC 68 | [`remediation/CURRENT_STATE_V5.md`](remediation/CURRENT_STATE_V5.md) |
| URL migration evidence EPIC 70 | [`migration/V5_URL_MANIFEST.json`](migration/V5_URL_MANIFEST.json) и [`migration/V5_URL_DECISIONS.md`](migration/V5_URL_DECISIONS.md) |

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

Отложенный владельцем пакет недостающих business facts —
[`CONTENT_FACT_PACKET.md`](CONTENT_FACT_PACKET.md). Это рабочий evidence intake,
а не Source of Truth. Текущий технический поток страницы и этот пакет не меняет.

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

NOW: GEO-first remediation v1, EPIC 68 baseline intake. Plan №4 остаётся
закрытой технической основой. Business facts по Крыму и четырём городам пока
`MISSING`: технические contracts/routes могут выполняться, но index activation
остаётся закрытой Content Gate. Production не выпускался и не разрешён.

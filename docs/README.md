# Документация проекта «Море и Горы»

**Статус:** Active
**Версия:** 3.6 — Plan №3 closed / Plan №4 v1 APPROVED
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

- Plan №3 v3 EPIC 44–54 смержены; итоговый зафиксированный `main` —
  `21e484c98503550dbfbcbef38eb2e9eecd8d8308` (PR 100);
- публичный read идёт через Public Gateway / Payload Local API и DTO;
  при недоступности БД действует безопасный fallback, не local JSON adapters;
- production не выпускался; technical preview — `more-previu.tw1.ru`;
- коммерческие и аналитические страницы остаются под content/trust/index gate;
- чистая цепочка из 26 migrations, upgrade fixture, single-DB application
  proof, credential rotation, immutable preview runtime и rollback доказаны;
  restore явно отложен решением владельца в Plan №3 v3;
  актуальные deferred и next-plan inputs собраны в
  [`OWNER_QUEUE.md`](OWNER_QUEUE.md);
- исходные per-task `EXECUTION_LEDGER_V1` EPIC 54 не сохранились после
  восстановления локального Task Manager; merge/gate подтверждены, но exact-main
  digest/install/smoke остаётся отдельным evidence-входом следующего технического
  плана;
- production не разрешён; EPIC 55–56 не импортировались и не являются активной
  программой.

## Audit / remediation baseline

Plan №3 v3 **APPROVED / CLOSED**: EPIC 44–54 закрыты, активных задач этого
Plan ID в Task Manager нет. Следующая техническая программа собрана в
[`MORE_I_GORY_PLAN_№ 4.md`](MORE_I_GORY_PLAN_№%204.md) как **v1 APPROVED**.
Final audit дал `READY_WITH_LIMITS`; единственное ограничение — SourceCraft
HTTP 401 до восстановления PAT. Production планом не разрешён.

```text
CODE_BASELINE=21e484c98503550dbfbcbef38eb2e9eecd8d8308  # Plan №3 closeout / PR 100
PROFILE=REALTY_BASE
TARGET_CORE=AMS Realty Platform 5.5
UI_CORE=AMS UI Core 5.0
```

| Поле | Значение |
|---|---|
| Code baseline | SourceCraft `integrator-p/more-i-gory-next` @ `21e484c98503550dbfbcbef38eb2e9eecd8d8308` |
| Профиль | `AMS_PROFILE=REALTY_BASE`, режим BUILD |
| Техническая конституция | [`AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md`](AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md) |
| UI-конституция | [`AMS_UI_CORE_v5.0_FINAL.md`](AMS_UI_CORE_v5.0_FINAL.md) |
| Последний утверждённый мастер-план | [`MORE_I_GORY_PLAN_№ 3.md`](MORE_I_GORY_PLAN_№%203.md) v3 APPROVED / CLOSED |
| Следующий технический план | [`MORE_I_GORY_PLAN_№ 4.md`](MORE_I_GORY_PLAN_№%204.md) v1 APPROVED; inventory schema v2 |
| Машинный inventory Plan №4 | [`task-manager-inventory.plan4.v1.json`](task-manager-inventory.plan4.v1.json); Plan ID `more-i-gory-technical-hardening-2026-09`, prefix `mg5` |
| Исторический машинный inventory | [`task-manager-inventory.plan3.v3.json`](task-manager-inventory.plan3.v3.json); повторно не импортировать |
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

NOW: нормализация канона после закрытия Plan №3. Следующий master plan собран
как Plan №4 v1 APPROVED и включает critical Next/Payload updates,
остаточный technical debt и восстановление exact-main candidate evidence.
Business facts, коммерческая модель, методика, география и страницы отложены
явным решением владельца. Production не выпускался и не разрешён.

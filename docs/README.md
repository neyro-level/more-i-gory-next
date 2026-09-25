# Документация проекта «Море и Горы»

**Статус:** Active
**Версия:** 4.1 — night hardening execution baseline
**Дата:** 2026-09-25
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

- GEO-first EPIC 68–86 закрыты; итоговый baseline в `main` —
  `8db1c1ced37bbd8c0b486bdb6e81ccd3ace7c683`;
- target IA реализована: federal hub, `/krym/` и четыре city hub,
  глобальные `/obekty/**`, future-region activation и единый SEO state;
- публичный read идёт через Public Gateway / Payload Local API и DTO;
  при недоступности БД действует безопасный fallback, не local JSON adapters;
- production не выпускался; technical preview — `more-previu.tw1.ru`;
- неподтверждённые коммерческие, региональные и аналитические страницы остаются
  под content/trust/index gate; текущий проверенный sitemap пуст и не публикует
  неподтверждённые URL;
- цепочка из 27 migrations, upgrade fixture, single-DB application proof,
  credential rotation, immutable preview runtime и rollback доказаны;
  единственная новая migration Payload применена на preview, owner login и
  live smoke прошли;
  restore явно отложен решением владельца в Plan №3 v3;
  актуальные deferred и next-plan inputs собраны в
  [`OWNER_QUEUE.md`](OWNER_QUEUE.md);
- production-like crawl EPIC 85 прошёл локальный `pnpm verify`, schema proof и
  SourceCraft RISKY gate 198; EPIC 86 завершил reconciliation; итоговая сверка находится в
  [`proofs/V5_GEO_FIRST_FINAL_PROOF.md`](proofs/V5_GEO_FIRST_FINAL_PROOF.md);
- новый утверждённый поток `AMS-MORE-I-GORY-NIGHT-HARDENING-PREVIEW-2026-09`
  выполняет EPIC 87–90; сейчас активен EPIC 87 baseline freeze;
- production не разрешён; domain cutover, jobs, outbound channels и страницы
  не активировались.

## Audit / remediation baseline

Plan №4 остаётся исторической технической основой. GEO-first v1 прошёл EPIC
68–86 и закрыт. Текущий утверждённый план — night hardening v1; production им
не разрешён, EPIC 90 ограничен technical preview.

```text
CODE_BASELINE=8db1c1ced37bbd8c0b486bdb6e81ccd3ace7c683  # GEO-first EPIC 68–86 merged baseline
PROFILE=REALTY_BASE
TARGET_CORE=AMS Realty Platform 5.5
UI_CORE=AMS UI Core 5.0
```

| Поле | Значение |
|---|---|
| Code baseline | SourceCraft `integrator-p/more-i-gory-next` @ `8db1c1ced37bbd8c0b486bdb6e81ccd3ace7c683` |
| Профиль | `AMS_PROFILE=REALTY_BASE`, режим BUILD |
| Техническая конституция | [`AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md`](AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md) |
| UI-конституция | [`AMS_UI_CORE_v5.0_FINAL.md`](AMS_UI_CORE_v5.0_FINAL.md) |
| Последний утверждённый мастер-план | [`AMS_MORE_I_GORY_NIGHT_HARDENING_PREVIEW_PLAN_V1.md`](AMS_MORE_I_GORY_NIGHT_HARDENING_PREVIEW_PLAN_V1.md) v1 APPROVED; EPIC 87–90 |
| Закрытый GEO-first план | [`AMS_MORE_I_GORY_GEO_FIRST_REMEDIATION_MASTER_PLAN_V5_0.md`](AMS_MORE_I_GORY_GEO_FIRST_REMEDIATION_MASTER_PLAN_V5_0.md) v1 APPROVED; EPIC 68–86 closed |
| Предыдущий план | [`MORE_I_GORY_PLAN_№ 4.md`](MORE_I_GORY_PLAN_№%204.md) v1 APPROVED / implementation complete |
| Машинный inventory текущего плана | [`task-manager-inventory.night-hardening.v1.json`](task-manager-inventory.night-hardening.v1.json); Plan ID `AMS-MORE-I-GORY-NIGHT-HARDENING-PREVIEW-2026-09`, prefix `mgnight` |
| Закрытый GEO-first inventory | [`task-manager-inventory.geo-first.v1.json`](task-manager-inventory.geo-first.v1.json); prefix `mggeo`, 19/19 epics closed |
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

NOW: night hardening v1, EPIC 87 control foundation и baseline freeze. GEO-first
EPIC 68–86 закрыты и находятся в `main`. Business facts по Крыму и четырём городам
по-прежнему `MISSING`, поэтому index activation остаётся закрытой Content Gate.
Следующий разрешённый шаг после closeout — отдельное решение по factual content;
production не выпускался и не разрешён.

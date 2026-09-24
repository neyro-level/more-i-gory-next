# AMS MASTER PLAN — «Море и Горы» GEO-FIRST INVESTMENT PLATFORM REMEDIATION

**Plan ID:** `AMS-MORE-I-GORY-GEO-FIRST-INVESTMENT-REMEDIATION`  
Version: v1  
**Source Revision:** `5.0.0 FINAL CANDIDATE`  
**Date:** `2026-09-24`  
Status: APPROVED  
**Architect Phase:** `APPROVAL_HANDOFF`  
**Approved By:** `owner`  
**Approved At:** `2026-09-24 Europe/Moscow`  
**Project:** «Море и Горы»  
**Repository:** `integrator-p/more-i-gory-next`  
**Canonical Git contour:** SourceCraft primary; GitHub — зеркало/контур чтения по фактической конфигурации проекта  
**Audited baseline:** `main@7e7c6141d289d9c91aee90d95bebd2de22b115d6`  
**Previous execution program:** Plan №4, EPIC 60–67  
**New execution range:** EPIC 68–86  
**Core:** AMS Realty Platform Core Standard 5.5 — Solo + AI  
**UI:** AMS UI Core v5.0  
**Runtime baseline at audit:** Next.js 16.3.6 + React 19.3.0 + Payload 3.90.1 + PostgreSQL  
**Production:** не выполнять без отдельной явной owner-команды  

> ВАЖНО: SHA выше — точка аудита, а не разрешение работать от устаревшего состояния. Перед EPIC 68 Codex обязан получить свежий `main`, сверить фактический SHA, рабочее дерево и актуальные active docs. При расхождении с этим планом действует правило: **actual code/runtime truth → Core/approved ADR → этот Master Plan → implementation detail**.

## Revision history

| Version | Date | Input | Result |
|---|---|---|---|
| `v0 DRAFT` | 2026-09-24 | Owner supplied source revision `5.0.0 FINAL CANDIDATE` | Принят как canonical baseline стадии `ASSEMBLY`; содержание не изменено, финальный audit и Task Manager import не запускались. |
| `v1 APPROVED` | 2026-09-24 | Owner approval + Architect final audit | Устранены конфликт canonical repository, дублирование plan-file, SEO/HTTP ownership drift и лишняя сериализация; добавлены autonomous waves, external-fact fallback, owner decisions и readiness evidence. |

---

# 0. НАЗНАЧЕНИЕ

Этот документ — исполняемый мастер-план доработки существующего проекта «Море и Горы» после утверждения новой SEO/URL архитектуры.

Проект **не пересобирается с нуля**. Сохраняются существующие рабочие контуры:

- Next.js App Router;
- Payload CMS;
- PostgreSQL;
- Public Gateway / DTO boundary;
- leads;
- jobs;
- feed ingest;
- media/S3;
- security boundaries;
- UI Core;
- release/verification foundation;
- SourceCraft PR/gate flow.

Перестраиваются только слои, которые должны соответствовать новой информационной архитектуре:

1. URL grammar;
2. geo model;
3. intent ownership;
4. SEO registry и Content Gate;
5. metadata / canonical / robots / sitemap;
6. routing;
7. regional/city hubs;
8. глобальный инвестиционный каталог;
9. project/entity relations;
10. breadcrumbs / internal linking;
11. legacy/current URL migration;
12. HTTP lifecycle и cache/error semantics;
13. SEO verification.

---

# 0.1. УТВЕРЖДЁННОЕ АРХИТЕКТУРНОЕ РЕШЕНИЕ

## Главный принцип

```text
GEO LOCAL SURFACES
×
GLOBAL STABLE INVESTMENT ENTITIES
×
ONE INTENT → ONE PRIMARY INDEXABLE URL
```

География владеет локальным поисковым спросом.

Инвестиционный объект/проект имеет один глобальный стабильный canonical URL и не переезжает при добавлении новых регионов и городов.

## Продуктовый смысл

«Море и Горы» остаётся не массовым классифайдом, а инвестиционным селектором:

```text
рынок
→ локальный рынок
→ ограниченный shortlist
→ инвестиционный паспорт
→ аналитика / методика
→ персональный разбор
```

Крым — первый и самый глубокий SEO-рынок.

Архитектура сразу допускает расширение на Архыз, Алтай, Сочи и следующие регионы без смены canonical URL существующих проектов.

---

# 0.2. ЦЕЛЕВОЕ URL-ДЕРЕВО

```text
/
│
├── investicionnaya-nedvizhimost/
│   └── федеральный сравнительный hub рынков
│
├── krym/
│   ├── yalta/
│   ├── sevastopol/
│   ├── evpatoriya/
│   └── alushta/
│
├── arkhyz/
├── altay/
├── sochi/
│
├── obekty/
│   ├── <project-slug>/
│   ├── <project-slug>/
│   └── ...
│
├── analitika/
│   └── <article-slug>/
│
├── metodika/
├── podbor/
├── o-kompanii/
├── kontakty/
├── privacy/
└── consent/
```

## Роли URL

| URL | Роль | Primary intent |
|---|---|---|
| `/` | бренд / инвестиционное бюро / trust | кто такие «Море и Горы», как работают |
| `/investicionnaya-nedvizhimost/` | федеральный выбор рынка | сравнение курортных рынков |
| `/krym/` | главный региональный hub R1 | инвестиционная недвижимость Крыма |
| `/krym/yalta/` | локальный market hub | недвижимость / квартиры / инвестиции в Ялте |
| `/krym/sevastopol/` | локальный market hub | недвижимость / квартиры / инвестиции в Севастополе |
| `/krym/evpatoriya/` | локальный market hub | недвижимость / квартиры / инвестиции в Евпатории |
| `/krym/alushta/` | локальный market hub | недвижимость / квартиры / инвестиции в Алуште |
| `/arkhyz/` | будущий/подготавливаемый geo hub | рынок Архыза |
| `/altay/` | будущий/подготавливаемый geo hub | рынок Алтая |
| `/sochi/` | geo hub/stub до Content Gate | рынок Сочи |
| `/obekty/` | глобальный курируемый инвестиционный каталог | инвестиционные проекты |
| `/obekty/<slug>/` | глобальная инвестиционная entity | конкретный проект / паспорт |
| `/analitika/` | экспертная библиотека | инвестиционные вопросы |
| `/analitika/<slug>/` | статья | один информационный intent |
| `/metodika/` | trust/methodology | как отбираются проекты |
| `/podbor/` | product landing | персональный инвестиционный разбор |

---

# 0.3. ЧТО БОЛЬШЕ НЕ ЯВЛЯЕТСЯ ЦЕЛЕВОЙ IA

Следующие конструкции не должны оставаться самостоятельными SEO owners только потому, что они существовали в старой Product Structure:

```text
/investicionnaya-nedvizhimost/krym/
/investicionnaya-nedvizhimost/krym/yalta/
/investicionnaya-nedvizhimost/krym/sevastopol/
/investicionnaya-nedvizhimost/krym/evpatoriya/
/investicionnaya-nedvizhimost/krym/alushta/
/investicionnaya-nedvizhimost/krym/novostroyki/
```

Новая owner-модель:

```text
/investicionnaya-nedvizhimost/          = федеральный market comparison
/krym/                                  = Крым
/krym/yalta/                            = Ялта
/krym/sevastopol/                       = Севастополь
/krym/evpatoriya/                       = Евпатория
/krym/alushta/                          = Алушта
```

**Никаких автоматических redirect решений только из-за нового плана.**

EPIC 70 обязан доказать для каждого старого/current URL:

```text
KEEP
REDIRECT_301
NOINDEX_RETAIN
REMOVE_404
GONE_410
REVIEW
```

Если URL никогда не был публично индексируемым production URL, SEO-миграционный 301 не создаётся автоматически.

---

# 0.4. РОЛЬ `/novostroyki/` В НОВОЙ МОДЕЛИ

Существующий feed/newbuild contour не удаляется.

Но в R1 этого Master Plan он **не является главным SEO-каталогом проекта**.

Primary investment catalog:

```text
/obekty/
```

Правило:

```text
/obekty/
= curated investment catalog

/obekty/<project-slug>/
= canonical investment passport/entity
```

Существующий:

```text
/novostroyki/
/novostroyki/<complex-slug>/
```

остаётся технической/product capability до отдельного решения EPIC 70/72.

По умолчанию:

- не получает автоматически ownership запроса «инвестиционные объекты»;
- не должен каннибализировать `/obekty/`;
- не должен создавать второй индексируемый URL той же инвестиционной сущности;
- может оставаться discovery/feed surface `200 noindex,follow`;
- может быть полностью скрыт из primary navigation;
- может быть переиспользован как data source для geo/project UI;
- индексируемость конкретной карточки ЖК разрешается только отдельным intent/entity решением.

Если `ResidentialComplex` и `Investment Project Passport` описывают одну сущность, должен существовать явный one-to-one relation и один SEO owner. Никакого массового canonical/redirect угадывания.

---

# 1. АРХИТЕКТУРНЫЕ ИНВАРИАНТЫ

## 1.1. Не перестраивать Core

Запрещено без отдельного ADR:

- добавлять второй CMS;
- добавлять Prisma;
- добавлять второй backend;
- менять Payload как owner schema/migrations;
- обходить Public Gateway;
- читать raw Payload documents в UI;
- создавать новый lead engine;
- создавать второй ingest;
- создавать вторую media pipeline;
- создавать индексируемые filter/query combinations;
- переносить SEO content в Client Components;
- менять SourceCraft delivery contour;
- включать production автоматически.

## 1.2. Server First

Основной SEO-контент обязан присутствовать в server HTML:

- H1;
- title/description;
- canonical;
- robots;
- breadcrumbs;
- основной текст;
- карточки проектов;
- внутренние ссылки.

## 1.3. Один устойчивый поисковый intent — один основной URL

Запрещено одновременно индексировать страницы с одинаковым фактическим intent только из-за разных технических источников данных.

## 1.4. Global entities stable

Проект не получает новый canonical URL при добавлении другого geo.

```text
/obekty/project-a/
```

остаётся тем же URL независимо от того, связан он с Крымом, Архызом, Алтаем или Сочи.

## 1.5. Geo route is discovery/context, not entity owner

```text
/krym/yalta/
```

может показывать Project A.

Project A при этом остаётся:

```text
/obekty/project-a/
```

## 1.6. No automatic SEO matrix

Запрещена автоматическая генерация:

```text
/krym/yalta/novostroyki/
/krym/yalta/apartamenty/
/krym/yalta/studii/
/krym/yalta/s-remontom/
...
```

Новый SEO URL допускается только через New URL Gate.

---

# 2. NEW URL GATE

Новый indexable geo/segment/facet URL можно создать только если одновременно есть:

1. отдельный подтверждённый SERP/search intent;
2. самостоятельная полезность страницы;
3. достаточный реальный ассортимент или аналитическая ценность;
4. уникальная market thesis / экономика / риски;
5. собственные inbound/outbound links;
6. владелец данных;
7. понятный процесс актуализации;
8. metadata без дублирования существующего owner;
9. Content Gate PASS.

Пример:

```text
/krym/yalta/
```

разрешён как city market hub.

Но:

```text
/krym/yalta/novostroyki/
```

не создаётся, пока не доказан отдельный intent и контент.

---

# 3. GEO MODEL

Целевая модель должна поддерживать минимум:

```text
Region
CityOrArea
InvestmentProject
ResidentialComplex?       # operational/feed relation
Developer?
Article
Source
SEOState
Redirect
```

## 3.1. Region

Минимум:

```text
id
name
slug
status
title
lead
investmentThesis
riskSummary
seo?
verifiedAt?
```

## 3.2. CityOrArea

Минимум:

```text
id
region
name
slug
status
title
lead
investmentThesis
riskSummary
seo?
verifiedAt?
```

R1:

```text
Крым
├── Ялта
├── Севастополь
├── Евпатория
└── Алушта
```

## 3.3. Project relation

Каждый публичный инвестиционный паспорт должен уметь однозначно сообщить:

```text
region
cityOrArea?
canonical path
related projects
related articles
residentialComplex?   # optional explicit relation
```

---

# 4. SEO STATE ENGINE

Индексируемость не должна вычисляться отдельно в:

- page component;
- metadata;
- sitemap;
- navigation;
- CMS;
- registry.

Нужен единый server-side resolver.

Целевой контракт:

```ts
type SeoState = {
  canonical: string;
  index: boolean;
  follow: boolean;
  sitemap: boolean;
  httpStatus: 200 | 404 | 410;
  redirect?: {
    permanent: boolean;
    target: string;
  };
  reason:
    | "published"
    | "content-gate"
    | "draft"
    | "review"
    | "stub"
    | "archived"
    | "gone"
    | "technical"
    | "staging";
};
```

`SeoState` — чистое server-side решение без вызова framework navigation APIs.
EPIC 72 владеет вычислением всего объекта, включая `httpStatus` и redirect
intent. EPIC 73 владеет только materialization этого решения в Next/Nginx:
фактическим HTTP status, redirect response и cache/error semantics. Metadata,
sitemap и route lifecycle обязаны использовать один effective SEO state.

---

# 5. ОБЯЗАТЕЛЬНЫЕ РЕМЕДИАЦИИ ИЗ АУДИТА

Новая IA не считается реализованной, пока не закрыты найденные системные дефекты.

## SEO-R01 — Registry gate vs runtime

Сейчас `gate/trust_gate` фактически превращаются в `noindex`, а sitemap и некоторые DB-backed entities живут по другим правилам.

Нужен единый effective resolver.

## SEO-R02 — Region sitemap vs robots

Запрещено состояние:

```text
URL находится в sitemap
AND page robots = noindex
```

## SEO-R03 — CMS SEO ЖК/застройщиков

Если collection содержит:

```text
seo.title
seo.description
seo.canonicalOverride
seo.robots
seo.ogImagePath
seo.priority
```

то runtime либо обязан их использовать, либо поле должно быть удалено/пересмотрено.

Декоративное SEO-поле запрещено.

## SEO-R04 — Article lifecycle

`draft/review/published` обязаны иметь собственное effective indexability.

Общий PAGE-017 gate не имеет права открыть draft.

## SEO-R05 — Реальный HTTP 410

`data-archive-status="410"` не считается реализацией HTTP 410.

Контракт должен проверять фактический response status.

## SEO-R06 — 301 / 308 contract

Framework slash normalization и SEO migration redirects — разные механизмы.

Нельзя тестировать `301`, если runtime отдаёт `308` через `permanentRedirect`.

## SEO-R07 — CMS arbitrary path

CMS `pages.path` не должен попадать в sitemap, если runtime не умеет обслужить этот path.

Выбрать один контракт:

- whitelist supported CMS paths; или
- полноценный generic CMS route.

Для текущего solo + AI scope default = whitelist.

## SEO-R08 — DB failure must not become cached business absence

Operational error:

```text
DB unavailable
```

не равен:

```text
[]
null
404
```

Инфраструктурный сбой не должен кэшироваться как отсутствие entity.

---

# 6. DELIVERY CONTRACT ДЛЯ КАЖДОГО EPIC

Каждый EPIC выполняется только так:

```text
fresh main
→ branch
→ implementation
→ targeted tests
→ docs/source-of-truth update
→ self-review
→ Pull Request
→ exact-head SourceCraft gate
→ merge main
→ post-merge proof
→ delete branch
→ следующий EPIC
```

**Delivery mode всех EPIC 68–86:** `MERGE_AFTER_GATE`. Это заранее
утверждённое разрешение выполнить review, один exact-head SourceCraft gate и
merge через Pull Request без повторного owner-вопроса. Direct push в `main` и
production запрещены.

Для каждого epic создаётся один task-owned worktree. Внутри epic допускается
несколько implementation tasks, но только одна terminal delivery-task. После
локального blocker Developer освобождает claim и продолжает следующую
независимую ready task.

## STANDARD EPIC

Минимум до PR:

```bash
pnpm typecheck
pnpm lint
targeted tests for changed scope
```

Merge:

```text
SourceCraft workflow: merge-standard
```

Текущий merge-standard обязан проверять exact reviewed head и выполнять repository standard verification (`pnpm verify` по актуальной CI-конфигурации).

## RISKY EPIC

Дополнительно:

```bash
pnpm verify:schema
```

Merge:

```text
SourceCraft workflow: merge-risky
```

## Правило

Не придумывать несуществующий package script.

Если в actual `package.json` нет `pnpm verify:merge-standard`, Codex не добавляет его только ради текста этого плана. Используется фактический SourceCraft workflow и фактические scripts repository.

---

# 7. DEPENDENCY GRAPH

```text
EPIC 68  Current-state freeze
   ▼ HARD
EPIC 69  Architecture / URL / SEO contract freeze
   ├───────────────┐
   ▼               ▼
EPIC 70          EPIC 71
Migration facts  URL identity contract
   │               ├───────────────┐
   │               ▼               ▼
   │            EPIC 72          EPIC 74
   │            SEO resolver     Geo model
   │               │               │
   └──────┬────────┘               │
          ▼                        │
       EPIC 73                     │
       HTTP/cache adapters         │
          └──────────┬─────────────┘
                     ▼
                  EPIC 75
                  Route materialization
                     │
          ┌──────────┼───────────┐
          ▼          ▼           ▼
       EPIC 76    EPIC 77     EPIC 83
       Catalog    Project      Future geo
          └──────┬───┘           │
                 ▼               │
              EPIC 78            │
              Crimea hub         │
          ┌──────┼──────┬────────┤
          ▼      ▼      ▼        ▼
       EPIC 79 EPIC 80 EPIC 81 EPIC 82
       Yalta   Sevast. Evpator. Alushta
          └──────┴──────┴────────┘
                     │
                     ▼
                  EPIC 84
                  Linking / analytics
                     ▼
                  EPIC 85
                  Invariants / crawl
                     ▼
                  EPIC 86
                  Final closeout
```

## 7.1. Authoritative dependency matrix

| Epic | HARD dependencies | Contract/soft dependencies | Wave | Parallel-safe |
|---|---|---|---|---|
| 68 | — | — | A | no, baseline owner |
| 69 | 68 | — | A | no, contract freeze |
| 70 | 69 | production/index evidence is EXTERNAL with explicit REVIEW fallback | B | with 71 |
| 71 | 69 | — | B | with 70 |
| 72 | 71 | 70 redirect decisions are CONTRACT input only | C | with 74 |
| 73 | 70, 72 | — | C | with 74 after resolver contract freeze |
| 74 | 69, 71 | schema migration sequence is shared-file owner | C | with 72; merge sequentially |
| 75 | 70, 71, 72, 73, 74 | — | D | no, route integration owner |
| 76 | 72, 74, 75 | content inventory is EXTERNAL; curated/noindex fallback | D | with 77 and 83 |
| 77 | 72, 73, 74, 75 | project facts are EXTERNAL; unpublished fallback | D | with 76 and 83 |
| 78 | 75, 76, 77 | Crimea content is EXTERNAL; technical route may remain noindex | E | contract/scaffold first |
| 79–82 | 78 contract/scaffold | each city's facts are independent EXTERNAL inputs | E | mutually parallel |
| 83 | 71, 72, 74, 75 | future-market content is EXTERNAL; `PREPARED_OFF` fallback | D | with 76 and 77 |
| 84 | 76, 77, 78, 79, 80, 81, 82, 83 | analytics identifiers are CONTRACT only | F | no, graph integrator |
| 85 | 84 | staging availability is EXTERNAL with local runtime fallback | G | no |
| 86 | 85 | production remains separate OWNER gate | G | no |

## 7.2. Autonomous execution rules

- Waves are authoritative; numeric epic order is identity, not forced serial execution.
- EPIC 79–82 are four independent streams after EPIC 78 freezes the parent-hub
  contract. Один blocked city не блокирует остальные города.
- Content/fact absence blocks only index activation and factual copy, never URL,
  DTO, resolver, noindex route or test work.
- Shared schema, URL grammar, SEO resolver and route registry each have one
  merge owner and freeze point; dependent streams rebase on the merged contract.
- A blocked task records `implementation` or `needs-owner` evidence and releases
  its claim. Developer immediately selects another ready task.
- No wave contains production, DNS, domain cutover or real-traffic activation.

---

# EPIC 68 — CURRENT STATE FREEZE / BASELINE INTAKE

**Risk:** STANDARD  
**Branch:** `epic/68-current-state-freeze`

## Цель

Зафиксировать реальное состояние `main` перед перестройкой и не потерять уже закрытую функциональность Plan №4.

## Tasks

- fetch latest SourceCraft `main`;
- записать фактический SHA;
- `git status` must be clean;
- сверить:
  - `package.json`;
  - Next/Payload/React versions;
  - active docs;
  - routes;
  - SEO registry;
  - sitemap source;
  - regions;
  - properties;
  - residential-complexes;
  - developers;
  - articles;
  - redirects;
  - Nginx/runtime contour;
- подтвердить, что Plan №4 завершает active execution на EPIC 67;
- зарегистрировать этот canonical документ без создания второй копии:
  - `docs/AMS_MORE_I_GORY_GEO_FIRST_REMEDIATION_MASTER_PLAN_V5_0.md`;
- добавить ссылку на него в `docs/README.md` и pointer в
  `docs/DELIVERY_STATE.yaml`;
- предыдущие планы не переписывать;
- пометить новый план как current execution source только после owner approval;
- сформировать `docs/remediation/CURRENT_STATE_V5.md`:
  - current routes;
  - indexability behavior;
  - sitemap sources;
  - known P0/P1;
  - exact baseline.
- выполнить business-fact/content preflight для Крыма и четырёх городов:
  - `AVAILABLE` — task активации может продолжаться;
  - `MISSING` — route/contract work продолжается, index activation получает
    внешний blocker, страница остаётся честной `noindex`/off по SEO state;
  - отсутствие фактов не блокирует независимые technical waves и никогда не
    разрешает выдумывать claims.

## DoD

- actual SHA записан;
- нет предположений о runtime;
- known audit defects перечислены;
- никакой production behavior не изменён;
- ни один route не изменён.

## Checks

```bash
git diff --check
pnpm typecheck
pnpm lint
```

Merge: `merge-standard`.

---

# EPIC 69 — GEO-FIRST IA / INTENT OWNERSHIP / ADR FREEZE

**Risk:** STANDARD  
**Branch:** `epic/69-geo-first-architecture`

## Цель

До кода заморозить новую информационную архитектуру.

## Tasks

Обновить:

```text
docs/01_PRD.md
docs/02_PRODUCT_STRUCTURE.md
docs/03_ARCHITECTURE.md
docs/04_BACKLOG.md
docs/05_RELEASE_CHECKLIST.md
```

Создать ADR:

```text
ADR-GEO-FIRST-INVESTMENT-IA.md
ADR-GLOBAL-INVESTMENT-ENTITY-URL.md
ADR-SEO-STATE-ENGINE.md
ADR-NEWBUILD-INVENTORY-ROLE.md
```

Зафиксировать:

```text
/                               = brand/trust
/investicionnaya-nedvizhimost/ = federal market comparison
/krym/                          = Crimea market owner
/krym/{city}/                   = local market owner
/obekty/                        = curated global investment catalog
/obekty/{project}/              = global investment entity
```

Зафиксировать:

- PAGE-024 old concept больше не является обязательным standalone SEO owner;
- `/novostroyki/` не является replacement для `/obekty/`;
- no auto city×category pages;
- future region activation через registry/Gate;
- Крым = R1 primary SEO market;
- Архыз/Алтай/Сочи не определяют глубину Крыма;
- project canonical не зависит от geo.

## DoD

- Product Structure не содержит двух owners для одного intent;
- target URL tree однозначен;
- old routes помечены migration candidates, а не silently deleted;
- docs-first chain согласован.

## Checks

```bash
git diff --check
pnpm verify:content
pnpm verify:seo
```

Merge: `merge-standard`.

---

# EPIC 70 — CURRENT / LEGACY URL MANIFEST + MIGRATION DECISIONS

**Risk:** STANDARD  
**Branch:** `epic/70-url-migration-manifest`

## Цель

Не делать слепые redirects при смене IA.

## Tasks

Создать:

```text
docs/migration/V5_URL_MANIFEST.json
docs/migration/V5_URL_DECISIONS.md
```

Инвентаризировать минимум:

```text
/
/investicionnaya-nedvizhimost/
/investicionnaya-nedvizhimost/krym/
/investicionnaya-nedvizhimost/krym/yalta/
/investicionnaya-nedvizhimost/krym/sevastopol/
/investicionnaya-nedvizhimost/krym/evpatoriya/
/investicionnaya-nedvizhimost/krym/alushta/
/investicionnaya-nedvizhimost/krym/novostroyki/
/investicionnaya-nedvizhimost/krym/apartamenty/
/investicionnaya-nedvizhimost/arkhyz/
/investicionnaya-nedvizhimost/altay/
/investicionnaya-nedvizhimost/sochi/
/obekty/**
/novostroyki/**
/zastroyshchik/**
/analitika/**
```

Для каждого:

```text
current status
current canonical
current robots
current sitemap
production/index evidence
target intent
target URL
migrationAction
reason
```

Actions:

```text
KEEP
REDIRECT_301
NOINDEX_RETAIN
REMOVE_404
GONE_410
REVIEW
```

Правила:

- no bulk redirect to `/`;
- no bulk redirect to `/obekty/`;
- redirect only same intent or same entity;
- preview-only/noindex URL не получает SEO redirect автоматически;
- redirect target обязан быть target canonical.

## DoD

- 100% текущих SEO-route patterns покрыты;
- нет unresolved migration for R1 paths;
- решения основаны на фактическом public/index evidence.

## Checks

- duplicate canonical report;
- redirect chain report;
- target existence report.

Merge: `merge-standard`.

---

# EPIC 71 — CANONICAL URL GRAMMAR / BUILDURL / PARSEURL

**Risk:** RISKY  
**Branch:** `epic/71-url-grammar`

## Цель

Убрать ручную сборку canonical paths разными слоями.

## Target

Создать один server-owned URL grammar module, например:

```text
src/core/routing/grammar/
```

или другое расположение, согласованное с current architecture guards.

Контракт:

```ts
type RouteIdentity =
  | { pageKey: "HOME" | "FEDERAL_INVESTMENT_HUB" | "INVESTMENT_CATALOG" | "ANALYTICS" | "METHODOLOGY" | "SELECTION" | "COMPANY" | "CONTACTS" | "PRIVACY" | "CONSENT" }
  | { pageKey: "REGION"; regionSlug: string }
  | { pageKey: "CITY"; regionSlug: string; citySlug: string }
  | { pageKey: "INVESTMENT_PROJECT"; projectSlug: string }
  | { pageKey: "ARTICLE"; articleSlug: string };

buildUrl(identity: RouteIdentity) -> canonical path
parseUrl(path) -> RouteIdentity | null
```

PageKey minimum:

```text
HOME
FEDERAL_INVESTMENT_HUB
REGION
CITY
INVESTMENT_CATALOG
INVESTMENT_PROJECT
ANALYTICS
ARTICLE
METHODOLOGY
SELECTION
COMPANY
CONTACTS
PRIVACY
CONSENT
```

## Tasks

- build canonical `/krym/`;
- build canonical `/krym/{city}/`;
- build `/obekty/{slug}/`;
- normalize trailing slash;
- reserved root protection;
- slug collision checks;
- invalid ≥ unsupported depth → no match;
- add roundtrip tests:
  - `parseUrl(buildUrl(identity)) ≡ identity`;
- sitemap, canonical, navigation и breadcrumbs позднее обязаны использовать builder;
- project code не должен собирать canonical конкатенацией строк в нескольких местах.

## DoD

- URL builder/parser typed;
- no duplicate canonical output;
- target IA полностью представима;
- old IA не считается canonical grammar.

## Checks

```bash
pnpm typecheck
pnpm verify:guards
pnpm verify:guards:test
pnpm verify:schema
```

Merge: `merge-risky`.

---

# EPIC 72 — UNIFIED SEO STATE ENGINE

**Risk:** RISKY  
**Branch:** `epic/72-seo-state-engine`

## Цель

Закрыть SEO-R01/R02/R03/R04 и устранить несколько источников indexability truth.

## Tasks

Реализовать единый effective resolver.

Inputs:

```text
route/pageKey
registry entry
entity publication status
entity/content status
Content Gate
CMS SEO
lifecycle
runtime contour
```

Output:

```text
canonical
index
follow
sitemap
httpStatus
redirect intent
reason
```

Resolver не вызывает `redirect()`, `permanentRedirect()`, `notFound()` и не
читает transport response. Эти adapter-обязанности принадлежат EPIC 73.

Обязательные изменения:

### Static/geo

- `gate` не должен интерпретироваться разными слоями по-разному;
- metadata и sitemap используют один effective result.

### Regions

Запрещено:

```text
published region → sitemap
registry gate → noindex
```

### Complex/developer CMS SEO

Выбрать и реализовать один контракт:

- если SEO fields остаются — Public DTO получает их и runtime использует;
- sitemap учитывает `robots`;
- `canonicalOverride` имеет controlled validation.

### Articles

```text
draft  -> noindex, outside sitemap
review -> noindex, outside sitemap
published + editorial/content gate PASS -> index candidate
archived -> lifecycle rule
```

`PAGE-017` больше не может один открыть весь article namespace.

### CMS pages

Sitemap eligibility only for runtime-supported paths.

Default:

```text
supportedCmsPagePaths whitelist
```

до отдельного решения generic CMS router.

## DoD

Инварианты:

```text
sitemap => HTTP 200
sitemap => index=true
noindex => outside sitemap
draft => outside sitemap
preview => outside sitemap
technical => outside sitemap
```

## Tests

Добавить отдельный suite:

```text
seo-state-contract.test
sitemap-indexability-invariant.test
article-indexing-lifecycle.test
cms-seo-runtime.test
```

## Checks

```bash
pnpm typecheck
pnpm verify:seo
pnpm test:sitemap-source
pnpm test:seo-contract
pnpm verify:schema
```

Использовать фактические имена scripts из актуального `package.json`.

Merge: `merge-risky`.

---

# EPIC 73 — HTTP LIFECYCLE + REDIRECT + CACHE FAILURE SEMANTICS

**Risk:** RISKY  
**Branch:** `epic/73-http-cache-lifecycle`

## Цель

Закрыть SEO-R05/R06/R08.

## Tasks

### Real 410

- определить approved runtime mechanism для реального HTTP 410;
- DOM attribute не считается status;
- archived gone entity must return real `410` или, если Next boundary не позволяет безопасно, ADR must choose explicit `404`; нельзя оставлять fake 200/410.

### Redirect semantics

Развести:

```text
trailing slash normalization = framework behavior
SEO migration redirect       = explicit migration behavior
```

Тесты должны проверять фактический HTTP response.

Если фактический permanent route API отдаёт `308`, contract не называет его `301`.

### DB/public fallback

Переделать fallback policy:

```text
valid read + zero rows -> [] / null
operational DB failure -> operational error / 5xx / controlled stale response
```

Не кэшировать infrastructure failure как:

```text
[]
null
notFound()
```

Audit:

```text
publicReadWithFallback
unstable_cache wrappers
sitemap readers
entity detail readers
catalog readers
```

## DoD

- temporary DB outage не превращает existing entity в cached 404;
- 410/404 verified by HTTP;
- redirect tests assert actual status;
- no redirect chain.

## Checks

- targeted public gateway tests;
- HTTP lifecycle tests;
- cache failure fixture;
- `pnpm verify:runtime`;
- `pnpm verify:schema`.

Merge: `merge-risky`.

---

# EPIC 74 — NORMALIZED CRIMEA GEO MODEL / DTO / RELATIONS

**Risk:** RISKY  
**Branch:** `epic/74-crimea-geo-model`

## Цель

Сделать Крым и города настоящими domain entities новой IA.

## Tasks

Использовать существующую `regions` модель максимально бережно.

Не создавать вторую geo систему, если текущую можно расширить.

R1 seed:

```text
Crimea
├── Yalta
├── Sevastopol
├── Evpatoriya
└── Alushta
```

Проверить/добавить:

```text
kind
parent
slug
path/pageKey ownership
status
verifiedAt
seo content fields or relation to registry
```

Новая canonical path должна строиться builder'ом, а не храниться как случайно редактируемая строка без validation.

Project relation:

- manual investment passport → region;
- optional city/area;
- existing complex relation не ломается.

Public DTO:

```text
RegionDTO
CityOrAreaDTO
Project geo context
```

## DoD

- Крым и 4 города normalised;
- no duplicated factual region content;
- existing ingest untouched unless relation migration requires explicit adapter;
- current public DTO boundary preserved.

## Checks

```bash
pnpm payload:generate-types
pnpm verify:schema
pnpm test:regions-contract
pnpm test:regions-routing
pnpm test:regions-internal-links
```

Merge: `merge-risky`.

---

# EPIC 75 — ROUTE MIGRATION TO GEO-FIRST CANONICALS

**Risk:** RISKY  
**Branch:** `epic/75-geo-first-routes`

## Цель

Материализовать новую grammar в App Router.

## Target routes

```text
/investicionnaya-nedvizhimost/
/krym/
/krym/yalta/
/krym/sevastopol/
/krym/evpatoriya/
/krym/alushta/
/arkhyz/
/altay/
/sochi/
```

## Tasks

- `/investicionnaya-nedvizhimost/` остаётся federal hub;
- region/city routes читают Public Gateway;
- убрать canonical ownership старого nested Crimea path;
- old paths ведут себя по EPIC 70 manifest;
- no route gets index automatically;
- `generateMetadata` only through SEO state;
- `generateStaticParams` / runtime behavior согласованы с publication state;
- production technical fixture slugs = 404;
- no arbitrary catch-all accepting unknown geo.

## DoD

- target routes resolve;
- old routes have explicit behavior;
- canonical exactly matches builder;
- breadcrumbs пока могут быть минимальными, но не ссылаются на removed canonical.

## Checks

```bash
pnpm typecheck
pnpm verify:seo
pnpm verify:runtime
pnpm verify:schema
```

Merge: `merge-risky`.

---

# EPIC 76 — GLOBAL INVESTMENT CATALOG `/obekty/`

**Risk:** STANDARD  
**Branch:** `epic/76-investment-catalog`

## Цель

Закрепить `/obekty/` как глобальный каталог для инвестиций, а не как технический список.

## Product contract

```text
/obekty/
= только проекты/паспорта, прошедшие editorial investment selection
```

Не mass marketplace.

## Tasks

Первый экран:

- H1;
- positioning;
- критерий допуска;
- дата актуальности/принцип проверки;
- CTA.

Catalog:

- cards;
- region;
- city/area;
- format;
- budget facts only if source-backed;
- key thesis;
- key risk;
- verifiedAt.

Filters:

```text
region
city
format
budget
strategy
```

но:

- query filters = noindex;
- canonical clean `/obekty/`;
- no automatic path pages.

Empty/small inventory:

- curated view;
- no fake filters;
- no fake counts.

Links:

```text
catalog -> project
catalog -> geo hub
catalog -> methodology
catalog -> selection
```

## DoD

- catalog useful with Crimea-only inventory;
- architecture does not need change when Arkhyz/Altay/Sochi appear;
- no feed inventory leaks as fake curated projects.

## Checks

```bash
pnpm verify:ui-drift
pnpm test:properties-public-routing
pnpm verify:seo
```

Merge: `merge-standard`.

---

# EPIC 77 — GLOBAL INVESTMENT PROJECT ENTITY / PASSPORT CONTEXT

**Risk:** STANDARD  
**Branch:** `epic/77-project-entity-context`

## Цель

Сделать `/obekty/<slug>/` стабильной global entity, связанной с geo graph.

## Tasks

Project page должен получать:

```text
region
cityOrArea?
related projects
related articles
source dates
verifiedAt
```

Breadcrumb:

```text
Главная
→ Объекты
→ Project
```

Это утверждённая primary breadcrumb hierarchy. Geo context показывается
отдельными crawlable contextual links `Project → Region → City` и не
подменяет entity hierarchy. Canonical всегда:

```text
/obekty/<slug>/
```

Breadcrumb hierarchy **не меняет canonical URL**.

Internal links:

```text
Project -> city
Project -> region
Project -> related
Project -> analytics
Project -> methodology
Project -> selection
```

Residential complex relation:

- если mapped — использовать inventory/factual data;
- не создавать второй indexable investment entity;
- не canonicalize разные сущности друг на друга без explicit mapping.

Structured data:

- только verified visible facts;
- no fake offer/prices.

## DoD

- one project = one canonical;
- geo relation visible/crawlable;
- related project logic bounded;
- archived lifecycle preserved after EPIC 73.

## Checks

```bash
pnpm test:properties-public-routing
pnpm test:public-inventory-boundary
pnpm test:final-public-boundary
pnpm verify:seo
```

Merge: `merge-standard`.

---

# EPIC 78 — CRIMEA REGIONAL HUB `/krym/`

**Risk:** STANDARD  
**Branch:** `epic/78-crimea-hub`

## Цель

Сделать Крым главным SEO-рынком R1.

## Primary intent

```text
инвестиционная недвижимость Крыма
купить недвижимость в Крыму
```

Точный phrase ownership фиксируется SEO registry после semantic QA.

## Page structure

```text
Hero
→ инвестиционный тезис Крыма
→ выбор города
→ сравнительная таблица городов
→ форматы недвижимости
→ бюджет входа
→ сезонность / спрос
→ правовые / операционные риски
→ curated shortlist
→ инвестиционные паспорта
→ аналитика
→ методика
→ CTA
```

Обязательные linked city hubs:

```text
/krym/yalta/
/krym/sevastopol/
/krym/evpatoriya/
/krym/alushta/
```

## Content Gate

Index only if:

- минимум 3 city hubs имеют самостоятельную фактуру;
- минимум 4 полных investment passports в регионе либо owner-approved equivalent;
- city comparison основан на source-backed фактах;
- ключевые риски и даты проверки существуют;
- internal graph complete.

## DoD

- `/krym/` не является шаблонной landing;
- city comparison полезно без перехода;
- no duplicate PAGE-024 novostroyki owner.

## Checks

```bash
pnpm verify:content
pnpm verify:seo
pnpm verify:ui-drift
pnpm verify:runtime
```

Merge: `merge-standard`.

---

# EPIC 79 — YALTA LOCAL MARKET HUB

**Risk:** STANDARD  
**Branch:** `epic/79-yalta-hub`

## URL

```text
/krym/yalta/
```

## Primary intent

```text
недвижимость Ялты
купить квартиру в Ялте
инвестиционная недвижимость Ялты
```

Финальный primary phrase — только после semantic QA.

## Page structure

```text
Hero
→ инвестиционный тезис Ялты
→ зоны/локации
→ форматы
→ бюджет
→ блок «Новостройки Ялты» как SECTION, не URL
→ curated projects
→ спрос / сезонность
→ управление
→ риски
→ сравнение с Крымом/городами
→ analytics
→ CTA
```

## Gate

- минимум 1 полный passport;
- самостоятельная local analysis;
- no templated city substitution;
- facts/source/verifiedAt;
- unique Title/H1/Description.

## DoD

- нет `/krym/yalta/novostroyki/`;
- linked projects use `/obekty/<slug>/`.

## Checks

- targeted city route/metadata test;
- Content Gate fixture: PASS activates index candidate, MISSING remains outside sitemap;
- `pnpm verify:seo`;
- `pnpm verify:content`.

Merge: `merge-standard`.

---

# EPIC 80 — SEVASTOPOL LOCAL MARKET HUB

**Risk:** STANDARD  
**Branch:** `epic/80-sevastopol-hub`

## URL

```text
/krym/sevastopol/
```

## Required differentiation

Страница обязана раскрывать самостоятельную модель спроса:

- городской/круглогодичный спрос;
- районы/локации;
- форматы;
- бюджет;
- правовые ограничения;
- управление;
- ликвидность;
- сравнение с Ялтой/Крымом.

## Gate

- минимум 1 полный passport;
- подтверждённое business coverage;
- unique market thesis;
- factual sources.

## DoD

- route uses shared city contract and global project canonicals;
- unique thesis is source-backed or the page remains outside sitemap;
- no unsupported city×category route resolves.

## Checks

- targeted city route/metadata test;
- Content Gate PASS/MISSING fixtures;
- `pnpm verify:seo`;
- `pnpm verify:content`.

Merge: `merge-standard`.

---

# EPIC 81 — EVPATORIYA LOCAL MARKET HUB

**Risk:** STANDARD  
**Branch:** `epic/81-evpatoriya-hub`

## URL

```text
/krym/evpatoriya/
```

## Required differentiation

- семейный курортный спрос;
- сезонность;
- инфраструктура;
- форматы;
- бюджет;
- управление;
- ликвидность;
- curated projects.

## Gate

- минимум 1 полный passport;
- самостоятельная фактура;
- otherwise route remains valid `200 noindex` only if project policy explicitly allows preview/public thin state; default production behavior follows SEO state engine.

## DoD

- route uses shared city contract and global project canonicals;
- unique thesis is source-backed or effective SEO state remains noindex/off;
- no unsupported city×category route resolves.

## Checks

- targeted city route/metadata test;
- Content Gate PASS/MISSING fixtures;
- `pnpm verify:seo`;
- `pnpm verify:content`.

Merge: `merge-standard`.

---

# EPIC 82 — ALUSHTA LOCAL MARKET HUB

**Risk:** STANDARD  
**Branch:** `epic/82-alushta-hub`

## URL

```text
/krym/alushta/
```

## Required differentiation

- компактный курортный рынок;
- зоны;
- сезонность;
- инфраструктура;
- форматы;
- управление;
- расходы;
- exit/liquidity;
- comparison with Yalta.

## Gate

- минимум 1 полный passport;
- самостоятельная фактура;
- unique local thesis.

## DoD

- route uses shared city contract and global project canonicals;
- unique thesis is source-backed or effective SEO state remains noindex/off;
- no unsupported city×category route resolves.

## Checks

- targeted city route/metadata test;
- Content Gate PASS/MISSING fixtures;
- `pnpm verify:seo`;
- `pnpm verify:content`.

Merge: `merge-standard`.

---

# EPIC 83 — FUTURE GEO ACTIVATION FRAMEWORK: ARKHYZ / ALTAY / SOCHI

**Risk:** RISKY  
**Branch:** `epic/83-future-geo-framework`

## Цель

Доказать, что архитектура масштабируется без нового routing code.

## Target

```text
/arkhyz/
/altay/
/sochi/
```

Statuses должны быть registry/data-driven.

Допустимые состояния:

```text
ACTIVE
STUB_NO_INDEX
PREPARED_OFF
```

или эквивалентный минимальный enum, согласованный ADR и текущей domain model.

Не импортировать сложную category-status систему «Союза» без реальной необходимости.

## Rules

### ACTIVE

```text
200
self-canonical
robots by SEO state
sitemap only after Gate
```

### STUB_NO_INDEX

```text
200
noindex,follow
outside sitemap
honest copy
CTA
```

### PREPARED_OFF

```text
404 public
data/schema may exist
```

## Acceptance

Добавление нового региона должно требовать:

```text
data
registry
content
navigation config
```

а не новый special-case route implementation.

## DoD

- Arkhyz/Altay/Sochi use same resolver;
- no hardcoded Crimea-only routing assumptions;
- project URLs unchanged.

## Checks

```bash
pnpm test:regions-routing
pnpm test:regions-contract
pnpm verify:seo
pnpm verify:schema
```

Merge: `merge-risky`.

---

# EPIC 84 — INTERNAL LINKING GRAPH / NAVIGATION / ANALYTICS DIMENSIONS

**Risk:** STANDARD  
**Branch:** `epic/84-linking-navigation-analytics`

## Цель

Собрать единый crawlable graph новой IA.

## Graph

```text
Home
→ federal hub
→ Crimea
→ city hubs
→ projects
→ methodology
→ selection

Federal hub
→ active/prepared markets according to state

Crimea
→ 4 cities
→ projects
→ analytics

City
→ parent Crimea
→ projects
→ relevant analytics
→ selection

Project
→ region
→ city
→ related projects
→ analytics
→ methodology
→ selection

Article
→ one primary commercial target
→ relevant projects
→ methodology
→ selection
```

## Header R1

Не превращать header в mega-menu.

Минимум:

```text
Объекты
Регионы
Аналитика
Методика
О компании
CTA
```

`Регионы`:

```text
Крым
Архыз/Алтай/Сочи только по public state
```

## Analytics

Добавить non-PII dimensions:

```text
page_key
region_slug
city_slug
project_slug or stable non-PII id when appropriate
source_surface
```

No PII.

## DoD

- no orphan index candidates;
- no links to PREPARED_OFF/404;
- breadcrumbs and JSON-LD hierarchy agree;
- link graph crawlable without JS.

## Checks

- internal-link graph invariant test;
- breadcrumb/JSON-LD hierarchy test;
- navigation state test for `ACTIVE`, `STUB_NO_INDEX`, `PREPARED_OFF`;
- analytics payload test proving allowed non-PII dimensions only;
- `pnpm verify:seo`;
- `pnpm verify:ui-drift`.

Merge: `merge-standard`.

---

# EPIC 85 — SEO INVARIANT SUITE + STAGING CRAWL

**Risk:** RISKY  
**Branch:** `epic/85-seo-invariant-crawl`

## Цель

Не принимать новую IA по коду без фактического HTTP crawl.

## Automated invariants

```text
1. Every sitemap URL returns HTTP 200.
2. Every sitemap URL has index,follow.
3. Every sitemap URL self-canonicals unless approved exception.
4. No noindex URL exists in sitemap.
5. No draft/review article exists in sitemap.
6. No technical preview URL exists in sitemap.
7. Every indexable geo page has unique Title/H1/Description.
8. Old nested Crimea URLs follow migration manifest.
9. No redirect chains.
10. Real gone entity returns approved real HTTP status.
11. Query filters are noindex and use approved canonical policy.
12. `/obekty/<slug>/` remains global canonical regardless of geo.
13. Geo pages link only to valid canonical project URLs.
14. DB failure fixture does not convert known entity to cached 404.
15. CMS noindex is respected wherever CMS SEO is authoritative.
16. Article published state cannot be overridden by generic PAGE-017 gate.
17. Unknown geo path returns 404.
18. No unsupported city×category path resolves.
```

## Crawl matrix

```text
/
/investicionnaya-nedvizhimost/
/krym/
/krym/yalta/
/krym/sevastopol/
/krym/evpatoriya/
/krym/alushta/
/arkhyz/
/altay/
/sochi/
/obekty/
/obekty/<sample>/
/analitika/
/analitika/<sample>/
/metodika/
/podbor/
/o-kompanii/
/kontakty/
404
410 or approved gone status
legacy redirects
```

Проверить:

```text
status
canonical
robots
title
description
H1
breadcrumbs
structured data
internal links
sitemap membership
```

## DoD

- P0/P1 SEO defects = 0;
- sitemap-vs-crawl mismatch = 0;
- redirect chains = 0;
- duplicate owner intents for R1 = 0 unresolved.

## Checks

```bash
pnpm verify
pnpm verify:schema
pnpm verify:runtime
```

+ production-like Nginx/browser crawl proof.

Merge: `merge-risky`.

---

# EPIC 86 — FINAL CANDIDATE / DOCUMENT RECONCILIATION / CLOSEOUT

**Risk:** RISKY  
**Branch:** `epic/86-geo-first-closeout`

## Цель

Закрыть программу и оставить один непротиворечивый source of truth.

## Tasks

Сверить:

```text
actual routes
02_PRODUCT_STRUCTURE
03_ARCHITECTURE
SEO registry
URL builder
sitemap
robots
redirect registry
Payload schema
Public DTO
navigation
tests
```

Обновить:

```text
docs/DELIVERY_STATE.yaml
docs/OWNER_QUEUE.md
docs/README.md
docs/05_RELEASE_CHECKLIST.md
```

Создать:

```text
docs/proofs/V5_GEO_FIRST_FINAL_PROOF.md
```

Proof должен фиксировать:

```text
exact candidate SHA
build result
verification result
route matrix
SEO invariant result
sitemap result
redirect result
P0/P1 status
remaining owner decisions
production status
```

## Hard rule

EPIC 86 **не выполняет production cutover**.

Production — отдельная owner-команда после review final candidate.

## DoD

- exact candidate SHA;
- all EPIC 68–85 merged;
- working tree clean;
- active docs consistent;
- no superseded IA presented as current;
- P0/P1 = 0;
- production still explicit owner gate.

## Checks

```bash
pnpm verify
pnpm verify:schema
```

+ SourceCraft `merge-risky`.

---

# 8. SEO REGISTRY TARGET COVERAGE

После EPIC 72 registry обязан представлять минимум:

```text
HOME
FEDERAL_INVESTMENT_HUB
REGION_KRYM
CITY_YALTA
CITY_SEVASTOPOL
CITY_EVPATORIYA
CITY_ALUSHTA
REGION_ARKHYZ
REGION_ALTAY
REGION_SOCHI
INVESTMENT_CATALOG
INVESTMENT_PROJECT
ANALYTICS_HUB
ARTICLE
METHODOLOGY
SELECTION
COMPANY
CONTACTS
PRIVACY
CONSENT
```

Для каждой index-capable surface:

```text
pageKey
canonical builder input
primary intent
secondary intents
title rule
description rule
H1
robots default
priority
Content Gate
sitemap rule
status source
```

---

# 9. CONTENT GATE TARGETS

## `/krym/`

Минимум:

- ≥3 полноценных city markets;
- ≥4 полных investment passports;
- самостоятельное сравнение городов;
- source-backed risks/economics;
- verifiedAt/review date;
- complete internal graph.

## City

Минимум:

- ≥1 полный relevant passport;
- unique local analysis;
- local market thesis;
- risks;
- source/date;
- non-template content.

## Project

Минимум:

- required passport facts;
- verifiedAt;
- sources;
- risk summary;
- verdict;
- media policy;
- editorial review.

## Article

Минимум:

- one intent;
- full text;
- sources;
- publishedAt;
- reviewedAt when required;
- commercial target;
- no thin duplicate.

---

# 10. НЕ ДЕЛАТЬ В ЭТОЙ ПРОГРАММЕ

Не входят без отдельного owner решения:

```text
массовые city×category SEO pages
индексируемые query filters
индексируемые lots
индексируемые layouts
автоматические «новостройки Ялты» URL
автоматические «апартаменты Ялты» URL
районные SEO pages
price landing pages
карта как основной discovery UI
личный кабинет
второй CMS
Prisma
Meilisearch
Redis
новый backend
production cutover
```

---

# 11. RISK REGISTER

| ID | Риск | Контроль |
|---|---|---|
| R-01 | каннибализация federal/Crimea/city/catalog | explicit intent ownership + registry |
| R-02 | `/novostroyki/` дублирует investment entities | noindex/default supportive role + explicit mapping |
| R-03 | geo page thin | Content Gate |
| R-04 | sitemap содержит noindex | unified SEO state engine |
| R-05 | draft article случайно index | per-article lifecycle |
| R-06 | CMS robots не исполняется | runtime DTO/metadata integration |
| R-07 | DB outage превращается в 404 | operational error semantics |
| R-08 | fake 410 | real HTTP lifecycle tests |
| R-09 | redirects create chains | migration manifest + graph tests |
| R-10 | future geo требует code forks | shared geo resolver + fixture |
| R-11 | шаблонные city pages | unique thesis/data Gate |
| R-12 | too many SEO URLs | New URL Gate |
| R-13 | PR слишком большой | one EPIC = one PR |
| R-14 | docs/code drift | EPIC 68/69 + EPIC 86 reconciliation |

---

# 12. FINAL ACCEPTANCE MATRIX

Новая архитектура считается реализованной только если одновременно выполнено:

```text
/krym/ exists as primary Crimea owner
/krym/yalta/ exists
/krym/sevastopol/ exists
/krym/evpatoriya/ exists
/krym/alushta/ exists

/investicionnaya-nedvizhimost/
remains federal comparison hub

/obekty/
is curated global investment catalog

/obekty/<slug>/
is stable global investment entity

project canonical does not contain geo
city pages link to projects
project pages link back to geo context

old nested Crimea URLs have explicit migration action
no duplicate intent owner remains

metadata/sitemap/robots share one effective state
all sitemap URLs = 200 + index
no noindex URL in sitemap
draft/review outside sitemap

real HTTP lifecycle proven
DB failure does not cache false absence

Arkhyz/Altay/Sochi use shared geo mechanism
new geo activation does not require new routing architecture

P0/P1 = 0
full verification green
exact candidate SHA recorded
production not executed without owner command
```

---

# 13. EXECUTION ORDER

```text
WAVE A  EPIC 68 → EPIC 69
WAVE B  EPIC 70 ∥ EPIC 71
WAVE C  EPIC 72 ∥ EPIC 74; EPIC 73 after 70+72
WAVE D  EPIC 75; then EPIC 76 ∥ EPIC 77 ∥ EPIC 83
WAVE E  EPIC 78 contract/scaffold; then EPIC 79 ∥ 80 ∥ 81 ∥ 82
WAVE F  EPIC 84
WAVE G  EPIC 85 → EPIC 86
```

`∥` означает независимые streams с отдельными branch/worktree/PR. Shared-file
owners всё равно сливаются последовательно согласно matrix §7.1.

---

# 14. FINAL FORMULA

```text
CURRENT MORE-I-GORY MAIN
+
CORE 5.5 / UI CORE 5.0
+
EXISTING PAYLOAD / GATEWAYS / LEADS / INGEST / SECURITY
+
GEO-FIRST MARKET ARCHITECTURE
+
CRIMEA AS PRIMARY SEO MARKET
+
CITY MARKET HUBS
+
GLOBAL STABLE INVESTMENT PROJECT URLS
+
CURATED /OBEKTY/ CATALOG
+
FEDERAL MARKET COMPARISON HUB
+
UNIFIED SEO STATE ENGINE
+
CONTENT GATES
+
EXPLICIT URL MIGRATION
+
REAL HTTP LIFECYCLE
+
SEO INVARIANT CRAWL
=
MORE-I-GORY GEO-FIRST INVESTMENT PLATFORM V5
```

## Финальный принцип

> География отвечает на вопрос «где инвестировать», глобальный каталог — «что рассматривать», а инвестиционный паспорт — «почему этот конкретный проект стоит или не стоит дальнейшего анализа».

> Крым получает максимальную SEO-глубину первым, но архитектура не становится «крымской»: Архыз, Алтай, Сочи и следующие рынки подключаются через те же contracts, registry и Content Gate без переноса существующих project URL.

> Один EPIC = один Pull Request = targeted verification = exact-head SourceCraft gate = merge в `main`.

# 15. MASTER PLAN MAP

```text
Primary goal:
  Перевести действующий сайт на GEO-first IA без перестройки Core и без
  конкурирующих SEO owners.

Non-goals:
  production, mass SEO matrix, indexable filters/lots/layouts, second CMS/ORM,
  new backend, Redis/Meilisearch, fabricated business facts.

Major outcomes:
  canonical URL grammar; unified SEO state; honest HTTP/cache semantics;
  normalized geo; stable project entities; Crimea/city hubs; crawlable graph;
  exact final proof.

Shared foundations:
  EPIC 69 IA contract; EPIC 71 RouteIdentity; EPIC 72 SeoState;
  EPIC 73 HTTP adapters; EPIC 74 geo DTO/schema.

Data/schema:
  extend current regions and project relations; Payload remains sole owner;
  forward-only migrations only when actual schema changes.

External prerequisites:
  factual content/sources; production/index evidence for legacy URLs;
  SourceCraft exact-head gate; production-like crawl contour.

Security-sensitive areas:
  no new auth/PII owner; analytics dimensions are non-PII; Public Gateway and
  Payload access boundaries remain unchanged.

Infrastructure/release boundary:
  no production, DNS or domain cutover; preview/staging proof only where the
  existing runbook authorizes it.
```

# 16. OWNER DECISION REGISTER

| Decision | Result | Deadline | Status |
|---|---|---|---|
| Primary IA and Crimea launch cohort | GEO-first tree and Crimea + four city surfaces approved; indexability still requires factual Content Gate | before approval | DECIDED |
| Project breadcrumb hierarchy | `Главная → Объекты → Project`; geo is contextual linking | before approval | DECIDED |
| `/novostroyki/` role | supportive/feed surface, default noindex; no second investment entity without explicit mapping | before approval | DECIDED |
| Delivery mode | all epics `MERGE_AFTER_GATE`; one PR and one exact-head gate per epic | before approval | DECIDED |
| Missing business facts | never fabricate; keep noindex/off, record external blocker, continue independent technical work | before approval | DECIDED |
| Production | excluded until a separate explicit owner release command | before production | DECIDED |

Owner decisions remaining before approval: `0`.

# 17. FINAL AUDIT FINDING REGISTER

| ID | Severity | Finding | Resolution | Status |
|---|---|---|---|---|
| F-01 | BLOCKER | SourceCraft repository identity was replaced by GitHub mirror identity | canonical `integrator-p/more-i-gory-next` recorded | RESOLVED |
| F-02 | BLOCKER | EPIC 68 created a competing second plan file | current Markdown declared the single canonical plan | RESOLVED |
| F-03 | MAJOR | SeoState and HTTP adapter ownership overlapped | pure resolver belongs to EPIC 72; runtime materialization to EPIC 73 | RESOLVED |
| F-04 | MAJOR | city epics were needlessly serialized | EPIC 79–82 made mutually parallel after EPIC 78 contract freeze | RESOLVED |
| F-05 | BLOCKER | missing business facts could stop the whole autonomous graph or encourage fabricated content | AVAILABLE/MISSING preflight, noindex/off fallback and task-local external blockers added | RESOLVED |
| F-06 | MAJOR | `buildUrl(pageKey)` could not represent dynamic identities | discriminated `RouteIdentity` contract added | RESOLVED |
| F-07 | QUESTION | project breadcrumb had two competing hierarchies | catalog-first hierarchy selected; geo preserved as contextual links | RESOLVED |
| F-08 | MAJOR | EPIC 79–82 and 84 lacked deterministic verification detail | route, Content Gate, graph, JSON-LD and non-PII checks added | RESOLVED |

Final state: blockers `0`, open major findings `0`, dependency cycles `0`.

# 18. MASTER PLAN AUDIT

```text
Logic/completeness
  blockers: 0
  major open: 0

Architecture/data/security
  blockers: 0
  major open: 0
  ownership: Payload + Public Gateway preserved

Dependency/autonomy
  cycles: 0
  hard dependencies: minimized in §7.1
  independent waves: 7
  parallel city streams: 4
  single blocking points: contract freezes only; each has explicit exit proof

Executability/evidence
  epics with outcome/DoD: 19/19
  epics with verification contract: 19/19
  delivery tasks: required, exactly one per epic in inventory
  delivery mode: MERGE_AFTER_GATE

Owner decisions
  before approval open: 0
  later open: 0 mandatory; production remains a separate command, not plan work
```

# 19. NIGHT RUN READINESS

```text
Independent ready waves:
  A baseline/contracts
  B migration inventory ∥ URL identity
  C SEO/HTTP ∥ geo data
  D routes, catalog, project, future geo
  E Crimea contract then four parallel city streams
  F linking/navigation/analytics
  G crawl and closeout

Critical path:
  68 → 69 → 71 → 72/74 → 75 → 78 → 79–82 → 84 → 85 → 86

External prerequisites:
  facts/sources, legacy index evidence, SourceCraft, staging crawl

Fallbacks:
  missing facts => noindex/off + local blocker;
  missing index evidence => REVIEW, no redirect guess;
  unavailable staging => complete local/runtime-safe work and block only live crawl;
  unavailable SourceCraft gate => do not merge that epic, continue independent work.

Production-only stops:
  DNS, domain cutover, real traffic, production migrations and rollout.

Result: READY_WITH_LIMITS
Limit:
  factual activation and external live proof cannot be produced autonomously
  when source evidence or the contour is absent. This does not block safe
  contract, route, DTO, noindex and test work, and it cannot be removed without
  violating the prohibition on invented facts.
```

# 20. APPROVAL AND HANDOFF CONTRACT

- Approved snapshot: `v1`.
- Plan ID: `AMS-MORE-I-GORY-GEO-FIRST-INVESTMENT-REMEDIATION`.
- Task Manager inventory: schema v2, repository key `more-i-gory-next`.
- Every epic ends with one `MERGE_AFTER_GATE` delivery task.
- Developer resumes an in-progress task first, otherwise claims the next ready
  implementation task, records `EXECUTION_LEDGER_V1`, commits/pushes and
  continues until graph completion or a genuine global owner/production gate.
- Production is forbidden in this graph.

# END

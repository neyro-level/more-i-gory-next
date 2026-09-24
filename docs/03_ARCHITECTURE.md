# Technical Architecture — «Море и Горы»

**Статус:** Active
**Версия:** 3.1 GEO-first architecture contract
**Дата:** 2026-09-24
**Engineering baseline:** AMS Realty Platform Core 5.5 (норматив стека)
**Важно:** этот документ фиксирует только проектную конкретику. Стек, границы
данных и jobs сверяются с
[`AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md`](AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md).
Молчаливые отклонения запрещены.

## 0. Transition contract

EPIC 1 перевёл публичный сайт со static export на production Node.js runtime.
EPIC 2–13, 15–17, 19–66 в `main`
(`cfcc784f61bf9cbfe03f06dc4b724c8dac8b3452`): Payload 3.90.1, PostgreSQL
migrations, Public Gateway, media/S3, regions, properties, newbuild/ingest,
leads, jobs, preview Nginx/systemd и proof matrix. Публичный read идёт через
`src/core/data-access/public/**` (Payload Local API + DTO); при недоступности
Payload действует безопасный fallback.

Принятая цель — `AMS_PROFILE=REALTY_BASE`: Next.js + Payload в одном Node.js
runtime, Managed PostgreSQL, S3 и один jobs owner. Решение принято в
[`ADR-004`](adr/ADR-004-realty-platform-runtime.md), project-specific профиль —
в [`PROJECT.md`](PROJECT.md). Readiness-программа Plan №3 v3 закрыта на EPIC 54;
release EPIC 55–56 не импортировались, production не разрешён.

Remediation baseline (TASK 19.1) был `27ea4c2` (после EPIC 12). Итоговый
Plan №4 candidate — `cfcc784f61bf9cbfe03f06dc4b724c8dac8b3452`.
Exact-main gate, single-build digest, immutable install, migration and live
smoke доказаны в EPIC 67. Карта — в [`README.md`](README.md).

## 1. Architecture Summary

Текущее реализованное состояние — Next.js + Payload в одном Node runtime;
локально schema проверяется на изолированной PostgreSQL 18 database.

```text
Payload published entities
→ Public Gateway (`src/core/data-access/public/**`)
→ serializable DTO
→ Next.js App Router
→ один `next start` Node.js process
→ Nginx reverse proxy (`more-previu.tw1.ru`)
```

Целевая runtime topology (TASK 13.2), одинаковая для preview и production:

```text
Internet
→ Nginx TLS
→ 127.0.0.1:<app-port>
→ Next standalone + Payload
→ Managed PostgreSQL
→ S3
```

Формы используют локальный Payload intake:

```text
Browser
→ POST /api/public/leads/
→ Nginx
→ Next.js server validation / consent / trusted-client rate limit / honeypot / minimum-fill
→ Payload Local API transaction
→ Managed PostgreSQL (`leads`)
→ Payload Admin
```

Это canonical Payload intake первого релиза. Внешняя пересылка заявок и
notification/outbound channels не входят в утверждённый маршрут. Оператор
работает с сохранёнными заявками в Payload Admin.

## 1.1. Delivery Profile

```text
DELIVERY_PROFILE = COMMERCIAL
```

Основание: публичный клиентский сайт с заявками, SEO-трафиком, репутационным
риском и локальным хранением обращений в Payload. Merge в `main` выполняется через
SourceCraft PR и exact-head `STANDARD`/`RISKY` gate. Production release остаётся
только отдельной командой владельца.

## 2. Stack

Exact toolchain первого релиза:

| Package/runtime | Exact version | Contract |
|---|---:|---|
| Node.js | `24.20.0` | `.node-version`, CI |
| pnpm | `11.5.1` | `packageManager`, lockfile |
| Next.js | `16.3.6` | App Router, Node.js runtime |
| Payload / `@payloadcms/*` | `3.90.1` | CMS, Admin, auth, jobs, schema/migrations owner |
| PostgreSQL | `18.6` local / `18.6` managed | one approved cluster `4210557` / database `default_db`; no second staging/restore resource |
| React / React DOM | `19.3.0` | Server First |
| TypeScript | `6.0.3` | strict; TypeScript 7 не используется |
| Tailwind CSS | `4.3.3` | CSS variables, global tokens |
| shadcn CLI | `4.21.0` | controlled primitive installation and inspection |
| Base UI | `1.8.0` | accessible interactive primitive base |
| Lucide React | `1.43.0` | single icon source |
| class-variance-authority | `0.7.1` | typed primitive variants |
| cn | `0.2.6` | canonical class merge utility used by preset |
| Zod | `4.6.1` | build-time content validation |
| GraphQL | `16.14.2` | required Payload peer only; API disabled in config |
| Velite | `0.4.0` | принят после Windows/dev/export smoke |
| sharp | `0.35.4` | image optimization dependency |

Также используется `concurrently` для совместного локального запуска Next.js и Velite.
Exact versions фиксируются в `package.json` и lockfile без ranges.

Next.js / eslint config `16.3.6` и Payload-group `3.90.1` являются текущим
установленным baseline. Compatibility matrix, auth/Admin/media/runtime proof и
HIGH/CRITICAL audit прошли в Plan №4.

## 2.1. Package strategy

```text
FOLDER FORM = canonical
```

Публичный UI живёт в едином project-owned дереве `src/components/**`. Отдельный
`packages/ui` удалён как consumer-free workspace и не должен возвращаться.

| Package | Статус |
|---|---|
| `packages/contracts` (`@more-i-gory/contracts`) | active — shared DTO/schemas |

`pnpm-workspace.yaml` сохраняет общий `packages/*`, но фактически включает только
активные packages. Lockfile не содержит importer для удалённого `packages/ui`.

shadcn contract:
- официальный встроенный registry `@shadcn`; он доступен CLI даже при
  `"registries": {}` в `components.json`;
- Base UI;
- preset `nova`;
- Tailwind CSS 4 и CSS variables;
- `components.json` и project aliases;
- CLI пишет primitives и их client-only реализации прямо в canonical
  `src/components/ui/**`; доменные client leaves изолируются в профильных
  подпапках, сейчас только `src/components/marketing/forms/**`;
- собственные составные компоненты хранятся локально в `src/components/**`;
- частный namespace `@ams` не подключается, пока реально не существует
  утверждённый registry endpoint;
- community registries и вторая UI-библиотека запрещены без ADR.

Build:
- standard `next build` + `next start`;
- `trailingSlash: true`;
- pnpm + frozen lockfile.

Content:
- typed data для commercial entities;
- Markdown для analytics;
- Zod validation;
- Velite — действующий Markdown build pipeline;
- fallback через Adapter без изменения публичных DTO.

Images:
- локальный media registry;
- `next/image` + server-side optimization;
- fallback — заранее оптимизированные локальные WebP/AVIF.

Production:
- immutable Next.js standalone artifact;
- один jobs-active runtime (preview не jobs owner);
- Nginx reverse proxy на `more-previu.tw1.ru`;
- versioned rollout и rollback: CODE EXISTS; live restore — FAIL, см. OWNER_QUEUE.

Backend:
- Next.js + Payload Node runtime для public render, Admin и штатного REST;
- Payload — единственный owner auth/schema/migrations; Prisma отсутствует;
- PostgreSQL adapter работает только через committed migrations (`push:false`);
- внешний CRM/notification adapter остаётся отключённым optional-контуром и не
  входит в первый release.

Границы, сохранённые после remediation:

- публичный UI читает только Public Gateway DTO; Payload types остаются
  server-only в `src/core/data-access/**`;
- GraphQL отключён, anonymous users REST закрыт access rules;
- `next/headers` запрещён в `core/ingest/**`, `core/cache/**` и job handlers;
- `overrideAccess:true` разрешён только controlled owner bootstrap в System Gateway;
- persistence/CMS imports в reusable UI запрещены;
- `use cache` и `cacheComponents` не включены.

## 3. Architecture Layers

Текущая реализация public render:

```text
src/app
→ Public Gateway
→ serializable DTO
→ presentation
```

UI не импортирует контент-файлы и Payload types напрямую.

Payload schema и `payload-types.ts` остаются server-only внутри
`src/core/data-access/**`. Принцип изоляции UI от persistence сохраняется.
Prisma как второй ORM запрещён.

## 4. Domain Modules

- `content`
- `regions`
- `projects`
- `articles`
- `people`
- `media`
- `seo`
- `navigation`
- `redirects`
- `leads`
- `ui`

## 5. Data Architecture

Реализованные DTO первого релиза:
- `SeoEntry`;
- `PageContent`;
- `RegionDTO`
- `ProjectDTO`
- `SourceDTO`
- `ArticleDTO`
- `PersonDTO`
- `MediaAssetDTO`
- `LandingPageDTO`.

`AreaDTO`, `LotDTO`, `DeveloperDTO`, `OperatorDTO` и отдельный `RedirectDTO`
не входят в текущий код. Они добавляются только вместе с реальной моделью данных,
чтобы архитектурный документ не обещал несуществующий runtime-контракт.

Правила:
- `id` — стабильный AMS identifier;
- `slug` — один сегмент;
- `path` — полный canonical path;
- published entity обязана проходить Zod validation;
- relations проверяются build-time;
- project не публикуется без `verifiedAt`, risk block, sources и инвестиционного вывода.

## 6. Content Architecture

### Commercial content
Хранится в typed source files и проходит Adapter/DTO validation.

### Articles

```text
content/articles/*.md
→ Markdown build processor
→ validated source model
→ ArticleSourceAdapter
→ ArticleDTO
→ Content Service
→ static page
```

MDX и произвольный JSX запрещены.

Raw HTML запрещён.

Разрешённые controlled blocks:
- note;
- warning;
- project-card;
- region-comparison;
- cta.

Любой unknown block/attribute/broken relation = build fail.

## 7. Routing

- GEO-first route ownership:
  - `/` — brand/trust;
  - `/investicionnaya-nedvizhimost/` — federal market comparison;
  - `/krym/` — Crimea market owner;
  - `/krym/{city}/` — local market owner из registry;
  - `/obekty/` — curated global investment catalog;
  - `/obekty/{project}/` — global investment entity;
- canonical проекта не зависит от региона: перенос проекта между регионами не
  меняет `/obekty/{project}/`;
- `/novostroyki/` обслуживает опубликованный newbuild inventory и не является
  replacement для инвестиционного каталога `/obekty/`;
- city×category routes не выводятся из данных автоматически; новый route
  требует PAGE-ID, registry decision и Gate;
- будущие регионы включаются registry-driven; глубина Крыма не навязывается
  Архызу, Алтаю или Сочи;
- все production routes известны build-time;
- dynamic project/article routes используют static params;
- route `/obekty/[slug]/` создаётся только при наличии минимум одного
  `published` проекта; до этого в коде хранится готовый
  `ProjectPassportTemplate`, а draft-проект не получает публичный route;
- filter/query states не становятся routes;
- trailing slash фиксируется единообразно;
- custom 404 обязан отдавать 404;
- redirects исполняются Nginx.

## 8. Server / Client Boundary

Главное правило:

> SERVER FIRST.

Server by default:
- page;
- layout;
- hero;
- text/content blocks;
- cards;
- tables;
- article body;
- project economics;
- risks;
- navigation links.

Возможные будущие Leaf Client Components:
- mobile menu;
- qualification form;
- controlled gallery;
- real interactive filters;
- modal;
- deferred map;
- calculator, если появится.

`"use client"` запрещён в `src/app/**` и больших композиционных секциях.

Форма рендерится на сервере и получает минимальный client leaf в
`src/components/marketing/forms/lead-form-client.tsx`; при отключённом JavaScript отправка
fail-closed.

Внутренние переходы используют `next/link`; изображения — `next/image` с
server-side optimizer. `pnpm verify:runtime` поднимает production `next start`,
проверяет маршруты и SEO по реальному HTTP, а JavaScript считает по route
manifest и фактически подключённым initial scripts.

Будущий Client Component:
- получает только минимальные serializable props;
- не импортирует Repository/Adapter;
- не получает полный DTO без необходимости;
- имеет fallback.

## 9. Hydration Contract

Server HTML и первый client render должны совпадать.

В initial render Client Components запрещены:
- `Date.now()`;
- `Math.random()`;
- browser-only data;
- viewport branching;
- localStorage-driven first markup;
- random IDs.

Browser preferences применяются после mount.

Hydration warning блокирует release.

## 10. SEO Architecture

Source of truth по URL/индексации — `02_PRODUCT_STRUCTURE.md`.

Один поисковый intent имеет ровно одного page owner. PAGE-024 является legacy
migration candidate, а не обязательным standalone owner. Current URL не
удаляется и не перенаправляется до evidence-driven manifest EPIC 70.

Будущий SEO state engine отделяет существование route от index activation:
route/contract work может продолжаться при отсутствующих business facts, но
индексация и sitemap остаются закрыты. Неподтверждённые факты не заменяются
правдоподобным текстом.

Architecture обеспечивает:
- HTML content at build;
- unique metadata;
- canonical;
- robots;
- sitemap from published registry;
- crawlable anchors;
- structured data from same content source после прохождения content gate;
- no client-only SEO text.

## 11. Images / Storage

```text
public/images/projects/<amsId>/
public/images/regions/<slug>/
public/images/team/
public/images/og/
public/images/contacts/
public/assets/
```

Rules:
- `next/image` — единственный image component;
- remote runtime images запрещены до включения точных S3 `remotePatterns`;
- Timeweb S3: `https://s3.twcstorage.ru`, `ru-1`, bucket `moreigory-media`,
  path-style addressing, `remotePatterns` pathname `/moreigory-media/media/**`;
- upload policy: `image/avif|jpeg|png|webp`, max 8 MiB, content kinds cannot
  be decorative; decorative empty alt only for `kind=ui`;
- width/height или stable aspect ratio обязательны;
- content image имеет meaningful alt;
- decorative image = `alt=""` + explicit decorative flag;
- published project cover обязательна;
- missing registered media = build fail.

## 12. Maps

Контакты после подтверждения фактического адреса:
```text
server-rendered placeholder
→ explicit user action
→ iframe
```

Project:
- собственная статичная location diagram;
- verified distances;
- external Yandex Maps link.

Общая интерактивная карта в scope первого релиза не входит.

Путь развития: первым кандидатом для интерактивной карты является 2ГИС MapGL.
Он подключается только отдельным пилотом; SDK и тайлы загружаются после действия
пользователя и не входят в initial JavaScript. MapLibre и коммерческая лицензия
Яндекс Карт рассматриваются только после отдельной проверки лицензий и экономики.

## 13. API / Integration Architecture

Единственный public write contract первого релиза:

`POST /api/public/leads`

```text
Browser
→ Next.js `POST /api/public/leads`
→ server validation + consent + trusted-client rate limit + honeypot + minimum-fill
→ Payload transaction: lead + pending delivery records
→ Payload Jobs delivery/recovery when an approved channel is enabled
```

Local Next.js/Payload intake:
- server validation;
- consent;
- rate limit;
- honeypot и minimum-fill anti-spam guards;
- одна транзакция записи в Payload collection `leads`;
- операторская видимость в Payload Admin.

Trusted client boundary:
- Node runtime доступен только через loopback;
- публичный Nginx edge перезаписывает `X-Moreigory-Client-IP` значением
  `$remote_addr`;
- application limiter принимает только валидный IP из этого project-owned
  header и игнорирует public `Forwarded`, `X-Forwarded-For` и `X-Real-IP`;
- Nginx `limit_req` и application limiter дают effective policy
  `5 requests/minute/client`, burst `5`, excess → HTTP `429`.

Outbound delivery:
- не входит в утверждённый первый релиз;
- не требуется для успешного сохранения заявки;
- пустой `LEAD_CHANNELS` означает отсутствие outbound delivery rows/jobs.

Consent payload обязательно содержит `consentVersion`, `accepted` и `acceptedAt`.
Сервер сверяет `consentVersion` с активной версией и сам фиксирует
`acceptedAt`; клиентские дата и версия не считаются доверенными при записи.
`NEXT_PUBLIC_LEADS_ENABLED=true` не требует внешнего CAPTCHA-сервиса или его
ключей. Публичная форма остаётся gated до E2E локальной записи в Payload;
внешний delivery не имитируется и включается только отдельным решением.

PII запрещено отправлять в web analytics.

## 14. Authentication

Payload владеет CMS authentication. Коллекция `users` поддерживает роли
`owner` и `editor`; Payload Admin использует штатную server-side сессию.
Анонимный REST-доступ к users закрыт, GraphQL отключён. Пользовательского
кабинета и отдельного public auth в текущем профиле нет.

## 15. Authorization

Доступ к CMS задаётся collection/global access rules. Public Gateway выдаёт
только `published` DTO и не раскрывает Payload types; privileged maintenance,
ingest и cache operations идут через System Gateway. Изменение ролей или
появление customer auth требует отдельного security решения.

## 16. Background Jobs

Payload Jobs реализуют lead delivery, ingest и maintenance-задачи. В каждом
окружении разрешён ровно один jobs owner; запуск управляется `JOBS_AUTORUN`.
Preview и production остаются с autorun выключенным до отдельного operational
gate, а повторный запуск и recovery покрыты task-specific контрактами.

## 17. Caching
HTML получает `no-cache`; versioned CSS/JS/images — длительное кеширование на Nginx.

Никакой request-time application cache в первом релизе.

## 18. Error Handling

- build validation errors останавливают release;
- форма показывает понятные success/error states;
- API error не уничтожает введённые данные пользователя;
- 404 кастомный;
- broken relation/link = verify fail;
- third-party map failure не ломает основную страницу.

## 19. Logging / Monitoring

Production gate:
- Nginx access/error logs;
- Payload intake/job logs без ПДн в application log payload;
- deployment logs;
- frontend runtime monitoring — отдельное решение перед production, если нужен внешний сервис;
- post-deploy smoke.

## 20. Security Constraints

- no secrets in frontend;
- no direct CRM write from browser;
- CSP;
- TLS;
- security headers;
- no raw HTML from Markdown;
- dependency versions locked;
- forms rate-limited server-side;
- staging noindex + auth;
- Safe Outbound pins TCP via `https.request` `lookup` to the already-validated
  DNS answer; TLS `servername` stays the original hostname. Custom `fetchImpl`
  is test-only and does not perform the socket pin.

## 21. Deployment

```text
SourceCraft
→ Linux builder (not the runtime host)
→ pnpm install --frozen-lockfile
→ next build (standalone)
→ scripts/pack-release.mjs
→ upload /opt/moreigory/releases/<sha>/
→ atomic current symlink
→ systemd restart
→ live smoke
```

Production не выполняет `git pull` и build. Реальный upload/atomic-switch runbook
остаётся human gate until a packed Linux artifact is installed.

## 22. Backup / Recovery

Код:
- SourceCraft.

Production:
- previous versioned artifacts retained according to operations policy.

Rollback:
- atomic switch to previous successful release.

БД:
- Timeweb Managed PostgreSQL с автоматическими backup provider;
- schema изменяется только committed Payload migrations (`push:false`);
- чистая PostgreSQL 18 прошла полную цепочку 27/27; migration
  `20260923_141141_add_reset_password_requested_at` применена на preview;
- отдельная restore DB и backup/restore rehearsal исключены из v3;
- production disaster-recovery rehearsal требует нового отдельного решения;
  текущий technical preview не заявляет restore readiness.

## 23. Testing Strategy

Детерминированный gate `pnpm verify`:
- typecheck;
- lint;
- content validation;
- broken links/relations;
- production build;
- HTML/metadata validation;
- bundle budget.

Отдельный browser/release gate:
- browser smoke и hydration console;
- keyboard/mobile/accessibility smoke;
- redirect/404 HTTP status;
- form E2E через локальный Payload intake; внешний delivery проверяется только
  если отдельным решением включён конкретный adapter.

Этот gate нельзя объявлять пройденным без реально запущенного браузера и
production-like HTTP/Nginx контура.

## 24. Performance Budgets

Initial targets:
- Initial route JS ≤ 210 KB gzip; baseline Node runtime EPIC 1 — 190 KB на `/podbor/`;
- one lazy chunk ≤ 300 KB gzip;
- Project Passport initial transfer ≤ 1.5 MB excluding lazy gallery;
- lab LCP target ≤ 2.5 s;
- CLS target ≤ 0.1;
- TBT target ≤ 200 ms.
- после запуска INP ≤ 200 ms p75.

Budgets are project gates, not SEO ranking guarantees.
`pnpm verify:runtime` обязан падать при превышении initial route JS budget.

## 25. Verification Commands

`pnpm verify:quick` выполняется через `scripts/verify-quick.mjs` и
`scripts/verify-quick-manifest.json`. Runner берёт все `test:*` в порядке
`package.json`, а точные Node runtime conditions — из команды каждого package
script; условия не угадываются по имени файла. Manifest явно фиксирует pre/post
стадии и обоснованные исключения.

Quick-проверка охватывает:
- typecheck;
- lint;
- schemas;
- content relations;
- URL uniqueness;
- Title/Description/H1 uniqueness;
- no forbidden client boundaries;
- no nondeterministic client first render;
- no forbidden request-time APIs in ingest/cache/jobs;
- no `overrideAccess` и persistence imports в reusable UI;
- exact shadcn preset, aliases, approved registries и набор primitives;
- semantic project tokens вместо повторяющихся arbitrary radius/container values;
- `gap`-based vertical rhythm в project-owned UI.

`pnpm verify` дополнительно проверяет:
- production build и запуск `next start`;
- HTTP 200 по всем текущим routes;
- production HTML H1/title/description/canonical/robots;
- canonical;
- sitemap и robots;
- Markdown;
- media;
- runtime 404;
- bundle budgets по route manifest и фактическим initial scripts.

`pnpm audit --audit-level high` обязателен в `RISKY` SourceCraft gate.
Browser, accessibility, Nginx и Leads E2E остаются отдельным release proof.

## 26. Architecture Constraints

AI не имеет права без ADR:
- добавлять CMS/DB/Prisma;
- менять canonical URL model;
- менять Content Repository contract;
- возвращать static export или второй runtime;
- добавлять auth;
- добавлять global client state;
- создавать second image/content pipeline;
- превращать filters/lots в SEO routes;
- менять hosting model.

См.:
- `adr/ADR-001-static-next-export.md`
- `adr/ADR-002-content-repository-boundary.md`
- `adr/ADR-003-canonical-seo-url-model.md`
- `adr/ADR-GEO-FIRST-INVESTMENT-IA.md`
- `adr/ADR-GLOBAL-INVESTMENT-ENTITY-URL.md`
- `adr/ADR-SEO-STATE-ENGINE.md`
- `adr/ADR-NEWBUILD-INVENTORY-ROLE.md`

## 27. Architecture Risks and Revisit Triggers

| ID | Риск | Текущий контроль | Revisit trigger |
|---|---|---|---|
| RISK-010 | Client JS или hydration распространяются на крупные секции | Server First guard, 200 KB route budget, runtime и browser gates | опубликованный route требует новый Client Component |
| RISK-011 | Exact dependency перестаёт быть совместимой с Node runtime | frozen lockfile, audit, `pnpm verify`, runtime proof | major upgrade Next.js либо сбой Velite/image pipeline |

Пересмотр класса проекта обязателен, если появляются runtime CMS, PostgreSQL,
auth, массовый каталог, realtime availability, worker или сложная интерактивная
карта. До отдельного ADR и RISKY stream такие изменения запрещены.

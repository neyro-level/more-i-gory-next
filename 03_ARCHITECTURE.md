# Technical Architecture — «Море и Горы»

**Статус:** Active
**Версия:** 1.7 UI Constitution Conformance
**Дата:** 2026-09-11
**Engineering baseline:** глобальный AMS Engineering Standard / Constitution
**Важно:** этот документ фиксирует только проектную конкретику.

## 1. Architecture Summary

Первый релиз — воспроизводимый статический Next.js-сайт.

```text
typed content / Markdown / media
→ Content Adapters
→ Repository Contract
→ Content Service
→ Next.js App Router build
→ static HTML/CSS/JS artifact
→ Nginx
```

Формы идут отдельно:

```text
Browser
→ POST /api/leads
→ Nginx
→ AMS Leads API
→ downstream CRM/routing
```

## 1.1. Delivery Profile

```text
DELIVERY_PROFILE = COMMERCIAL
```

Основание: публичный клиентский сайт с заявками, SEO-трафиком, репутационным
риском и будущей интеграцией AMS Leads API. Merge в `main` выполняется через
SourceCraft PR и exact-head `STANDARD`/`RISKY` gate. Production release остаётся
только отдельной командой владельца.

## 2. Stack

Exact toolchain первого релиза:

| Package/runtime | Exact version | Contract |
|---|---:|---|
| Node.js | `24.20.0` | `.node-version`, CI |
| pnpm | `11.5.1` | `packageManager`, lockfile |
| Next.js | `16.3.4` | App Router, static export |
| React / React DOM | `19.3.0` | Server First |
| TypeScript | `6.0.3` | strict; TypeScript 7 не используется |
| Tailwind CSS | `4.3.3` | CSS variables, global tokens |
| shadcn CLI | `4.21.0` | controlled primitive installation and inspection |
| Base UI | `1.8.0` | accessible interactive primitive base |
| Lucide React | `1.43.0` | single icon source |
| class-variance-authority | `0.7.1` | typed primitive variants |
| cn | `0.2.6` | canonical class merge utility used by preset |
| Zod | `4.6.1` | build-time content validation |
| Velite | `0.4.0` | принят после Windows/dev/export smoke |
| next-image-export-optimizer | `1.21.1` | принят после static export/image smoke |
| sharp | `0.35.4` | единая override-версия для build pipeline |

Также используется `concurrently` для совместного локального запуска Next.js и Velite.
Exact versions фиксируются в `package.json` и lockfile без ranges.

shadcn contract:
- официальный встроенный registry `@shadcn`; он доступен CLI даже при
  `"registries": {}` в `components.json`;
- Base UI;
- preset `nova`;
- Tailwind CSS 4 и CSS variables;
- `components.json` и project aliases;
- CLI пишет primitives в `src/components/ui/**`; client-only реализации
  изолируются в `src/ui/interactive/**` и реэкспортируются через canonical alias;
- собственные составные компоненты хранятся локально в `src/components/**`;
- частный namespace `@ams` не подключается, пока реально не существует
  утверждённый registry endpoint;
- community registries и вторая UI-библиотека запрещены без ADR.

Build:
- `output: "export"`;
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
- build-time optimization;
- `next-image-export-optimizer` как действующий build-time optimizer;
- fallback — заранее оптимизированные локальные WebP/AVIF.

Production:
- Nginx;
- versioned releases;
- atomic switch;
- rollback на предыдущий artifact.

Backend:
- N/A для публичного рендера;
- отдельный AMS Leads API только для заявок.

Database / ORM / CMS / Auth:
- N/A в первом релизе.

Запрещены в static контуре:
- Server Actions;
- request-time SSR;
- Middleware/Proxy;
- runtime cookies/headers;
- runtime API routes;
- runtime image optimization;
- `use cache` и `cacheComponents`.

## 3. Architecture Layers

```text
src/app
→ Content Service
→ Content Repository Contract
→ Local Adapters
→ typed content / Markdown / media registry
```

UI не импортирует контент-файлы напрямую.

Будущая CMS подключается как `PayloadContentRepository`, не меняя page
components, DTO и URLs. Payload Admin, PostgreSQL и runtime delivery являются
отдельным будущим архитектурным решением; Prisma как второй ORM запрещён.

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

- все production routes известны build-time;
- dynamic project/article routes используют static params;
- route `/obekty/[slug]/` создаётся только при наличии минимум одного
  `published` проекта, потому что Next static export запрещает пустой
  `generateStaticParams()`; до этого в коде хранится готовый
  `ProjectPassportTemplate`, а draft-проект не попадает в `out/`;
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

В текущем первом релизе опубликованные маршруты не импортируют React Client
Components. Client-capable shadcn primitives установлены как будущие leaf-компоненты,
но не входят в route graph и initial JavaScript. Форма рендерится
на сервере и получает framework-free progressive enhancement через
`public/assets/lead-form.js`; при отключённом JavaScript отправка fail-closed.

После `next build` для всех маршрутов
выполняется post-export stripping Next runtime scripts. Это не меняет HTML,
metadata, CSS, изображения и ссылки, но убирает ненужную гидратацию там, где нет
интерактива. Next runtime на старте не сохраняется ни для одного маршрута.

Post-export stripping — проектная оптимизация, а не встроенная возможность Next.js.
Поэтому внутренние переходы используют обычные `<a>` и всегда загружают готовый
HTML-документ, не запрашивая RSC payload. `pnpm verify:artifact` контролирует
наличие HTML, metadata, ссылок и JS-бюджет после stripping.

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
- remote runtime images запрещены;
- width/height или stable aspect ratio обязательны;
- content image имеет meaningful alt;
- decorative image = `alt=""` + explicit decorative flag;
- published project cover обязательна;
- missing registered media = build fail.

## 12. Maps

Контакты после подтверждения фактического адреса:
```text
static preview
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

Единственный public integration contract первого релиза:

`POST /api/leads`

Frontend:
- UX validation only.

AMS Leads API:
- server validation;
- consent;
- rate limit;
- anti-spam/captcha secret;
- routing.

Consent payload обязательно содержит `consentVersion`, `accepted` и `acceptedAt`.
Production endpoint, SLA и routing остаются human gate. До него форма работает
только против явно заданного test/stub контура и не имитирует доставку лида.

PII запрещено отправлять в web analytics.

## 14. Authentication
N/A.

## 15. Authorization
N/A.

## 16. Background Jobs
N/A.

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
- AMS Leads API logs;
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
- staging noindex + auth.

## 21. Deployment

```text
SourceCraft
→ pnpm install --frozen-lockfile
→ pnpm verify
→ build content
→ next build
→ image optimize
→ validate out/
→ upload versioned release
→ atomic switch
→ live smoke
```

Production не выполняет `git pull` и build. Реальный upload/atomic-switch runbook
остаётся human gate и не считается реализованным текущим примером Nginx.

## 22. Backup / Recovery

Код:
- SourceCraft.

Production:
- previous versioned artifacts retained according to operations policy.

Rollback:
- atomic switch to previous successful release.

БД:
- N/A.

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
- form E2E против утверждённого Leads API.

Этот gate нельзя объявлять пройденным без реально запущенного браузера и
production-like HTTP/Nginx контура.

## 24. Performance Budgets

Initial targets:
- Initial route JS ≤ 110 KB gzip;
- one lazy chunk ≤ 300 KB gzip;
- Project Passport initial transfer ≤ 1.5 MB excluding lazy gallery;
- lab LCP target ≤ 2.5 s;
- CLS target ≤ 0.1;
- TBT target ≤ 200 ms.
- после запуска INP ≤ 200 ms p75.

Budgets are project gates, not SEO ranking guarantees.
`pnpm verify:artifact` обязан падать при превышении initial route JS budget.

## 25. Verification Commands

`pnpm verify:quick` проверяет:
- typecheck;
- lint;
- schemas;
- content relations;
- URL uniqueness;
- Title/Description/H1 uniqueness;
- no forbidden client boundaries;
- no nondeterministic client first render;
- no request-time Next APIs;
- no `next/link` client navigation in the static shell.
- exact shadcn preset, aliases, approved registries и набор primitives;
- semantic project tokens вместо повторяющихся arbitrary radius/container values;
- `gap`-based vertical rhythm в project-owned UI.

`pnpm verify` дополнительно проверяет:
- static build и наличие `out/`;
- production HTML H1/title/description/canonical;
- canonical;
- sitemap и robots;
- broken links;
- Markdown;
- media;
- 404 artifact;
- bundle budgets.

`pnpm audit --audit-level high` обязателен в `RISKY` SourceCraft gate.
Browser, accessibility, Nginx и Leads E2E остаются отдельным release proof.

## 26. Architecture Constraints

AI не имеет права без ADR:
- включать server runtime;
- добавлять CMS/DB/Prisma;
- менять canonical URL model;
- менять Content Repository contract;
- заменять static export;
- добавлять auth;
- добавлять global client state;
- создавать second image/content pipeline;
- превращать filters/lots в SEO routes;
- менять hosting model.

См.:
- `ADR-001-static-next-export.md`
- `ADR-002-content-repository-boundary.md`
- `ADR-003-canonical-seo-url-model.md`

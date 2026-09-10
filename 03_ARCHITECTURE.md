# Technical Architecture — «Море и Горы»

**Статус:** Active
**Версия:** 1.5
**Дата:** 2026-09-10
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
| Zod | `4.6.1` | build-time content validation |
| Velite | `0.4.0` | candidate после compatibility smoke |
| next-image-export-optimizer | `1.21.1` | candidate после compatibility smoke |

Также используются `sharp`, `concurrently`, Lucide и официальный shadcn/ui.
Exact versions фиксируются в `package.json` и lockfile без ranges.

shadcn contract:
- официальный registry `@shadcn`;
- Base UI;
- preset `nova`;
- Tailwind CSS 4 и CSS variables;
- `components.json` и project aliases;
- community registries и вторая UI-библиотека запрещены без ADR.

Build:
- `output: "export"`;
- `trailingSlash: true`;
- pnpm + frozen lockfile.

Content:
- typed data для commercial entities;
- Markdown для analytics;
- Zod validation;
- Velite — основной кандидат Markdown build pipeline после compatibility smoke;
- fallback через Adapter без изменения публичных DTO.

Images:
- локальный media registry;
- build-time optimization;
- `next-image-export-optimizer` как кандидат после compatibility smoke;
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

Минимальные DTO:
- `SeoEntry`;
- `PageContent`;
- `RegionDTO`
- `AreaDTO`
- `ProjectDTO`
- `LotDTO`
- `DeveloperDTO`
- `OperatorDTO`
- `SourceDTO`
- `ArticleDTO`
- `PersonDTO`
- `MediaAssetDTO`
- `RedirectDTO`

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

Leaf Client Components:
- mobile menu;
- qualification form;
- controlled gallery;
- real interactive filters;
- modal;
- deferred map;
- calculator, если появится.

`"use client"` запрещён в `src/app/**` и больших композиционных секциях.

Для полностью статических маркетинговых маршрутов после `next build`
выполняется post-export stripping Next runtime scripts. Это не меняет HTML,
metadata, CSS, изображения и ссылки, но убирает ненужную гидратацию там, где нет
интерактива. Клиентский runtime сохраняется только для маршрутов с реальными
Client leaves: на старте `/podbor/` и `/kontakty/`.

Client Component:
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
- structured data from same content source;
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

Контакты:
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

Consent payload обязательно содержит `version`, `accepted` и `acceptedAt`.
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
Static files + HTTP caching на Nginx.

Никакой request-time application cache в первом релизе.

## 18. Error Handling

- build validation errors останавливают release;
- форма показывает понятные success/error states;
- API error не уничтожает введённые данные пользователя;
- 404 кастомный;
- broken relation/link = verify fail;
- third-party map failure не ломает основную страницу.

## 19. Logging / Monitoring

Minimum:
- Nginx access/error logs;
- AMS Leads API logs;
- deployment logs;
- frontend runtime errors по выбранному monitoring tool, если подключён;
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

Production не выполняет `git pull` и build.

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

Mandatory:
- typecheck;
- lint;
- unit validation for schemas/helpers;
- content validation;
- broken links/relations;
- production build;
- HTML/metadata validation;
- browser smoke;
- hydration smoke;
- form E2E;
- redirect verification;
- mobile QA;
- accessibility smoke;
- bundle budget.

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

## 25. `pnpm verify`

Должен проверять:
- typecheck;
- lint;
- unit tests;
- schemas;
- content relations;
- URL uniqueness;
- Title/Description/H1 uniqueness;
- canonical;
- sitemap и robots;
- broken links;
- redirects;
- Markdown;
- media;
- no forbidden client boundaries;
- no nondeterministic client first render;
- hydration smoke;
- no request-time Next APIs;
- no frontend secrets;
- static build и наличие `out/`;
- production HTML H1/title/description/canonical;
- structured data;
- bundle budgets;
- browser smoke;
- accessibility smoke.

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

# AMS STATIC SITE CORE STANDARD 1.1 — SOLO MINIMAL

**Статус:** Superseded — историческая локальная копия стандарта.
**Модель:** solo owner / project manager + AI.
**Production:** static HTML/CSS/JS → Nginx.
**Принцип:** минимальная сложность сейчас; CMS/DB подключаются только по реальной бизнес-потребности.

---

# 0. НАЗНАЧЕНИЕ

Для сайтов AMS с коммерческими страницами, статьями, небольшими фиксированными сущностями, формами, галереями, картами и калькуляторами, где контент ведёт AMS через AI + git.

Если появляются roles, drafts, media library, регулярный import, dynamic catalog, auth, cabinet или server-side workflows — проект проходит отдельное решение о смене класса.

---

# 1. HARD CONTRACT — AI ЧИТАЕТ ПЕРЕД КАЖДОЙ ЗАДАЧЕЙ

1. Production использует Next.js `output: "export"`.
2. На production нет Next.js/Node.js runtime.
3. Payload, PostgreSQL, ORM, Auth, Docker, worker, Redis отсутствуют без доказанной необходимости.
4. Nginx раздаёт готовый `out/`.
5. Контент: `Page -> Content API/Service -> Content Repository -> Local Adapter`.
6. Page/UI не импортируют content-файлы напрямую.
7. Zod schema — source of truth; types = `z.infer`.
8. UI получает DTO и не знает storage.
9. Local Adapter сейчас; Payload Adapter — только при миграции.
10. `id` в DTO — стабильный AMS domain/content ID, не database PK.
11. Payload в будущем хранит AMS ID отдельным unique field.
12. `path` — полный canonical URL-path и route identity.
13. `slug` — только сегмент URL.
14. `path` нормализован: ведущий и завершающий `/`.
15. Route uniqueness: `(locale, path)`.
16. `locale` есть в contract с первого проекта, даже если значение одно.
17. Смена production `path` требует redirect.
18. Commercial pages используют typed blocks.
19. Block type/field names должны быть совместимы с будущими Payload Blocks.
20. Rich text проходит только через `RichTextDTO` + единый `<RichText />`.
21. Entity relations в DTO — refs; resolve выполняет Content Service.
22. Site Settings, Navigation, SEO, Media централизованы.
23. Dynamic routes полностью известны на build через `generateStaticParams()`.
24. Request-time rendering, ISR, Server Actions, dynamic POST/API handlers запрещены.
25. `cookies()`, `headers()`, Proxy/Middleware как application layer запрещены.
26. Next runtime redirects/rewrites/headers не используются как production-механизм static export.
27. Redirects, staging restrictions и security headers реализуются Nginx.
28. Client Components — только для реальной browser-интерактивности.
29. Основной SEO-content не загружается client-side.
30. Default images: preoptimized assets + `images.unoptimized: true`; project-defined build-time custom loader допустим после compatibility smoke и без runtime image service.
31. Secrets не попадают в git, `NEXT_PUBLIC_*`, HTML, JS или `out/`.
32. Заявки: `Browser -> /api/leads -> Nginx -> AMS Leads API`.
33. Browser validation — UX; Leads API повторно валидирует всё.
34. Public CAPTCHA site key допустим; CAPTCHA secret — только в Leads API.
35. Build выполняется в SourceCraft CI; production получает готовый artifact.
36. Production не делает `git pull`, install и build по умолчанию.
37. Deploy должен позволять rollback без rebuild.
38. `pnpm verify` остаётся быстрой ежедневной проверкой.
39. Invalid schema, duplicate ID/path, broken refs/links блокируют release.
40. Staging: Basic Auth + `X-Robots-Tag: noindex, nofollow`.
41. PII-form без required legal pages/consent contract не выпускается.
42. Неиспользуемые modules/directories/infrastructure не создаются.
43. Если static-модель перестала подходить — меняется класс проекта, а не обходятся правила.
44. При равной безопасности выбирается более простое решение для solo owner + AI.

---

# 2. SOURCE OF TRUTH И STACK

## Source of truth

- этот документ — architecture;
- `docs/PROJECT.md` — project-specific decisions;
- `docs/OPERATIONS.md` — deploy/Nginx/recovery;
- `docs/VERSION_MATRIX.md` — pinned versions;
- `docs/adr/` — существенные deviations.

## Core stack

- Next.js App Router;
- React;
- TypeScript `strict`;
- Tailwind CSS;
- shadcn/ui + AMS UI;
- Zod;
- pnpm.

Optional по задаче: Motion, Embla, React Hook Form.

## Canonical Next config

```ts
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
}

export default nextConfig
```

Exact versions — `package.json`, `pnpm-lock.yaml`, `VERSION_MATRIX.md`. Dependencies pinned exact; CI использует frozen lockfile.

---

# 3. CONTENT ARCHITECTURE

## Boundary

```text
App / Page
-> Content API / Service
-> Content Repository
-> Local Adapter
-> Local Sources
```

Будущее:

```text
тот же UI / DTO
-> тот же Repository Contract
-> Payload Adapter
-> Payload
```

## Repository

```ts
type PageQuery = {
  locale?: Locale
  kind?: PageKind
}

type ArticleQuery = {
  locale?: Locale
  tag?: string
  limit?: number
  offset?: number
}

interface ContentRepository {
  getPages(query?: PageQuery): Promise<PageDTO[]>
  getPageByPath(path: string, locale?: Locale): Promise<PageDTO | null>

  getArticles(query?: ArticleQuery): Promise<ArticleDTO[]>
  getArticleByPath(path: string, locale?: Locale): Promise<ArticleDTO | null>

  getSiteSettings(locale?: Locale): Promise<SiteSettingsDTO>
  getNavigation(locale?: Locale): Promise<NavigationDTO>
}
```

Новые methods/entities — только по факту потребности.

## Service rule

Service нужен для composition, refs resolve, related content, breadcrumbs или derived view model. Не создавать service-file на каждый простой getter.

Local Adapter загружает/валидирует content один раз на build и использует module-level indexes/maps; N+1 filesystem reads запрещены.

---

# 4. CONTENT CONTRACTS

## Zod-first

```ts
export const pageSchema = z.object({ /* ... */ })
export type PageDTO = z.infer<typeof pageSchema>
```

Ручное дублирование `interface + schema` запрещено.

## Identity / routing

```ts
{
  id: 'service-seo',
  locale: 'ru',
  slug: 'seo',
  path: '/services/seo/',
}
```

- `id` immutable;
- `slug` — segment;
- `path` — canonical route;
- `(locale, path)` unique;
- locale присутствует с первого проекта.

## Base content

```text
id
locale
path
slug
status: published | hidden
publishedAt?
updatedAt
seo
```

`updatedAt` используется для sitemap `lastmod`, если дата фактическая.
`draft` появляется только с реальным editor/CMS workflow.

## Rich text

```ts
type RichTextDTO =
  | { format: 'markdown'; value: string }
  | { format: 'lexical'; value: unknown }
```

UI:

```tsx
<RichText content={content} />
```

Local Adapter → `markdown`; будущий Payload Adapter → `lexical`.

## References

```ts
type ContentRefDTO = {
  id: string
  type: string
}
```

Repository не возвращает произвольные deeply nested entity trees. Resolve/composition делает Content Service.

## Blocks

Центральный registry:

```text
blockType -> Zod schema -> React Component
```

Правила:

- stable `blockType`;
- stable field names;
- будущий Payload block slug = `blockType`;
- unknown block = build error;
- `Record<string, any>` как core block-model запрещён.

## Formats

- commercial pages/entities — typed TypeScript data;
- articles/long-form — Markdown;
- MDX — только whitelist components;
- JSON — generated/imported static data;
- YAML — только при явном преимуществе.

Arbitrary JSX page-builder в MDX запрещён.

---

# 5. CENTRAL MODELS

**Site Settings:** company/site name, canonical domain, contacts, social, default SEO, analytics IDs, legal links.

**Navigation:** header, footer, legal.

**Media:** stable AMS media ID, `src`, `alt`, dimensions, role. Content media и UI-assets разделены.

**SEO:** title, description, canonical/path policy, robots, OG image.

---

# 6. PROJECT STRUCTURE

```text
src/
  app/
  core/
    content/
      schemas/
      repository/
      services/
      block-registry/
    seo/
    leads/
    lib/

  project/
    content/
    site-settings.ts
    navigation.ts
    redirects.ts
    project.config.ts

  ui/
    primitives/
    components/
    blocks/
    layouts/
    forms/

scripts/
ops/nginx/
docs/
tests/
```

Создаются только при необходимости:

```text
core/media/
core/maps/
core/analytics/
ui/gallery/
ui/calculators/
```

Не создавать заранее:

```text
backend/ db/ prisma/ payload/ auth/
workers/ queues/ redis/ docker/
```

---

# 7. ROUTING, UI, SEO

## Routing

1. Route source of truth — `path`.
2. Dynamic routes используют `generateStaticParams()`.
3. Все production paths известны на build.
4. `dynamicParams = false` — default для static dynamic-routes после проверки pinned Next version.
5. `generateMetadata()` использует тот же content layer.
6. Sitemap строится из published `(locale, path)`.
7. Custom 404 обязателен.

## UI

Server Components — default. Client Components только для forms, calculators, gallery controls, maps, mobile menu, modal/tabs, browser APIs.

State default: local React state / URL state. Global state manager — только по доказанной причине.

Accessibility minimum: semantic HTML, один логический H1, heading hierarchy, keyboard/focus, labels/errors, alt, contrast.

## SEO

Каждая indexable page: title, description, canonical, H1, robots, OG. Structured data — только по фактическим данным.

Redirect source: `src/project/redirects.ts`. Проверки: loop, chain, duplicate source, missing target.

---

# 8. FORMS, LEGAL, LEADS

```text
Form
-> client validation
-> POST /api/leads
-> Nginx proxy
-> AMS Leads API
-> validation / persistence / integrations
```

Static site не пишет в DB, не ходит напрямую в CRM и не хранит CRM secrets.

Browser: UX validation, honeypot/minimum-fill-time, CAPTCHA widget при необходимости.

Leads API: schema validation, normalization, rate limit, consent, CAPTCHA secret/verification, routing/idempotency.

Если форма собирает ПД:

- required privacy/personal-data legal page;
- consent text/link;
- consent payload: `accepted`, `version`, `acceptedAt`;
- применимые требования РФ фиксируются в `PROJECT.md`.

В analytics не отправлять phone/email/name/message/raw form body.

---

# 9. MEDIA, MAPS, CALCULATORS

## Images

```text
source
-> build/prebuild optimization
-> web-ready assets
-> static export
```

Default: `images.unoptimized: true`.

Допустимое проектное отклонение — build-time image optimizer с custom loader, который создаёт все варианты до публикации и не требует runtime-сервиса. Такое решение фиксируется в project technical architecture и проверяется на exact версиях Next.js и optimizer package.

Verify/build проверяет existence, dimensions, alt, oversized media, formats.

Custom loader/CDN — только по project decision.

## Maps

Один адрес → embed/link.

Сложная карта:

```text
Map UI -> thin provider adapter -> Yandex / 2GIS / MapLibre / other
```

Provider/license проверяются для клиента.

## Calculator

Deterministic client logic; formula/config отделены от UI; критичная логика покрывается tests.

---

# 10. SECURITY И STAGING

## Secrets

Не попадают в git/content, `NEXT_PUBLIC_*`, HTML/JS, `out/`, browser logs.

## CSP

Nonce-based CSP для static export не используется: nonce требует request-time dynamic rendering.

Static CSP задаётся Nginx и проверяется на реальном build.

Если inline scripts требуют разрешения:

1. build-compatible hash/SRI — если стабилен и проверен на pinned version;
2. иначе минимально необходимый `'unsafe-inline'` с документированным обоснованием;
3. experimental SRI не является default.

`'unsafe-eval'` в production запрещён без доказанной причины.

Также: HSTS, `X-Content-Type-Options`, Referrer-Policy, frame protection; Permissions-Policy при необходимости.

Untrusted remote MDX, arbitrary raw HTML и unchecked `dangerouslySetInnerHTML` запрещены.

## Staging

- separate hostname;
- Basic Auth/restricted access;
- `X-Robots-Tag: noindex, nofollow`;
- не используется как production canonical;
- test leads изолированы/помечены.

---

# 11. NGINX И DEPLOY

## Topology

```text
Internet
-> Nginx
    -> static out/
    -> /api/leads -> AMS Leads API
```

Production не требует Node/pnpm/PostgreSQL/Payload/Docker/worker/Redis.

## Release model

```text
/var/www/site/
  releases/<release-id>/
  current -> releases/<active>
```

Deploy:

```text
pnpm verify
-> SourceCraft CI
-> next build
-> validate out/
-> upload release
-> switch current
-> Nginx cache/reload step
-> smoke
```

Rollback:

```text
current -> previous release
-> reload if required
-> smoke
```

## Trailing slash

Canonical:

```text
/page  -> 301 -> /page/
/page/ -> 200
```

Nginx directory redirect может обеспечить это автоматически; smoke обязан подтвердить. Если нет — добавляется явное правило.

Обязательно:

```nginx
error_page 404 /404.html;
```

## Symlink/open_file_cache

При `current` symlink старый release не должен оставаться в `open_file_cache`.

AMS default:

```text
switch current
-> nginx reload
-> smoke
```

Иная policy допустима только если зафиксирована и проверена в `OPERATIONS.md`.

## Cache

- `/_next/static/` — long immutable;
- HTML — не immutable;
- unhashed public assets — осторожная policy.

---

# 12. MONITORING, BACKUP, VERIFY

## Monitoring/recovery

Production: external uptime + TLS alert; AMS Leads API мониторится отдельно.

`out/` — generated artifact. Source of recovery:

- SourceCraft repository;
- content/media masters;
- Nginx/deploy config;
- domain/DNS access.

Ежедневный backup generated `out/` не обязателен.

## Daily

```bash
pnpm verify
```

Состав:

```text
typecheck
lint
fast unit tests
content validation
architecture guards
```

## Hard fail

- invalid Zod;
- duplicate AMS `id`;
- duplicate `(locale, path)`;
- invalid path;
- broken ref/link/navigation;
- missing media;
- redirect loop/chain/missing target;
- unknown block;
- published page без required SEO;
- PII form без legal/consent;
- staging без noindex/access protection.

## Static guards

Проверять:

- Server Actions;
- cookies/headers request-time usage;
- dynamic POST/API handlers;
- Proxy/Middleware;
- direct content imports из route/UI;
- direct CRM integration из frontend;
- suspicious secret-like `NEXT_PUBLIC_*`;
- default image optimizer при `output: export`.

CI обязательно выполняет `next build`.

Critical E2E: home/nav, representative dynamic page, article, 404, trailing-slash redirect, lead form, mobile menu, critical map/gallery/calculator.

---

# 13. ЭВОЛЮЦИЯ CONTENT MANAGEMENT

## Stage 1 — Local Static

```text
AI/git -> local content -> build -> static production
```

## Stage 2 — Git-based editor, optional

Если клиенту нужно только browser-editing текста, можно рассмотреть git-based editor поверх тех же files.

Условия:

- static model сохраняется;
- git остаётся source of truth;
- repository/auth integration безопасна;
- совместимость с SourceCraft или bridge доказана.

Decap/Tina и аналоги — примеры класса, не AMS default.

## Stage 3 — Payload / Platform

Payload оправдан при:

- нескольких editors/roles;
- drafts/review/scheduled publishing;
- media library;
- frequent operational changes;
- dynamic catalog/entities;
- automatic import;
- DB как business source of truth;
- auth/users/cabinet;
- server-side workflows.

Не причины: «может пригодиться», рост обычных pages/articles, одна форма, карта или calculator.

Migration seam:

```text
UI / DTO / RichText / Blocks
-> Content API
-> Repository
-> Payload Adapter
```

---

# 14. BUILD MODE

**0. Foundation:** Next/TS/Tailwind, static export, SourceCraft CI, `pnpm verify`.

**1. Content:** Zod-first, Repository/Local Adapter, path/id/locale, block registry, RichText, Settings/Navigation/Media/SEO/redirects.

**2. Public:** routes/pages/articles, metadata, sitemap/robots, accessibility.

**3. Optional:** Leads, analytics, gallery, map, calculator, git-based editor.

**4. Production:** Nginx/TLS/CSP, staging protection, atomic deploy/rollback, monitoring, critical E2E, `PROJECT.md`, `OPERATIONS.md`.

---

# 15. OFFICIAL CONTRACT CHECKS

Перед `VERSION_MATRIX.md`, major upgrade и production-sensitive change:

- https://nextjs.org/docs/app/guides/static-exports
- https://nextjs.org/docs/app/api-reference/components/image
- https://nextjs.org/docs/app/guides/content-security-policy
- https://nginx.org/en/docs/

Framework-specific детали перепроверяются; Core Standard не считает их вечными.

---

# ФИНАЛЬНЫЙ SOLO CONTRACT

Проект соответствует **AMS Static Site Core Standard 1.1**, если:

1. production — static export без Node runtime;
2. нет CMS/DB/Auth/worker без причины;
3. Zod — source of truth;
4. `id` — AMS domain ID;
5. `(locale, path)` — route identity;
6. UI не зависит от storage;
7. Local/Payload adapters разделены Repository contract;
8. Rich Text изолирован;
9. relations используют refs;
10. blocks имеют stable registry/schema/component contract;
11. routes известны на build;
12. images имеют static-compatible optimization path;
13. SEO/navigation/media/redirects централизованы;
14. staging закрыт от доступа и индексации;
15. forms идут через AMS Leads API;
16. secrets отсутствуют во frontend;
17. PII forms имеют legal/consent contract;
18. SourceCraft CI создаёт reproducible artifact;
19. deploy имеет быстрый rollback и учитывает Nginx file cache;
20. Payload подключается только по реальной бизнес-потребности.

> **Главный критерий:** AI должен быстро понять границы проекта, не принести платформенную сложность в статический сайт и сохранить чистый шов для будущего подключения CMS.

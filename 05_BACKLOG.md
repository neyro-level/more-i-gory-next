# Backlog — «Море и Горы»

**Статус:** Active
**Версия:** 1.5
**Дата:** 2026-09-10
**Правило:** это единственный source of truth текущей разработки.

## 1. Horizons

- NOW — foundation и первые страницы.
- NEXT — полный commercial core.
- LATER — расширение после запуска.

## 2. Development Entry Gate

Статус: **PASSED 2026-09-10**.

- PAGE-001..023 имеют полный Page Definition Contract в `02_PRODUCT_STRUCTURE.md`;
- границы страниц Сочи и Крыма повторно проверены Topvisor;
- individual content gate остаётся обязательным перед публикацией каждой страницы;
- `TASK-001` разрешает только foundation и не разрешает преждевременно публиковать пустые SEO routes.

## 3. SourceCraft delivery map

Один PR — один независимо принимаемый эпик. Следующий зависимый PR создаётся от
свежего `origin/main` после review, exact-head gate и merge предыдущего.

| PR | Ветка | Scope | Gate | Status |
|---|---|---|---|---|
| PR-00 | `docs/development-ready-v1` | Development Ready docs, SEO registry, backlog, bootstrap manual-only CI | RISKY | READY FOR GATE |
| PR-01 | `foundation/next-static` | Next.js, TypeScript 6, shadcn, static export, manual-only CI | RISKY | READY |
| PR-02 | `foundation/content-pipeline` | Repository/DTO, Velite smoke, media и images | RISKY | BLOCKED BY PR-01 |
| PR-03 | `foundation/seo-routing` | SEO registry, metadata, sitemap, robots, redirects | STANDARD | BLOCKED BY PR-02 |
| PR-04 | `design/system-shell` | Tokens, primitives, Header, Footer | STANDARD | BLOCKED BY PR-03 |
| PR-05 | `pages/home` | Полная главная | STANDARD | BLOCKED BY PR-04 |
| PR-06 | `pages/core-regions` | Федеральный хаб, Сочи, Крым, Архыз, Алтай | STANDARD | BLOCKED BY PR-05 |
| PR-07 | `pages/sochi-cluster` | Новостройки, апартаменты, Адлер | STANDARD | BLOCKED BY PR-06 |
| PR-08 | `pages/crimea-cluster` | Ялта, Севастополь, Евпатория, Алушта | STANDARD | BLOCKED BY PR-07 |
| PR-09 | `pages/projects` | Каталог, фильтр, инвестиционный паспорт | STANDARD | BLOCKED BY PR-08 |
| PR-10 | `pages/analytics` | Методика, аналитика, пять seed-статей | STANDARD | BLOCKED BY PR-09 |
| PR-11 | `pages/leads-trust-legal` | Подбор, форма, компания, контакты, legal drafts | RISKY | BLOCKED BY PR-10 |
| PR-12 | `quality/release-readiness` | Финальный QA, Nginx и release readiness | RISKY | BLOCKED BY PR-11 |

PR создаётся без автоматических проверок. Перед merge выполняются review,
risk-based local proof и один ручной SourceCraft workflow на exact head SHA.
Production, реальный Leads API и публикация неподтверждённого контента не входят
ни в один PR этого цикла.

# NOW

## EPIC-01 — Project Foundation

### Goal
Создать воспроизводимый static Next.js foundation с архитектурными guards.

### Related Requirements
REQ-014, REQ-015, REQ-019, REQ-020, REQ-021, REQ-022.

### Done When
- scaffold готов;
- exact versions зафиксированы;
- static export работает;
- `pnpm verify` существует;
- repository/content boundary создан;
- базовый release build воспроизводим.

### TASK-001 — Scaffold Next.js foundation

Type: ARCHITECTURE
Status: READY
Epic: EPIC-01
Priority: P1

#### Goal
Создать минимальный проект и зафиксировать toolchain.

#### Requirements
REQ-019.

#### Implementation Scope
- Next.js App Router;
- TypeScript strict;
- Tailwind;
- pnpm;
- static export;
- trailing slash;
- project folders;
- base scripts;
- exact versions in lockfile/version note.

#### Out of Scope
- страницы продукта;
- CMS;
- DB;
- form integration.

#### Acceptance Criteria
- [ ] `pnpm install --frozen-lockfile` работает после первого lock.
- [ ] `pnpm build` генерирует static artifact.
- [ ] production build не требует Node runtime.
- [ ] TypeScript strict enabled.
- [ ] архитектурные folders созданы.

#### Tests
- build;
- typecheck;
- lint.

#### Documentation Impact
Обновить `03_ARCHITECTURE.md`, если exact toolchain отличается от целевого.

#### Dependencies
None.

### TASK-002 — Implement content repository contract

Type: ARCHITECTURE
Status: BACKLOG
Epic: EPIC-01
Priority: P1

#### Goal
Создать границу `Content Service → Repository → Local Adapter`.

#### Acceptance Criteria
- [ ] app/pages не импортируют raw content.
- [ ] DTO validated through Zod.
- [ ] sample Region/Project available through service.
- [ ] broken relation fails verification.

### TASK-003 — Implement architecture guards and `pnpm verify`

Type: ARCHITECTURE
Status: BACKLOG
Epic: EPIC-01
Priority: P1

#### Acceptance Criteria
- [ ] typecheck/lint/build checks.
- [ ] route/path uniqueness.
- [ ] content validation.
- [ ] forbidden client boundary check.
- [ ] production HTML smoke hook.

### TASK-004 — Implement Markdown article pipeline smoke

Type: ARCHITECTURE
Status: BACKLOG
Epic: EPIC-01
Priority: P1

#### Goal
Проверить Velite candidate на exact toolchain.

#### Acceptance Criteria
- [ ] one real article builds.
- [ ] watch works.
- [ ] invalid frontmatter fails.
- [ ] unknown directive fails.
- [ ] no Markdown tooling in client bundle.
- [ ] if smoke fails, fallback implemented through same Adapter.

### TASK-005 — Implement media registry and image pipeline smoke

Type: ARCHITECTURE
Status: BACKLOG
Epic: EPIC-01
Priority: P1

#### Acceptance Criteria
- [ ] one region image and one project image optimized.
- [ ] missing media fails validation.
- [ ] alt/decorative contract validated.
- [ ] stable dimensions.
- [ ] fallback path documented if optimizer incompatible.

## EPIC-02 — Design Foundation

### Goal
Перенести визуальный характер live-сайта в чистую project design system.

### Related Requirements
REQ-001, REQ-021, REQ-022.

### TASK-006 — Implement design tokens
Type: FEATURE
Status: BACKLOG
Priority: P1

Acceptance:
- [ ] colors;
- [ ] typography;
- [ ] spacing;
- [ ] radii;
- [ ] container;
- [ ] responsive steps.

### TASK-007 — Implement core primitives
Type: FEATURE
Status: BACKLOG
Priority: P1

Scope:
- Button;
- SectionShell;
- Container;
- Picture;
- Typography;
- Card primitives.

### TASK-008 — Implement SiteHeader and SiteFooter
Type: FEATURE
Status: BACKLOG
Priority: P1

Acceptance:
- [ ] responsive menu;
- [ ] crawlable links;
- [ ] CTA;
- [ ] keyboard focus;
- [ ] footer matches canonical IA.

## EPIC-03 — SEO / Routing Foundation

### Goal
Собрать route registry, metadata, sitemap, robots, breadcrumbs and redirect data.

### Related Requirements
REQ-014, REQ-015, REQ-016.

Tasks:
- TASK-009 — Implement canonical route registry.
- TASK-010 — Implement metadata and structured data helpers.
- TASK-011 — Implement sitemap/robots.
- TASK-012 — Build legacy redirect registry.

# NEXT

## EPIC-04 — Core Commercial Pages

Goal:
Создать:
- PAGE-001 Главная;
- PAGE-002 federal hub;
- PAGE-003 Сочи;
- PAGE-007 Крым;
- PAGE-012 Архыз;
- PAGE-013 Алтай.

Tasks:
- TASK-013 Home page.
- TASK-014 Federal investment hub.
- TASK-015 Sochi hub.
- TASK-016 Crimea hub.
- TASK-017 Arkhyz hub.
- TASK-018 Altai hub.

Done When:
- pages have real content;
- unique intent/meta;
- internal linking;
- mobile QA;
- HTML validation.

## EPIC-05 — Sochi SEO Cluster

Related:
REQ-004.

Tasks:
- TASK-019 Sochi / novostroyki.
- TASK-020 Sochi / apartamenty.
- TASK-021 Sochi / Adler.
- TASK-022 Sochi cross-page cannibalization review.

## EPIC-06 — Crimea SEO Cluster

Related:
REQ-005.

Tasks:
- TASK-023 Crimea / Yalta.
- TASK-024 Crimea / Sevastopol after business gate.
- TASK-025 Crimea / Evpatoriya.
- TASK-026 Crimea / Alushta.
- TASK-027 Crimea cross-page duplication review.

## EPIC-07 — Curated Objects

Related:
REQ-006, REQ-007, REQ-008, REQ-017, REQ-018.

Tasks:
- TASK-028 Objects index.
- TASK-029 Project Passport template.
- TASK-030 Project data validation.
- TASK-031 Publish first 4 passports.
- TASK-032 Publish remaining 4–8 passports.
- TASK-033 Client-side filters without indexable states.

## EPIC-08 — Methodology and Analytics

Related:
REQ-009, REQ-010.

Tasks:
- TASK-034 Methodology page.
- TASK-035 Analytics index.
- TASK-036 Risks article.
- TASK-037 Operator article.
- TASK-038 Net yield article.
- TASK-039 Liquidity/exit article.
- TASK-040 Sochi vs Crimea decision article.

## EPIC-09 — Lead Conversion

Related:
REQ-011, REQ-012.

Tasks:
- TASK-041 Product landing `/podbor/`.
- TASK-042 Qualification form UI.
- TASK-043 Leads API integration.
- TASK-044 Consent and privacy flow.
- TASK-045 Form E2E.

## EPIC-10 — Trust / Company

Tasks:
- TASK-046 About page.
- TASK-047 Contacts.
- TASK-048 Deferred map.
- TASK-049 Legal pages.

## EPIC-11 — Migration / Release

Tasks:
- TASK-050 Final legacy URL audit.
- TASK-051 Nginx 301 map.
- TASK-052 Staging release.
- TASK-053 SEO/HTML/redirect verification.
- TASK-054 Mobile + hydration + performance verification.
- TASK-055 Production deploy.
- TASK-056 Post-deploy smoke.

# LATER

## EPIC-12 — Evidence-Based Expansion

Candidates:
- Krasnaya Polyana;
- Sirius;
- Sudak;
- other Crimea cities;
- project comparisons;
- cases;
- strategy pages.

No detailed tasks until content/data gate is passed.

## 4. Backlog Rules

- Only READY task can be implemented.
- A task may become READY only after dependencies and acceptance criteria are resolved.
- One working cycle should produce one independently reviewable change.
- Architecture drift requires ADR.
- New SEO URL requires Product Structure update before code.
- Content-зависимая страница может быть технически собрана, но остаётся draft/noindex до прохождения gate.
- TASK-043, TASK-049, TASK-055 и TASK-056 требуют отдельного human gate; production-задачи не входят в текущий цикл.

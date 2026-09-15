# **МАСТЕР-ПЛАН ПЕРЕСТРОЙКИ «МОРЕ И ГОРЫ» → AMS REALTY PLATFORM 5.5**

Plan ID: MORE-I-GORY-REALTY-PLATFORM
Version: v2
Status: APPROVED
Approved by: owner
Approved at: 2026-09-15
Delivery profile: COMMERCIAL

**Исходная точка:** static export (Core Standard 1.1), production не выпускался.  
 **Целевая точка:** `AMS_PROFILE=REALTY_BASE`, Payload \+ Managed PostgreSQL \+ S3 \+ Nginx, один jobs-active runtime.  
 **Ключевое следствие:** production никогда не публиковался → URL-схема переписывается **без redirect-плана один раз, сейчас**, в E7. После E14 любое изменение URL требует redirect.

---

# **0\. ЗАФИКСИРОВАННЫЕ РЕШЕНИЯ (не пересматриваются внутри эпиков)**

1. `AMS_PROFILE=REALTY_BASE`. Триггеров §22 нет.  
2. Локализация выключена. `ru-RU`. Поля `locale` в DTO не вводятся.  
3. `CACHE_INVALIDATION_MODE=http`. Proof B1 не запускается, `in-process` запрещён.  
4. **Крым — SEO-ядро.** Максимальная глубина и приоритет контента.  
5. **Сочи — заглушка.** Маршрут сохраняется, статус `stub`: 200, `noindex`, вне sitemap, вне навигации. Дочерние страницы Сочи (`novostroyki`, `apartamenty`, `adler`) **удаляются** вместе с их PAGE-ID.  
6. Архыз и Алтай — обычные региональные страницы, приоритет P2.  
7. `/obekty/` \= инвестиционные паспорта, `origin=manual`. Это не каталог квартир.  
8. Каталог квартир в ЖК Крыма \= `origin=feed`, `market=newbuild`, приходит из XML-фидов (1–2 источника, \~2 месяца). Схема закладывается в E15, публикуется в E17.  
9. Раздел называется **«Аналитика»**, URL `/analitika/*`. Модуль §22A.4 активируется в E18. `/journal/*` резервируется как namespace и не занимается.  
10. Единая коллекция `properties` для manual и feed inventory (по §8.2). Разделение — через `origin` \+ `market` в predicate публичного gateway, не через вторую коллекцию.  
11. **Инвариант scope деактивации:** `origin='feed' AND feedSource=<id> AND market=<source.market>`. Ни один import-run не может задеть `origin=manual`. Проверяется тестом в E16.  
12. Каналы доставки лидов на старте: Telegram. CRM не включается, но порт/адаптерная граница делается полной в E11.  
13. `cacheComponents` / `use cache` не включаются.  
14. Версии: Next 16.3.4 (поддерживается Payload с 3.73.0, линия 3.89.x), Payload 4.x не канон. React 19.3 / TS 6.0.3 / Tailwind 4.3 подтверждаются фактически при установке в E2.
15. До отдельной команды владельца каждый завершённый эпик проходит `MERGE_AFTER_GATE` и доводится до canonical `main`; production deploy не выполняется.
16. Timeweb app server и Managed PostgreSQL staging/production отложены до получения владельцем отдельного аккаунта и передачи доступов. Их отсутствие не блокирует локально проверяемые эпики E2–E12, но блокирует инфраструктурную часть E13, RELEASE и любые live/production proof.

---

# **1\. ЦЕЛЕВАЯ АРХИТЕКТУРА**

Internet  
 → Nginx (TLS, HSTS, CSP, rate limit, redirects, /admin restriction)  
   → Next.js \+ Payload \+ Payload Jobs (JOBS\_AUTORUN=true), ровно один runtime  
     → Timeweb Managed PostgreSQL  
     → Timeweb S3 (manual media через Payload upload adapter)

Слои и направление зависимостей:

ДАННЫЕ      Payload collections/globals \+ migrations/  
КОНТРАКТ    packages/contracts (DTO, serializable)  
ГЕЙТ        src/core/data-access/{public,system,ingest}  
ПРЕДСТАВЛ.  packages/ui \+ src/app/globals.css

project → core ;  app → core/project/ui ;  ui → contracts  
core \-X→ ui ;  ui \-X→ payload/@payloadcms/\*/pg/project persistence

Владение типами (закрывает долг «Zod не source of truth»):

Payload collections  \= schema  
payload-types.ts     \= server-only, внутри gateway  
Zod                  \= валидация границ (env, вход форм, XML normalization, code-owned registry)  
packages/contracts   \= DTO, собираются mapper'ами

Ни одна модель не описывается руками дважды. Скрипты `scripts/validate-*.mjs` импортируют те же схемы, а не переписывают их.

## **Коллекции по вехам**

M2:  users · media · pages · regions · redirects · properties  
M3:  leads · lead-deliveries  
M5:  developers · residential-complexes · buildings · layouts   (E15, unpublished)  
     feed-sources · import-runs · import-issues                (E16)  
     posts                                                       (E18)  
globals: site-settings · navigation  
не создаются: seo-landings · facet-cache · price-history · phone-reveals · reviews · offices · agents

---

# **2\. ФИНАЛЬНАЯ URL-КАРТА**

| URL | Владелец | Index | Sitemap | Веха |
| ----- | ----- | ----- | ----- | ----- |
| `/` | static composition | yes | P1 | E1 |
| `/investicionnaya-nedvizhimost/` | regions hub | yes | P1 | E7 |
| `/investicionnaya-nedvizhimost/krym/` | regions | **yes** | **P1** | E7 |
| `/investicionnaya-nedvizhimost/krym/yalta/` | regions | yes | P1 | E7 |
| `/investicionnaya-nedvizhimost/krym/sevastopol/` | regions | yes | P1 | E7 |
| `/investicionnaya-nedvizhimost/krym/evpatoriya/` | regions | yes | P2 | E7 |
| `/investicionnaya-nedvizhimost/krym/alushta/` | regions | yes | P2 | E7 |
| `/investicionnaya-nedvizhimost/krym/novostroyki/` | regions (segment) | yes | P1 | E7 |
| `/investicionnaya-nedvizhimost/krym/apartamenty/` | regions (segment) | yes | P2 | E7 |
| `/investicionnaya-nedvizhimost/arkhyz/` | regions | yes | P2 | E7 |
| `/investicionnaya-nedvizhimost/altay/` | regions | yes | P2 | E7 |
| `/investicionnaya-nedvizhimost/sochi/` | regions, `status=stub` | **no** | **нет** | E7 |
| `/obekty/` | properties `origin=manual` | yes | P1 | E8 |
| `/obekty/<slug>/` | properties | yes | P2 | E8 |
| `/analitika/` | pages | yes | P2 | E5 |
| `/metodika/` `/podbor/` `/o-kompanii/` `/kontakty/` | static | yes | P1/P2 | E1 |
| `/privacy/` `/consent/` | pages | no | нет | E10 |
| `/404` | static | — | — | E1 |
| `/admin` | Payload | — | — | E2 |
| `POST /api/public/leads` | route handler | — | — | E10 |
| `POST /api/internal/revalidate` | route handler | — | — | E4 |

Зарезервированные namespace (E5, занимать запрещено):

/analitika/\<slug\>/              → активируется E18  
/novostroyki/                   → активируется E17 (каталог ЖК)  
/novostroyki/\<complex-slug\>/    → canonical URL ЖК  
/komplex/\<slug\>/                → reserved-only, маршрут не создаётся  
/zastroyshchik/\<slug\>/          → активируется E17  
/journal/\*                      → reserved-only, контент живёт на /analitika/\*  
/agenty/\*                       → reserved-only

Комбинации «локация × тип» (`krym/yalta/novostroyki`) — только по whitelist, после появления фактического контента. Автогенерация запрещена (thin content).

Правило индексации inventory в E17: страница ЖК индексируется; типовая планировка (`layouts`) — опционально по whitelist; **отдельная квартира (unit) собственного индексируемого URL не получает.**

---

# **3\. ЭПИКИ**

Каждый эпик \= отдельная ветка/PR. Отчёт по §20. Слова CHECKED/GREEN без фактического прогона запрещены. Эпик не считается закрытым без выполненного Proof.

---

## **M0 — GOVERNANCE**

### **EPIC 0 — Документы, ADR, IA-решения**

**Risk:** STANDARD · **Зависимости:** нет

1. Создать `docs/PROJECT.md` по §21: `AMS_PROFILE=REALTY_BASE`, `TZ=Europe/Moscow`, домены prod/staging, enabled modules, reserved namespaces, `archiveRetentionDays=60`, `leadRetentionDays`, каналы доставки и routing, `CACHE_INVALIDATION_MODE=http`, `INTERNAL_REVALIDATE_BASE_URL`, mapping env-имён, статусы proof’ов, extended-profile triggers.  
2. Создать `docs/OPERATIONS.md` (скелет по §21, заполняется в E13) и `docs/DESIGN.md`.  
3. Переписать `docs/02_PRODUCT_STRUCTURE.md` под новую IA: Крым-ядро, Сочи-заглушка, удаление PAGE-004/005/006, добавление `krym/novostroyki` и `krym/apartamenty`, reserved namespaces. PAGE-ID остаются стабильными идентификаторами.  
4. ADR:  
   * ADR-004 Static export → Realty platform (что умирает и почему)  
   * ADR-005 Crimea-core IA \+ Sochi stub  
   * ADR-006 `regions` collection (owner-решение, вне base §8.1)  
   * ADR-007 Retire `strip-static-route-js` \+ StaticLink-only policy  
   * ADR-008 Image pipeline: Next Image \+ sharp \+ S3 remote patterns  
   * ADR-009 Deferred ingest subsystem (триггер: первый XML-фид, ожидание \~2 мес)  
   * ADR-010 Аналитика как namespace модуля journal  
5. Проверить, что `verify-foundation.mjs` не блокирует `docs/adr/` (сейчас `adr` в `forbiddenLegacyDocPaths`).  
6. `.sourcecraft/ci.yaml`: убрать `grep -c ... -eq 23`; оставить проверку существования документов \+ `pnpm verify`.

**Proof:** `pnpm verify` зелёный, CI на ветке проходит, документы существуют.

---

## **M1 — RUNTIME**

### **EPIC 1 — Runtime pivot: static export → Node**

**Risk:** RISKY · **Зависимости:** E0

1. `next.config.ts`: удалить `output:'export'`, весь блок `env` export-optimizer, `images.loader:'custom'`, `transpilePackages`. Оставить `trailingSlash:true`, `poweredByHeader:false`. Ключ `agentRules:false` удалить, если не документирован в pinned Next.  
2. Удалить: `scripts/strip-static-route-js.mjs`, `scripts/serve-static.mjs`, `remoteOptimizedImages.cjs`, зависимость `next-image-export-optimizer`.  
3. `ExportedImage` → `next/image` во всех местах (`page-hero.tsx`, карточки, home-sections).  
4. `scripts/verify-static-artifact.mjs` → `scripts/verify-runtime.mjs`: поднять `next start`, проверить 200 по всем маршрутам, один H1, наличие SEO-контракта, JS-бюджет по route manifest. **Удалить инвариант «requiredRoutes отсутствуют в sitemap»** — он ломается на первой публикации.  
5. `verify-foundation.mjs`: снять запреты `next/link`, `next/server`. Запрет `next/headers` оставить только для `core/ingest/**`, `core/cache/**`, job handlers (Guard 8). Сохранить запреты `overrideAccess`, persistence-в-UI, `"use client"` вне leaf.  
6. Навигацию перевести на `next/link`. `StaticLink` оставить только для внешних/якорных ссылок либо удалить.  
7. Scripts: `dev`, `build`, `start`, `verify`, `verify:schema`, `verify:daily`.

**Proof:** `next start`, все текущие маршруты 200, H1 корректны, `pnpm verify` зелёный, скриншот-сравнение главной и региональной страницы до/после.  
 **Запрещено:** вносить Payload в этом эпике.

### **EPIC 2 — Payload \+ PostgreSQL \+ миграционный контур**

**Risk:** RISKY · **Зависимости:** E1

1. Установить `payload`, `@payloadcms/next`, `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical`, `sharp`. Обернуть конфиг `withPayload`. Exact-версии \+ `--frozen-lockfile` в CI.  
2. Реструктуризация app: `src/app/(site)/**`, `src/app/(payload)/**` (из template, не редактируется), `src/app/api/public/**`, `src/app/api/internal/**`.  
3. `payload.config.ts` \+ `@payload-config` в tsconfig. Сразу `jobs: { enableConcurrencyControl: true }`, `typescript.outputFile`.  
4. `src/project/env.ts` — Zod-валидация env с условными правилами §16.4. Полный env dump запрещён.  
5. Подготовить migration-only контракт для будущих Timeweb Managed PostgreSQL prod/staging (`push` запрещён), создать изолированный Doppler-проект и выполнить `pnpm verify:schema` на чистой локальной PostgreSQL 18. Фактический cloud provisioning перенесён в production blockers до передачи владельцем отдельного Timeweb-аккаунта.  
6. `users`: self-registration off, lockout, owner \+ опциональный editor. Bootstrap первого owner — контролируемый скрипт через System Gateway.  
7. Первая миграция: `users` \+ `payload-jobs`.

**Proof:** `/admin` открывается, owner создан скриптом, `pnpm verify:schema` на чистой БД, публичный сайт по-прежнему рендерится из текущих JSON.

### **EPIC 3 — Gateways, DTO, package boundary, guards**

**Risk:** RISKY · **Зависимости:** E2

1. Создать `src/core/{access,data-access/{public,system},dto,query,security/{outbound-http,redaction},observability,lib}`.  
2. Public Gateway: в каждой функции `'server-only'`, `overrideAccess:false`, явные `depth`, `select`, `limit`, publication predicate, валидированный вход, на выходе DTO. Raw-документ наружу не уходит.  
3. System Gateway: единственное место с `overrideAccess:true`, whitelist (bootstrap, maintenance, jobs recovery, migration helpers).  
4. **PACKAGE FORM:** создать `packages/contracts` (DTO \+ Zod, без persistence и framework runtime) и `packages/ui`. `packages/ui/package.json` не содержит `payload`, `@payloadcms/*`, `pg`, ORM/DB clients, project persistence.  
5. Удалить `src/content/domain/types.ts` (ручные дубли `z.infer`). Перевести `scripts/validate-*.mjs` на импорт общих схем. `z.string().url()` → актуальный zod-4 стиль.  
6. Реализовать Guards 1–8 §18.4 как исполняемые проверки в `pnpm verify`.

**Proof:** guard-тесты падают на фикстурах-нарушениях; `pnpm verify` зелёный на чистом коде; dependency graph `packages/ui` проверен.

### **EPIC 4 — Jobs и cache invalidation**

**Risk:** RISKY · **Зависимости:** E3

1. `jobs` config §10.1: очереди `system`(false) / `imports`(true) / `maintenance`(false) / `lead-deliveries`(true), `enableConcurrencyControl:true`, `shouldAutoRun` через `JOBS_AUTORUN`. Очередь `imports` объявляется без задач до E16. API сверить с официальной документацией на pinned-версии.  
2. `src/core/cache/invalidator.ts`, контракт `invalidate(targets)`. Top-level `next/cache` запрещён — только lazy `await import('next/cache')` внутри approved-ветки.  
3. `POST /api/internal/revalidate`: `REVALIDATE_SECRET`, POST only, allowlist targets, rate limit, secret-safe логи, не используется как public API.  
4. Typed cache targets: `catalogGroup()`, `propertyPage(slug)`, `regionPage(slug)`, `pageDoc(slug)`, `navigation()`, `siteSettings()`. Per-item синхронная массовая ревалидация запрещена — только батч.  
5. Failure policy §11.5: сбой инвалидации не откатывает записанные данные, фиксируется как operational issue.

**Proof:** **targeted proof B2** — job делает один батчевый POST, секрет принят, следующий публичный запрос отдаёт свежие данные, нет self-throttle.

---

## **M2 — КОНТЕНТ И IA**

### **EPIC 5 — Globals, pages, block registry, redirects, SEO**

**Risk:** RISKY · **Зависимости:** E4

1. Global `site-settings`: название, canonical domain, контакты, соцсети, default SEO, юридические ссылки, analytics IDs. Global `navigation`: header / footer / legal.  
2. Удалить массивы `navigation` из `site-header.tsx` и `site-footer.tsx`; `siteUrl` из `src/seo/metadata.ts` перевести в settings/env.  
3. Коллекция `pages` с **фиксированной блочной схемой**, без universal page-builder. Реестр: `blockType → Payload block → React component`. Стабильные `blockType` и имена полей. Unknown block \= ошибка рендера. Стартовый набор из существующих секций: `hero`, `lead`, `thesis`, `risk-block`, `numbered-steps`, `proof-block`, `scenario-table`, `cards-grid`, `object-cards`, `cta`, `rich-text`.  
4. `drafts: on` для `pages`. Коллекция `redirects`: source/destination/permanent \+ hook-валидация на loop, chain, duplicate source, missing target. Удалить `src/seo/redirects.ts` и `redirects.json`. Применение — генерация Nginx-правил на деплое (не middleware).  
5. SEO-контракт: группа полей на CMS-коллекциях (title, description, canonical override, OG image, robots, priority); для статических маршрутов остаётся `src/seo/registry.json` \+ Zod. Один хелпер `buildPageMetadata()` на оба источника. Жёсткая проверка «published без SEO \= fail». Убрать проверку «== 23».  
6. Динамические `sitemap.ts` / `robots.ts` из БД \+ registry. Исключены: `noindex`, `archived`, `stub`, `draft`.  
7. Страницы `/analitika/`, `/privacy/`, `/consent/` переводятся на `pages`.

**Proof:** правка текста и пункта меню в `/admin` видна на сайте после revalidate без rebuild; redirect loop/chain падают на фикстуре; sitemap содержит только published+index.

### **EPIC 6 — Media и S3**

**Risk:** RISKY · **Зависимости:** E5

1. Коллекция `media`: обязательный `alt` с правилом «`decorative` → `alt=''`», width/height, `kind` (`region|project|complex|og|ui`). **Разделить content media и UI/og-ассеты** — сейчас `og/default.webp` используется как hero на большинстве страниц.  
2. `@payloadcms/storage-s3` на Timeweb S3. VPS-диск не source of truth. Креды только в env.  
3. Перенести 4 существующих ассета из `public/images/**` в S3 скриптом, ссылки → media-документы. Оптимизировать мастера (`sochi-coast.webp` \~909 КБ, `og/default.webp` \~390 КБ непригодны для hero).  
4. `next/image`: `remotePatterns` строго по approved S3 host, wildcard запрещён. Один `priority` LCP-кандидат на страницу, `sizes`, стабильный aspect-ratio, lazy ниже критической зоны, fallback.

**Proof:** загрузка в Admin попадает в S3 и рендерится; Lighthouse mobile на главной и странице объекта: LCP ≤ 2.5 s, CLS ≤ 0.1.

### **EPIC 7 — Regions и реструктуризация IA (Крым-ядро)**

**Risk:** RISKY · **Зависимости:** E6

1. Коллекция `regions`: `slug`, `title`, `kind` (`region|locality|segment`), `parent` (self-relation), `order`, `lead`, `investmentThesis`, `riskSummary`, `heroMedia`, `blocks`, SEO-группа, `status` (`published|hidden|stub`), `drafts:on`.  
2. Наполнить по URL-карте §2: Крым \+ 4 локации \+ 2 сегмента (`novostroyki`, `apartamenty`), Архыз, Алтай, Сочи со `status=stub`.  
3. **Сочи:** отдельный шаблон заглушки — 200, `noindex`, вне sitemap, вне header/footer навигации, честный текст «регион в проработке» \+ CTA на подбор. Дочерние маршруты Сочи удалить вместе с PAGE-004/005/006.  
4. Маршруты: `src/app/(site)/investicionnaya-nedvizhimost/[...path]/page.tsx` либо явные сегменты — выбрать по фактической глубине; путь считается из `slug` \+ parent chain, **не хранится третьим полем**. Тройной учёт маршрута (папка \+ registry \+ JSON) ликвидируется.  
5. Хаб `/investicionnaya-nedvizhimost/` строит карту из `regions` (stub исключён).  
6. Удалить: `src/content/data/{regions,landing-pages,pages}.json`, `_components/region-landing.tsx` и `segment-landing.tsx` перевести на DTO из gateway.  
7. Перелинковка: Крым ↔ локации ↔ сегменты ↔ методика ↔ объекты. Без генерации тонких URL.

**Proof:** все URL из §2 отдают ожидаемый статус/robots; Сочи: 200 \+ noindex \+ отсутствие в sitemap и навигации (автотест); ни одного удалённого URL в sitemap.

### **EPIC 8 — Properties: инвестиционные паспорта**

**Risk:** RISKY · **Зависимости:** E7

1. Коллекция `properties` **полностью по §8.2 сразу**, включая newbuild-readiness (pre-create rule):  
   * identity: `origin` (`feed|manual`), `feedSource` (nullable relation), `externalId`, `importHash`, `firstSeenAt`, `lastSeenAt`, `lastImportRun`  
   * grouping: `externalComplexId`, `externalComplexName`, `externalBuildingId`, `externalLayoutId`  
   * lifecycle: `status` (`active|archived`), `deactivatedAt`, `deactivatedByRun`, `needsReview`, `publishedAt`, `slug`  
   * classification: `market` (NOT NULL, default `secondary`, index), `category`, `dealType`  
   * money: `priceMinor` integer, `currency`, `pricePerMeterMinor`  
   * parameters: `rooms`, `totalArea`/`livingArea`/`kitchenArea` `decimal(10,2)` в м², `floor`, `floors`  
   * location: `region` (relation на `regions`), `locality`, `district`, `street`, `house`, `publicAddress`, `lat`, `lng`  
   * content: `title`, `description`, `images`  
   * private: `unitNumber`, `cadastralNumber`, `internalComment`, `ownerContact`  
   * project-домен паспорта: `verdict`, `facts[]`, `budgetNote`, `riskSummary`, `sources[]`, `verifiedAt`  
2. Private fields защищены **field-level access**, не только DTO. Индексы §8.2, включая `unique(feedSource, externalId)`.  
3. `versions`/`drafts`/`locking` \= off для `properties` (imported inventory contract), on для `pages`/`regions`.  
4. `/obekty/` — предикат `origin='manual' AND status='active' AND publishedAt != null`. Пустой каталог не маскируется под выбор (текущее поведение сохранить). `/obekty/<slug>/` — паспорт.  
5. Lifecycle archived §15.1: 200 \+ «не актуально» \+ noindex \+ вне sitemap \+ релевантные альтернативы; после `archiveRetentionDays` — 301 на релевантную цель или 410\. Redirect на главную запрещён.  
6. Удалить `src/content/data/{projects,media}.json`, `local-content-repository.ts`, `payload-content-repository.ts`, `repository.ts`, `service.ts`.

**Proof:** `catalog list p95 ≤ 300 ms`, `property detail p95 ≤ 200 ms` с логом измерения; тест «private field отсутствует в публичном DTO и в HTTP-ответе»; archived-сценарий end-to-end.

### **EPIC 9 — UI conformance и добор долга**

**Risk:** STANDARD · **Зависимости:** E8 (частично параллелится с E6–E8)

1. Заменить npm-пакет `cn` на `clsx` \+ `tailwind-merge` по shadcn-контракту (иначе конфликтующие Tailwind-классы в переопределениях не мерджатся → тихие визуальные баги).  
2. Вычистить `requiredPrimitives` в `verify-foundation.mjs`: гейт требует `accordion`, `breadcrumb`, `alert`, `badge`, которые нигде не используются — гейт сам генерирует мёртвый код. Оставить только фактически используемые.  
3. Привести `src/ui/interactive/` к §13.6: `lead-form.tsx` лежит там без `"use client"`; `src/components/ui/checkbox.tsx` — реэкспорт-цепочка. Один owner на примитив, `SERVER SECTION → CLIENT INTERACTIVE LEAF`.  
4. Включить Guard 10 (`dark:` при отключённой тёмной теме) и Guard 11 (design literals вне `globals.css`) как исполняемые; расширить allowlist структурных значений тестами.  
5. Guard 9: dependency graph `packages/ui` и `packages/contracts`.  
6. `Container`/`Section` по §13.4, типографические роли §13.3; отклонения зафиксировать в `DESIGN.md`.  
7. Drift audit §19 в режиме отчёта: устранить P0/P1, P2 — в backlog.

**Proof:** `pnpm verify` содержит все 11 guards и падает на фикстурах; drift-отчёт без P0/P1.

---

## **M3 — ЛИДЫ**

### **EPIC 10 — Leads: транзакционный outbox**

**Risk:** RISKY · **Зависимости:** E4, E9

1. Коллекция `leads`: create \= public create-only endpoint, read/update/delete \= owner only, public DTO запрещён. Коллекция `lead-deliveries` по §8.5 (`status`, `attempts`, `nextAttemptAt`, `idempotencyKey`, `externalRef`, `lastErrorRedacted`, `claimedAt`, `heartbeatAt`, компактный `attemptLog[]`).  
2. `POST /api/public/leads`: Zod-валидация, honeypot \+ minimum-fill-time, rate limit (Nginx \+ приложение), consent payload `{accepted, version, acceptedAt}`.  
3. Транзакция §14.1: `BEGIN → insert lead → insert lead-deliveries(pending) для всех активных каналов → COMMIT` → enqueue **после** commit. Внешние HTTP внутри транзакции запрещены. Success ответа зависит только от локального commit.  
4. Один канонический `<LeadForm>`: серверная секция \+ клиентский leaf. Удалить `public/assets/lead-form.js`. `data-consent-version="draft-2026-09-10"` → реальная версия согласия.  
5. **Юридический гейт:** `/privacy/` и `/consent/` должны содержать согласованный текст (сейчас заглушки «human gate»). Без этого форма не выпускается.  
6. Analytics: phone/email/name/message/raw body не передаются.  
7. Снять Nginx-заглушку `/api/leads → 503`.

**Proof:** лид сохраняется при полностью недоступных каналах; форма возвращает success после commit; PII отсутствует в логах; публичный доступ к `leads` и `lead-deliveries` отклоняется (интеграционный тест).

### **EPIC 11 — Доставка лидов**

**Risk:** RISKY · **Зависимости:** E10

1. Порт `LeadDeliveryChannel` \+ `LeadDeliveryPayload`; результат `{externalRef?}`; ошибка `{retryable, safeCode, redactedMessage, deliveryCertainty}`. Адаптер Telegram. CRM-адаптер не включается, граница готова.  
2. `Safe Outbound Client` §9.3 как единственный путь наружу: https по умолчанию, host allowlist, deny localhost/private/link-local, timeout, max response size, re-check редиректов, единый DNS/address safety. Guard 6 запрещает configurable `fetch` мимо него.  
3. Задача `deliverLead`: очередь `lead-deliveries`, `concurrency key = delivery:<leadId>:<channelId>`, `exclusive:true`, `supersedes:false`, `retries=0`, backoff через `waitUntil` по §14A.4 (0 / 1m / 5m / 15m / 60m / 240m).  
4. **Retryable-ошибка не throw’ится:** инкремент `attempts`, append `attemptLog`, расчёт `nextAttemptAt`, `status=pending`, enqueue следующей попытки, handler завершается успешно. State-update и enqueue вне откатываемой транзакции.  
5. `pending → sending` — conditional transition; провал перехода \= выход без HTTP.  
6. Идемпотентность `lead:<leadId>:channel:<channelId>`; `externalRef` сохраняется сразу после подтверждённого remote create. Для Telegram зафиксировать residual duplicate risk при `unknown timeout` в [PROJECT.md](http://project.md/).  
7. Секреты только через env/`credentialRef`; в job input — только `leadDeliveryId`.  
8. Admin: состояние доставки, компактный attemptLog, manual retry `abandoned` с audit-записью. Агрегированные алерты (failure ratio, abandoned, outage, backlog); per-lead алерты off.

**Proof:** **targeted proof G**; переход в `abandoned`; отсутствие секретов/PII в логах и `lastErrorRedacted`; enforcement host allowlist.

### **EPIC 12 — Maintenance, retention, recovery**

**Risk:** RISKY · **Зависимости:** E11

1. Static schedules в `maintenance`: `jobsJanitor`, `leadRetentionCleanup`, `catalogLifecycle`, `recoverLeadDeliveries`.  
2. `recoverLeadDeliveries`: stale `sending` → `pending`; orphan pending sweep (`nextAttemptAt <= now`, нет живого job, возраст ≥ `max(5m, 2× maintenanceInterval)`) → controlled requeue. Закрывает crash-окно между commit и enqueue.  
3. `leadRetentionCleanup`: удаление/анонимизация лида **вместе** с его deliveries по `leadRetentionDays`.  
4. `catalogLifecycle`: применение §15.1 к archived properties.  
5. Trusted `payload-jobs` recovery только в `core/data-access/system/jobs`; generic CRUD по `payload-jobs` запрещён; read-only диагностика owner’у через `jobsCollectionOverrides` при поддержке pinned-версии. Ручная процедура — в [OPERATIONS.md](http://operations.md/). Raw SQL не default.

**Proof:** **targeted proofs E и F**; proof D в части jobs janitor.

---

## **M4 — PRODUCTION**

### **EPIC 13 — Nginx, staging, deploy, backup, monitoring**

**Risk:** RISKY · **Зависимости:** E12

1. Nginx §16.3: TLS \+ HSTS, nosniff, Referrer-Policy, frame protection, точные allowed origins, rate limit на `/api/public/leads` и логин Admin.  
2. **CSP пересобрать.** Текущая `script-src 'self'` работала только потому, что из HTML вырезался весь Next-рантайм. Порядок: build-compatible hash/SRI, если стабилен на pinned-версии → иначе минимально необходимое послабление с документированным обоснованием. `'unsafe-eval'` в production запрещён.  
3. **Канонический trailing slash.** Текущий `try_files $uri $uri/ $uri/index.html` отдаёт 200 и на `/page`, и на `/page/` → SEO-дубли. Нужно явное `301 /page → /page/` \+ smoke-подтверждение.  
4. **Кэш разделить:** хешированные `/_next/static/` — long immutable; нехешированные ассеты — осторожная политика. Текущий общий `expires 30d` по расширениям приводил к отдаче старого `lead-form.js` после деплоя.  
5. `/admin` ограничить по IP/private-access policy согласно [PROJECT.md](http://project.md/). Генерация redirect-правил из коллекции `redirects` на деплое.  
6. Staging: отдельный хост, отдельная БД, non-production secrets, Basic Auth, `X-Robots-Tag: noindex, nofollow`. Дамп production PII в staging запрещён.  
7. Релиз: immutable artifact, `releases/<id>` \+ symlink `current`, порядок «миграции → релиз → reload → smoke», rollback на known-good без rebuild, билд на production-хосте запрещён. **Handover jobs §4.1:** новый runtime `JOBS_AUTORUN=false` → readiness proof → вывод старого → подтверждение отсутствия jobs-active runtime → restart нового с `true` → jobs health.  
8. Managed PostgreSQL automatic backup \+ S3 versioning; **фактическая проверка restore**. External uptime \+ TLS alert. Actionable-алерты §17.5.  
9. Заполнить [OPERATIONS.md](http://operations.md/) целиком по §21.

**Proof:** staging-прогон миграции до production; live smoke; фактически выполненный тестовый restore; проверенный rollback; подтверждённое отсутствие второго jobs-active runtime при handover.

### **EPIC 14 — Тесты, guards, релизный гейт**

**Risk:** RISKY · **Зависимости:** E13

1. Integration minimum §18.5 без import-блока (он в E16): access matrix, anonymous deny, private fields вне DTO, недоступность `leads`/`lead-deliveries`, полный lead-delivery блок, migration-блок (чистая БД, сохранность данных, индексы/constraints, newbuild-readiness defaults).  
2. E2E golden paths: каталог → объект, Admin → правка/публикация, форма → сохранённый лид. Плюс 404, trailing-slash 301, мобильное меню, Сочи-заглушка, archived-объект.  
3. Собрать `pnpm verify` (быстрый: typecheck, lint, guards, unit — **без полного build**), `pnpm verify:schema`, `pnpm verify:daily` (полный).  
4. Зафиксировать таблицу proof’ов в [PROJECT.md](http://project.md/): B2 ✓(E4), G ✓(E11), E ✓(E12), F ✓(E12), D ✓(E12/E16), A и C — N/A до E16, B1 — N/A (режим `http`).

**Proof:** зелёный `verify:daily` на exact main SHA \+ заполненная таблица proof-статусов.

**→ ПЕРВЫЙ PRODUCTION RELEASE**

---

## **M5 — НОВОСТРОЙКИ, ФИДЫ, АНАЛИТИКА**

### **EPIC 15 — Схема новостроек (pre-create, unpublished)**

**Risk:** RISKY · **Зависимости:** E8 (schema-only, можно параллельно с M4)

1. Коллекции §22A.1: `developers` (slug, title, description, media, SEO), `residential-complexes` (slug, title, `developer` relation, `region` relation, `externalComplexId` unique-per-source, адрес, media, blocks, SEO, `status`), `buildings` (`complex` relation, `externalBuildingId`, корпус/срок сдачи), `layouts` (`complex`/`building` relation, `externalLayoutId`, `rooms`, `totalArea`, план).  
2. Связи: `properties.externalComplexId → residential-complexes`, `externalBuildingId → buildings`, `externalLayoutId → layouts`. **`layout != unit`** — смешение является blocking data-model defect.  
3. Expand-migration без backfill. Публичных маршрутов **нет**. Всё `status=draft/hidden`, вне sitemap, вне навигации.  
4. Reserved namespaces из E5 не занимаются.

**Proof:** `pnpm verify:schema` на чистой БД и на копии production-схемы; сайт не изменился ни одним публичным URL; ambiguity-кейс `complex/building + rooms + area` создаёт `needsReview`, auto-merge только по близкой площади запрещён (unit-тест маппера).

### **EPIC 16 — Ingest subsystem (XML/YRL)**

**Risk:** RISKY · **Зависимости:** E15 \+ **триггер: фактический доступный фид**

1. Коллекции `feed-sources` (§8.3: `code`, `parser`, `market`, `feedUrlRef`, `enabled`, `refreshIntervalMinutes`, `nextDueAt`, `lastAttemptAt`, `lastSuccessfulRunAt`, `lastFullRunAt`, `safetyThresholdPercent`, `maxDeactivationsPerRun`, `lastOfferCount`, `lastEtag`, `lastModified`, `lastFeedHash`, `deactivationApproval`), `import-runs`, `import-issues`.  
2. Dispatcher `dispatchDueFeeds` (queue `system`, cron `*/5`): conditional claim через Payload application path, `nextDueAt = max(now+interval, prev+interval)` — missed intervals не догоняются. Затем `create import-run(queued)` → `enqueue importFeed(queue='imports', {feedSourceId, importRunId})` → save `jobId`.  
3. `importFeed`: `retries=0`, `concurrency key = import:feed:<feedSourceId>`, `exclusive`. До первого inventory write — conditional transition `queued → running`; провал \= выход без ingest.  
4. Streaming SAX parser per source в registry по `feedSource.parser`: DTD off, external entities off, max size, structural limits, timeout. Локальный плохой offer → skip \+ `import-issue`; critical anomaly → `suspicious`.  
5. Conditional GET \+ baseline §9.2; `importHash` идемпотентность; bulk touch `lastSeenAt` не считается business write.  
6. Field ownership §9.6: `manual → explicit owner → owning feed → empty`. Feed A не трогает manual и не трогает Feed B.  
7. **Safe deactivation §9.7** со scope из §0.11: `origin='feed' AND feedSource=<id>`. Percentage gate \+ `maxDeactivationsPerRun`. Первый run — только baseline. Одноразовый approval с `consumedAt`.  
8. Heartbeat **вне** ingest-транзакции; `jobsJanitor` расширяется на import (stale → `interrupted`, baseline не меняется, mass deactivation forbidden; orphan queued threshold `max(15m, 3× dispatcherInterval)`).  
9. Import-блок интеграционных тестов §18.5 полностью, включая **тест «import-run не может деактивировать `origin=manual`»** и multi-feed independence для двух источников.  
10. Cache targets: `catalogGroup`, `complexPage`, затронутые slices — батчем.

**Proof:** **targeted proofs A, C, D**; полный import-блок §18.5; staging-прогон на реальном фиде до production.

### **EPIC 17 — Публичный каталог новостроек**

**Risk:** RISKY · **Зависимости:** E16

1. Маршруты: `/novostroyki/` (каталог ЖК Крыма), `/novostroyki/<complex-slug>/` (ЖК: застройщик, корпуса, планировки, доступный inventory, риски, CTA), `/zastroyshchik/<slug>/`.  
2. Индексация: ЖК — index; `layouts` — по whitelist; **unit собственного индексируемого URL не получает**. Фильтры — whitelist only §15.  
3. Public Gateway предикаты: `origin='feed' AND market='newbuild' AND status='active'`. `/obekty/` остаётся строго `origin='manual'` — пересечения нет.  
4. Перелинковка: `krym/novostroyki` ↔ `/novostroyki/` ↔ ЖК ↔ застройщик ↔ аналитика.  
5. Активация reserved namespace, обновление sitemap-секций, [PROJECT.md](http://project.md/), cache registry.

**Proof:** `catalog list p95 ≤ 300 ms` на фактическом объёме фида; `/obekty/` не содержит feed-записей и наоборот (тест); sitemap не содержит unit-URL.

### **EPIC 18 — Аналитика как модуль (posts)**

**Risk:** STANDARD (миграция контента — RISKY) · **Зависимости:** E14

1. Коллекция `posts`: slug, title, description, Lexical body, categories/tags, `relatedRegions`, `relatedProperties`, `sources`, `publishedAt`, SEO, `drafts:on`.  
2. Единый `<RichText />` над Lexical. `dangerouslySetInnerHTML` на непроверенном входе запрещён.  
3. Активировать `/analitika/<slug>/`; листинг с пагинацией, related materials, Article \+ BreadcrumbList structured data только по фактическим данным, journal-секция sitemap, cache targets. RSS — опционально.  
4. Перенести 5 черновиков из `docs/drafts/analitika/*.md` в Payload.

**Proof:** статья публикуется в Admin → появляется в листинге и sitemap после revalidate; structured data валидна.

---

# **4\. ПОРЯДОК И ПАРАЛЛЕЛИЗМ**

E0 → E1 → E2 → E3 → E4 → E5 → E6 → E7 → E8 → E10 → E11 → E12 → E13 → E14 → RELEASE  
                                     ↘ E9 (параллельно E6–E8)  
                                     ↘ E15 (schema-only, параллельно M3/M4)  
                        E16 → E17   (после E15 \+ триггер фида, \~2 мес)  
                        E18         (после E14, по решению владельца)

Строго последовательны E0→E5. Параллелятся: E9 с E6–E8; E15 с M3/M4; E18 независим после E14.

Текущий execution ceiling: завершённые эпики доводятся через PR и обязательный COMMERCIAL Merge Gate до `main`. Переход к E13-инфраструктуре, RELEASE и production deploy приостановлен до отдельной команды владельца после появления Timeweb-аккаунта и доступов.

---

# **5\. КОНСОЛИДИРОВАННЫЙ СПИСОК УДАЛЕНИЯ**

E1: scripts/strip-static-route-js.mjs · scripts/serve-static.mjs ·  
    remoteOptimizedImages.cjs · next-image-export-optimizer ·  
    output:'export' · images.loader:'custom' · env-блок optimizer  
E3: src/content/domain/types.ts  
E5: src/seo/redirects.ts · src/seo/redirects.json ·  
    navigation-массивы в site-header/site-footer · siteUrl-хардкод  
E7: src/content/data/{regions,landing-pages,pages}.json ·  
    маршруты sochi/{novostroyki,apartamenty,adler} · PAGE-004/005/006  
E8: src/content/data/{projects,media}.json · src/content/repository.ts ·  
    src/content/service.ts · adapters/local-content-repository.ts ·  
    adapters/payload-content-repository.ts  
E9: npm-пакет cn · неиспользуемые primitives из requiredPrimitives ·  
    реэкспорт-цепочка components/ui/checkbox.tsx  
E10: public/assets/lead-form.js · Nginx-заглушка /api/leads → 503  
Отдельно (до E8): velite · velite.config.ts · content/articles/\*\* ·  
    src/content/data/articles.json · dev:content · content:build ·  
    velite-блок в validate-content.mjs  
    → 5 черновиков сохранить в docs/drafts/analitika/\*.md вне сборки

---

# **6\. ENV (canonical)**

AMS\_PROFILE=REALTY\_BASE  
TZ=Europe/Moscow  
JOBS\_AUTORUN  
DATABASE\_URI  
PAYLOAD\_SECRET  
NEXT\_PUBLIC\_SERVER\_URL  
CACHE\_INVALIDATION\_MODE=http  
REVALIDATE\_SECRET  
INTERNAL\_REVALIDATE\_BASE\_URL  
S3\_ENDPOINT S3\_REGION S3\_BUCKET S3\_ACCESS\_KEY S3\_SECRET\_KEY  
OUTBOUND\_ALLOWED\_HOSTS  
LEAD\_CHANNELS=telegram  
LEAD\_OUTBOUND\_HOSTS  
TELEGRAM\_BOT\_TOKEN TELEGRAM\_CHAT\_ID  
ALERT\_WEBHOOK\_URL  
FEED\_SOURCE\_\*            \# с E16

Условная Zod-валидация §16.4. Полный env dump запрещён.

---

# **7\. ЗАПРЕЩЕНО НА ВСЁМ ПРОТЯЖЕНИИ**

Redis, broker, отдельный jobs runner в BASE, Elasticsearch, PostGIS, imgproxy, GraphQL/tRPC, custom auth, личный кабинет, multitenancy, второй ORM, вторая UI-библиотека/icon pack, Optimized Read Gateway до измеренного bottleneck, universal page-builder, `overrideAccess` вне System Gateway, `push` в production, design literals вне `globals.css`, wildcard remote image hosts, occupancy reserved namespace, per-item синхронная массовая ревалидация, PII-дамп в staging, второй jobs owner на очередь.

Избранное/сравнение, если понадобятся — только client-only (localStorage/URL), это не личный кабинет.

---

# **8\. БЛОКЕРЫ PRODUCTION (двигать параллельно с M2)**

1. Согласованные юридические тексты privacy \+ consent с версией — блокирует E10.  
2. Фактически выполненный тестовый restore БД — блокирует E13.  
3. Подтверждённый rollback на known-good artifact — блокирует E13.  
4. Telegram bot token \+ chat ID \+ host allowlist — блокирует E11.  
5. Реальные контакты для `/kontakty/` и `site-settings` — блокирует E5.  
6. Утверждённый контент Крым-ядра (Крым \+ 4 локации \+ 2 сегмента) — блокирует индексацию после E7.
7. Отдельный Timeweb-аккаунт проекта, app server, Managed PostgreSQL staging/prod и связанные секреты — блокируют инфраструктурную часть E13, RELEASE и production deploy. До передачи владельцем доступов cloud-ресурсы не создавать; разработка продолжается до `main`.

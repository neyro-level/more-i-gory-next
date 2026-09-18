# Project Profile — «Море и Горы»

**Статус:** Active — BUILD MODE
**Дата:** 2026-09-18
**Профиль:** `AMS_PROFILE=REALTY_BASE`
**Delivery profile:** `COMMERCIAL`
**Timezone:** `Europe/Moscow`

Этот документ фиксирует только особенности проекта поверх AMS Realty Platform
Core. Продуктовые требования, URL и текущая работа остаются в профильных
Source of Truth проекта.

## 1. Проект и окружения

| Параметр | Значение |
|---|---|
| Проект | «Море и Горы» — инвестиционное бюро курортной недвижимости |
| Production domain | `more-previu.tw1.ru` technical preview; final `moreigori.ru` reserved for later cutover and currently not used by this release |
| Staging domain | `more-previu.tw1.ru` — полноценный staging/preview; `moreigori.ru` reserved for later cutover |
| Production runtime | один Next.js standalone + Payload runtime за host Nginx; jobs остаются `JOBS_AUTORUN=false` до отдельного production jobs gate |
| Production server | Timeweb `Moregory`, регион `ru-1`, Ubuntu 26.04; SSH aliases `moreigory` (deploy, sudo) и `moreigory-root` |
| Secret Master | project `more-i-gory-server`, env `prod` — единственный source of truth для server и DB credentials |
| Production database | отдельная Timeweb Managed PostgreSQL, регион `ru-1`, достижима с сервера (проверено 2026-09-18) |
| Staging database | отдельная database name на существующем Managed PostgreSQL, без production PII |
| Manual media | Timeweb S3 bucket `moreigory-media`, endpoint `s3.twcstorage.ru`, region `ru-1`, path-style, публичное чтение; создан и проверен 2026-09-18 |
| Repository | SourceCraft `integrator-p/more-i-gory-next` |

Production и staging не используют общую БД, secrets или пользовательские
данные. Production build на сервере запрещён.

### Operational and legal summary

| Область | Текущее решение |
|---|---|
| Active feeds/parsers | pipeline настраивается в EPIC 26 и сразу замораживается; живой XML-фид и каталог объектов не активируются 3–4 месяца |
| Non-secret integrations | Payload Admin, Timeweb Managed PostgreSQL и Timeweb S3 подтверждены; внешний канал оповещений о заявках решением владельца не подключается |
| Backup | planned: automatic Managed PostgreSQL backup + S3 versioning; retention и provider-independent copy — `TODO` до EPIC 13 |
| Restore proof | не выполнялся; обязательный фактический restore test в EPIC 13 |
| Legal | оператор ПДн и публичные реквизиты утверждены владельцем; privacy/consent опубликованы как `privacy-2026-09-17` и `pdn-consent-2026-09-17`; банковские реквизиты не публикуются |
| Core version | нормативная база — локальные конституции `docs/AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md` и `docs/AMS_UI_CORE_v5.0_FINAL.md` |
| Server state | проверено 2026-09-18: nginx active (только default site), приложение не развёрнуто, Node/pnpm/docker отсутствуют — EPIC 13 является первичным провижинингом |

Эта таблица фиксирует статусы, а не доказательство готовности. Planned integration
не включается и не требует secrets до своего эпика.

## 1.1. Implementation status (TASK 19.3)

Статусы: `IMPLEMENTED` — код в `main`; `PARTIAL` — код есть, контракт неполный;
`DISABLED` — выключено решением; `NOT_PROVEN` — нет runtime/E2E evidence;
`OWNER_GATE` — только команда владельца.

| Подсистема | Статус | Комментарий |
|---|---|---|
| Payload CMS / Admin / schema | IMPLEMENTED + NOT_PROVEN public render | Admin живёт; публичный `ContentService` ещё на JSON adapters |
| PostgreSQL | IMPLEMENTED local; PARTIAL managed | Managed DB есть и доступна с сервера; app на хосте не развёрнут |
| S3 | IMPLEMENTED bucket + PARTIAL app wiring | бакет `moreigory-media` проверен; Payload adapter на сервере NOT_PROVEN |
| Leads intake | IMPLEMENTED + NOT_PROVEN E2E | форма/API/commit есть |
| Lead delivery | PARTIAL + NOT_PROVEN | handler-заглушка; внешний канал DISABLED |
| Newbuild schema / public catalog | IMPLEMENTED namespaces | живого каталога объектов нет |
| Feed ingest | PARTIAL; DISABLED autorun | код в `main`; freeze до отдельной команды; 3–4 месяца без живого фида |
| Jobs | IMPLEMENTED registry + NOT_PROVEN runtime | `JOBS_AUTORUN=false`; janitor stub |
| Retention | IMPLEMENTED code + NOT_PROVEN live clock | |
| Cache invalidation | IMPLEMENTED `http` + NOT_PROVEN live | endpoint есть; B2 live в EPIC 13/27 |
| Staging | NOT_PROVEN | контур описан; поднимается в EPIC 13 на `more-previu.tw1.ru` |
| Production | OWNER_GATE | EPIC 33; выкат только по отдельной команде |

## 2. Включённые модули

### Realty Base

- Payload Admin и users: `owner`, опционально `editor`;
- globals: `site-settings`, `navigation`;
- editorial content: `pages`, `regions`, `redirects`, `media`;
- инвестиционные паспорта: `properties` с `origin=manual`;
- public/system gateways и DTO contracts;
- Payload Jobs и HTTP cache invalidation;
- leads и transactional delivery outbox;
- Nginx, staging, migrations, backup и operations.

### Отложенные модули

| Модуль | Статус | Условие активации |
|---|---|---|
| Newbuild schema | enabled | EPIC 15: hidden-by-default collections, no unit routes |
| XML/YRL ingest | implemented then frozen | EPIC 26: proof on fixture, затем jobs выключены до отдельной команды |
| Public newbuild catalog | enabled | EPIC 17: `/novostroyki/`, `/novostroyki/<complex-slug>/`, `/zastroyshchik/<slug>/` |
| Posts `/analitika/<slug>/` | disabled | EPIC 18 после EPIC 14 и решения владельца |
| CRM delivery | disabled | внешний канал оповещений не подключается в этой программе |
| Maps | disabled / `TODO` | отдельное решение provider/license до подключения |
| Reviews, offices, stats, price history | disabled | отдельное доказанное продуктовое требование |

Disabled module не требует env, jobs, коллекций или клиентского JavaScript.

## 3. URL и reserved namespaces

Каноническая URL-карта принадлежит `02_PRODUCT_STRUCTURE.md`. До её обновления
в EPIC 0 целевыми решениями считаются решения мастер-плана.

Активированы:

- `/novostroyki/` — EPIC 17;
- `/novostroyki/<complex-slug>/` — EPIC 17;
- `/zastroyshchik/<slug>/` — EPIC 17;

Зарезервированы и не создаются раньше указанного эпика:

- `/analitika/<slug>/` — EPIC 18;
- `/komplex/<slug>/` — reserved only;
- `/journal/*` — reserved only, аналитика остаётся в `/analitika/*`;
- `/agenty/*` — reserved only.

`/obekty/` принадлежит только инвестиционным паспортам с `origin=manual`.
Feed inventory `market=newbuild` не может попадать в этот публичный срез.
`/novostroyki/` принадлежит опубликованным ЖК; активные предложения внутри
карточки ЖК читаются только через `origin=feed AND market=newbuild AND
status=active`. Unit/filter/layout URL не получают самостоятельный
индексируемый маршрут без отдельного whitelist.

## 4. Retention и lifecycle

- `archiveRetentionDays=60`;
- `leadRetentionDays=100`;
- `leadHistoryRecoveryDays=200`;
- `leadHistoryPurgeDays=300`;
- архивный объект сначала остаётся доступным с `noindex`, затем получает только
  релевантный `301` или `410`; redirect на главную запрещён;
- lead PII анонимизируется после 100 дней; восстановимая операционная история
  без PII хранится ещё 200 дней; после 300 дней lead и связанные
  `lead-deliveries` удаляются вместе;
- staging не получает production leads или неанонимизированный PII dump.

## 5. Leads и routing

- стартовый канал: не подключается; заявки живут в Payload Admin;
- CRM не включена, но delivery port остаётся расширяемым;
- success формы зависит от локального commit lead + pending deliveries, а не от
  ответа Telegram;
- внешний канал оповещений не подключается: заявки сохраняются в БД и проверяются оператором в Payload Admin;
- `deliverLead` использует concurrency key `delivery:<leadDeliveryId>` как
  owner-approved safe proxy для пары `lead + channel`: запись
  `lead-deliveries` имеет уникальный индекс по этой паре, а job input остаётся
  минимальным и содержит только `leadDeliveryId`;
- Telegram не даёт проекту полноценный idempotency key: после unknown timeout
  возможен residual duplicate risk, поэтому `externalRef` сохраняется сразу
  после подтверждённого remote create, а unknown outcome уходит в retry/recovery
  без записи ПДн в error log;
- новый token, chat ID и outbound host allowlist являются external secret gate;
- phone, email, name, message и raw body не передаются в analytics или логи.

## 6. Cache invalidation

```text
CACHE_INVALIDATION_MODE=http
```

- in-process invalidation запрещена;
- внутренний endpoint: `POST /api/internal/revalidate`;
- `INTERNAL_REVALIDATE_BASE_URL` задаётся окружением и не является публичным URL;
- `REVALIDATE_SECRET` хранится только в secret manager;
- массовый import выполняет одну батчевую invalidation по typed targets, а не
  синхронный вызов на каждый объект.
- catalog group инвалидирует tag `catalog`, `/obekty/` и `/novostroyki/`;
- import по новостройкам дополнительно инвалидирует affected
  `/novostroyki/<complex-slug>/` и segment slices вроде
  `/investicionnaya-nedvizhimost/krym/novostroyki/`.

## 7. Env mapping

Значения и secrets в документации не хранятся.

| Назначение | Project env | Примечание |
|---|---|---|
| Profile | `AMS_PROFILE` | фиксированное значение `REALTY_BASE` |
| Timezone | `TZ` | `Europe/Moscow` |
| Database | `DATABASE_URI` | проектное имя роли `DATABASE_URL` из Core 3.0; runtime alias не вводится |
| Payload secret | `PAYLOAD_SECRET` | secret |
| Public canonical server URL | `NEXT_PUBLIC_SERVER_URL` | проектное имя роли `NEXT_PUBLIC_SITE_URL` из Core 3.0 |
| Jobs ownership | `JOBS_AUTORUN` | `true` только у одного jobs-active runtime |
| Cache mode | `CACHE_INVALIDATION_MODE` | `http` |
| Internal revalidation URL | `INTERNAL_REVALIDATE_BASE_URL` | server-only |
| Internal revalidation auth | `REVALIDATE_SECRET` | secret |
| S3 | `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` | credentials are secret; до записи в Secret Master читаются из Timeweb API |
| Outbound policy | `OUTBOUND_ALLOWED_HOSTS` | exact allowlist |
| Lead channels | `LEAD_CHANNELS` | `telegram` |
| Lead outbound policy | `LEAD_OUTBOUND_HOSTS` | exact allowlist |
| Lead channel | не настроен; канал оповещений исключён из текущей программы |
| Alerts | `ALERT_WEBHOOK_URL` | optional secret integration |
| Feed sources | `FEED_SOURCE_*` | только при configured ingest source |

`src/project/env.ts` обязан fail closed и валидировать только env включённых
модулей. Полный env dump запрещён.

## 8. Proof registry

| Proof | Статус | Владелец этапа |
|---|---|---|
| B1 — in-process cache invalidation | N/A | режим `http` запрещает B1 |
| B2 — HTTP cache invalidation | landed in code EPIC 4; live proof EPIC 13 | EPIC 4 / 13 |
| G — lead delivery | landed in code EPIC 11; live proof pending secrets | EPIC 11 |
| E — lead recovery | landed in code EPIC 12; live proof pending | EPIC 12 |
| F — retention/recovery | landed in code EPIC 12; live proof pending | EPIC 12 |
| D — jobs janitor | landed in code EPIC 12; live proof pending | EPIC 12, расширение в EPIC 16 |
| A — ingest | schema/jobs in `main`; N/A until configured feed | EPIC 16 |
| C — safe deactivation | schema/jobs in `main`; N/A until configured feed | EPIC 16 |

Статус proof меняется только после фактического прогона с evidence. `CHECKED` или
`GREEN` без выполненной проверки запрещены.

## 9. Extended-profile triggers

Текущий профиль остаётся `REALTY_BASE`. Расширение требует отдельного решения и
обновления Architecture/ADR, если появляется хотя бы одно из условий:

- отдельный authenticated пользовательский кабинет;
- multitenancy или общий production instance для нескольких клиентов;
- второй backend, ORM, broker, Redis, Elasticsearch или PostGIS;
- отдельный jobs service вместо одного jobs-active runtime;
- custom auth/MFA или изменение trust boundary;
- Optimized Read Gateway до измеренного bottleneck;
- новый лицензируемый map/media/integration provider;
- production-scale модуль, отсутствующий в списке включённых выше.

`NEEDS_OWNER`: мастер-план ссылается на §21/§22 Realty Platform 5.5, тогда как
локальный канонический skill содержит Realty Platform Core Standard 3.0 и
определяет `PROJECT.md` в разделе N.1. До появления канонического Standard 5.5
этот документ следует точным решениям мастер-плана и совместимым инвариантам
Standard 3.0; неизвестные значения не додумываются.

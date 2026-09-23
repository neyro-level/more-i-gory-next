# Project Profile — «Море и Горы»

**Статус:** Active — BUILD MODE
**Дата:** 2026-09-23
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
| Preview database | существующая `default_db` на cluster `4210557`; это единственный project-owned data contour v3 |
| Manual media | Timeweb S3 bucket `moreigory-media`, endpoint `s3.twcstorage.ru`, region `ru-1`, path-style, публичное чтение; создан и проверен 2026-09-18 |
| Repository | SourceCraft `integrator-p/more-i-gory-next` |
| Last closed program baseline | Plan №3 v3 / PR 100 / `21e484c98503550dbfbcbef38eb2e9eecd8d8308` |

Preview и будущий release используют одну утверждённую БД. Migration chain и
минимальные technical records были доказаны; production user data не заявлены.
Production build на сервере запрещён.

### Operational and legal summary

| Область | Текущее решение |
|---|---|
| Active feeds/parsers | pipeline настраивается в EPIC 26 и сразу замораживается; живой XML-фид и каталог объектов не активируются 3–4 месяца |
| Non-secret integrations | Payload Admin, Timeweb Managed PostgreSQL и Timeweb S3 подтверждены; внешний канал оповещений о заявках решением владельца не подключается |
| Backup | PostgreSQL: Timeweb Managed automatic backup. S3 versioning + TAP |
| Restore proof | не входит в v3; отдельная restore DB и rehearsal запрещены текущим plan |
| Legal | оператор ПДн и публичные реквизиты утверждены владельцем; privacy/consent опубликованы как `privacy-2026-09-17` и `pdn-consent-2026-09-17`; банковские реквизиты не публикуются |
| Core version | нормативная база — локальные конституции `docs/AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md` и `docs/AMS_UI_CORE_v5.0_FINAL.md` |
| Server state | EPIC 48–49 preview migration/runtime, immutable install и rollback PASS; exact Plan №3 closeout candidate evidence переносится в следующий technical plan |

Эта таблица фиксирует статусы, а не доказательство готовности. Planned integration
не включается и не требует secrets до своего эпика.

## 1.1. Implementation status (TASK 19.3)

Статусы: `IMPLEMENTED` — код в `main`; `PARTIAL` — код есть, контракт неполный;
`DISABLED` — выключено решением; `NOT_PROVEN` — нет runtime/E2E evidence;
`OWNER_GATE` — только команда владельца.

| Подсистема | Статус | Комментарий |
|---|---|---|
| Payload CMS / Admin / schema | IMPLEMENTED | Admin и public pages через Public Gateway; fallback при недоступности Payload |
| PostgreSQL | IMPLEMENTED managed + local | clean chain 26/26 и upgrade fixture PASS; одна managed `default_db` утверждена v3 |
| S3 | IMPLEMENTED + LIVE PROOF | `moreigory-media` path-style; keys synchronized to Secret Master; Put/Head/Delete PASS |
| Leads intake | IMPLEMENTED + TAP | POST `/api/public/leads`; PII logs proof 14.K |
| Lead delivery | IMPLEMENTED pipeline; channel DISABLED | внешний канал не подключается |
| Newbuild schema / public catalog | IMPLEMENTED namespaces | живой XML-фид заморожен |
| Feed ingest | IMPLEMENTED then frozen | fixture proof; autorun off |
| Jobs | IMPLEMENTED one-owner runbook | preview не jobs owner |
| Retention | IMPLEMENTED + TAP | live clock не обязателен для 14.H |
| Cache invalidation | IMPLEMENTED http + TAP | B2 proof в EPIC 27/32 |
| Preview | IMPLEMENTED + LIVE PROOF | EPIC 48–49 migration/runtime/install/rollback PASS; exact `21e484c` candidate tuple не сохранён |
| Production | NOT AUTHORIZED | новый approved technical plan, release prerequisites и отдельная owner-команда |

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
- `/analitika/` и `/analitika/<slug>/` — route реализован; публикация и index
  остаются под editorial/content gate;

Зарезервированы и не создаются раньше указанного эпика:

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
| Database | `DATABASE_URI` | Secret Master source: `MOREIGORY_DATABASE_URL`; generic `DATABASE_URL` is legacy and not consumed |
| Payload secret | `PAYLOAD_SECRET` | secret |
| Public canonical server URL | `NEXT_PUBLIC_SERVER_URL` | проектное имя роли `NEXT_PUBLIC_SITE_URL` из Core 3.0 |
| Jobs ownership | `JOBS_AUTORUN` | `true` только у одного jobs-active runtime |
| Cache mode | `CACHE_INVALIDATION_MODE` | `http` |
| Internal revalidation URL | `INTERNAL_REVALIDATE_BASE_URL` | server-only |
| Internal revalidation auth | `REVALIDATE_SECRET` | secret |
| S3 | `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` | credentials are secret; required fail-fast in production runtime; local/build/verify-runtime may omit them |
| Outbound policy | `OUTBOUND_ALLOWED_HOSTS` | exact allowlist |
| Lead channels | `LEAD_CHANNELS` | unset; пустой registry — текущий contract |
| Lead outbound policy | `LEAD_OUTBOUND_HOSTS` | unset при пустом registry; exact allowlist нужен только после отдельного включения канала |
| Lead channel | не настроен; delivery rows/jobs и внешний outbound не создаются |
| Alerts | `ALERT_WEBHOOK_URL` | optional secret integration |
| Feed sources | `FEED_SOURCE_*` | optional; freeze — не обязательны и не включают ingest после деплоя |

`src/project/env.ts` обязан fail closed и валидировать только env включённых
модулей. Полный env dump запрещён.

## 8. Proof registry

| Proof | Статус | Владелец этапа |
|---|---|---|
| B1 — in-process cache invalidation | N/A | режим `http` запрещает B1 |
| B2 — HTTP cache invalidation | PASS: contract/TAP и integration proof | EPIC 42 |
| G — lead delivery | PASS локально: retryable → delivered; внешний канал остаётся disabled | EPIC 42 |
| E — lead recovery | PASS: deterministic recovery test | EPIC 42 |
| F — retention/recovery | PASS: deterministic retention test | EPIC 42 |
| D — jobs janitor | PASS: one-owner/jobs proof; production autorun остаётся gate | EPIC 42 |
| A — ingest | PASS на fixture; живой feed заморожен | EPIC 42 |
| C — safe deactivation | PASS на fixture; живой feed заморожен | EPIC 42 |

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

Локальный канон проекта — `AMS Realty Platform Core 5.5` и `AMS UI Core 5.0`,
оба хранятся в `docs/`. Отклонение допускается только как явное Approved
Exception в `docs/README.md`/`docs/DESIGN.md` либо отдельный ADR.

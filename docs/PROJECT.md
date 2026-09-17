# Project Profile — «Море и Горы»

**Статус:** Active — BUILD MODE
**Дата:** 2026-09-15
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
| Production domain | `TODO: подтвердить до EPIC 5` |
| Staging domain | `TODO: подтвердить до EPIC 2/13` |
| Production runtime | один Next.js + Payload runtime и один jobs-active process |
| Production database | отдельная Timeweb Managed PostgreSQL, регион `TODO` |
| Staging database | отдельная Timeweb Managed PostgreSQL, без production PII |
| Manual media | Timeweb S3 через Payload upload adapter |
| Repository | SourceCraft `integrator-p/more-i-gory-next` |

Production и staging не используют общую БД, secrets или пользовательские
данные. Production build на сервере запрещён.

### Operational and legal summary

| Область | Текущее решение |
|---|---|
| Active feeds/parsers | отсутствуют; XML/YRL ingest выключен до EPIC 16 и появления фактического feed |
| Non-secret integrations | Payload Admin, Timeweb Managed PostgreSQL, Timeweb S3 и Telegram delivery запланированы; production endpoints и accounts пока не утверждены |
| Backup | planned: automatic Managed PostgreSQL backup + S3 versioning; retention и provider-independent copy — `TODO` до EPIC 13 |
| Restore proof | не выполнялся; обязательный фактический restore test в EPIC 13 |
| Monitoring | planned: внешний uptime monitor + TLS alert; provider и alert destination — `TODO` до EPIC 13 |
| Legal | privacy/consent, оператор ПДн, реквизиты и consent version не утверждены; `NEEDS_OWNER`, блокирует EPIC 10 |
| Core version | target мастер-плана — Realty Platform 5.5; локально доступен нормативный Core Standard 3.0, отдельного core package нет |

Эта таблица фиксирует статусы, а не доказательство готовности. Planned integration
не включается и не требует secrets до своего эпика.

## 2. Включённые модули

### Realty Base

- Payload Admin и users: `owner`, опционально `editor`;
- globals: `site-settings`, `navigation`;
- editorial content: `pages`, `regions`, `redirects`, `media`;
- инвестиционные паспорта: `properties` с `origin=manual`;
- public/system gateways и DTO contracts;
- Payload Jobs и HTTP cache invalidation;
- leads и transactional delivery outbox;
- Telegram как единственный стартовый delivery channel;
- Nginx, staging, migrations, backup, monitoring и operations.

### Отложенные модули

| Модуль | Статус | Условие активации |
|---|---|---|
| Newbuild schema | enabled | EPIC 15: hidden-by-default collections, no unit routes |
| XML/YRL ingest | enabled, jobs explicit | EPIC 16: feed sources/import runs/issues; no autorun without configured source |
| Public newbuild catalog | enabled | EPIC 17: `/novostroyki/`, `/novostroyki/<complex-slug>/`, `/zastroyshchik/<slug>/` |
| Posts `/analitika/<slug>/` | disabled | EPIC 18 после EPIC 14 и решения владельца |
| CRM delivery | disabled | отдельное решение; стартовый канал — Telegram |
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
- `leadRetentionDays=TODO` — `NEEDS_OWNER` до EPIC 10/12;
- архивный объект сначала остаётся доступным с `noindex`, затем получает только
  релевантный `301` или `410`; redirect на главную запрещён;
- удаление или анонимизация lead включает связанные `lead-deliveries`;
- staging не получает production leads или неанонимизированный PII dump.

## 5. Leads и routing

- стартовый канал: `telegram`;
- CRM не включена, но delivery port остаётся расширяемым;
- success формы зависит от локального commit lead + pending deliveries, а не от
  ответа Telegram;
- фактический Telegram destination и fallback routing: `TODO` до EPIC 11;
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
| S3 | `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` | credentials are secret |
| Outbound policy | `OUTBOUND_ALLOWED_HOSTS` | exact allowlist |
| Lead channels | `LEAD_CHANNELS` | `telegram` |
| Lead outbound policy | `LEAD_OUTBOUND_HOSTS` | exact allowlist |
| Telegram | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | secrets |
| Alerts | `ALERT_WEBHOOK_URL` | optional secret integration |
| Feed sources | `FEED_SOURCE_*` | только после EPIC 16 |

`src/project/env.ts` обязан fail closed и валидировать только env включённых
модулей. Полный env dump запрещён.

## 8. Proof registry

| Proof | Статус | Владелец этапа |
|---|---|---|
| B1 — in-process cache invalidation | N/A | режим `http` запрещает B1 |
| B2 — HTTP cache invalidation | planned | EPIC 4 |
| G — lead delivery | planned | EPIC 11 |
| E — lead recovery | planned | EPIC 12 |
| F — retention/recovery | planned | EPIC 12 |
| D — jobs janitor | planned | EPIC 12, расширение в EPIC 16 |
| A — ingest | N/A до feed | EPIC 16 |
| C — safe deactivation | N/A до feed | EPIC 16 |

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

# Owner / deferred queue

**Статус:** Active owner-gate register during night hardening v1
**Последний план:** `AMS_MORE_I_GORY_NIGHT_HARDENING_PREVIEW_PLAN_V1` v1 APPROVED
**Code baseline:** `8db1c1ced37bbd8c0b486bdb6e81ccd3ace7c683`
**Дата нормализации:** 2026-09-25

Этот файл больше не изображает незавершённый EPIC 54. Он хранит только
фактические внешние решения и входы будущих программ. Новый Task Manager graph
из него не создаётся автоматически.

## DEFERRED_BY_OWNER

Владелец явно отложил этот scope. Он не блокирует текущую техническую
нормализацию и не должен порождать точечные задачи до возврата области в работу.

| Область | Текущее безопасное состояние | Условие возврата |
|---|---|---|
| Business facts, команда, коммерческая модель, методика, география | `CONTENT_FACT_PACKET.md` сохранён; неподтверждённые claims не публикуются | отдельная команда владельца на factual content |
| Крым и четыре city hub | route/DTO/SEO contracts готовы, но facts `MISSING`; страницы остаются вне sitemap | источники, review и прохождение Content Gate |
| Проекты и аналитика | опубликованные сущности разрешены только при полном publication contract; fixtures и draft/review не индексируются | реальные паспорта/статьи, источники и `verifiedAt` |
| Index activation | effective SEO state fail-closed; проверенный sitemap candidate содержит 0 URL | явное прохождение factual Content Gate, затем повторный crawl |
| Адрес/карта/provider | карта отключена, provider/license не выбран | отдельное owner-решение |
| Production и `moreigori.ru` | production не выпускался; DNS/TLS/cutover не менялись | отдельная release-команда после approved technical plan |

## NEXT_TECHNICAL_PLAN_INPUTS

Каноническое имя секции сохранено для project guard. Технические входы Plan №4
и GEO-first routing/SEO contracts закрыты; ниже остались только внешние решения.
Они не являются дефектами кода и не должны автоматически превращаться в новые
Beads-задачи.

| Приоритет | Решение | Текущее безопасное состояние | Требуемый результат |
|---:|---|---|---|
| P0 | Factual content cohort | все неподтверждённые страницы noindex/off и вне sitemap | утвердить источники, факты и launch cohort |
| P0 | Index activation | effective SEO state и crawl fail closed | включать только страницы, реально прошедшие Content Gate |
| P1 | Recovery policy | backup не считается доказанным restore | отдельный ephemeral restore rehearsal перед production-ready claim |
| P1 | Production release | exact candidate не установлен на production | отдельная команда `Выпускаем production` после повторного release proof |

## RESOLVED — REMOVE FROM ACTIVE QUEUE

Следующие старые пункты закрыты evidence и не должны снова показываться как
blocker:

| Старый пункт | Результат | Evidence |
|---|---|---|
| Managed PostgreSQL credential rotation | PASS; старый credential revoked, consumer healthy | `proofs/47.O-operational-rotation-ledger.md` |
| Payload/S3/app env в Secret Master | PASS; единый canonical scope и полный 17-key env | `proofs/47.O-operational-rotation-ledger.md` |
| Preview runtime install/rollback | PASS на exact preview SHA `f06fdb0…` | `proofs/49.O-preview-operation.md` |
| S3 credential correction | PASS; Put/Head/Delete и синхронизация выполнены | `proofs/49.O-preview-operation.md` |
| CAPTCHA / Turnstile account | superseded; внешний CAPTCHA исключён approved v3 | `MORE_I_GORY_PLAN_№ 3.md` v3 |
| Reserved `packages/ui` | PASS; consumer-free workspace удалён, возврат блокирует Guard 9 | Plan №4 EPIC 65.1 |

## REVISIT_ONLY_ON_TRIGGER

- advisory lock или TTL-record для jobs owner не являются текущим долгом:
  one-owner runbook, guard и tests существуют; возвращаться только при реальном
  dual-owner incident или изменении topology;
- точечные `301` создаются только при появлении подтверждённого legacy URL с
  однозначной заменой; пустой redirect inventory не является долгом.

## Правило следующего планирования

Текущий night hardening plan закрывает только перечисленный технический scope и
technical preview. После него новый план нужен только для factual content/index
activation либо для отдельного production release. GEO-first V5 scope не
расширять скрыто. Production всегда остаётся отдельным explicit gate.

# Owner / deferred queue

**Статус:** Active deferred-input register
**Последний план:** `MORE_I_GORY_PLAN_№ 3` v3 APPROVED / CLOSED
**Code baseline:** `21e484c98503550dbfbcbef38eb2e9eecd8d8308`
**Дата нормализации:** 2026-09-23

Этот файл больше не изображает незавершённый EPIC 54. Он хранит только
фактические внешние решения и входы будущих программ. Новый Task Manager graph
из него не создаётся автоматически.

## DEFERRED_BY_OWNER

Владелец явно отложил этот scope. Он не блокирует текущую техническую
нормализацию и не должен порождать точечные задачи до возврата области в работу.

| Область | Текущее безопасное состояние | Условие возврата |
|---|---|---|
| Business facts, команда, коммерческая модель, методика, география | `CONTENT_FACT_PACKET.md` сохранён; неподтверждённые claims не публикуются | отдельная команда владельца на content/product plan |
| Коммерческие, региональные и аналитические страницы | draft/stub/noindex и publication gates сохраняются | утверждённый launch cohort и источники |
| Адрес/карта/provider | карта отключена, provider/license не выбран | отдельное owner-решение |
| Production и `moreigori.ru` | production не выпускался; DNS/TLS/cutover не менялись | отдельная release-команда после approved technical plan |

## NEXT_TECHNICAL_PLAN_INPUTS

Эти пункты должны пройти triage в следующем master plan. Они не являются
активными Beads-задачами до approval.

| Приоритет | Вход | Evidence / ограничение | Требуемый результат |
|---:|---|---|---|
| P0 | Critical Next/Payload upgrade | Next `16.3.4` и Payload `3.89.0` имеют подтверждённые critical security updates | Next `16.3.6`, Payload-group `3.90.1`, migration strategy, regression surface, RISKY gate |
| P0 | Legacy `mg-*` Beads graph | 156 open, 149 blocked, 7 ложных ready; записи не имеют current Plan ID | validate history-preserving quarantine/supersede contract, затем убрать из ready-work без удаления evidence |
| P0 | EPIC 54 exact-main candidate evidence | PR 100 / run 143 / merge `21e484c` известны; original task ledgers и installed digest отсутствуют | новый immutable tuple `SHA + digest + path + smoke` либо честное supersede |
| P1 | `work/ci-gate-split` | отдельный clean stream, 5 commits поверх Plan №3 main | принять/перебазировать/отклонить до создания конкурирующего CI/release scope |
| P1 | Property enum live preflight | до migration база была пустой; после minimal seed появились technical rows; старый `queried:false` больше не достаточен | новый read-only drift report; DDL только при фактической необходимости |
| P1 | Recovery policy | restore rehearsal исключён решением Plan №3 v3; backup не считать доказанным restore | owner decision и отдельный recovery contract до production-ready claim |
| P2 | Reserved `packages/ui` | пакет inactive, runtime imports отсутствуют, но guards/lockfile его учитывают | удалить со всеми references либо явно оставить как архитектурное решение |

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

## REVISIT_ONLY_ON_TRIGGER

- advisory lock или TTL-record для jobs owner не являются текущим долгом:
  one-owner runbook, guard и tests существуют; возвращаться только при реальном
  dual-owner incident или изменении topology;
- точечные `301` создаются только при появлении подтверждённого legacy URL с
  однозначной заменой; пустой redirect inventory не является долгом.

## Правило следующего планирования

Сначала technical plan: critical Next/Payload upgrade и перечисленные технические входы.
Content/product plan формируется позже отдельным revision input владельца.
Production всегда остаётся отдельным explicit gate.

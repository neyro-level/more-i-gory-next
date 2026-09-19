# EPIC 42 — Final platform proofs

**Дата:** 2026-09-19  
**Проверенный code SHA:** `12c62c48905018221544f509ec37ec0d10fd59fc`  
**Режим:** локальные test harnesses и disposable PostgreSQL 18; production не затронут.  
**Итог:** PASS

## Изменённые critical boundaries

| Scope | Критерий | Команда | Verdict |
| --- | --- | --- | --- |
| Public boundary | published доступен; hidden и stub отсутствуют в params, sitemap, generic route и related links | `pnpm test:final-public-boundary` | PASS |
| Safe Outbound | oversized chunked body отменяется до полного producer body; bytes ограничены limit + один chunk; slow stream отменяется до первого chunk | `pnpm test:safe-outbound` | PASS |
| Same hash | первый HTTP 200 фиксирует success и baseline; второй byte-identical HTTP 200 даёт unchanged, не пишет inventory, продвигает successful/full timestamps и сохраняет offer count | `pnpm test:feed-same-hash-unchanged` | PASS |
| Suspicious baseline | 1000 → 100 → 100 дважды остаётся suspicious без снижения baseline и mass deactivation | `pnpm test:suspicious-baseline-regression` | PASS |
| Heartbeat visibility | independent PostgreSQL connection видит heartbeat до commit длинной ingest transaction | `HEARTBEAT_TEST_DATABASE_URI=<disposable-pg18> pnpm test:heartbeat-visibility` | PASS |
| Lead migration | 5/5 строк сохранены; только sent → delivered; индексы и unique constraint сохранены; historical deliveredAt может быть NULL | `LEAD_DELIVERY_MIGRATION_TEST_DATABASE_URI=<disposable-pg18> pnpm test:lead-delivery-migration` | PASS |
| Retryable delivery | Payload retries=0; retryable error не бросается, возвращает pending, пишет nextAttemptAt и ставит executable waitUntil job | `pnpm test:lead-delivery-task` | PASS |

Для heartbeat и migration использованы отдельные временные базы
`moreigory_epic42_heartbeat_exact` и `moreigory_epic42_lead_exact` на локальном
PostgreSQL 18. Обе базы удалены сразу после PASS.

## Повторно выполненные существующие proofs

На том же SHA повторно выполнены без переписывания исторических proof-файлов:

```text
pnpm test:cache-invalidator
pnpm test:ingest-proof-acd
pnpm test:lead-delivery-recovery
pnpm test:lead-retention-cleanup
pnpm test:jobs-handover
pnpm test:jobs-config
pnpm test:runtime-topology
pnpm test:storage-s3
pnpm test:timeweb-s3-contract
```

Все команды: **PASS**. Advisory lock не добавлялся; подтверждён действующий
контракт одного jobs-owner и управляемого handover.

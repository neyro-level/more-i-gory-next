# Property enum drift report (TASK 24.1a)

Generated without applying a live-data rewrite.

## Contract

- category: apartment | house | land | commercial
- dealType: sale | rent

## Query

```sql
SELECT id, category, deal_type
FROM properties
WHERE (category IS NOT NULL AND category <> '' AND category NOT IN ('apartment', 'house', 'land', 'commercial'))
   OR (deal_type IS NOT NULL AND deal_type <> '' AND deal_type NOT IN ('sale', 'rent'))
ORDER BY id;
```

## Prior live schema evidence

- checked against: Timeweb managed PostgreSQL 18 bootstrap database
- checked at: 2026-09-19
- schema preflight queried: true
- `properties` table existed: false
- out-of-contract rows: not applicable until the migration chain is applied

This historical evidence is not a current zero-row drift result. It is preserved
so a later read-only run cannot erase the verified pre-migration state.

## Current read-only result

- queried: false
- out-of-contract rows: not queried
- query error: none

_no sample rows_

TASK 24.1b applies the Postgres enum conversion to existing rows only when this count is 0 or the owner unblocks EPIC 34.

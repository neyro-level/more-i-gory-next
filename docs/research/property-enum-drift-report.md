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

## Result

- queried: false
- out-of-contract rows: not queried
- query error: Cannot find package 'postgres' imported from C:\ams-worktrees\moreigory-epic-24\scripts\report-property-enum-drift.mjs

_no sample rows_

TASK 24.1b applies the Postgres enum conversion to existing rows only when this count is 0 or the owner unblocks EPIC 34.

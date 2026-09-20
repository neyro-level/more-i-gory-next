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

## Live schema preflight

```sql
SELECT to_regclass('public.properties') AS properties_table;
```

## Result

- checked against: Timeweb managed PostgreSQL 18 bootstrap database
- checked at: 2026-09-19
- schema preflight queried: true
- `properties` table exists: false
- out-of-contract rows: not applicable until the migration chain is applied
- query error: none

_no sample rows_

The live database is empty and unmigrated, so this is not evidence of a zero-row enum drift result. Apply the repaired migration chain in place only through EPIC 48 after its preflight and recovery gate. Re-run the row query immediately before any enum conversion; conversion is allowed only when the table exists and the out-of-contract count is zero.

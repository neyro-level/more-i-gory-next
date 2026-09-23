# Мастер-план № 4 — Security upgrade и техническое оздоровление

**Plan ID:** `more-i-gory-technical-hardening-2026-09`  
Версия: v1  
Статус: APPROVED
**Утвердил:** владелец, 2026-09-23  
**Дата:** 2026-09-23  
**Code baseline:** `21e484c98503550dbfbcbef38eb2e9eecd8d8308`  
**Delivery profile:** COMMERCIAL  
**Platform:** AMS Realty Platform 5.5 + Payload + PostgreSQL  
**Task Manager:** owner approval получен; импорт разрешён только после PASS
финального audit и clean inventory validation

## 1. Назначение

План приводит техническую основу проекта в проверяемое состояние после закрытия
Plan №3. Первый приоритет — одним RISKY-потоком обновить Next.js `16.3.4` до
`16.3.6` и весь Payload-набор с `3.89.0` до `3.90.1`: обе текущие версии имеют
официально подтверждённые critical security updates. После обновления закрывается
только проверенный backend, infrastructure и repository debt.

Владелец утвердил exact v1 после сборочного раунда. Финальный audit завершён с
`READY_WITH_LIMITS`: implementation/merge разрешены утверждёнными delivery
modes, production по-прежнему требует отдельной release-команды.

## 2. Границы

### Входит

- единый exact-version upgrade `payload` и всех `@payloadcms/*` пакетов;
- exact patch-upgrade `next` и `eslint-config-next` до `16.3.6`;
- обязательная auth/schema migration и повторная генерация типов/import map;
- проверка Payload Admin, users/auth, access, gateways, jobs, media/S3 и Lexical;
- explicit `serverURL` / CSRF / CORS origins и полный Nginx security-header contract;
- исправление подтверждённых ingest invariants до разморозки любого feed;
- backend hardening lead rate-limit без включения outbound channel;
- чистый install, migration fixtures, full local verification и exact-head gate;
- нормализация старого Task Manager graph без удаления истории;
- решение судьбы отдельной ветки `work/ci-gate-split`;
- удаление доказанного неиспользуемого workspace package `packages/ui` либо
  документированное сохранение, если потребитель будет найден;
- новый immutable technical-preview candidate, который честно supersede старый
  EPIC 54 evidence gap.

### Не входит

- изменения страниц, URL, SEO, навигации и публикации;
- business facts владельца, коммерческая модель, методика и география запуска;
- тексты, цены, доходность, кейсы и публичные обещания;
- production, DNS, TLS, public indexing и реальный cutover;
- включение внешнего lead delivery channel;
- major-upgrade Next.js, React, PostgreSQL либо смена архитектуры.
- визуальная переделка header/menu/form, переработка секций страниц и полный
  UI Drift Audit; эти findings сохранены до отдельной команды владельца.

## 3. Проверенная исходная точка

| Область | Текущее состояние | Требуемый результат |
|---|---|---|
| Payload | все Payload-пакеты exact `3.89.0` | все exact `3.90.1`, без смешанных версий |
| Next / React | Next `16.3.4`, React `19.3.0` | Next + eslint config exact `16.3.6`; React не менять |
| Database | PostgreSQL, migrations-only, 26 migrations | forward migration для новой auth-схемы и PASS двух fixtures |
| Users/Auth | owner/editor, login lockout | новая auth-схема, login/session/reset-password regression PASS |
| Media | S3, local storage disabled, upload policy | безопасный upload/XML/SVG contract и S3 regression PASS |
| Editor | Payload Lexical | generated/admin/editor regression PASS |
| Task Manager | `mg4-*` closed; legacy `mg-*` noncanonical | legacy graph не выдаёт ложную ready work; история сохранена |
| Candidate evidence | merge/gate есть, exact installed tuple EPIC 54 утрачен | новый SHA + digest + path + smoke |
| Ingest | feed frozen; найдены source-isolation/baseline/janitor gaps | contract-correct pipeline; feed остаётся frozen |
| Leads | intake выключен; unknown-IP bucket неограничен | bounded backend limiter; UI/page changes deferred |

### Официальные основания версии

- Payload `v3.90.0` — critical security release; официальный release требует
  обновления, regenerate types и migration для relational database.
- Payload `v3.90.1` — текущий patch поверх security release.
- GHSA `GHSA-vcvr-r3jv-pc5j`: Next.js `>=16.2.0 <16.3.6` уязвим для critical
  RCE в Node.js `next/og` ImageResponse; patched version — `16.3.6`.
- Проект не импортирует `next/og` и не содержит `opengraph-image`, но обновление
  обязательно как устранение уязвимого runtime package.
- Next.js `16.3.6` остаётся в поддерживаемом Payload диапазоне `16.2.6+`.

Перед началом реализации исполнитель повторно сверяет latest stable и migration
notes по официальным источникам. Если latest stable уже выше `3.90.1`, изменение
target version считается новой owner decision, а не скрытым расширением плана.

## 4. Решения и открытые вопросы

| ID | Решение | Статус |
|---|---|---|
| OD-01 | Next.js / eslint config `16.3.6` и Payload-group `3.90.1` — exact targets | DECIDED |
| OD-02 | Страницы и весь owner content scope заморожены | DECIDED |
| OD-03 | Legacy `mg-*` сохраняется как история, но исключается из ready work | DECIDED |
| OD-04 | `work/ci-gate-split` не сливать вслепую; сначала exact diff review | DECIDED |
| OD-05 | `packages/ui` удалить после доказательства отсутствия consumers | DECIDED |
| OD-06 | Новый candidate supersede EPIC 54 evidence gap; старые proof не переписывать | DECIDED |
| OD-07 | Перед production выполнить фактическую restore-репетицию на временном recovery target; постоянную test DB не создавать | DECIDED |
| OD-08 | Отдельный staging-контур не создаётся: `more-previu.tw1.ru` остаётся production-candidate без реального трафика до release; затем меняется домен | DECIDED |
| OD-09 | Jobs owner включается только release-задачей после restore proof; preview/feed остаются frozen в implementation graph | DECIDED |

Все before-approval решения закрыты владельцем. OD-08 является явным
time-boxed исключением из отдельного staging: оно не разрешает реальные лиды,
production или domain cutover внутри implementation graph.

## 5. Dependency graph и волны

```text
EPIC 60 Control foundation
  ├─> EPIC 61 Critical dependency security upgrade
  │     └─> EPIC 62 Payload config, schema and runtime proof
  ├─> EPIC 63 Ingest correctness and bounded performance
  ├─> EPIC 64 Leads backend hardening
  ├─> EPIC 65 Repository and UI-foundation hygiene
  └─> EPIC 66 Delivery and recovery contract
EPIC 62 + EPIC 63 + EPIC 64 + EPIC 65 + EPIC 66
  └─> EPIC 67 Technical-preview candidate and closeout
```

EPIC 63–66 открываются после control freeze и могут идти независимо; EPIC 62
зависит от dependency upgrade. Циклов нет. Каждая implementation task начинается от fresh canonical
`origin/main` в собственной branch/worktree.

## 6. Эпики

### EPIC 60 — Execution-control foundation

**Цель:** убрать двусмысленность до изменения зависимостей.

Задачи:

1. восстановить read/write доступ к SourceCraft и подтвердить свежий `origin/main`;
2. проверить, что baseline плана не устарел;
3. провести exact diff review ветки `work/ci-gate-split` и выбрать
   `adopt/rebase`, `split` либо `reject`;
4. подготовить history-preserving quarantine/supersede для legacy `mg-*`;
5. сделать preflight состояния БД и migration chain без mutation production;
6. зафиксировать execution branches, ownership и evidence paths.

**Acceptance:** SourceCraft access PASS; base SHA подтверждён; нет двух
конкурирующих release implementations; Task Manager не может выдать legacy
задачу как текущую; production не затронут.

### EPIC 61 — Critical dependency security upgrade

**Цель:** удалить обе critical vulnerable dependency baselines без скрытого
product scope.

Задачи:

1. обновить `next` и `eslint-config-next` одновременно до exact `16.3.6`;
2. обновить одновременно `payload`, `@payloadcms/db-postgres`,
   `@payloadcms/next`, `@payloadcms/richtext-lexical`,
   `@payloadcms/storage-s3` до exact `3.90.1`;
3. обновить lockfile и проверить отсутствие второй Next/Payload-версии;
4. regenerate `src/payload-types.ts` и Payload import map;
5. принять только необходимые compatibility fixes;
6. создать forward-only migration для `resetPasswordRequestedAt` и других
   подтверждённых schema changes;
7. добавить `pnpm audit --audit-level high` в оба manual merge gates; dependency
   change всё равно проходит RISKY, standard gate больше не пропускает известный
   high/critical baseline;
8. не менять page/content schema без доказанной обязанности upgrade.

**Acceptance:** clean install и audit PASS; Next/eslint exact `16.3.6`; все
Payload-пакеты exact `3.90.1`; generated artifacts актуальны; diff не содержит
продуктовых изменений; migration review не выявляет destructive SQL.

### EPIC 62 — Payload config, schema, auth и runtime proof

**Цель:** доказать обновление на реальных границах приложения.

Проверки:

- `serverURL`, CSRF и CORS берутся из exact env origins, wildcard запрещён;
- foreign Origin + cookie получает отказ; same-origin Admin/auth работает;
- Nginx contract доказывает CSP/frame policy, HSTS, nosniff и Referrer-Policy;
- multipart limit согласован: Payload default 50 MiB не расширяет фактический
  Nginx `client_max_body_size 12m`;
- blank-database migration fixture и populated upgrade fixture;
- owner/editor login, session, lockout, password reset и denied access;
- Payload Admin boot и основные collection/global reads;
- Public Gateway и System Gateway, including explicit override-access guards;
- jobs config, maintenance jobs и scheduled-publishing absence/presence contract;
- Media/S3 upload, XML/SVG rejection policy, remote/paste URL boundary;
- Lexical editor and generated-type compatibility;
- leads intake, catalog lifecycle и ingest smoke без внешней отправки;
- typecheck, lint, targeted tests, затем полный `pnpm verify`.

**Acceptance:** оба migration fixtures PASS; auth/access allowed и denied
сценарии PASS; exact-origin и security headers PASS; gateways/jobs/media/editor
PASS; full verification PASS.

### EPIC 63 — Ingest correctness и bounded performance

**Цель:** feed pipeline соблюдает source ownership и safety contracts до любой
разморозки. Feed остаётся выключенным в этой программе.

Задачи:

1. искать existing property по паре `feedSource + externalId`; manual collision
   обрабатывать отдельной explicit branch, не fallback `docs[0]`;
2. заменить per-offer find/update N+1 на bounded batch contract и доказать
   ограниченное число DB operations на 2000 offers;
3. заморозить `NormalizedFeedOffer` contract перед реализацией money/area/
   location/grouping normalization; import hash и writes используют normalized;
4. обновлять `lastOfferCount` и `lastFeedHash` только после успешного full run;
5. orphan-queued janitor сверяет связанную Payload job и будущий `waitUntil`;
   stale threshold учитывает наблюдаемую успешную длительность;
6. привести percentage safety gate к `lastOfferCount` contract, сохранив уже
   существующий absolute `maxDeactivationsPerRun` ceiling;
7. добавить deterministic regression tests и real-runtime proof A/C/D после
   исправлений, без включения расписания/фида.

**Acceptance:** два feeds с одинаковым externalId создают независимые records;
partial run не меняет baseline; live job не объявляется orphan; 2000-offer test
имеет зафиксированный query ceiling; invalid normalized offer не пишет property;
feed и `JOBS_AUTORUN` остаются выключены.

### EPIC 64 — Leads backend hardening

**Цель:** выключенный сейчас intake безопасно ведёт себя после будущего
включения, не активируя external delivery.

Задачи:

1. убрать общий blocking bucket `unknown`: missing trusted header даёт безопасный
   fail-closed/warn policy без глобального отказа всем посетителям;
2. чистить expired rate-limit buckets и ввести bounded store size;
3. проверить redaction всех catch/error paths для database URLs и PII;
4. синхронизировать `PROJECT.md`: пустой `LEAD_CHANNELS` — текущий contract;
5. сохранить Telegram/outbound secrets и jobs выключенными.

**Acceptance:** missing-IP concurrency не создаёт глобальный 429; store bounded;
logs не содержат URL credentials/PII; пустой channel registry PASS; UI формы и
страницы не менялись.

### EPIC 65 — Подтверждённый repository и UI-foundation cleanup

**Цель:** удалить только доказанный долг, не маскируя его новой архитектурой.

Задачи:

1. проверить consumers workspace package `packages/ui` через imports, workspace
   graph, lockfile и build;
2. при отсутствии consumers удалить package, references и stale guards одним
   атомарным diff; иначе задокументировать owner и оставить;
3. выполнить read-only property enum drift preflight и создать mutation task
   только при подтверждённом drift;
4. перенести project-owned primitives из `src/ui/interactive` в canonical
   `src/components/ui`; lead client — в marketing/forms; обновить guards/imports
   без изменения поведения страницы;
5. зафиксировать approved physical mapping `src/components/**` и location
   `src/app/(site)/globals.css` в DESIGN вместо искусственной перестройки слоёв;
6. заменить fragile `verify:quick` command string на deterministic runner с
   manifest/metadata условий; не угадывать `react-server` по имени файла;
7. historical Plan №2/№3 оставить на месте как явно ненормативную историю:
   rename/move отвергнут, потому что ломает evidence links без runtime benefit;
8. проверить отсутствие новых dead dependencies после security upgrade.

**Acceptance:** каждая удалённая сущность имеет evidence отсутствия consumers;
один canonical primitive tree; tests/build не опираются на ghost package;
каждый test учтён runner manifest; enum mutation не выполнялась без отчёта;
historical evidence и ссылки сохранены; публичный UI визуально не менялся.

### EPIC 66 — Delivery, recovery и release-contract cleanup

**Цель:** оставить один понятный путь от exact SHA к preview candidate.

Задачи:

1. реализовать принятое решение по `work/ci-gate-split` без дублирования build;
2. подтвердить manual-only SourceCraft gate для COMMERCIAL profile;
3. проверить pack/install/rollback/staging contracts после Payload update;
4. вынести restore rehearsal в явный owner gate с ценой и stop-rule;
5. записать ADR-исключение: отдельные staging DB/host не создаются, текущий
   preview является production-candidate до domain cutover, реальные лиды и
   production запрещены без release-команды;
6. зафиксировать pre-production jobs-owner contract; не включать jobs на
   текущем preview в implementation phase;
7. запретить production path без отдельной команды владельца.

**Acceptance:** одна release implementation; zero-CI на push/PR; rollback
contract PASS; restore runbook готов к отдельной release-фазе; staging exception
имеет expiry на момент domain cutover; production не запускался.

### EPIC 67 — Technical-preview candidate и closeout

**Цель:** закрыть программу новым воспроизводимым evidence, не переименовывая
preview в production-ready.

Задачи:

1. full diff review и один exact-head RISKY SourceCraft gate;
2. собрать immutable artifact один раз;
3. установить тот же digest на technical preview;
4. выполнить smoke изменённых Next/Payload/Admin/gateway/media/auth/ingest
   сценариев без разморозки feed;
5. записать tuple `commit SHA + artifact digest + installed path + smoke`;
6. синхронизировать README, Architecture, Backlog, Release Checklist,
   Delivery State и Task Manager evidence.

**Acceptance:** exact-head gate green; immutable tuple полный; preview smoke
PASS; EPIC 54 gap помечен superseded; pages/content/production не изменены.

## 7. Task decomposition и delivery

Каждый эпик — самостоятельный stream с собственной branch/worktree и terminal
delivery task. Delivery mode всех эпиков — `MERGE_AFTER_GATE`: full diff review,
один соответствующий exact-head SourceCraft gate и merge без production.

| Task | Outcome | Depends on | Required evidence |
|---|---|---|---|
| 60.1 | SourceCraft access, fresh main и current CI topology подтверждены | — | API access/fetch/remote SHA или явный external blocker |
| 60.2 | `work/ci-gate-split` получает решение adopt/split/reject по exact diff | — | commit map и отсутствие второго release path |
| 60.3 | legacy `mg-*` history-preserving supersede/quarantine выполнен | — | Plan-scoped ready выдаёт только новый graph; history сохранена |
| 60.4 | DB/migration baseline и execution ownership зафиксированы | — | read-only preflight, paths, stop conditions |
| 60.D | EPIC 60 review/gate/merge | 60.1–60.4 | delivery ledger, exact SHA, PR/gate/merge |
| 61.1 | Next/eslint `16.3.6` и Payload-group `3.90.1` установлены exact | 60.D | clean install, lockfile, dependency/audit report |
| 61.2 | Payload types/import map и forward auth migration созданы | 61.1 | generated diff, reviewed non-destructive SQL |
| 61.3 | manual standard/risky gates оба включают high audit | 61.1 | CI contract tests; zero push/PR triggers |
| 61.D | EPIC 61 review/RISKY gate/merge | 61.2, 61.3 | delivery ledger, exact SHA, PR/gate/merge |
| 62.1 | exact serverURL/CSRF/CORS env contract реализован | 61.D | same/foreign-origin integration tests |
| 62.2 | Nginx CSP/header и 12 MiB upload boundary доказаны | 61.D | contract tests и operations alignment |
| 62.3 | blank/populated migrations, auth/Admin/media/Lexical proof PASS | 62.1, 62.2 | fixture and runtime evidence matrix |
| 62.D | EPIC 62 review/RISKY gate/merge | 62.3 | delivery ledger, exact SHA, PR/gate/merge |
| 63.1 | Feed identity isolation и bounded lookup/update contract реализованы | 60.D | collision test + 2000-offer query ceiling |
| 63.2 | NormalizedFeedOffer contract владеет импортируемыми values/hash | 60.D | money/area/null/invalid-offer tests |
| 63.3 | full-only baseline и lastOfferCount safety contract реализованы | 63.1, 63.2 | partial/full/suspicious regression tests |
| 63.4 | Janitor учитывает live Payload job/waitUntil и adaptive stale threshold | 60.D | queued/running/job-link regression tests |
| 63.5 | Proof A/C/D обновлён без разморозки feed | 63.3, 63.4 | deterministic runtime evidence |
| 63.D | EPIC 63 review/RISKY gate/merge | 63.5 | delivery ledger, exact SHA, PR/gate/merge |
| 64.1 | missing-IP rate limit не создаёт global outage; store bounded | 60.D | concurrency, expiry and capacity tests |
| 64.2 | DB URL/PII redaction охватывает error paths | 60.D | negative log assertions |
| 64.3 | PROJECT/env contract фиксирует пустой LEAD_CHANNELS | 64.1, 64.2 | fail-closed registry/runtime tests |
| 64.D | EPIC 64 review/RISKY gate/merge | 64.3 | delivery ledger, exact SHA, PR/gate/merge |
| 65.1 | inactive packages/ui удалён со всеми valid references | 60.D | consumer proof, workspace/lockfile tests |
| 65.2 | один canonical primitive tree без behavior/page redesign | 60.D | import guards, typecheck, a11y regression |
| 65.3 | verify runner детерминированно покрывает все tests/conditions | 60.D | coverage self-test и full verify |
| 65.4 | enum drift read-only report, dead deps и DESIGN exceptions закрыты | 65.1–65.3 | reports; no unapproved DDL; docs proof |
| 65.D | EPIC 65 review/RISKY gate/merge | 65.4 | delivery ledger, exact SHA, PR/gate/merge |
| 66.1 | одна release implementation после решения ci-gate-split | 60.2, 61.D | pack/install/rollback contract matrix |
| 66.2 | ADR фиксирует no-separate-staging exception и production stop | 60.D | approved decision, expiry/domain condition |
| 66.3 | jobs-owner и restore procedures готовы, но не выполняются | 62.D | runbooks/preflight/explicit release stops |
| 66.4 | local staging/pack/install/rollback tests PASS | 66.1–66.3 | deterministic test evidence |
| 66.D | EPIC 66 review/RISKY gate/merge | 66.4 | delivery ledger, exact SHA, PR/gate/merge |
| 67.1 | full verification и cross-epic requirements review PASS | 62.D–66.D | `pnpm verify`, audit and review matrix |
| 67.2 | один immutable artifact установлен на current preview | 67.1 | SHA/digest/path/install evidence |
| 67.3 | изменённые runtime surfaces и no-production boundary доказаны | 67.2 | live smoke + docs/state reconciliation |
| 67.D | EPIC 67 review/RISKY gate/merge и program closeout | 67.3 | exact candidate tuple and delivery ledger |

## 8. Verification matrix

| Gate | Минимальное доказательство | Stop-rule |
|---|---|---|
| Package integrity | Next `16.3.6`, Payload `3.90.1`, clean install, high audit | mixed versions или high/critical advisory |
| Migration safety | reviewed SQL; blank + populated fixtures PASS | data loss, failed forward migration |
| Auth/security | allowed/denied auth, reset, session, Admin PASS | privilege widening или auth regression |
| Public boundaries | Public/System gateways и unpublished isolation PASS | Payload types leaked в UI или public leak |
| Media/editor | S3, upload policy, XML/SVG, Lexical PASS | unsafe upload или broken Admin |
| Ingest | source isolation, normalized writes, full baseline, job-aware janitor, bounded 2000 test | cross-feed write, partial baseline mutation, unbounded N+1 |
| Leads backend | missing-IP, bounded store, redaction, empty channels PASS | global rate-limit outage или secret/PII log |
| Application | typecheck, lint, targeted tests, `pnpm verify` PASS | любой обязательный gate red |
| Delivery | exact-head RISKY gate + immutable preview tuple | inaccessible gate/logs или digest mismatch |

Локальный успех называется только `LOCAL PASS`. Для COMMERCIAL merge требуется
зелёный SourceCraft run текущего exact SHA; старый run не переиспользуется.

## 9. Rollback и recovery

- Package rollback допустим только вместе с совместимой code/schema revision.
- Применённую production-like migration нельзя автоматически откатывать вниз;
  при anomaly — stop, snapshot/evidence, forward fix или подтверждённый restore.
- Candidate install обязан сохранять предыдущий artifact для symlink rollback.
- Любой digest mismatch, unexplained schema drift, access regression или missing
  audit log останавливает эпик и не разрешает merge/release.

## 10. Task Manager contract

- текущая версия `v1 APPROVED` импортируется только из matching inventory hash;
- inventory создаётся только после final audit и exact approval;
- новый prefix не переиспользует `mg`, `mg3` или `mg4`;
- legacy tasks не удаляются и не получают новый Plan ID;
- после фразы `План утверждён` сначала выполняется readiness gate, затем import;
- Developer получает только APPROVED exact version/hash и не получает права на
  production.

## 11. Readiness к утверждению

- [x] подтверждены Next `16.3.6`, Payload `3.90.1` и official security/migration notes на 2026-09-23;
- [ ] SourceCraft access: известный HTTP 401 вынесен в TASK 60.1 как EXTERNAL stop; safe local work может продолжаться;
- [x] решения OD-01–OD-09 закрыты;
- [ ] `work/ci-gate-split` exact review назначен TASK 60.2 до изменения release tooling;
- [x] эпики декомпозированы до deterministic implementation tasks;
- [x] dependency graph и acceptance прошли final audit;
- [ ] inventory schema v2 должен дать CLEAN при Validate/Import/Reconcile;
- [x] владелец произнёс exact-фразу `План утвержден` для v1.

## 12. История версий

| Версия | Статус | Изменение |
|---|---|---|
| v0 | DRAFT / ASSEMBLY | Создан технический seed: Payload 3.90.1, schema/runtime proof, debt cleanup, delivery contract и новый preview candidate; page/business scope исключён |
| v1 | APPROVED | Проверен внешний пакет, закрыты owner decisions, добавлены deterministic tasks и проведён финальный audit; Next/Payload security, backend/infra/hygiene включены, UI/page remediation отложена, production исключён |

## 13. Revision input R-01 — внешний технический аудит

**Источник:** внешний пакет владельца от 2026-09-23.  
**Результат:** пакет проверен по коду, канону и официальным security releases;
перенос findings выполнен выборочно.

| Группа | Triage | Решение |
|---|---|---|
| Next `16.3.6`, Payload `3.90.1`, audit gates | ACCEPTED | EPIC 61–62 |
| Payload serverURL/CSRF/CORS и Nginx CSP | ACCEPTED | EPIC 62 |
| Ingest 3.1–3.5 | ACCEPTED | code evidence подтвердил gaps; EPIC 63 |
| Ingest 3.6 | ACCEPTED WITH CORRECTION | absolute ceiling уже есть; исправить percentage baseline contract |
| Lead rate-limit map / unknown bucket | ACCEPTED | EPIC 64 |
| Credential rotation | ALREADY_COVERED | PASS в `proofs/47.O-operational-rotation-ledger.md`; повторная rotation не создаётся |
| LEAD_CHANNELS contradiction | ACCEPTED | docs/runtime reconciliation в EPIC 64 |
| Restore и staging isolation | NEEDS_OWNER | OD-07/OD-08; до production-ready claim |
| Production jobs owner | ACCEPTED AS LATER GATE | не включать на preview; OD-09/EPIC 66 |
| packages/ui, primitive trees, verify runner | ACCEPTED | EPIC 65, behavior-preserving only |
| Move/rename historical plans | REJECTED | ломает evidence links, не уменьшает runtime debt |
| Lead form UI, menus, CMS navigation, home sections, scroll behavior, Drift Audit | DEFERRED | затрагивает страницы/навигацию и противоречит текущему owner freeze |

### Deferred UI finding register

Сохранены для следующей owner-команды без импорта в Plan №4 execution graph:

- field-level email/429 UX, checkbox accessibility и no-JS form behavior;
- mobile/preview menu focus, Escape/outside click и close-on-navigation;
- staging CMS chrome вместо forced fallback;
- primitive variants/Alert/Eyebrow cleanup и split `home-sections.tsx`;
- Next smooth-scroll behavior и полный report-only UI Drift Audit.

## 14. Финальный audit exact v1

### Pass 1 — Logic / Completeness

- primary outcome покрыт EPIC 60–67;
- security, schema, auth, ingest, leads backend, repository hygiene, recovery и
  delivery имеют отдельные outcomes;
- page/content/UI remediation и production изолированы;
- дубли Next/Payload и старые resolved rotation findings устранены.

**Findings:** BLOCKER 0; MAJOR 0; deferred UI findings не входят в promise v1.

### Pass 2 — Architecture / Data / Security

- Payload остаётся единственным CMS/auth/schema owner; Prisma не вводится;
- migrations forward-only, blank + populated fixtures обязательны;
- source ownership, full-run baseline и job-aware janitor имеют explicit tasks;
- PII/outbound channels остаются выключены; CSRF/CORS/origin и log redaction
  проверяются до candidate;
- restore выполняется только в release-фазе на временном recovery target;
  постоянная staging/test DB не создаётся.

**Findings:** BLOCKER 0; MAJOR 0; staging isolation risk принят владельцем как
time-boxed exception до domain cutover.

### Pass 3 — Dependencies / Autonomy

- cycles: 0;
- critical path: `60.D → 61.D → 62.D → 67`;
- EPIC 63–65 независимы после 60.D; EPIC 66 частично зависит от 61/62;
- blocking scope задан на уровне конкретных tasks, shared schema/security/CI
  streams сливаются последовательно;
- при SourceCraft 401 Developer оформляет TASK 60.1 owner/external blocker и
  продолжает safe independent local work, но не закрывает delivery tasks.

**Findings:** cycles 0; HARD dependencies обоснованы; external limitation 1.

### Pass 4 — Executability / Evidence / Delivery

- каждый epic имеет observable outcome, acceptance и terminal delivery task;
- каждый task имеет deterministic evidence и dependency;
- delivery mode везде `MERGE_AFTER_GATE`, direct main запрещён;
- full verification выполняется один раз в EPIC 67 после task-scope checks;
- preview install обещает exact tuple; production и domain switch не входят.

**Findings:** BLOCKER 0; MAJOR 0; ambiguous critical definitions 0.

### Audit scorecard

```text
Logic/completeness: blockers 0, major 0
Architecture/data/security: blockers 0, major 0
Dependency/autonomy: cycles 0, independent waves 4, external limitation 1
Executability/evidence: epics with acceptance 8/8, terminal delivery tasks 8/8
Owner decisions before approval: 0
Production actions in implementation graph: 0
Night Run Readiness: READY_WITH_LIMITS
```

`READY_WITH_LIMITS` вызван только текущим SourceCraft HTTP 401. Он не мешает
импорту и безопасным local implementation tasks, но блокирует push, PR, gate и
merge до восстановления PAT. Другого fallback нет; browser запрещён.

# EPIC 87 — control foundation и baseline freeze

Дата проверки: 2026-09-25  
План: `AMS-MORE-I-GORY-NIGHT-HARDENING-PREVIEW-2026-09` v1 APPROVED  
Режим: read-only baseline; production и server mutation запрещены

## Exact baseline tuple

| Поле | Факт |
|---|---|
| Canonical repository | SourceCraft `integrator-p/more-i-gory-next` |
| `origin/main` | `8db1c1ced37bbd8c0b486bdb6e81ccd3ace7c683` |
| Plan checkpoint | `061bb61abe99fa8342a514e6d7b9778a1faed350` |
| Next.js / React / Payload | `16.3.6` / `19.3.0` / `3.90.1` |
| Registered migrations | 27 |
| Preview host | `more-previu.tw1.ru` |
| Installed preview SHA | `cfcc784f61bf9cbfe03f06dc4b724c8dac8b3452` |
| Installed release path | `/opt/moreigory/releases/cfcc784f61bf9cbfe03f06dc4b724c8dac8b3452` |
| Rollback release path | `/opt/moreigory/releases/21e484c98503550dbfbcbef38eb2e9eecd8d8308` |
| Runtime unit | `moreigory.service`, active |

Installed identity прочитан через существующий project SSH alias. Перезапуск,
изменение env, migration, deploy и запись на сервер не выполнялись. Secret Master
проверен только по именам обязательных ключей; значения не извлекались в отчёт.

## Task Manager и Git

- предыдущий GEO-first graph: 102/102 tasks closed, ready work = 0;
- новый inventory: 4/4 epic roots reconciled, cycles = 0;
- активная задача: `mgnight-task-87-implement`;
- branch создана от exact `origin/main`; перед реализацией worktree был clean.

## Preview URL manifest BEFORE

Каждый ответ содержит `X-Robots-Tag: noindex, nofollow`.

| HTTP | URL |
|---:|---|
| 200 | `/`, `/investicionnaya-nedvizhimost/`, `/obekty/`, `/novostroyki/` |
| 200 | `/analitika/`, `/metodika/`, `/podbor/`, `/o-kompanii/`, `/kontakty/` |
| 200 | `/privacy/`, `/consent/`, `/obekty/preview-project/` |
| 200 | `/novostroyki/preview-complex/`, `/zastroyshchik/preview-developer/`, `/robots.txt` |
| 404 | `/krym/`, `/krym/yalta/`, `/krym/sevastopol/`, `/krym/evpatoriya/`, `/krym/alushta/` |
| 404 | `/sochi/`, `/arkhyz/`, `/altay/`, `/__night-baseline-missing__/` |

Это подтверждает ожидаемый drift: установленный preview SHA старше GEO-first
`main`. Он остаётся rollback baseline до EPIC 90 preflight.

## Test baseline BEFORE

- test files: 165;
- cases: 681;
- pass: 671;
- skipped: 10;
- fail: 0 при штатных режимах запуска;
- duration основного reporter run: 45.3 s.

Основной агрегированный запуск с `--conditions=react-server` дал один loader
failure для `http-lifecycle.test.mjs`, потому что его package script намеренно
запускается без этого condition. Отдельный штатный запуск дал 3/3 PASS; это не
дефект продукта и не скрытая потеря тестов.

## SourceCraft и security tooling

- `.sourcecraft/ci.yaml` содержит `on: {}`: auto push/PR CI отсутствует;
- manual workflows `merge-standard`, `merge-risky` и `release-single-build`
  присутствуют;
- `merge-risky` включает audit, migration/seed proof, `pnpm verify` и schema proof;
- `gitleaks.exe` доступен; полный history scan относится к EPIC 88.

## Stop conditions

Production, `moreigori.ru`, DNS/TLS, jobs, feeds, outbound lead channels,
public lead intake, index activation и неподтверждённый content не изменялись.

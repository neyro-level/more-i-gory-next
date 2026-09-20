# Owner / deferred queue

**План:** `MORE_I_GORY_PLAN_№ 3` v2 APPROVED
**Сводка:** production-readiness EPIC 44–54
**База:** `c824e9fa02ecfe370c859a851e3c0e0cedd48667` (`origin/main` после EPIC 44)
**Правило:** стоп-фактор останавливает подшаг, не программу. Автономная часть
делается сразу; остаток попадает сюда. Owner-решение «принимаем риск»
в эту сводку не подставляется.

Формат записи:

```text
источник (TASK)
что именно требуется от владельца или какой ресурс отсутствует
что уже сделано автономно
что произойдёт после получения решения/ресурса
блокирует ли production release
```

## BLOCKS_RELEASE

Без этих пунктов production (EPIC 55–56) не включаем. Domain cutover — отдельная
команда владельца после программы, но без него публичный `moreigori.ru` не
переключается.

| Источник | Что требуется | Что уже сделано автономно | После решения | Блокирует release |
|---|---|---|---|---|
| `mg4-epic-46.2` / TASK 46.2 | Выбрать staging DB: увеличить лимит выше 600 ₽/мес., предоставить другой изолированный PostgreSQL 18 либо явно отложить staging | Доступный минимальный Timeweb preset стоит 790 ₽/мес.; общий с production контур не используется | Создать project-owned staging/restore DB и выполнить restore/browser proof | да |
| TASK 24.1b | Применить Postgres enum conversion к живым `properties.category` / `deal_type` только после успешного drift-отчёта | Контракт, reject и draft SQL в 24.1a; `docs/research/property-enum-drift-report.md`: `queried: false` (пакет `postgres` недоступен в том прогоне) | Сначала живой SELECT; при 0 внеконтрактных строк — автономная миграция; иначе owner unlock | да, пока drift не измерен или найдены расхождения |
| `mg4-epic-50.1` / TASK 50.3 | Создать Cloudflare Turnstile widget и записать project keys в Secret Master | CSP/env/verification contract подготовлен; секреты не выдумываются | Проверить CAPTCHA на preview и форму end-to-end | да |
| `mg4-epic-52.1` / EPIC 52 | Заполнить единый `CONTENT_FACT_PACKET` для шести обязательных страниц либо явно утвердить меньший launch cohort | Матрица собрана; privacy/consent имеют PASS, неизвестные факты остаются unpublished | Завершить content/editorial gate без серии точечных вопросов | да |
| Domain cutover | Переключить `moreigori.ru` отдельной owner-командой после программы | Preview `more-previu.tw1.ru`; production не деплоился | Cutover DNS/TLS/nginx на канонический домен | да |
| Credentials hygiene | Ротировать пароль Managed PostgreSQL после утечки `DATABASE_URI` в traceback агента (значения в репозиторий не записывать) | Runtime env на сервере собирается из Secret Master; секреты в git нет | Новый пароль в Timeweb + Secret Master + `/etc/moreigory/app.env` | да |

## IMPROVEMENT

Отложенные усиления и внешние записи, которые не останавливают код-граф.
Можно закрыть после релиза, если владелец не поднимет приоритет.

| Источник | Что требуется | Что уже сделано автономно | После решения | Блокирует release |
|---|---|---|---|---|
| TASK 21.6 | Решить, удалять ли workspace-пакет `packages/ui` | Пакет reserved/inactive; FOLDER FORM каноничен | Cleanup lockfile/workspace отдельным PR | нет |
| TASK 25.8 вариант 1 | Postgres advisory lock при старте jobs-owner | Runbook + `scripts/assert-one-jobs-owner.mjs`; proof 14.I PASS | Усиление, если live dual-owner повторится | нет |
| TASK 25.8 вариант 2 | Служебная запись владения с TTL | То же; таблица не добавлялась | Усиление после EPIC 32 только по owner | нет |
| TASK 28.4 | Точечные `301` вместо `410` по списку URL без однозначной замены | Правило 410; expired URL без замены в отчёте нет | 301 только по явному списку, массовый 301 на листинг запрещён | нет |
| TASK 31.x | Записать `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` в Secret Master `more-i-gory-server/prod` | Бакет `moreigory-media` path-style проверен; machine identity только чтение (`403` на create); deploy читает ключи из Timeweb API | Запись ключей, когда identity получит write | нет |
| TASK 49 preview runtime | Выложить exact artifact на project-owned preview после появления staging DB: HTML/sitemap ранее отдавали bootstrap `503`, `/api/health` был `200` | Nginx/systemd/pack/rollback в EPIC 13; локальный runtime proof PASS | Install-release на Linux preview и browser smoke | нет до RC; да для release |
| App env in Secret Master | Записать `PAYLOAD_SECRET` и `NEXT_PUBLIC_SERVER_URL` в `more-i-gory-server/prod` (сейчас там server/DB keys) | Локальный verify 14.J использовал dummy secret; production fail-fast контракт есть | Deploy читает app keys из того же проекта SM | нет |

## TASK 34.2 — Прогноз плана vs фактическая очередь

Прогнозируемый состав на момент планирования (мастер-план v6) сверен со
сводкой выше. Новые BLOCKS_RELEASE, которых не было в прогнозе, не вычёркивают
прогноз: они добавлены по evidence EPIC 13/24/32.

| Источник прогноза | Прогноз «блокирует release» | Факт в очереди | Сверка |
|---|---|---|---|
| TASK 24.1b | да, если отчёт 24.1a нашёл расхождения | `BLOCKS_RELEASE` | PASS: живой отчёт `queried: false`, drift не доказан нулевым — держим блок до SELECT |
| TASK 31.x | нет (значения из Timeweb API) | `IMPROVEMENT` | PASS |
| TASK 25.8 варианты 1/2 | нет | `IMPROVEMENT` (две строки) | PASS: proof 14.I PASS, runbook достаточен |
| TASK 28.4 | нет | `IMPROVEMENT` | PASS: список 410→301 пуст |
| Domain cutover `moreigori.ru` | да, отдельная команда после программы | `BLOCKS_RELEASE` | PASS |

# Content evidence inventory

**Статус:** Evidence only

**План:** `more-i-gory-production-readiness-2026-09` v2

**Задача:** `TASK 51.1 — Autonomous evidence inventory`

**Дата среза:** 2026-09-20

**Git-база:** `78c2753efc48fb2abafd0527b8949e85af199762`

Этот файл инвентаризирует уже существующие факты, заявления и пробелы. Он не
становится новым Source of Truth: подтверждённые решения должны остаться в
`docs/01…06`, `LEGAL_DETAILS.md` или в соответствующей Payload entity.

## 1. Иерархия источников

| Класс | Источник | Что можно считать доказанным | Ограничение |
|---|---|---|---|
| Канон | `docs/01_PRD.md`, `docs/02_PRODUCT_STRUCTURE.md` | Продуктовое позиционирование, PAGE-ID, URL и content gates | Это решение продукта, но не доказательство внешнего рыночного или финансового факта |
| Канон | `docs/LEGAL_DETAILS.md` | Юридическое лицо, оператор ПДн, директор/основатель и перечисленные публичные контакты | Перед release каналы, адрес и часы работы нужно проверить фактическим контактом |
| Канон | `docs/03_ARCHITECTURE.md`, `docs/OPERATIONS.md` | Runtime-, data- и publishing-контракты | Не подтверждает business claims |
| Реализация | `src/content/**`, `src/app/(site)/**`, `src/seo/registry.json` | Фактический текст, route surface и текущие статусы сущностей | `draft`, `review`, `hidden`, `stub` и `gate` не равны разрешению на публикацию |
| CMS/DB | Payload collections и Managed PostgreSQL | Только реально существующие опубликованные записи | На дату среза целевая БД пуста: публичных проектов, ЖК и застройщиков из неё нет |
| Evidence | `docs/research/**` | Исследования и исторические основания | Не переносится в публичный claim автоматически |

## 2. Реестр claim-кластеров

| Claim-кластер | Найденный источник | Состояние | Владелец следующего решения |
|---|---|---|---|
| «Море и Горы» — инвестиционное бюро курортной недвижимости | PRD, Product Structure, тексты главной и `/o-kompanii/` | `FACT_PASS` как утверждённое позиционирование | product owner |
| Будущая доходность описывается сценариями, а не гарантией | PRD, `/o-kompanii/`, методика, legal notice | `FACT_PASS` как редакционная политика; численные обещания запрещены | editorial owner |
| Проект публикуется только после фактов, источников, рисков и `verifiedAt` | Product Structure и публичные шаблоны | `FACT_PASS` как publishing rule; реальных прошедших gate проектов нет | content owner |
| Юридический владелец, ОГРНИП, ИНН и юридический адрес | `docs/LEGAL_DETAILS.md` | `FACT_PASS` в каноне; release требует финальной сверки отображения | legal owner |
| Директор и основатель — Колобова Ольга Викторовна | `docs/LEGAL_DETAILS.md` | `FACT_PASS` для имени и роли; биография и подтверждённый опыт отсутствуют | legal/content owner |
| Телефон, email, офис и часы работы | `docs/LEGAL_DETAILS.md` | `FACT_PASS` в каноне, но `UNPUBLISHED_NO_FACT` для обещания доступности до проверки каналов/SLA | operations owner |
| Методика отбора, stop-факторы, иерархия источников и конфликт интересов | Product Structure задаёт обязательный состав; `/metodika/` содержит только каркас | `UNPUBLISHED_NO_FACT`: полная версия, дата, reviewer и human gate отсутствуют | methodology owner |
| Команда, роли, биографии и подтверждённый опыт | Product Structure требует данные; `/o-kompanii/` прямо сообщает об их отсутствии | `UNPUBLISHED_NO_FACT`, кроме подтверждённого директора/основателя | content owner |
| Реальные кейсы, отзывы, показатели доходности, лидерство и объём сделок | Канонические документы запрещают выдумывать; источники не найдены | `UNPUBLISHED_NO_FACT` | product owner |
| Модель оплаты, вознаграждение, партнёрские комиссии и disclosure | Content gate `/podbor/` требует модель; фактический документ не найден | `UNPUBLISHED_NO_FACT` | commercial/legal owner |
| SLA первого ответа и ответственный за обращения | Product Structure требует; страницы показывают placeholder | `UNPUBLISHED_NO_FACT` | operations owner |
| География Крым, Архыз, Алтай и Сочи | Product Structure и region route plan | Route intent подтверждён; инвестиционные выводы и локальные business claims не подтверждены | content owner |

## 3. Route и entity inventory

| Область | Фактическое состояние | Решение до следующего gate |
|---|---|---|
| Главная и федеральный hub | Две local content entity имеют статус `review`; metadata — `gate` | Не считать content-ready без фактов о команде, методике и проектах |
| Региональные страницы | 9 записей `hidden`, Сочи — `stub`; все содержат защитный черновой текст | `UNPUBLISHED_NO_FACT`; Сочи остаётся `200 noindex` вне sitemap/navigation |
| Проекты/паспорта | Seed или подтверждённые project entity не найдены; Managed PostgreSQL пуст | Ноль публикуемых проектов; запрещены цены, доходность, кейсы и project claims |
| Аналитика | 5 статей в `draft`, у всех `sourceIds: []` | Не индексировать и не публиковать до источников, авторства и editorial gate |
| Методика | Публичный route реализован, но сам текст помечает экран как каркас до human gate | Оставить gated до утверждённой полной методики |
| О компании | Реализованы позиционирование и редакционные принципы; команда/опыт отсутствуют | Не добавлять людей, опыт и сильные claims без источника |
| Контакты | Канонические реквизиты есть в `LEGAL_DETAILS.md`, но route всё ещё показывает placeholders | Синхронизация и проверка каналов — отдельная следующая задача; не считать route готовым |
| Подбор/формы | Процесс описан; SLA, оплата и production delivery ещё gated | Не обещать срок/цену и не заявлять боевую доставку до proof |
| Privacy/consent | Версии и данные оператора зафиксированы; страницы реализованы как `noindex` | Финально сверить с фактической формой, аналитикой и каналами перед release |
| Каталоги Payload | Public Gateway отдаёт только `published`; fallback fail-closed | Пустой результат не заменять выдуманными карточками |

## 4. Конкретные пробелы для owner packet

Следующая задача должна собрать один пакет, а не серию вопросов:

1. Подтверждение публичных каналов: телефон, email, офис, часы работы,
   мессенджеры, ответственный и SLA.
2. Команда: ФИО, роль, биография, проверяемый опыт и допустимые формулировки.
3. Коммерческая модель: цена/формат услуги, вознаграждение, комиссии,
   партнёрства и disclosure конфликта интересов.
4. Методика: критерии допуска, stop-факторы, источники, расчёт gross/net,
   reviewer, версия и дата.
5. География: что реально обслуживается в первом release, а что остаётся
   `DEFERRED_OUT_OF_RELEASE`.
6. Реальные проекты и кейсы: entity, документы, источники, `verifiedAt`, права
   на media и разрешённые claims.

## 5. Fail-closed вывод

- Исследования не повышают claim до `FACT_PASS` без переноса в канон/entity.
- Отсутствующий факт даёт `UNPUBLISHED_NO_FACT`, а не маркетинговый placeholder.
- Конфликт источников блокирует только соответствующую строку или entity.
- Независимые технические и редакционные задачи продолжаются.
- На дату среза поддерживаются только юридические факты из
  `LEGAL_DETAILS.md`, утверждённое позиционирование и редакционные правила;
  проекты, кейсы, доходность, команда (кроме директора/основателя), полная
  методика, коммерческая модель и SLA не имеют достаточного evidence для
  публикации.

## 6. Terminal state каждой fact-bearing entity

Это состояние действует до обработки `CONTENT_FACT_PACKET`. Группировка
разрешена только там, где все перечисленные entity имеют одинаковый источник и
одинаковый terminal state.

| Entity / ID | Terminal state | Source / evidence | Публичное поведение |
|---|---|---|---|
| Brand positioning: «инвестиционное бюро курортной недвижимости» | `FACT_PASS` | `01_PRD.md`, `02_PRODUCT_STRUCTURE.md` | Допустимо без численных или лидерских утверждений |
| Legal operator + requisites | `FACT_PASS` | `LEGAL_DETAILS.md` | Допустимо в legal pages; финальная сверка перед release сохраняется |
| Founder/director identity | `FACT_PASS` | `LEGAL_DETAILS.md` | Допустимы только имя и зафиксированные роли |
| Public channel availability + SLA | `UNPUBLISHED_NO_FACT` | Каналы перечислены, но operational proof и SLA отсутствуют | Не обещать доступность/срок ответа; route сохраняет placeholder |
| Team biographies and experience | `UNPUBLISHED_NO_FACT` | Источники не найдены | Не публиковать team cards и опыт |
| Methodology full version | `UNPUBLISHED_NO_FACT` | `/metodika/` прямо помечен как каркас | Route остаётся `noindex` через `gate`; не выдавать каркас за утверждённую методику |
| Commercial model / fee / partner disclosure | `UNPUBLISHED_NO_FACT` | Source не найден | Не публиковать цену, комиссию или независимость отбора |
| PAGE-001, PAGE-002 | `UNPUBLISHED_NO_FACT` | Local content status `review`; content gates не пройдены | `noindex`, вне sitemap, пока registry имеет `gate` |
| PAGE-007…013, PAGE-024, PAGE-025 | `UNPUBLISHED_NO_FACT` | 9 region seed entity имеют `hidden` | Generic routes не генерируются; не попадают в sitemap/links |
| PAGE-003 / Sochi | `DEFERRED_OUT_OF_RELEASE` | Region entity `stub`; Product Structure фиксирует отдельное решение | Только отдельная `200 noindex` заглушка вне sitemap/navigation |
| PAGE-014 / project listing | `UNPUBLISHED_NO_FACT` | Нет полного набора опубликованных паспортов | Registry `gate`; пустые project claims запрещены |
| PAGE-015 / project passports | `UNPUBLISHED_NO_FACT` | Подтверждённых project entity и двух источников нет | Dynamic route только для `published`; выдуманные карточки не создаются |
| PAGE-016 / analytics listing | `UNPUBLISHED_NO_FACT` | Нет четырёх прошедших editorial gate материалов | Registry `gate`; пустая рубрика не индексируется |
| Five PAGE-017 article entity | `UNPUBLISHED_NO_FACT` | Все `draft`, у всех `sourceIds: []` | Не входят в public routes и sitemap |
| PAGE-018 / methodology | `UNPUBLISHED_NO_FACT` | Полная методика и human gate отсутствуют | Registry `gate`; каркас не индексируется |
| PAGE-019 / selection service | `UNPUBLISHED_NO_FACT` | Нет SLA, ответственного и commercial model | Registry `gate`; не обещать боевую доставку или цену |
| PAGE-020 / company | `UNPUBLISHED_NO_FACT` для trust claims | Команда/опыт/кейсы отсутствуют | `trust_gate`; допустимы позиционирование и редакционные принципы |
| PAGE-021 / contacts | `UNPUBLISHED_NO_FACT` для channel readiness | Route содержит placeholders, каналы не протестированы | `trust_gate`; не заявлять operational readiness |
| PAGE-022, PAGE-023 | `FACT_PASS` для текущих legal versions | `LEGAL_DETAILS.md` + реализованные privacy/consent texts | Всегда `noindex`, вне sitemap; перед release сверить с фактической формой |
| PAGE-026 / newbuild catalog shell | `FACT_PASS` только для route contract; `UNPUBLISHED_NO_FACT` для content gate | Registry и Public Gateway | Route остаётся активным, но пустой shell не индексируется и не входит в sitemap; только `published` entity попадают в выдачу |
| Developer, operator, project, case entity not listed above | `UNPUBLISHED_NO_FACT` | Подтверждённые записи/источники отсутствуют | Не создавать public route, sitemap entry или marketing claim |

Runtime enforcement уже fail-closed: metadata считает любое значение, кроме
`index: yes`, как `noindex`; sitemap принимает только `index: yes` +
`sitemap: yes`; region/project/article gateways возвращают только
`published`. Поэтому ожидание owner facts не останавливает инфраструктурные,
DB, leads и release-readiness задачи.

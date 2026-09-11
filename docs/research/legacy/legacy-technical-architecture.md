# Техническая архитектура сайта «Море и Горы»

**Дата ревью:** 2026-09-10
**Статус:** Superseded — заменён `../../03_ARCHITECTURE.md`
**Класс проекта:** коммерческий статический сайт
**Production:** готовые HTML/CSS/JS-файлы под Nginx, без Next.js/Node.js runtime

## 1. Решение

Первый релиз строится на Next.js App Router в режиме `output: "export"`. Все публичные страницы заранее собираются в HTML. На production Nginx раздаёт каталог `out/` и проксирует только заявки на отдельный AMS Leads API.

Главные ограничения:

- архитектурный инвариант `SERVER FIRST`: любой page, layout, section и content block по умолчанию является Server Component;
- никакой CMS, базы данных, авторизации, worker или request-time server-side rendering в первом релизе; Server Components выполняются во время build и попадают в статический HTML;
- основной текст, ссылки, metadata и structured data присутствуют в собранном HTML;
- интерактивность изолируется в небольших листовых Client Components;
- контент и UI не зависят от способа хранения данных;
- новая сборка публикуется только после валидации; при ошибке остаётся последний успешный artifact.

## 2. Стек первого релиза

| Слой | Решение | Обязательное правило |
| --- | --- | --- |
| Framework | Next.js 16 Active LTS, App Router | актуальный безопасный patch на день scaffold |
| Runtime сборки | поддерживаемая Next.js версия Node.js | exact-версия фиксируется при scaffold |
| UI | React + TypeScript strict | Server Components по умолчанию |
| Styling | Tailwind CSS + project tokens | `03_DESIGN_SYSTEM.md` — визуальный source of truth |
| Components | shadcn/ui + собственные AMS-компоненты | библиотека не определяет внешний вид проекта |
| Validation | Zod | schema — источник типов и build validation |
| Content | typed data для коммерческих сущностей, Markdown для статей | SEO-контент не загружается client-side |
| Blog pipeline | Velite как dev/build-преобразователь | exact-версия фиксируется; в production runtime отсутствует |
| Dev orchestration | `concurrently` | единый Windows-совместимый запуск watcher и Next.js |
| Package manager | pnpm + frozen lockfile | зависимости закрепляются exact-версиями |
| Output | `output: "export"`, `trailingSlash: true` | production artifact — `out/` |
| Image pipeline | `next-image-export-optimizer` + `sharp` | оптимизация выполняется после `next build` |
| Maps | Яндекс Конструктор/виджет с загрузкой по клику | карта не входит в initial JavaScript |
| Hosting | Nginx + versioned releases | атомарное переключение и rollback |
| Leads | AMS Leads API через Nginx `/api/leads` | frontend не хранит CRM/API secrets |

Пока отсутствуют `package.json` и lockfile, версии являются целевыми, а не установленными. Совместимость `next-image-export-optimizer` с выбранным patch Next.js подтверждается отдельным smoke при scaffold; пакет не считается проверенным одним только наличием документации.

## 3. Source of truth и границы слоёв

```text
Page / Layout
→ Content Service
→ Content Repository
→ Local Adapter
→ typed data / Markdown / media registry
```

UI получает DTO и не импортирует файлы контента напрямую. Zod-схемы определяют типы. `id` — стабильный AMS ID, `path` — полный canonical URL с ведущим и завершающим `/`, `slug` — только один сегмент URL.

В будущем Local Adapter может быть заменён CMS Adapter без изменения компонентов и публичных URL.

## 4. Статическая маршрутизация и SEO

- все production URL известны во время сборки;
- dynamic routes используют `generateStaticParams()`;
- параметры фильтрации не создают индексируемые страницы;
- sitemap формируется только из опубликованных сущностей;
- metadata берётся из того же content layer, что и страница;
- canonical, robots, title, description, H1 и OG обязательны для каждой индексируемой страницы;
- redirects хранятся централизованно, а в production исполняются Nginx;
- custom 404 обязателен и должен реально возвращаться с HTTP 404;
- основная навигация и внутренняя перелинковка состоят из обычных `<a href>`.

## 5. Контентная модель

Коммерческие страницы и сущности хранятся как типизированные данные. Статьи — Markdown через единый `RichTextDTO` и renderer. Block registry связывает стабильный `blockType`, Zod schema и React component.

Минимальные сущности первого релиза:

- `Region`;
- `Project`;
- `Lot` как неиндексируемые данные внутри проекта;
- `Developer` и `Operator` как связанные факты;
- `Source` для существенных показателей;
- `Article`;
- `Person`;
- `SiteSettings`, `Navigation`, `Media`, `SEO`, `Redirect`.

Публикация проекта запрещена без даты проверки, источников, ответственного, обложки, инвестиционного вывода и заполненного блока рисков.

### 5.1. Pipeline аналитики

Velite читает Markdown и frontmatter, проверяет исходные поля через Zod и создаёт типизированный build-output. Это удобство авторинга, а не новый архитектурный слой:

```text
content/articles/*.md
→ Velite validation/transform
→ .velite/ generated output
→ ArticleSourceAdapter
→ Content Repository / ArticleDTO
→ Content Service
→ статическая страница
```

Только `ArticleSourceAdapter` может импортировать `.velite`. Страницы и UI не зависят от Velite. Каталоги `.velite/` и `out/` являются воспроизводимыми артефактами и не коммитятся. Если Velite перестаёт быть совместимым, его можно заменить локальным Markdown Adapter без изменения URL, DTO и компонентов.

Velite подключается как `devDependency`, его exact-версия фиксируется в lockfile и проверяется smoke-тестом с выбранным patch Next.js 16. Поскольку пакет остаётся в ветке `0.x`, обновление версии выполняется осознанно, а не автоматически.

Ожидаемые scripts после scaffold:

```json
{
  "scripts": {
    "dev": "pnpm build:content && concurrently -k \"pnpm dev:content\" \"pnpm dev:next\"",
    "dev:content": "velite --watch",
    "dev:next": "next dev",
    "build:content": "velite --clean",
    "build:site": "next build && next-image-export-optimizer",
    "build": "pnpm build:content && pnpm build:site"
  }
}
```

Команда уточняется по exact-версиям при scaffold. Связка через shell-оператор `&` не используется: основной компьютер — Windows, а процессы должны корректно завершаться вместе.

Velite не встраивается через Webpack plugin: официальный guide отдельно предупреждает о проблемах такого способа с Turbopack. Независимый build/watch-процесс выше сохраняет развязку с bundler Next.js.

### 5.1.1. Почему выбран Velite

На 2026-09-10 решение остаётся таким: **Velite — основной кандидат первого scaffold**, но только после smoke на exact Next.js 16, Node.js и Windows. Он подходит проекту, потому что в одном build-time инструменте даёт Markdown, Zod validation, типизированный output и framework-agnostic режим. В браузер и production runtime пакет не попадает.

Проверенные альтернативы:

| Вариант | Сильная сторона | Ограничение для этого проекта | Решение |
|---|---|---|---|
| Velite | единый лёгкий Markdown/data pipeline, Zod, независимость от Next.js | версия `0.x`, один основной maintainer, incremental build остаётся в roadmap | основной кандидат |
| Content Collections | типизированные коллекции, transforms, отдельная интеграция Next.js и автоматическое обновление контента в dev | больше framework/build-интеграции и пакетов; также `0.x` | первый fallback, если Velite не проходит smoke |
| Markdoc | зрелый безопасный синтаксис пользовательских тегов и контролируемый AST | это прежде всего parser/renderer, а не готовая collection/data layer; понадобится собственная обвязка | только если сложные редакционные блоки станут отдельным продуктовым требованием |
| Contentlayer | близкая исходная идея | официальный проект прямо помечен как больше не поддерживаемый | не использовать |
| Собственный `gray-matter` + unified pipeline | полный контроль и минимум внешней магии | больше собственного кода, тестов и сопровождения | аварийный fallback, не стартовый выбор |

Финальный gate при scaffold:

1. одна реальная статья с frontmatter, директивами, изображением и связями;
2. clean build и watch на Windows;
3. совместимость с `next dev`/Turbopack и static export;
4. корректная ошибка на плохом frontmatter, неизвестной директиве и broken relation;
5. отсутствие Velite в client bundle;
6. повторяемость результата после удаления `.velite/`;
7. если любой обязательный пункт не проходит без нестабильного workaround — переход на Content Collections через тот же `ArticleSourceAdapter`.

### 5.2. Контракт статьи

Минимальные исходные поля:

- стабильные `id`, `slug` и полный canonical `path`;
- `status`: `draft` или `published`;
- `title`, `description`, `excerpt`;
- `publishedAt`, `updatedAt`, `reviewedAt`;
- `authorId`, опциональный `reviewerId`;
- `coverId`, `pillar`, `intent`;
- `relatedRegionIds`, `relatedProjectIds`, `relatedArticleIds`;
- `sourceIds` и тип дисклеймера;
- Markdown body.

Оглавление, список заголовков и время чтения вычисляются во время сборки. Черновики хранятся отдельно или имеют `status: draft`; они не попадают в маршруты, sitemap и production artifact.

Velite валидирует исходный frontmatter. Local Adapter отдельно собирает и проверяет итоговый `ArticleDTO`. Общие примитивы и enum переиспользуются, но source schema и DTO schema не смешиваются: у них разные границы ответственности.

### 5.3. Безопасный Markdown

- MDX и произвольный JSX на старте запрещены;
- raw HTML в Markdown запрещён и не передаётся в UI как доверенный HTML;
- статья преобразуется в контролируемый `RichTextDTO` или безопасное AST;
- изображения ссылаются на стабильный `mediaId` и проходят общий media registry из раздела 6; второй image pipeline Velite не вводится;
- разрешены только директивы из whitelist: `note`, `warning`, `project-card`, `region-comparison`, `cta`;
- директива принимает только описанные Zod-схемой атрибуты и стабильные ID;
- неизвестная директива, атрибут или ссылка на отсутствующую сущность останавливает сборку.

`remark-directive` может использоваться только как parser. Собственный обработчик обязан явно сопоставлять разрешённую директиву с типизированным блоком; автоматическое исполнение содержимого не допускается.

### 5.4. Редакторский режим и будущая CMS

На старте статьи ведутся в Git как Markdown: изменения проверяемы, откатываемы и проходят ту же сборочную валидацию. Отдельная админка не создаётся.

CMS или Git-based editor рассматривается не по календарю, а при операционном триггере: несколько постоянных редакторов без Git, неприемлемое время публикации, регулярные ошибки frontmatter, обязательный preview/approval workflow или объём обновлений, который владелец больше не может безопасно обслуживать. Замена источника выполняется через новый Adapter.

## 6. Изображения

### 6.1. Build-time pipeline

Целевой пакет — `next-image-export-optimizer`. После `next build` он запускает `sharp`, создаёт адаптивные варианты и WebP, генерирует blur placeholder и складывает готовые файлы в `out/`. Собственный image pipeline не разрабатывается.

Базовая конфигурация при scaffold:

```ts
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    loader: 'custom',
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    unoptimized: false,
  },
  transpilePackages: ['next-image-export-optimizer'],
}

export default nextConfig
```

Параметры `env` и команда post-build берутся из документации exact установленной версии пакета. Image-шаг входит в общий pipeline как `build:site`:

```json
{
  "scripts": {
    "build:site": "next build && next-image-export-optimizer"
  }
}
```

`unoptimized: false` разрешён здесь потому, что работает build-time custom loader, а не runtime Image Optimization API. Если smoke exact-версий не проходит, fallback — заранее оптимизированные локальные WebP с `images.unoptimized: true`; CDN или собственный sharp-конвейер автоматически не добавляются.

### 6.2. Хранение и использование

```text
public/images/projects/<amsId>/
public/images/regions/<slug>/
public/images/team/
public/images/og/
public/images/contacts/
public/assets/
```

`public/images/` содержит контентные изображения и проходит через pipeline. `public/assets/` содержит логотипы, иконки, декоративные SVG и другие UI-ассеты.

Страницы используют только `ui/primitives/Picture.tsx` поверх `ExportedImage`. Прямой импорт `ExportedImage` в `src/app/**` запрещён. Обёртка централизует `sizes`, aspect ratio, качество, preload/fetch priority и fallback.

Для Next.js 16 проп `priority` не используется: он deprecated. У единственного подтверждённого LCP-изображения страницы задаётся `preload` либо `fetchPriority="high"` после проверки фактического HTML. Остальные изображения загружаются лениво. `width`/`height` или стабильный aspect ratio обязательны.

Remote images в первом релизе запрещены: исходники сначала переносятся в локальный media registry. Это делает сборку воспроизводимой и исключает зависимость production от стороннего image-host.

### 6.3. Alt и media validation

- содержательное изображение имеет осмысленный `alt`;
- декоративное изображение имеет `alt=""` и явный флаг `decorative: true`;
- alt не повторяет имя файла и не заполняется ключевыми словами механически;
- наличие файла, размеры и связь с сущностью проверяются на build;
- исходник по умолчанию не тяжелее 6 МБ и не шире 4000 px;
- обложка опубликованного проекта — 16:9, не менее 1600 px по ширине;
- отсутствующие, дублирующиеся и не зарегистрированные изображения блокируют сборку;
- лишние зарегистрированные файлы сначала считаются warning; hard fail включается после стабилизации media registry.

## 7. Карта

### 7.1. Контакты

Используется только официальный код iframe, полученный в Яндекс Конструкторе карт или функции «Поделиться картой». До согласованного действия пользователя сторонний iframe не создаётся:

```text
статичное локальное preview
→ кнопка «Показать карту»
→ создание iframe по клику
```

`ui/interactive/MapEmbed.tsx` — небольшой Client Component. У iframe обязательны `title`, `loading="lazy"`, фиксированный aspect ratio и размеры контейнера. Нельзя модифицировать выданный Яндексом код способом, запрещённым условиями сервиса.

Загрузка по клику нужна для контроля сторонних запросов, cookies, CSP и initial performance. Использование Яндекс-карты отражается в политике конфиденциальности. Перед production проверяются актуальные условия Яндекса и допустимость виджета для открытого коммерческого сайта.

CSP разрешает только фактический origin iframe, полученный из production-кода. Ожидаемая минимальная директива:

```nginx
frame-src https://api-maps.yandex.ru;
```

Wildcard добавляется только если реальный network trace докажет необходимость.

### 7.2. Карточки проектов

Интерактивной карты на карточках нет. Используется собственная статичная схема расположения `public/images/projects/<amsId>/location.webp`, подписи проверенных расстояний и обычная ссылка «Открыть на Яндекс Картах» в новой вкладке.

Схема не должна быть скриншотом, копией тайлов или производной картографических материалов без разрешения. Это самостоятельная инфографика на основании проверенных фактов и разрешённых источников.

Общая карта объектов, MapLibre, OpenFreeMap, PMTiles и платные картографические API в первый релиз не входят.

### 7.3. Резервный путь: 2ГИС MapGL JS API

Если после запуска появится доказанная задача общей интерактивной карты объектов, первым кандидатом проверяется 2ГИС MapGL JS API. Это запасной путь, а не зависимость первого релиза.

Подтверждено официальной документацией 2ГИС на 2026-09-10:

- библиотека MapGL JS API предоставляется без отдельной платы и без лимита;
- данные карты загружаются через платный Map Tiles API, где единица — успешно полученный векторный тайл 256×256 px;
- для области 800×600 px официальный расчёт даёт минимум 12 и рекомендуемо около 30 тайлов на первичное отображение;
- пакет 100 000 тайлов стоит 8 000 ₽ за расчётный месяц; при годовой подписке действует скидка 10%;
- демо-ключ выдаётся на один месяц, общий лимит Map Tiles API — 500 000 тайлов.

Из 100 000 / 30 получается примерно 3 300 первичных отображений области 800×600 px. Это только ориентир: перемещение, масштабирование, повторные загрузки, размеры экрана и поведение cache меняют расход. Перед решением проверяются актуальный тариф и реальная статистика пилота; цена не считается зафиксированной частью архитектуры.

Технический контракт возможного пилота:

```text
статичный server-rendered preview
→ явная кнопка «Показать интерактивную карту»
→ leaf Client Component
→ dynamic import `@2gis/mapgl` только после действия
→ MapGL + Map Tiles API
```

- до клика нет библиотеки карты, WebGL, тайлов и сторонних сетевых запросов;
- server HTML и первый client render показывают один и тот же preview;
- карта не содержит единственный экземпляр полезного текста или навигации;
- при отсутствии WebGL, ошибке API или исчерпании лимита остаются preview и обычная внешняя ссылка;
- browser access key технически виден пользователю и не считается секретом; для него включается только необходимый Map Tiles API;
- для ключа настраиваются отдельные дневные/месячные лимиты и действие `Block` или `Throttle` в Platform Manager;
- `disableZoomOnScroll` включается; touch-поведение проверяется отдельно;
- экземпляр карты и listeners уничтожаются при unmount;
- сторонние origins добавляются в CSP только по production network trace;
- использование 2ГИС и передача данных третьей стороне отражаются в privacy-документах;
- перед публикацией отдельно проверяются лицензия, корректность нужных территорий, качество данных по объектам и фактический расход тайлов.

Яндекс остаётся решением первого релиза для контактов, собственная статичная схема — для проекта. 2ГИС не заменяет их автоматически и не требует отдельного ADR до фактического пилота.

## 8. Контроль клиентского JavaScript

### 8.1. `SERVER FIRST` и Client boundary

Базовое дерево страницы:

```text
Page — Server Component
├─ Hero — Server Component
├─ SEO/content — Server Component
├─ Cards — Server Component
├─ Article/RichText — Server Component
├─ Filter controls — leaf Client Component
├─ Map launcher — leaf Client Component
└─ FavoriteButton — leaf Client Component, только если функция появится
```

Для каждого нового компонента решение принимается в таком порядке:

1. По умолчанию — Server Component.
2. Нужны только данные, разметка, стили, ссылки или композиция — остаётся Server Component.
3. Нужны `state`, `effect`, browser API, event handlers или browser-only interactive library — выделяется минимальный leaf Client Component.
4. Client boundary поднимается выше только если это доказано связным интерактивным сценарием и не утягивает основной контент.

Запрещён шаблон `"use client"` на всей странице, layout, shell или большой секции ради одного интерактивного элемента.

`"use client"` разрешён только в `src/ui/interactive/**` и только у листовых интерактивных компонентов. Директива запрещена в `src/app/**`, layout, page, template, content blocks и больших композиционных секциях.

Допустимые Client Components:

- форма подбора;
- мобильное меню;
- управляемая галерея;
- действительно интерактивные фильтры;
- модальное окно;
- `MapEmbed`;
- калькулятор;
- tabs только при невозможности корректного server-first варианта.

FAQ по умолчанию реализуется через доступные HTML `details/summary` без React state. Основной текст паспорта, экономика, риски, таблицы, статьи, карточки и ссылки остаются серверными.

`"use client"` создаёт транзитивную границу: импортируемые им модули тоже могут попасть в client bundle. Поэтому Client Component:

- не импортирует Content Repository, Adapter, Markdown renderer, полную страницу или крупную UI-секцию;
- получает только минимальные сериализуемые props, необходимые интерактивности, а не полный `RegionDTO`, `ProjectDTO` или `ArticleDTO`;
- принимает готовый server-rendered контент через `children`, если интерактивная оболочка должна визуально его окружать;
- не требует глобального provider в root layout, если состояние относится к одному виджету;
- имеет явный fallback и может быть удалён без потери основного смысла страницы.

Ожидаемый эффект `SERVER FIRST`: меньше client JavaScript и hydration work, быстрее интерактивность, более устойчивые Core Web Vitals, готовый HTML для поисковых роботов, меньше глобального client state и меньше классов ошибок. Это архитектурная гарантия границ, а не обещание позиции или показателей без измерения.

### 8.2. Dynamic imports

Размер зависимости сам по себе не является основанием для `ssr: false`. Динамически загружаются только необязательные интерактивные функции, которые не нужны для первого экрана и понимания страницы.

`ssr: false` допустим только для browser-only библиотеки, которая объективно не может быть отрендерена при сборке. Если компонент содержит полезный текст или навигацию, он обязан иметь server-rendered оболочку и доступный fallback.

### 8.3. Контракт гидратации

Гидратация — штатный процесс React: браузер присоединяет обработчики событий к заранее собранному HTML Client Components. Server Components сами не требуют гидратации; риск и стоимость появляются только внутри клиентской границы и импортируемого ею графа.

Для этого проекта действует правило:

> server HTML и первый client render обязаны быть структурно и текстово одинаковыми.

Обязательные ограничения:

- в render-path Client Component запрещены `Date.now()`, `new Date()` без заранее переданного стабильного значения, `Math.random()`, случайные ID, чтение `window`, `document`, `localStorage`, viewport и media query;
- локализованные даты, цены и числа форматируются детерминированно с явно заданными locale/timezone либо готовятся до клиентской границы;
- browser-only состояние читается в `useEffect` после первого совпадающего render; начальный fallback остаётся тем же, что в HTML;
- для идентификаторов React используется стабильный `useId`, а для сущностей — AMS ID из данных;
- HTML обязан быть валидным: без вложенных ссылок, кнопок, `<p>` и других интерактивных конфликтов;
- форма получает стабильные initial values; сохранённые в браузере предпочтения применяются только после mount;
- third-party script не может менять React-owned DOM до завершения гидратации;
- размер и состав транзитивного client graph проверяются bundle report, а не только поиском директивы `"use client"`;
- `suppressHydrationWarning` запрещён как способ скрыть ошибку. Исключение возможно только для одного заранее описанного неизбежного значения, после ревью; компонент всё равно обязан сохранять корректный fallback;
- `ssr: false` не является общим лечением mismatch и разрешён только для изолированной browser-only функции;
- metadata `format-detection` фиксируется явно, чтобы iOS не менял телефоны, даты, email и адреса внутри HTML до гидратации.

Hydration gate перед выпуском:

1. production build обслуживается как статический artifact;
2. прямое открытие и hard reload эталонных маршрутов выполняются на desktop и mobile viewport;
3. в console нет hydration mismatch, uncaught и recoverable hydration errors;
4. меню, форма, галерея, фильтр и карта проверяются после завершения гидратации;
5. с отключённым JavaScript остаются основной контент, ссылки, контакты и SEO-смысл страницы;
6. превышение client JS budget или найденный hydration warning блокирует выпуск.

### 8.4. Бюджеты

| Метрика | Бюджет | Где контролируется |
| --- | --- | --- |
| Initial route JS | не более 110 КБ gzip | bundle report, hard fail |
| Один lazy chunk | не более 300 КБ gzip | bundle report, hard fail |
| Initial transfer паспорта | не более 1,5 МБ без ленивой галереи | browser/Lighthouse, hard fail |
| Lab LCP | не более 2,5 с | медиана 3 фиксированных mobile-прогонов |
| Lab CLS | не более 0,1 | медиана 3 фиксированных mobile-прогонов |
| Lab TBT | не более 200 мс | медиана 3 фиксированных mobile-прогонов |
| Field INP | не более 200 мс на p75 | после запуска, RUM/Search Console |

Эталонные маршруты: главная, Сочи, один инвестиционный паспорт и одна статья. Нестабильный единичный Lighthouse-прогон не блокирует релиз без повторного подтверждения; структурные и bundle budgets блокируют сразу.

## 9. Architecture guards и `pnpm verify`

`pnpm verify` должен включать:

- typecheck и lint;
- Zod validation всего опубликованного контента;
- сборку Velite и валидацию итогового `ArticleDTO`;
- уникальность `id` и `(locale, path)`;
- broken links, refs, navigation и redirects;
- существование автора, проверяющего, источников и всех связанных сущностей статьи;
- отсутствие неизвестных Markdown-директив, атрибутов, raw HTML и MDX;
- отсутствие случайно индексируемых страниц тегов, рубрик, авторов и черновиков;
- соответствие `Article`/`BreadcrumbList` structured data видимому содержимому;
- media validation из раздела 6;
- отсутствие `"use client"` вне `src/ui/interactive/**`;
- запрет импорта content/server-слоёв и полных DTO в транзитивный граф Client Components;
- отсутствие недетерминированных render-вызовов и browser APIs в первом render Client Components;
- browser smoke без hydration warnings/errors на эталонных маршрутах;
- отсутствие request-time APIs, Server Actions, Proxy/Middleware, `use cache` и `cacheComponents`;
- отсутствие frontend-интеграции с CRM и секретоподобных `NEXT_PUBLIC_*`;
- отсутствие runtime endpoint `out/api/leads/**`;
- bundle budgets;
- проверку production HTML.

HTML-проверка применяется только к реестру индексируемых страниц и подтверждает:

- один логический H1;
- непустые title, description и canonical;
- отсутствие `noindex` у индексируемой страницы;
- наличие основного текста без выполнения JavaScript;
- обычные crawlable links;
- минимальный объём содержимого согласно типу страницы, а не единый порог для всех URL.

После `next build` отдельно проверяются sitemap, robots, 404, trailing slash, redirect targets и отсутствие случайных служебных страниц в индексе.

## 10. Формы, ПДн и аналитика

```text
Form
→ client UX validation
→ POST /api/leads
→ Nginx
→ AMS Leads API
→ server validation / rate limit / consent / routing
```

Static site не пишет в базу и CRM напрямую. Leads API повторно валидирует данные. CAPTCHA secret находится только в Leads API. В analytics запрещено отправлять имя, телефон, email, сообщение и raw form body.

До production обязательны страницы privacy/consent, версия текста согласия и передача `accepted`, `version`, `acceptedAt`. Форма проверяется end-to-end на тестовом маршруте доставки.

## 11. Подключение CMS и backend

Первый допустимый CMS-сценарий сохраняет статический frontend:

```text
Payload CMS / другой headless CMS
→ защищённый build-time API
→ CMS Adapter
→ те же Zod schemas и DTO
→ Next build
→ новый static artifact
```

Секрет CMS доступен только CI. Webhook запускает сборку, но не публикует artifact, не прошедший validation. Preview и drafts закрыты от индексации. При недоступности CMS production продолжает раздавать последний успешный release.

Переход к Next.js + Payload + PostgreSQL как Realty Platform требуется при регулярном импорте, сотнях меняющихся объектов/лотов, нескольких редакторах и ролях, server-side фильтрах, авторизации, кабинете или фоновых jobs. Это отдельная смена класса проекта, а не постепенное добавление базы в static export.

Пользовательский кабинет предпочтительно остаётся отдельным приложением/контуром; публичный SEO-сайт связывается с ним обычными URL.

## 12. Production и выпуск

```text
SourceCraft repository
→ pnpm install --frozen-lockfile
→ pnpm verify
→ next build + image optimizer
→ validate out/
→ upload versioned release
→ atomic switch current
→ Nginx reload при необходимости
→ live smoke
```

Production не выполняет `git pull`, install или build. Rollback переключает `current` на предыдущий release без пересборки. Staging закрывается Basic Auth и заголовком `X-Robots-Tag: noindex, nofollow`.

Nginx отвечает за TLS, canonical trailing slash, redirects, security headers, CSP, 404 и прокси `/api/leads`.

## 13. Порядок scaffold и реализации

1. Создать Next.js foundation и зафиксировать exact-версии.
2. Подключить static export, Zod, content repository и базовые guards.
3. Зафиксировать Velite и `concurrently`, выполнить compatibility smoke и реализовать `ArticleSourceAdapter`.
4. Проверить `next-image-export-optimizer` на exact Next.js patch.
5. Реализовать `Picture.tsx`, media registry и media validation.
6. Ввести client boundary и bundle budgets до появления сложных компонентов.
7. Создать tokens, shell, header/footer и базовые page templates.
8. Собрать контентные страницы и проверить HTML/SEO.
9. Подключить форму и выполнить end-to-end проверку Leads API.
10. Добавить отложенную карту контактов в последнюю очередь.
11. Подготовить Nginx, staging, atomic deploy, rollback и live smoke.

Не создаются заранее: собственный sharp pipeline, image CDN, CMS, PostgreSQL, Prisma, auth, Docker, общая карта объектов, MapLibre, OpenFreeMap и PMTiles.

## 14. Проверка официальной документации

При scaffold и перед production сверяются:

- Next.js Static Exports: https://nextjs.org/docs/app/guides/static-exports
- Next.js Image: https://nextjs.org/docs/app/api-reference/components/image
- Next.js Support Policy: https://nextjs.org/support-policy
- `next-image-export-optimizer`: https://github.com/Niels-IO/next-image-export-optimizer
- Яндекс Конструктор карт: https://yandex.ru/maps-api/docs/constructor/index.html
- условия использования Яндекс Карт: https://yandex.ru/legal/maps_termsofuse/
- условия отдельных сервисов Яндекс Карт: https://yandex.ru/legal/maps_api/
- Google JavaScript SEO: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- Google Core Web Vitals: https://developers.google.com/search/docs/appearance/core-web-vitals
- Velite collections: https://velite.js.org/guide/define-collections
- Velite + Next.js: https://velite.js.org/guide/with-nextjs
- Velite package/status: https://www.npmjs.com/package/velite
- Content Collections: https://github.com/sdorra/content-collections
- Markdoc: https://github.com/markdoc/markdoc
- Contentlayer maintenance status: https://github.com/contentlayerdev/contentlayer
- `remark-directive`: https://github.com/remarkjs/remark-directive
- Google Article structured data: https://developers.google.com/search/docs/appearance/structured-data/article
- Google FAQ structured data: https://developers.google.com/search/docs/appearance/structured-data/faqpage
- Next.js Server and Client Components: https://nextjs.org/docs/app/getting-started/server-and-client-components
- Next.js hydration errors: https://nextjs.org/docs/messages/react-hydration-error
- React `hydrateRoot`: https://react.dev/reference/react-dom/client/hydrateRoot
- 2ГИС MapGL tariffs: https://docs.2gis.com/mapgl/overview/tariffs
- 2ГИС pricing and limits: https://docs.2gis.com/en/platform-manager/subscription/pricing
- 2ГИС access key limits: https://docs.2gis.com/en/platform-manager/subscription/managing-keys

## 15. Финальный контракт

Первый релиз — воспроизводимый статический Next.js-сайт с заранее собранным SEO-контентом, типизированным и заменяемым pipeline аналитики, build-time оптимизацией локальных изображений, минимальным клиентским JavaScript, отложенной сторонней картой и отдельным Leads API. Любая функция, требующая request-time backend, проходит отдельное решение о смене класса проекта.

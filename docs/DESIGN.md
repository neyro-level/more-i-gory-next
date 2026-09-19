# Realty Design Adapter — «Море и Горы»

**Статус:** Active adapter
**UX scope:** 'PUBLIC_COMMERCIAL' + 'CMS_NATIVE_ADMIN'

Этот документ не является второй дизайн-системой. Визуальная политика находится
в '06_DESIGN_SYSTEM.md', числовые tokens — только в 'src/app/(site)/globals.css'.
Здесь зафиксировано, как существующий UI применяется после перехода к Realty
Platform.

## Ownership

- public site сохраняет проектную систему «premium / calm / evidence-led»;
- Payload Admin остаётся native CMS-интерфейсом и не копирует публичный бренд;
- canonical consumer API — `@/components/ui/*`; owner primitives —
  `src/components/ui/**` и exact paths из
  `docs/ui-upstream-exceptions.json`; `packages/ui` reserved/inactive;
- страницы получают только DTO/contracts и не импортируют Payload persistence;
- решение компонентов: 'REUSE → VARIANT → CREATE'.

## Public patterns

Сохраняются 'Container', 'SectionShell', 'PageHero', 'ActionLink', карточки,
'ProofBlock', 'RiskBlock', 'SourceList', 'ScenarioTable' и lead-form composition.
Новый route является новой композицией утверждённых patterns, а не новой
визуальной системой.

## Runtime

Static-export image/navigation adapters сняты. Действующий UI runtime:

```text
Next.js standalone
Payload
PostgreSQL
S3
Node runtime
Server-first
```

- изображения и навигация — `next/image` и `next/link`;
- media roles те же после Payload/S3;
- `'use client'` только в минимальных interactive leaves;
- dark mode выключен; Tailwind class variant остаётся техническим контрактом,
  но класс `.dark` приложение не устанавливает; reduced motion обязателен;
- package-boundary перенос UI не является текущим design contract.

## CMS-native boundary

Payload Admin используется для контента, media, redirects, properties, leads и
operations. Custom Views допустимы только для workflow, который нельзя удобно
решить штатным Admin. Отдельный branded back office не создаётся.

## Evidence and accessibility

- один logical H1 на коммерческой странице;
- факты, риски, источники и даты проверки остаются видимыми;
- формы имеют связанные label/help/error и текстовые состояния;
- mobile и keyboard behavior проверяются на representative routes;
- статус не передаётся только цветом;
- layout не допускает horizontal overflow.

## EPIC 9 conformance record

- `Container` использует только утверждённые размеры `site` и `narrow`; сужение
  контейнера через случайные `max-w-*` в page-level `className` не является
  допустимым новым паттерном.
- `SectionShell` владеет вертикальным rhythm и передаёт `containerSize` в
  `Container`; публичный API rhythm: `sm | md | lg | hero`; прямые page-level
  вертикальные padding-классы запрещены; legal/404/focused text используют `narrow`.
- Новые типографические роли не вводились: используются роли из
  `06_DESIGN_SYSTEM.md`.

## Token ownership

- числовые и semantic design tokens принадлежат
  `src/app/(site)/globals.css`;
- `docs/06_DESIGN_SYSTEM.md` описывает смысл ролей, но не создаёт второй token source;
- произвольные цвета, radius, spacing и shadow в presentation-коде запрещены
  автоматическими guards;
- upstream shadcn-код после установки является project-owned; намеренные
  отклонения перечисляются только в `docs/ui-upstream-exceptions.json`.

## Approved exceptions

| Исключение | Причина | Location | Владелец / пересмотр |
|---|---|---|---|
| Next.js experimental `globalNotFound` | У приложения два root layouts — `(site)` и `(payload)`; единый 404 до выбора layout иначе не гарантируется | `next.config.ts`, `src/app/global-not-found.tsx` | Plan №3 / EPIC 43; пересмотреть после появления стабильного Next.js API |

На установленном Next.js `16.3.4` опция присутствует в config schema, а
[официальная документация Next.js](https://nextjs.org/docs/app/api-reference/file-conventions/not-found#global-not-foundjs-experimental)
по-прежнему помечает её experimental. Поэтому это осознанное исключение, а не
скрытый drift.

Любое отклонение от '06_DESIGN_SYSTEM.md', новый token role или новый UI owner
фиксируется здесь только после доказанной потребности и owner decision.

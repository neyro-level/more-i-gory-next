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
- reusable primitives живут в `src/components/**` (`FOLDER FORM = canonical`);
  `packages/ui` помечен reserved/inactive и не является текущим owner;
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
- dark mode выключен, reduced motion обязателен;
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
  `Container`; legal/404/focused text используют `narrow`.
- Новые типографические роли не вводились: используются роли из
  `06_DESIGN_SYSTEM.md`.

Любое отклонение от '06_DESIGN_SYSTEM.md', новый token role или новый UI owner
фиксируется здесь только после доказанной потребности и owner decision.

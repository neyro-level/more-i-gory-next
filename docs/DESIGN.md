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
- reusable primitives принадлежат 'packages/ui' после EPIC 3;
- страницы получают только DTO/contracts и не импортируют Payload persistence;
- решение компонентов: 'REUSE → VARIANT → CREATE'.

## Public patterns

Сохраняются 'Container', 'SectionShell', 'PageHero', 'ActionLink', карточки,
'ProofBlock', 'RiskBlock', 'SourceList', 'ScenarioTable' и lead-form composition.
Новый route является новой композицией утверждённых patterns, а не новой
визуальной системой.

## Runtime transition

- EPIC 1 заменяет static-export image/navigation adapters на 'next/image' и
  'next/link', не меняя визуальное направление;
- EPIC 3 переносит DTO/contracts и UI в package boundaries;
- EPIC 6 подключает Payload/S3 media с теми же semantic media roles;
- EPIC 9 выполняет отдельный drift audit и закрывает P0/P1;
- 'use client' остаётся только в минимальных interactive leaves;
- dark mode выключен, reduced motion обязателен.

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

Любое отклонение от '06_DESIGN_SYSTEM.md', новый token role или новый UI owner
фиксируется здесь только после доказанной потребности и owner decision.

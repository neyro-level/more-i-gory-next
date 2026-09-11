# Project UI Technical Core — «Море и Горы»

**Статус:** Active
**Версия:** 1.0
**Дата:** 2026-09-12
**Назначение:** короткий UI-адаптер к действующему
[03_ARCHITECTURE.md](03_ARCHITECTURE.md), а не второй архитектурный канон.

## 1. Core Profile

- Selected AMS Core: STATIC, project-specific static Next.js contract.
- Canonical repository: SourceCraft integrator-p/more-i-gory-next.
- Package manager: pnpm.
- UX scope: PUBLIC_COMMERCIAL.
- AMS Distribution Mode: DISABLED; private @ams registry не подключён.

## 2. Runtime / Exact Versions

Exact versions берутся из package.json, lockfile и .node-version:

- Node.js 24.20.0;
- Next.js 16.3.4;
- React 19.3.0;
- TypeScript 6.0.3;
- Tailwind CSS 4.3.3;
- shadcn CLI 4.21.0, Base UI, preset nova;
- Lucide 1.43.0.

UI foundation: CSS-first Tailwind 4, components.json, project tokens в
src/app/globals.css, primitives в src/components/ui.

## 3. Images

- Mechanism: next-image-export-optimizer в static-export pipeline.
- Content images: зарегистрированный локальный media asset с width/height и alt.
- Responsive contract: fill только вместе с stable wrapper и sizes.
- LCP contract: единственный hero asset получает priority; card/gallery media
  не загружается eager без причины.
- Runtime remote images запрещены.

## 4. Fonts

- Loading: next/font/google в root layout; browser получает self-hosted build
  assets без runtime-запроса к Google.
- Primary/display family: Montserrat variable, normal style.
- Approved weights: 400, 500, 600, 700.
- Cyrillic: VERIFIED через configured cyrillic subset и upstream metadata.
- Source/license: Google Fonts, SIL Open Font License (OFL), VERIFIED.

Official evidence:

- https://nextjs.org/docs/app/api-reference/components/font
- https://github.com/google/fonts/blob/main/ofl/montserrat/METADATA.pb

## 5. Leads / Forms

- Canonical lead UI: LeadForm.
- Transport: browser POST /api/leads через framework-free enhancement.
- Server validation/integration owner: отдельный AMS Leads API, не UI.
- Current mode: fail-closed до legal/Leads API approval.
- PII/legal: consent version и policy gate из Product Structure/Architecture.

Static exception: published routes не гидратируют React. Поэтому server-safe
shadcn Input, Textarea, Button сочетаются с нативными semantic field wrappers и
checkbox. Ошибки связаны через aria-describedby; control получает aria-invalid,
wrapper — data-invalid.

## 6. Data Boundary

- UI input: project DTO / safe view contract.
- Formation layer: Content Service + Repository contracts.
- Reusable UI не импортирует persistence/CMS/ORM types.
- Payload/Prisma/Auth/DB отсутствуют в первом static release.

## 7. Deployment Target

- Production model: static artifact → versioned Nginx release.
- Next.js/Node.js runtime на production отсутствует.
- Production-like proof выполняется на итоговом static artifact.

## 8. Performance Budget

- Mobile LCP: <= 2.5 s.
- CLS: <= 0.1.
- Initial route JavaScript budget: <= 110 KB gzip; фактически static routes
  проходят post-export stripping.
- Measurement: production-like build и representative mobile profile.

## 9. Verification Cadence

- WORK: implementation diagnostics and changed-path proof.
- MERGE STANDARD: review, typecheck, lint, relevant tests, visual/responsive
  proof и один exact-head SourceCraft gate.
- MERGE RISKY: STANDARD плюс proof конкретного foundation/runtime риска.
- RELEASE: exact clean main, один artifact/rollout/live smoke.

## 10. Theme / Locale

- Dark mode: DISABLED.
- Locale: ru-RU.
- Number/currency/date formatting: только через подтверждённый content contract;
  финансовые значения и доходность не выдумываются.

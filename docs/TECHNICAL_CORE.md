# Project UI Technical Core — «Море и Горы»

**Статус:** Active
**Версия:** 1.1
**Дата:** 2026-09-18
**Назначение:** короткий UI-адаптер к действующему
[03_ARCHITECTURE.md](03_ARCHITECTURE.md), а не второй архитектурный канон.
Static export не является действующим UI/runtime contract.

## 1. Core Profile

- Selected AMS Core: REALTY_BASE, Next.js Node runtime, Payload 3.89 in-tree.
- Canonical repository: SourceCraft integrator-p/more-i-gory-next.
- Package manager: pnpm.
- UX scope: PUBLIC_COMMERCIAL.
- AMS Distribution Mode: DISABLED; private @ams registry не подключён.

Действующий runtime UI-слоя:

```text
Next.js standalone
Payload
PostgreSQL
S3
Node runtime
Server-first
```

`output: "standalone"` задан в `next.config.ts`. `"use client"` разрешён только в
`src/ui/interactive/**`. Public pages остаются Server Components.

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
src/app/(site)/globals.css, primitives в src/components/ui.

## 3. Images

- Mechanism: `next/image` и server-side optimizer Next.js.
- Content images: зарегистрированный локальный media asset с width/height и alt.
- Responsive contract: fill только вместе с stable wrapper и sizes.
- LCP contract: единственный hero asset получает `preload`; card/gallery media
  не загружается eager без причины.
- Remote media: `next.config.ts` собирает S3 `remotePatterns` из
  `S3_BUCKET`/`S3_ENDPOINT`; без этих env список пуст и remote fetch не
  открывается.

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
- Transport: browser POST `/api/public/leads` через `src/ui/interactive/lead-form-client.tsx`.
- Server owner: тот же Node runtime и Payload collections `leads` /
  `lead-deliveries`; отдельный static-export AMS Leads API не используется.
- PII/legal: consent version и policy gate из Product Structure/Architecture.

Форма остаётся server-first и использует framework-free progressive enhancement.
Ошибки связаны через aria-describedby; control получает aria-invalid, wrapper —
data-invalid.

## 6. Data Boundary

- UI input: project DTO / safe view contract.
- Formation layer: Content Service + Repository contracts.
- Reusable UI не импортирует persistence/CMS/ORM types.
- Payload 3.89 + PostgreSQL 18 foundation в `main`; Prisma запрещён.
- Публичный UI продолжает читать текущие JSON/Markdown adapters.

## 7. Deployment Target

- Production model: Next.js standalone Node process с in-tree Payload,
  PostgreSQL и S3 media; reverse proxy — Nginx (EPIC 13).
- Не Docker-only «immutable Next.js image» и не static HTML export.
- Staging/production rollout — EPIC 13; локальный production-like proof —
  `next build` + `next start`.

## 8. Performance Budget

- Mobile LCP: <= 2.5 s.
- CLS: <= 0.1.
- Initial route JavaScript budget: <= 210 KB gzip; EPIC 1 baseline — 190 KB; LeadForm primitives add a small client cost on `/podbor/`.
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

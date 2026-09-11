# Risks & Scope — «Море и Горы»

**Статус:** Superseded — риски перенесены в `../../01_PRD.md` и `../../03_ARCHITECTURE.md`
**Версия:** 1.1
**Дата:** 2026-09-11

## 1. MVP / Release 1

Входит:
- главная;
- federal investment hub;
- Сочи;
- Сочи / новостройки;
- Сочи / апартаменты;
- Сочи / Адлер;
- Крым;
- Крым / Ялта;
- Крым / Севастополь — только после подтверждения business coverage;
- Крым / Евпатория;
- Крым / Алушта;
- Архыз;
- Алтай;
- `/obekty/`;
- 8–12 Project Passports;
- `/analitika/`;
- 5 стартовых материалов;
- `/metodika/`;
- `/podbor/`;
- `/o-kompanii/`;
- `/kontakty/`;
- legal;
- 301 migration;
- AMS Leads API integration;
- static production.

## 2. V1 after Launch

- дополнительные статьи;
- Красная Поляна;
- Сириус;
- Судак;
- дополнительные города Крыма;
- project comparisons;
- подтверждённые cases;
- расширение project corpus.

Каждый новый URL проходит SEO/content/data gate.

## 3. Later

- CMS Adapter;
- более удобный редактор;
- динамическая карта;
- новые регионы;
- отдельные strategy pages;
- developer/operator public pages;
- Realty Platform class;
- user cabinet.

## 4. Out of Scope

- mass feed;
- hundreds of auto-updated listings;
- DB/Prisma;
- auth;
- user roles;
- realtime prices;
- lot pages;
- indexable filters;
- universal map;
- server-rendered request-time catalog;
- mobile native app.

## 5. Risk Register

### RISK-001 — Selector positioning without proof
Category: Product / Business
Probability: High
Impact: High
Mitigation:
- реальная методика;
- sources;
- verifiedAt;
- stop-factors;
- примеры отказа;
- фактические кейсы при наличии.
Trigger: marketing claim не может быть подтверждён материалом.
Status: Open
Owner: Product Owner

### RISK-002 — Cannibalization in Sochi
Category: SEO
Probability: Medium
Impact: High
Mitigation:
- отдельная intent map для Sochi / novostroyki / apartamenty / Adler;
- уникальные titles/H1/body;
- explicit parent-child linking.
Trigger: pages rank for same query set or duplicate content appears.
Status: Open
Owner: SEO/Product

### RISK-003 — Crimea template duplication
Category: SEO / Content
Probability: High
Impact: High
Mitigation:
- separate data source per city;
- cross-region content validation;
- local market thesis mandatory.
Trigger: blocks differ only by place name.
Status: Open

### RISK-004 — Insufficient inventory for local landing
Category: Product / SEO
Probability: Medium
Impact: Medium
Mitigation:
- page publication requires content gate;
- unpublished page stays absent from route registry.
Trigger: fewer useful projects / no independent analysis.
Status: Open

### RISK-005 — Stale investment data
Category: Data / Business
Probability: High
Impact: High
Mitigation:
- `verifiedAt`;
- source ledger;
- review SLA;
- build/process stale warnings.
Trigger: price/operator/terms changed.
Status: Open

### RISK-006 — Misleading ROI claims
Category: Compliance / Business
Probability: Medium
Impact: High
Mitigation:
- fact/calculation/forecast/assumption taxonomy;
- gross/net separation;
- source/date;
- legal review of sensitive wording.
Trigger: percentage has no reproducible basis.
Status: Open

### RISK-007 — Hidden broker conflict
Category: Business / Compliance
Probability: Medium
Impact: High
Mitigation:
- define compensation model;
- disclose applicable conflict policy in methodology.
Trigger: selector claim conflicts with commission incentives.
Status: Open

### RISK-008 — Static content operational overload
Category: Operations
Probability: Medium
Impact: Medium
Mitigation:
- small curated catalog;
- predictable review calendar;
- CMS only after operational trigger.
Trigger: updates cannot be safely maintained in Git.
Status: Open

### RISK-009 — Legacy SEO loss
Category: SEO
Probability: Medium
Impact: High
Mitigation:
- URL inventory;
- traffic/backlink check;
- direct 301;
- no redirect chains;
- post-launch monitoring.
Trigger: old indexed pages disappear without equivalent.
Status: Open

### RISK-010 — Hydration / client JS drift
Category: Architecture / Performance
Probability: Medium
Impact: Medium
Mitigation:
- server-first;
- client boundary lint/guards;
- hydration smoke;
- bundle budgets.
Trigger: `"use client"` spreads into large sections.
Status: Controlled by Server First guard, static anchors and artifact/browser gates

### RISK-011 — Dependency incompatibility
Category: Architecture
Probability: Medium
Impact: Medium
Mitigation:
- exact-version smoke for Markdown and image pipeline;
- Adapter/fallback strategy.
Trigger: Next patch breaks build pipeline.
Status: Controlled; exact versions smoke-tested, `sharp` override audited on 2026-09-11

### RISK-012 — Form data/privacy issue
Category: Security / Compliance
Probability: Low/Medium
Impact: High
Mitigation:
- separate Leads API;
- consent versioning;
- no PII in analytics;
- rate limit/captcha server-side.
Trigger: frontend exposes secret or analytics receives form data.
Status: Open

## 6. Scope Change Rule

Новая функция сначала проходит:
1. product need;
2. impact on PRD;
3. impact on Product Structure;
4. architecture impact / ADR;
5. scope decision;
6. backlog.

AI не добавляет feature «по ходу».

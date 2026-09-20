# Release Checklist — «Море и Горы»

**Статус:** Active — TECHNICAL PREVIEW RELEASE
**Версия:** 3.1 — Plan №3 v2 readiness
**Дата:** 2026-09-20

`[x]` означает реально полученное доказательство. Непроверенное не считается
пройденным. Production выполняется только по отдельной команде владельца.

## 1. Technical foundation

- [x] canonical docs и runtime повторно сверены;
- [x] exact toolchain и frozen lockfile зафиксированы;
- [x] Node runtime и trailing slash включены; static export удалён;
- [x] Payload 3.89 подключён как единственный CMS/auth/schema owner;
- [x] PostgreSQL adapter использует `push:false` и committed migrations;
- [x] PostgreSQL 18 clean migration chain 26/26, owner bootstrap и upgrade
  fixture доказаны в EPIC 44;
- [x] anonymous users REST закрыт, GraphQL отключён;
- [x] Server First boundary проверяется автоматически;
- [x] metadata берётся из единого registry;
- [x] draft/gated pages исключены из sitemap;
- [x] HIGH/CRITICAL dependency advisories отсутствуют;
- [x] SourceCraft workflows manual-only и exact-head;
- [x] STANDARD gate не запускает verify дважды;
- [x] RISKY gate выполняет install, audit и verify.
- [x] канонические документы нормализованы в `docs/01…06`;

## 2. Final branch proof

- [x] `pnpm install --frozen-lockfile`;
- [x] `pnpm audit --audit-level high`;
- [x] `pnpm verify:daily` и `pnpm verify:schema` на Plan №3 baseline;
- [x] disposable PostgreSQL 18 proofs: lead migration 5/5 и heartbeat
  visibility; recovery/retention подтверждены deterministic tests;
- [x] rendered Title/Description/H1/canonical/robots contract;
- [x] runtime routes и 404 проверяются через `next start`;
- [x] browser console without hydration/runtime errors;
- [x] mobile layout smoke;
- [x] keyboard/touch/form smoke на доступных representative routes; DB-backed
  detail routes ожидают project-owned staging DB и preview EPIC 49;
- [x] Lighthouse accessibility audit on `/`;
- [x] SourceCraft RISKY exact-head gate PR-19.
- [x] SourceCraft RISKY exact-head gate PR-20 (run 21).

## 3. Content and SEO gates

- [ ] сильные утверждения подтверждены;
- [ ] реальные проекты имеют sources и `verifiedAt`;
- [ ] региональные страницы не являются шаблонными дублями;
- [ ] статьи завершены, имеют источники, review и publication date;
- [ ] методика и сведения о команде утверждены;
- [ ] legacy URL inventory и прямые redirects утверждены;
- [ ] для прошедших gate страниц включены index/sitemap;
- [ ] structured data добавлены только по видимому утверждённому контенту.

До выполнения раздела все текущие страницы сохраняют `noindex, follow`, а sitemap
не рекламирует их поисковым системам.

## 4. Forms, privacy and integrations

- [x] юридический оператор и публичные реквизиты подтверждены владельцем;
- [x] privacy/consent тексты утверждены владельцем;
- [x] consent version утверждена: `pdn-consent-2026-09-17`;
- [ ] production activation и env локального Payload intake известны;
- [ ] server validation, rate limit и CAPTCHA доказаны на backend;
- [ ] форма прошла E2E intake test с записью в Payload; внешний delivery не
  требуется, пока optional channel выключен;
- [ ] ПДн отсутствуют в аналитике;
- [ ] адрес и вариант карты утверждены.

До этого `NEXT_PUBLIC_LEADS_ENABLED=false`: `POST /api/public/leads` остаётся
закрыт на уровне приложения, а Nginx-пример не содержит legacy-заглушку
`/api/leads → 503`.

## 5. Infrastructure and release

- [x] technical production hostname определён: `more-previu.tw1.ru`;
- [ ] TLS для technical hostname проверен на сервере;
- [x] production database credentials identified in Secret Master `more-i-gory-server/prod`;
- [ ] Nginx config отрендерен с реальным окружением и прошёл `nginx -t`;
- [ ] access/error logs определены;
- [x] standalone artifact mode enabled for immutable versioned rollout;
- [ ] atomic switch и rollback протестированы;
- [ ] clean canonical `main` и exact SHA подтверждены для release;
- [ ] выполнен один production release;
- [ ] live 200/404/redirect/sitemap/robots/form smoke;
- [ ] мобильная визуальная проверка production.

## 6. Budgets

- [x] maximum route JavaScript: ≤ 210 KB gzip (`/podbor/`);
- [x] largest initial script chunk: 70 KB gzip ≤ 300 KB;
- [ ] Project Passport first screen ≤ 1.5 MB без lazy gallery;
- [x] local lab LCP: 694 ms ≤ 2.5 s;
- [x] local lab CLS: 0.00 ≤ 0.1;
- [ ] TBT ≤ 200 ms;
- [ ] после запуска INP ≤ 200 ms p75.

Числа фиксируются по итоговому content-complete runtime build, а не переносятся из
предыдущего PR.

Текущий technical artifact: Lighthouse Accessibility 100, Best Practices 100.
SEO 69 объясняется единственным ожидаемым fail: `noindex` до content gate.
Локальные LCP/CLS без network throttling являются smoke, а не прогнозом field CWV.

## 7. Current blockers

Production сейчас блокируют не фундамент Next.js, а:

1. `BLOCKS_RELEASE` в `docs/OWNER_QUEUE.md` (staging/restore DB, enum drift,
   Turnstile, content facts, ротация credentials и domain cutover);
2. неутверждённый контент и реальные project passports;
3. отдельная команда владельца на release EPIC 55–56.

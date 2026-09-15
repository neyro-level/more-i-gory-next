# Release Checklist — «Море и Горы»

**Статус:** Active — NOT READY FOR PRODUCTION
**Версия:** 1.9 Node runtime
**Дата:** 2026-09-15

`[x]` означает реально полученное доказательство. Непроверенное не считается
пройденным. Production выполняется только по отдельной команде владельца.

## 1. Technical foundation

- [x] canonical docs и runtime повторно сверены;
- [x] exact toolchain и frozen lockfile зафиксированы;
- [x] Node runtime и trailing slash включены; static export удалён;
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
- [x] `pnpm verify` after final form-runtime optimization;
- [x] rendered Title/Description/H1/canonical/robots contract;
- [x] runtime routes и 404 проверяются через `next start`;
- [x] browser console without hydration/runtime errors;
- [x] mobile layout smoke;
- [ ] full keyboard smoke on all representative routes;
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

- [ ] юридический оператор и реквизиты подтверждены;
- [ ] privacy/consent тексты утверждены;
- [ ] consent version утверждена;
- [ ] production Leads API известен;
- [ ] server validation, rate limit и CAPTCHA доказаны на backend;
- [ ] форма прошла E2E delivery test;
- [ ] ПДн отсутствуют в аналитике;
- [ ] адрес и вариант карты утверждены.

До этого `NEXT_PUBLIC_LEADS_ENABLED=false`, а пример Nginx возвращает `503` для
`POST /api/leads`.

## 5. Infrastructure and release

- [ ] production hostname/TLS определены;
- [ ] Nginx config отрендерен с реальным окружением и прошёл `nginx -t`;
- [ ] access/error logs определены;
- [ ] immutable image build и versioned rollout реализованы;
- [ ] atomic switch и rollback протестированы;
- [ ] clean canonical `main` и exact SHA подтверждены;
- [ ] выполнен один production release;
- [ ] live 200/404/redirect/sitemap/robots/form smoke;
- [ ] мобильная визуальная проверка production.

## 6. Budgets

- [x] maximum route JavaScript: 190 KB gzip ≤ 200 KB (`/podbor/`);
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

1. неутверждённый контент и реальные project passports;
2. юридические тексты и production Leads API;
3. release/rollback infrastructure proof;
4. финальный exact-main browser/performance audit после контентных правок.

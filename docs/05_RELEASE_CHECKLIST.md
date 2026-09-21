# Release Checklist — «Море и Горы»

**Статус:** Active — TECHNICAL PREVIEW CANDIDATE CLOSEOUT
**Версия:** 3.3 — Plan №3 v3 closeout
**Дата:** 2026-09-21

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
- [x] local disposable PostgreSQL 18 proofs: lead migration 5/5 и heartbeat
  visibility; recovery/retention подтверждены deterministic tests;
- [x] rendered Title/Description/H1/canonical/robots contract;
- [x] runtime routes и 404 проверяются через `next start`;
- [x] browser console without hydration/runtime errors;
- [x] mobile layout smoke;
- [x] keyboard/touch/form smoke на доступных representative routes; DB-backed
  detail routes ожидают migration/runtime proof EPIC 48–49 на существующей DB;
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
- [x] canonical Payload intake утверждён: локальный `POST /api/public/leads/`
  сохраняет заявку в единственной Payload/PostgreSQL базе; внешние notification
  channels выключены;
- [x] server validation, trusted-client/Nginx + application rate limit,
  honeypot и minimum-fill доказаны на backend;
- [x] внешний CAPTCHA-сервис и его ключи не требуются;
- [x] форма прошла E2E intake test с записью в Payload; внешний delivery не
  требуется, пока optional channel выключен;
- [x] ПДн и пользовательский `sourcePath` отсутствуют в operational logs;
- [ ] адрес и вариант карты утверждены.

После E2E proof technical preview возвращён в безопасный режим
`NEXT_PUBLIC_LEADS_ENABLED=false`: `POST /api/public/leads/` закрыт на уровне
приложения до отдельной команды на включение формы.

Включение формы зависит только от `NEXT_PUBLIC_LEADS_ENABLED` и успешного E2E
локальной записи в Payload. Внешний CAPTCHA-сервис в архитектуру не входит.

## 5. Infrastructure and release

- [x] technical production hostname определён: `more-previu.tw1.ru`;
- [x] TLS для technical hostname проверен на сервере;
- [x] production database credentials identified in Secret Master `more-i-gory-server/prod`;
- [x] Nginx config отрендерен с реальным окружением и прошёл `nginx -t`;
- [x] access/error logs определены;
- [x] standalone artifact mode enabled for immutable versioned rollout;
- [x] atomic switch и rollback протестированы;
- [ ] clean canonical `main`, exact SHA и один frozen candidate digest —
  терминальный внешний proof TASK 54.D после merge;
- [ ] выполнен один production release;
- [ ] live 200/404/redirect/sitemap/robots/form smoke;
- [ ] мобильная визуальная проверка production.

## 6. Budgets

- [x] maximum route JavaScript: ≤ 210 KB gzip (`/podbor/`);
- [x] largest initial script chunk: 70 KB gzip ≤ 300 KB;
- [x] Project Passport first screen: 365 KB transferred ≤ 1.5 MB без lazy gallery;
- [x] preview browser LCP: 500 ms maximum across measured representative routes ≤ 2.5 s;
- [x] local lab CLS: 0.00 ≤ 0.1;
- [x] preview browser TBT: 6 ms maximum across measured representative routes ≤ 200 ms;
- [ ] после запуска INP ≤ 200 ms p75.

Числа фиксируются по итоговому content-complete runtime build, а не переносятся из
предыдущего PR.

Текущий technical preview: Lighthouse Accessibility 100, Best Practices 100.
SEO 69 объясняется единственным ожидаемым fail: `noindex` до content gate.
Локальные LCP/CLS без network throttling являются smoke, а не прогнозом field CWV.

## 7. Current blockers

Production сейчас блокируют не фундамент Next.js, а:

1. оставшиеся `BLOCKS_RELEASE` в `docs/OWNER_QUEUE.md` (property enum drift,
   content facts и domain cutover; credential rotation уже выполнена);
2. неутверждённый контент и реальные project passports;
3. отдельная команда владельца на release EPIC 55–56.

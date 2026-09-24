# Payload Local API inventory

**Дата:** 2026-09-23
**Задача:** TASK 36.4, TASK 62.3
**Статус:** Evidence only

Каждый вызов `getPayload`, `payload.find/findByID/findGlobal/create/update/delete`,
`payload.jobs.queue` и `req.payload.*` классифицирован одним слоем.
`SYSTEM GATEWAY` означает только фактический owner-module внутри
`src/core/data-access/system/**`; исполняемые seed-скрипты имеют класс
`ORCHESTRATION` и не владеют привилегированным CRUD.

| Location | Operation | Class | Snippet |
|---|---|---|---|
| `scripts/lead-delivery-proof-g.test.mjs:110` | `jobs.queue` | TEST | `await memory.payload.jobs.queue({` |
| `scripts/run-payload-runtime-proof.mjs:23` | `getPayload` | TEST | `const payload = await getPayload({ config });` |
| `scripts/run-payload-runtime-proof.mjs:35` | `create` | TEST | `const editor = await payload.create({` |
| `scripts/run-payload-runtime-proof.mjs:41` | `create` | TEST | `const lockoutUser = await payload.create({` |
| `scripts/run-payload-runtime-proof.mjs:61` | `create` | TEST | `payload.create({` |
| `scripts/run-payload-runtime-proof.mjs:87` | `findByID` | TEST | `const locked = await payload.findByID({` |
| `scripts/run-payload-runtime-proof.mjs:116` | `find` | TEST | `const users = await payload.find({ collection: "users", limit: 10, overrideAccess: false, user: owner });` |
| `scripts/run-payload-runtime-proof.mjs:117` | `findGlobal` | TEST | `const siteSettings = await payload.findGlobal({ slug: "site-settings", overrideAccess: false, user: owner });` |
| `scripts/seed-media-assets.mjs:64` | `getPayload` | ORCHESTRATION | `const payload = await getPayload({ config });` |
| `scripts/seed-preview-db-proof.mjs:60` | `getPayload` | ORCHESTRATION | `const payload = await getPayload({ config });` |
| `scripts/seed-regions.mjs:73` | `getPayload` | ORCHESTRATION | `const payload = await getPayload({ config });` |
| `scripts/verify-architecture-guards.test.mjs:56` | `find` | TEST | `files: [{ path: "src/core/data-access/public/pages.ts", content: 'payload.find({ collection: "pages" });' }],` |
| `scripts/verify-architecture-guards.test.mjs:69` | `find` | TEST | `content: 'payload.find({ collection: "pages", overrideAccess: false });',` |
| `scripts/verify-architecture-guards.test.mjs:118` | `find` | TEST | `files: [{ path: "src/core/data-access/system/jobs.ts", content: 'payload.find({ collection: "payload-jobs", overrideAccess: true });' }],` |
| `scripts/verify-architecture-guards.test.mjs:125` | `find` | TEST | `files: [{ path: "src/core/data-access/system/lead-delivery.ts", content: 'payload.find({ collection: "payload-jobs", overrideAccess: true });' }],` |
| `scripts/verify-architecture-guards.test.mjs:322` | `find` | TEST | `content: 'payload.find({ collection: "regions", overrideAccess: false, where: { slug: { exists: true } } });',` |
| `scripts/verify-architecture-guards.test.mjs:335` | `find` | TEST | `content: 'payload.find({ collection: "regions", overrideAccess: false, where: { status: { equals: "published" } } });',` |
| `src/core/data-access/public/newbuilds.ts:171` | `getPayload` | PUBLIC GATEWAY | `const payload = await getPayload({ config });` |
| `src/core/data-access/public/newbuilds.ts:172` | `find` | PUBLIC GATEWAY | `const result = await payload.find({` |
| `src/core/data-access/public/newbuilds.ts:192` | `getPayload` | PUBLIC GATEWAY | `const payload = await getPayload({ config });` |
| `src/core/data-access/public/newbuilds.ts:193` | `find` | PUBLIC GATEWAY | `const result = await payload.find({` |
| `src/core/data-access/public/newbuilds.ts:257` | `getPayload` | PUBLIC GATEWAY | `const payload = await getPayload({ config });` |
| `src/core/data-access/public/newbuilds.ts:258` | `find` | PUBLIC GATEWAY | `const result = await payload.find({` |
| `src/core/data-access/public/pages.ts:15` | `getPayload` | PUBLIC GATEWAY | `const payload = await getPayload({ config });` |
| `src/core/data-access/public/pages.ts:16` | `find` | PUBLIC GATEWAY | `const pages = await payload.find({` |
| `src/core/data-access/public/properties.ts:32` | `getPayload` | PUBLIC GATEWAY | `const payload = await getPayload({ config });` |
| `src/core/data-access/public/properties.ts:33` | `find` | PUBLIC GATEWAY | `const result = await payload.find({` |
| `src/core/data-access/public/properties.ts:53` | `getPayload` | PUBLIC GATEWAY | `const payload = await getPayload({ config });` |
| `src/core/data-access/public/properties.ts:54` | `find` | PUBLIC GATEWAY | `const result = await payload.find({` |
| `src/core/data-access/public/regions.ts:31` | `getPayload` | PUBLIC GATEWAY | `const payload = await getPayload({ config });` |
| `src/core/data-access/public/regions.ts:32` | `find` | PUBLIC GATEWAY | `const result = await payload.find({` |
| `src/core/data-access/public/site-chrome.ts:19` | `getPayload` | PUBLIC GATEWAY | `const payload = await getPayload({ config });` |
| `src/core/data-access/public/site-chrome.ts:21` | `findGlobal` | PUBLIC GATEWAY | `payload.findGlobal({ slug: "site-settings", depth: 0, overrideAccess: false, select: publicSiteSettingsSelect }),` |
| `src/core/data-access/public/site-chrome.ts:22` | `findGlobal` | PUBLIC GATEWAY | `payload.findGlobal({ slug: "navigation", depth: 0, overrideAccess: false, select: publicNavigationSelect }),` |
| `src/core/data-access/public/sitemap-pages.ts:21` | `getPayload` | PUBLIC GATEWAY | `const payload = await getPayload({ config });` |
| `src/core/data-access/public/sitemap-pages.ts:22` | `find` | PUBLIC GATEWAY | `const result = await payload.find({` |
| `src/core/data-access/system/apply-feed-upsert.ts:69` | `find` | SYSTEM GATEWAY | `const result = await payload.find({` |
| `src/core/data-access/system/apply-feed-upsert.ts:136` | `create` | SYSTEM GATEWAY | `return payload.create({` |
| `src/core/data-access/system/apply-feed-upsert.ts:148` | `update` | SYSTEM GATEWAY | `await payload.update({` |
| `src/core/data-access/system/apply-feed-upsert.ts:163` | `update` | SYSTEM GATEWAY | `await payload.update({` |
| `src/core/data-access/system/apply-safe-deactivation.ts:44` | `findByID` | SYSTEM GATEWAY | `const source = await payload.findByID({` |
| `src/core/data-access/system/apply-safe-deactivation.ts:78` | `findByID` | SYSTEM GATEWAY | `const run = await payload.findByID({` |
| `src/core/data-access/system/apply-safe-deactivation.ts:94` | `find` | SYSTEM GATEWAY | `payload.find({` |
| `src/core/data-access/system/apply-safe-deactivation.ts:118` | `update` | SYSTEM GATEWAY | `await payload.update({` |
| `src/core/data-access/system/apply-safe-deactivation.ts:131` | `update` | SYSTEM GATEWAY | `await payload.update({` |
| `src/core/data-access/system/bootstrap-owner.ts:14` | `getPayload` | SYSTEM GATEWAY | `const payload = await getPayload({ config });` |
| `src/core/data-access/system/bootstrap-owner.ts:16` | `find` | SYSTEM GATEWAY | `const owners = await payload.find({` |
| `src/core/data-access/system/bootstrap-owner.ts:27` | `create` | SYSTEM GATEWAY | `await payload.create({` |
| `src/core/data-access/system/catalog-lifecycle.ts:74` | `find` | SYSTEM GATEWAY | `const existing = await payload.find?.({` |
| `src/core/data-access/system/catalog-lifecycle.ts:86` | `update` | SYSTEM GATEWAY | `await payload.update?.({` |
| `src/core/data-access/system/catalog-lifecycle.ts:97` | `create` | SYSTEM GATEWAY | `await payload.create?.({` |
| `src/core/data-access/system/catalog-lifecycle.ts:112` | `find` | SYSTEM GATEWAY | `const archivedResult = await payload.find?.({` |
| `src/core/data-access/system/catalog-lifecycle.ts:127` | `find` | SYSTEM GATEWAY | `const publishedResult = await payload.find?.({` |
| `src/core/data-access/system/create-import-issue.ts:13` | `create` | SYSTEM GATEWAY | `return payload.create({` |
| `src/core/data-access/system/create-lead.ts:39` | `jobs.queue` | SYSTEM GATEWAY | `await payload.jobs.queue({` |
| `src/core/data-access/system/create-lead.ts:61` | `getPayload` | SYSTEM GATEWAY | `const payload = await getPayload({ config });` |
| `src/core/data-access/system/create-lead.ts:68` | `create` | SYSTEM GATEWAY | `const lead = await payload.create({` |
| `src/core/data-access/system/create-lead.ts:89` | `create` | SYSTEM GATEWAY | `const delivery = await payload.create({` |
| `src/core/data-access/system/dispatch-due-feeds.ts:69` | `find` | SYSTEM GATEWAY | `const dueFeeds = await payload.find({` |
| `src/core/data-access/system/dispatch-due-feeds.ts:92` | `update` | SYSTEM GATEWAY | `const claim = await payload.update({` |
| `src/core/data-access/system/dispatch-due-feeds.ts:118` | `create` | SYSTEM GATEWAY | `const importRun = await payload.create({` |
| `src/core/data-access/system/dispatch-due-feeds.ts:129` | `jobs.queue` | SYSTEM GATEWAY | `job = await payload.jobs.queue({` |
| `src/core/data-access/system/dispatch-due-feeds.ts:142` | `update` | SYSTEM GATEWAY | `await payload.update({` |
| `src/core/data-access/system/import-feed-run.ts:54` | `update` | SYSTEM GATEWAY | `const transition = await payload.update({` |
| `src/core/data-access/system/import-feed-run.ts:84` | `update` | SYSTEM GATEWAY | `const transition = await payload.update({` |
| `src/core/data-access/system/import-feed-run.ts:104` | `update` | SYSTEM GATEWAY | `await payload.update({` |
| `src/core/data-access/system/import-feed-run.ts:135` | `update` | SYSTEM GATEWAY | `const transition = await payload.update({` |
| `src/core/data-access/system/import-feed-run.ts:177` | `update` | SYSTEM GATEWAY | `await payload.update({` |
| `src/core/data-access/system/import-feed-run.ts:201` | `update` | SYSTEM GATEWAY | `const transition = await payload.update({` |
| `src/core/data-access/system/import-feed-run.ts:225` | `update` | SYSTEM GATEWAY | `const transition = await payload.update({` |
| `src/core/data-access/system/import-feed-run.ts:250` | `update` | SYSTEM GATEWAY | `const transition = await payload.update({` |
| `src/core/data-access/system/import-feed-run.ts:275` | `findByID` | SYSTEM GATEWAY | `const source = await payload.findByID?.({` |
| `src/core/data-access/system/import-feed-run.ts:286` | `find` | SYSTEM GATEWAY | `const history = await payload.find?.({` |
| `src/core/data-access/system/import-feed-run.ts:305` | `update` | SYSTEM GATEWAY | `await payload.update({` |
| `src/core/data-access/system/jobs-janitor.ts:31` | `find` | SYSTEM GATEWAY | `const result = await payload.find?.({` |
| `src/core/data-access/system/jobs-janitor.ts:67` | `find` | SYSTEM GATEWAY | `const completed = await payload.find?.({` |
| `src/core/data-access/system/jobs-janitor.ts:98` | `update` | SYSTEM GATEWAY | `await payload.update({` |
| `src/core/data-access/system/jobs.ts:43` | `find` | SYSTEM GATEWAY | `payload.find({` |
| `src/core/data-access/system/jobs.ts:90` | `find` | SYSTEM GATEWAY | `payload.find({` |
| `src/core/data-access/system/lead-delivery.ts:90` | `update` | SYSTEM GATEWAY | `const transition = await payload.update({` |
| `src/core/data-access/system/lead-delivery.ts:123` | `findByID` | SYSTEM GATEWAY | `const existing = await payload.findByID?.({` |
| `src/core/data-access/system/lead-delivery.ts:142` | `update` | SYSTEM GATEWAY | `const update = await payload.update({` |
| `src/core/data-access/system/lead-delivery.ts:164` | `jobs.queue` | SYSTEM GATEWAY | `await payload.jobs?.queue({` |
| `src/core/data-access/system/lead-delivery.ts:181` | `update` | SYSTEM GATEWAY | `const update = await payload.update({` |
| `src/core/data-access/system/lead-delivery.ts:203` | `update` | SYSTEM GATEWAY | `const update = await payload.update({` |
| `src/core/data-access/system/lead-delivery.ts:228` | `update` | SYSTEM GATEWAY | `await payload.update({` |
| `src/core/data-access/system/lead-delivery.ts:249` | `jobs.queue` | SYSTEM GATEWAY | `await payload.jobs?.queue({` |
| `src/core/data-access/system/lead-delivery.ts:273` | `find` | SYSTEM GATEWAY | `(await payload.find?.({` |
| `src/core/data-access/system/lead-delivery.ts:308` | `update` | SYSTEM GATEWAY | `const update = await payload.update({` |
| `src/core/data-access/system/lead-delivery.ts:321` | `jobs.queue` | SYSTEM GATEWAY | `await payload.jobs?.queue({` |
| `src/core/data-access/system/lead-retention.ts:47` | `find` | SYSTEM GATEWAY | `const result = await payload.find?.({` |
| `src/core/data-access/system/lead-retention.ts:75` | `update` | SYSTEM GATEWAY | `const update = await payload.update({` |
| `src/core/data-access/system/lead-retention.ts:98` | `delete` | SYSTEM GATEWAY | `await payload.delete({` |
| `src/core/data-access/system/lead-retention.ts:103` | `delete` | SYSTEM GATEWAY | `await payload.delete({` |
| `src/core/data-access/system/load-feed-source-conditional.ts:15` | `findByID` | SYSTEM GATEWAY | `const source = await payload.findByID({` |
| `src/core/data-access/system/load-feed-source-market.ts:17` | `findByID` | SYSTEM GATEWAY | `const source = await payload.findByID({` |
| `src/core/data-access/system/load-feed-source-parser.ts:15` | `findByID` | SYSTEM GATEWAY | `const source = await payload.findByID({` |
| `src/core/data-access/system/load-feed-source-url-ref.ts:15` | `findByID` | SYSTEM GATEWAY | `const source = await payload.findByID({` |
| `src/core/data-access/system/load-lead-delivery.ts:100` | `findByID` | SYSTEM GATEWAY | `const delivery = (await payload.findByID({` |
| `src/core/data-access/system/load-lead-delivery.ts:117` | `findByID` | SYSTEM GATEWAY | `const lead = (await payload.findByID({` |
| `src/core/data-access/system/seed-media.ts:13` | `find` | SYSTEM GATEWAY | `const result = await payload.find({` |
| `src/core/data-access/system/seed-media.ts:26` | `update` | SYSTEM GATEWAY | `await payload.update({` |
| `src/core/data-access/system/seed-media.ts:37` | `create` | SYSTEM GATEWAY | `await payload.create({` |
| `src/core/data-access/system/seed-preview-proof.ts:44` | `find` | SYSTEM GATEWAY | `const result = await payload.find({` |
| `src/core/data-access/system/seed-preview-proof.ts:53` | `update` | SYSTEM GATEWAY | `? await payload.update({` |
| `src/core/data-access/system/seed-preview-proof.ts:59` | `create` | SYSTEM GATEWAY | `: await payload.create({` |
| `src/core/data-access/system/seed-regions.ts:6` | `find` | SYSTEM GATEWAY | `const result = await payload.find({` |
| `src/core/data-access/system/seed-regions.ts:23` | `find` | SYSTEM GATEWAY | `const result = await payload.find({` |
| `src/core/data-access/system/seed-regions.ts:33` | `update` | SYSTEM GATEWAY | `? await payload.update({` |
| `src/core/data-access/system/seed-regions.ts:39` | `create` | SYSTEM GATEWAY | `: await payload.create({` |
| `src/project/collections/properties.ts:43` | `req.payload` | CMS ADMIN | `(feedSourceId == null ? null : await loadFeedSourceMarket(req.payload, feedSourceId));` |
| `src/project/collections/redirects.ts:17` | `req.payload.find` | CMS ADMIN | `req.payload.find({` |
| `src/project/collections/redirects.ts:25` | `req.payload.find` | CMS ADMIN | `req.payload.find({` |
| `src/project/collections/redirects.ts:34` | `req.payload.find` | CMS ADMIN | `req.payload.find({` |
| `src/project/jobs/imports/dispatch-due-feeds.ts:25` | `req.payload` | SYSTEM GATEWAY | `const result = await dispatchDueFeeds(req.payload as unknown as Parameters<typeof dispatchDueFeeds>[0]);` |
| `src/project/jobs/imports/import-feed.ts:253` | `req.payload` | SYSTEM GATEWAY | `payload: req.payload as unknown as ImportFeedPayload,` |
| `src/project/jobs/leads/deliver-lead.ts:189` | `req.payload` | SYSTEM GATEWAY | `payload: req.payload as unknown as PayloadLike,` |
| `src/project/jobs/maintenance/scheduled-tasks.ts:94` | `req.payload` | SYSTEM GATEWAY | `req.payload as unknown as Parameters<typeof jobsJanitor>[0],` |
| `src/project/jobs/maintenance/scheduled-tasks.ts:121` | `req.payload` | SYSTEM GATEWAY | `req.payload as unknown as Parameters<typeof recoverLeadDeliveries>[0],` |
| `src/project/jobs/maintenance/scheduled-tasks.ts:148` | `req.payload` | SYSTEM GATEWAY | `req.payload as unknown as Parameters<typeof catalogLifecycle>[0],` |
| `src/project/jobs/maintenance/scheduled-tasks.ts:175` | `req.payload` | SYSTEM GATEWAY | `req.payload as unknown as Parameters<typeof leadRetentionCleanup>[0],` |
| `src/project/leads/owner-retry.ts:39` | `req.payload` | SYSTEM GATEWAY | `req.payload as Parameters<typeof retryAbandonedLeadDelivery>[0],` |

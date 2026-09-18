# Payload Local API inventory

**Дата:** 2026-09-18  
**Задача:** TASK 20.1  
**Статус:** Evidence only

Каждый вызов `getPayload`, `payload.find/findByID/findGlobal/create/update/delete`,
`payload.jobs.queue` и `req.payload.*` классифицирован одним слоем.

| Location | Operation | Class | Snippet |
|---|---|---|---|
| `scripts/seed-media-assets.mjs:63` | `getPayload` | SYSTEM GATEWAY | `const payload = await getPayload({ config });` |
| `scripts/seed-media-assets.mjs:66` | `find` | SYSTEM GATEWAY | `const existing = await payload.find({` |
| `scripts/seed-media-assets.mjs:78` | `update` | SYSTEM GATEWAY | `await payload.update({` |
| `scripts/seed-media-assets.mjs:90` | `create` | SYSTEM GATEWAY | `await payload.create({` |
| `scripts/seed-regions.mjs:54` | `find` | SYSTEM GATEWAY | `const result = await payload.find({` |
| `scripts/seed-regions.mjs:68` | `find` | SYSTEM GATEWAY | `const result = await payload.find({` |
| `scripts/seed-regions.mjs:89` | `getPayload` | SYSTEM GATEWAY | `const payload = await getPayload({ config });` |
| `scripts/seed-regions.mjs:100` | `update` | SYSTEM GATEWAY | `? await payload.update({ collection: "regions", data, id: existing.id, overrideAccess: true })` |
| `scripts/seed-regions.mjs:101` | `create` | SYSTEM GATEWAY | `: await payload.create({ collection: "regions", data, overrideAccess: true });` |
| `scripts/verify-architecture-guards.test.mjs:66` | `find` | TEST | `files: [{ path: "src/core/data-access/public/pages.ts", content: 'payload.find({ collection: "pages" });' }],` |
| `scripts/verify-architecture-guards.test.mjs:79` | `find` | TEST | `content: 'payload.find({ collection: "pages", overrideAccess: false });',` |
| `scripts/verify-architecture-guards.test.mjs:128` | `find` | TEST | `files: [{ path: "src/core/data-access/system/jobs.ts", content: 'payload.find({ collection: "payload-jobs", overrideAccess: true });' }],` |
| `scripts/verify-architecture-guards.test.mjs:135` | `find` | TEST | `files: [{ path: "src/core/data-access/system/lead-delivery.ts", content: 'payload.find({ collection: "payload-jobs", overrideAccess: true });' }],` |
| `src/core/data-access/public/newbuilds.ts:176` | `getPayload` | PUBLIC GATEWAY | `const payload = await getPayload({ config });` |
| `src/core/data-access/public/newbuilds.ts:177` | `find` | PUBLIC GATEWAY | `const result = await payload.find({` |
| `src/core/data-access/public/newbuilds.ts:195` | `getPayload` | PUBLIC GATEWAY | `const payload = await getPayload({ config });` |
| `src/core/data-access/public/newbuilds.ts:196` | `find` | PUBLIC GATEWAY | `const result = await payload.find({` |
| `src/core/data-access/public/newbuilds.ts:258` | `getPayload` | PUBLIC GATEWAY | `const payload = await getPayload({ config });` |
| `src/core/data-access/public/newbuilds.ts:259` | `find` | PUBLIC GATEWAY | `const result = await payload.find({` |
| `src/core/data-access/public/pages.ts:11` | `getPayload` | PUBLIC GATEWAY | `const payload = await getPayload({ config });` |
| `src/core/data-access/public/pages.ts:12` | `find` | PUBLIC GATEWAY | `const pages = await payload.find({` |
| `src/core/data-access/public/properties.ts:27` | `getPayload` | PUBLIC GATEWAY | `const payload = await getPayload({ config });` |
| `src/core/data-access/public/properties.ts:28` | `find` | PUBLIC GATEWAY | `const result = await payload.find({` |
| `src/core/data-access/public/properties.ts:46` | `getPayload` | PUBLIC GATEWAY | `const payload = await getPayload({ config });` |
| `src/core/data-access/public/properties.ts:47` | `find` | PUBLIC GATEWAY | `const result = await payload.find({` |
| `src/core/data-access/public/site-chrome.ts:15` | `getPayload` | PUBLIC GATEWAY | `const payload = await getPayload({ config });` |
| `src/core/data-access/public/site-chrome.ts:17` | `findGlobal` | PUBLIC GATEWAY | `payload.findGlobal({ slug: "site-settings", depth: 0, overrideAccess: false, select: publicSiteSettingsSelect }),` |
| `src/core/data-access/public/site-chrome.ts:18` | `findGlobal` | PUBLIC GATEWAY | `payload.findGlobal({ slug: "navigation", depth: 0, overrideAccess: false, select: publicNavigationSelect }),` |
| `src/core/data-access/system/bootstrap-owner.ts:14` | `getPayload` | SYSTEM GATEWAY | `const payload = await getPayload({ config });` |
| `src/core/data-access/system/bootstrap-owner.ts:16` | `find` | SYSTEM GATEWAY | `const owners = await payload.find({` |
| `src/core/data-access/system/bootstrap-owner.ts:27` | `create` | SYSTEM GATEWAY | `await payload.create({` |
| `src/core/data-access/system/catalog-lifecycle.ts:31` | `find` | SYSTEM GATEWAY | `const result = await payload.find?.({` |
| `src/core/data-access/system/create-lead.ts:34` | `jobs.queue` | SYSTEM GATEWAY | `await payload.jobs.queue({` |
| `src/core/data-access/system/create-lead.ts:47` | `getPayload` | SYSTEM GATEWAY | `const payload = await getPayload({ config });` |
| `src/core/data-access/system/create-lead.ts:54` | `create` | SYSTEM GATEWAY | `const lead = await payload.create({` |
| `src/core/data-access/system/create-lead.ts:75` | `create` | SYSTEM GATEWAY | `const delivery = await payload.create({` |
| `src/core/data-access/system/dispatch-due-feeds.ts:69` | `find` | SYSTEM GATEWAY | `const dueFeeds = await payload.find({` |
| `src/core/data-access/system/dispatch-due-feeds.ts:92` | `update` | SYSTEM GATEWAY | `const claim = await payload.update({` |
| `src/core/data-access/system/dispatch-due-feeds.ts:118` | `create` | SYSTEM GATEWAY | `const importRun = await payload.create({` |
| `src/core/data-access/system/dispatch-due-feeds.ts:126` | `jobs.queue` | SYSTEM GATEWAY | `const job = await payload.jobs.queue({` |
| `src/core/data-access/system/dispatch-due-feeds.ts:136` | `update` | SYSTEM GATEWAY | `await payload.update({` |
| `src/core/data-access/system/import-feed-run.ts:20` | `update` | SYSTEM GATEWAY | `const transition = await payload.update({` |
| `src/core/data-access/system/jobs.ts:32` | `find` | SYSTEM GATEWAY | `const result = await payload.find({` |
| `src/core/data-access/system/lead-delivery.ts:88` | `update` | SYSTEM GATEWAY | `const transition = await payload.update({` |
| `src/core/data-access/system/lead-delivery.ts:121` | `findByID` | SYSTEM GATEWAY | `const existing = await payload.findByID?.({` |
| `src/core/data-access/system/lead-delivery.ts:140` | `update` | SYSTEM GATEWAY | `const update = await payload.update({` |
| `src/core/data-access/system/lead-delivery.ts:162` | `jobs.queue` | SYSTEM GATEWAY | `await payload.jobs?.queue({` |
| `src/core/data-access/system/lead-delivery.ts:179` | `update` | SYSTEM GATEWAY | `const update = await payload.update({` |
| `src/core/data-access/system/lead-delivery.ts:203` | `update` | SYSTEM GATEWAY | `await payload.update({` |
| `src/core/data-access/system/lead-delivery.ts:224` | `jobs.queue` | SYSTEM GATEWAY | `await payload.jobs?.queue({` |
| `src/core/data-access/system/lead-delivery.ts:246` | `find` | SYSTEM GATEWAY | `const result = await payload.find?.({` |
| `src/core/data-access/system/lead-delivery.ts:279` | `update` | SYSTEM GATEWAY | `const update = await payload.update({` |
| `src/core/data-access/system/lead-delivery.ts:292` | `jobs.queue` | SYSTEM GATEWAY | `await payload.jobs?.queue({` |
| `src/core/data-access/system/lead-retention.ts:47` | `find` | SYSTEM GATEWAY | `const result = await payload.find?.({` |
| `src/core/data-access/system/lead-retention.ts:75` | `update` | SYSTEM GATEWAY | `const update = await payload.update({` |
| `src/core/data-access/system/lead-retention.ts:98` | `delete` | SYSTEM GATEWAY | `await payload.delete({` |
| `src/core/data-access/system/lead-retention.ts:103` | `delete` | SYSTEM GATEWAY | `await payload.delete({` |
| `src/project/collections/redirects.ts:15` | `req.payload.find` | CMS ADMIN | `req.payload.find({` |
| `src/project/collections/redirects.ts:23` | `req.payload.find` | CMS ADMIN | `req.payload.find({` |
| `src/project/jobs/imports/dispatch-due-feeds.ts:23` | `req.payload` | SYSTEM GATEWAY | `const result = await dispatchDueFeeds(req.payload as unknown as Parameters<typeof dispatchDueFeeds>[0]);` |
| `src/project/jobs/imports/import-feed.ts:29` | `req.payload` | SYSTEM GATEWAY | `req.payload as unknown as Parameters<typeof transitionImportRunToRunning>[0],` |
| `src/project/jobs/leads/deliver-lead.ts:35` | `req.payload` | SYSTEM GATEWAY | `req.payload as unknown as Parameters<typeof transitionLeadDeliveryToSending>[0],` |
| `src/project/jobs/maintenance/scheduled-tasks.ts:105` | `req.payload` | SYSTEM GATEWAY | `req.payload as unknown as Parameters<typeof recoverLeadDeliveries>[0],` |
| `src/project/jobs/maintenance/scheduled-tasks.ts:132` | `req.payload` | SYSTEM GATEWAY | `req.payload as unknown as Parameters<typeof catalogLifecycle>[0],` |
| `src/project/jobs/maintenance/scheduled-tasks.ts:159` | `req.payload` | SYSTEM GATEWAY | `req.payload as unknown as Parameters<typeof leadRetentionCleanup>[0],` |
| `src/seo/sitemap-source.ts:29` | `getPayload` | PUBLIC GATEWAY | `const payload = await getPayload({ config });` |
| `src/seo/sitemap-source.ts:30` | `find` | PUBLIC GATEWAY | `const pages = await payload.find({` |

import * as migration_20260915_171809_initial_users_jobs from './20260915_171809_initial_users_jobs';
import * as migration_20260916_061119_site_globals from './20260916_061119_site_globals';
import * as migration_20260916_062705_pages_blocks from './20260916_062705_pages_blocks';
import * as migration_20260916_063247_pages_drafts_redirects from './20260916_063247_pages_drafts_redirects';
import * as migration_20260916_063715_pages_seo_contract from './20260916_063715_pages_seo_contract';
import * as migration_20260916_071855 from './20260916_071855';

export const migrations = [
  {
    up: migration_20260915_171809_initial_users_jobs.up,
    down: migration_20260915_171809_initial_users_jobs.down,
    name: '20260915_171809_initial_users_jobs',
  },
  {
    up: migration_20260916_061119_site_globals.up,
    down: migration_20260916_061119_site_globals.down,
    name: '20260916_061119_site_globals',
  },
  {
    up: migration_20260916_062705_pages_blocks.up,
    down: migration_20260916_062705_pages_blocks.down,
    name: '20260916_062705_pages_blocks',
  },
  {
    up: migration_20260916_063247_pages_drafts_redirects.up,
    down: migration_20260916_063247_pages_drafts_redirects.down,
    name: '20260916_063247_pages_drafts_redirects',
  },
  {
    up: migration_20260916_063715_pages_seo_contract.up,
    down: migration_20260916_063715_pages_seo_contract.down,
    name: '20260916_063715_pages_seo_contract',
  },
  {
    up: migration_20260916_071855.up,
    down: migration_20260916_071855.down,
    name: '20260916_071855'
  },
];

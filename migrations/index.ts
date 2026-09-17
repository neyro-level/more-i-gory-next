import * as migration_20260915_171809_initial_users_jobs from './20260915_171809_initial_users_jobs';
import * as migration_20260916_061119_site_globals from './20260916_061119_site_globals';
import * as migration_20260916_062705_pages_blocks from './20260916_062705_pages_blocks';
import * as migration_20260916_063247_pages_drafts_redirects from './20260916_063247_pages_drafts_redirects';
import * as migration_20260916_063715_pages_seo_contract from './20260916_063715_pages_seo_contract';
import * as migration_20260916_071855 from './20260916_071855';
import * as migration_20260916_205602_regions_collection from './20260916_205602_regions_collection';
import * as migration_20260916_215600_20260917_properties_collection from './20260916_215600_20260917_properties_collection';
import * as migration_20260916_220752_20260917_properties_indexes_access from './20260916_220752_20260917_properties_indexes_access';
import * as migration_20260916_221346_20260917_properties_locking_contract from './20260916_221346_20260917_properties_locking_contract';
import * as migration_20260916_231730_newbuild_schema from './20260916_231730_newbuild_schema';
import * as migration_20260916_232544_newbuild_property_links from './20260916_232544_newbuild_property_links';
import * as migration_20260917_000415_ingest_collections from './20260917_000415_ingest_collections';
import * as migration_20260917_001601_ingest_jobs_tasks from './20260917_001601_ingest_jobs_tasks';
import * as migration_20260917_005004_safe_deactivation_approval_marker from './20260917_005004_safe_deactivation_approval_marker';
import * as migration_20260917_005724_import_run_heartbeat_interrupted from './20260917_005724_import_run_heartbeat_interrupted';
import * as migration_20260917_031908_leads_outbox_schema from './20260917_031908_leads_outbox_schema';

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
    name: '20260916_071855',
  },
  {
    up: migration_20260916_205602_regions_collection.up,
    down: migration_20260916_205602_regions_collection.down,
    name: '20260916_205602_regions_collection',
  },
  {
    up: migration_20260916_215600_20260917_properties_collection.up,
    down: migration_20260916_215600_20260917_properties_collection.down,
    name: '20260916_215600_20260917_properties_collection',
  },
  {
    up: migration_20260916_220752_20260917_properties_indexes_access.up,
    down: migration_20260916_220752_20260917_properties_indexes_access.down,
    name: '20260916_220752_20260917_properties_indexes_access',
  },
  {
    up: migration_20260916_221346_20260917_properties_locking_contract.up,
    down: migration_20260916_221346_20260917_properties_locking_contract.down,
    name: '20260916_221346_20260917_properties_locking_contract',
  },
  {
    up: migration_20260916_231730_newbuild_schema.up,
    down: migration_20260916_231730_newbuild_schema.down,
    name: '20260916_231730_newbuild_schema',
  },
  {
    up: migration_20260916_232544_newbuild_property_links.up,
    down: migration_20260916_232544_newbuild_property_links.down,
    name: '20260916_232544_newbuild_property_links',
  },
  {
    up: migration_20260917_000415_ingest_collections.up,
    down: migration_20260917_000415_ingest_collections.down,
    name: '20260917_000415_ingest_collections',
  },
  {
    up: migration_20260917_001601_ingest_jobs_tasks.up,
    down: migration_20260917_001601_ingest_jobs_tasks.down,
    name: '20260917_001601_ingest_jobs_tasks',
  },
  {
    up: migration_20260917_005004_safe_deactivation_approval_marker.up,
    down: migration_20260917_005004_safe_deactivation_approval_marker.down,
    name: '20260917_005004_safe_deactivation_approval_marker',
  },
  {
    up: migration_20260917_005724_import_run_heartbeat_interrupted.up,
    down: migration_20260917_005724_import_run_heartbeat_interrupted.down,
    name: '20260917_005724_import_run_heartbeat_interrupted',
  },
  {
    up: migration_20260917_031908_leads_outbox_schema.up,
    down: migration_20260917_031908_leads_outbox_schema.down,
    name: '20260917_031908_leads_outbox_schema'
  },
];

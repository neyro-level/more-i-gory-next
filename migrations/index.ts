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
import * as migration_20260917_103447_schema_drift from './20260917_103447_schema_drift';
import * as migration_20260917_112944_maintenance_jobs from './20260917_112944_maintenance_jobs';
import * as migration_20260917_125114 from './20260917_125114';
import * as migration_20260918_183258_property_enums from './20260918_183258_property_enums';
import * as migration_20260918_184114_property_numeric from './20260918_184114_property_numeric';
import * as migration_20260918_190215_deactivation_approval from './20260918_190215_deactivation_approval';
import * as migration_20260919_114121_import_run_canonical_status from './20260919_114121_import_run_canonical_status';
import * as migration_20260919_123428 from './20260919_123428';
import * as migration_20260919_202220_epic44_status_enum_collision from './20260919_202220_epic44_status_enum_collision';
import * as migration_20260923_141141_add_reset_password_requested_at from './20260923_141141_add_reset_password_requested_at';
import * as migration_20260924_161359_epic74_geo_model from './20260924_161359_epic74_geo_model';
import * as migration_20260926_070539_add_s3_storage_fields from './20260926_070539_add_s3_storage_fields';

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
    name: '20260917_031908_leads_outbox_schema',
  },
  {
    up: migration_20260917_103447_schema_drift.up,
    down: migration_20260917_103447_schema_drift.down,
    name: '20260917_103447_schema_drift',
  },
  {
    up: migration_20260917_112944_maintenance_jobs.up,
    down: migration_20260917_112944_maintenance_jobs.down,
    name: '20260917_112944_maintenance_jobs',
  },
  {
    up: migration_20260917_125114.up,
    down: migration_20260917_125114.down,
    name: '20260917_125114',
  },
  {
    up: migration_20260918_183258_property_enums.up,
    down: migration_20260918_183258_property_enums.down,
    name: '20260918_183258_property_enums',
  },
  {
    up: migration_20260918_184114_property_numeric.up,
    down: migration_20260918_184114_property_numeric.down,
    name: '20260918_184114_property_numeric',
  },
  {
    up: migration_20260918_190215_deactivation_approval.up,
    down: migration_20260918_190215_deactivation_approval.down,
    name: '20260918_190215_deactivation_approval',
  },
  {
    up: migration_20260919_114121_import_run_canonical_status.up,
    down: migration_20260919_114121_import_run_canonical_status.down,
    name: '20260919_114121_import_run_canonical_status',
  },
  {
    up: migration_20260919_123428.up,
    down: migration_20260919_123428.down,
    name: '20260919_123428',
  },
  {
    up: migration_20260919_202220_epic44_status_enum_collision.up,
    down: migration_20260919_202220_epic44_status_enum_collision.down,
    name: '20260919_202220_epic44_status_enum_collision',
  },
  {
    up: migration_20260923_141141_add_reset_password_requested_at.up,
    down: migration_20260923_141141_add_reset_password_requested_at.down,
    name: '20260923_141141_add_reset_password_requested_at',
  },
  {
    up: migration_20260924_161359_epic74_geo_model.up,
    down: migration_20260924_161359_epic74_geo_model.down,
    name: '20260924_161359_epic74_geo_model'
  },
  {
    up: migration_20260926_070539_add_s3_storage_fields.up,
    down: migration_20260926_070539_add_s3_storage_fields.down,
    name: '20260926_070539_add_s3_storage_fields',
  },
];

import * as migration_20260915_171809_initial_users_jobs from './20260915_171809_initial_users_jobs';

export const migrations = [
  {
    up: migration_20260915_171809_initial_users_jobs.up,
    down: migration_20260915_171809_initial_users_jobs.down,
    name: '20260915_171809_initial_users_jobs'
  },
];

# Runtime supervisor

Chosen supervisor: **systemd** (`moreigory.service`).

No container orchestration is required for this single-host preview/staging
runtime. Do not add Docker Compose or Kubernetes for the app process without a
new architecture decision.

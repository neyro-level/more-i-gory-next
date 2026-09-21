# Runtime supervisor

Chosen supervisor: **systemd** (`moreigory.service`).

No container orchestration is required for this single-host preview/staging
runtime. Do not add Docker Compose or Kubernetes for the app process without a
new architecture decision.

After the exact merged EPIC 49 files are present on preview, TASK 49.O installs
the local health monitor:

```bash
install -m 0644 ops/systemd/moreigory-healthcheck.service /etc/systemd/system/
install -m 0644 ops/systemd/moreigory-healthcheck.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now moreigory-healthcheck.timer
systemctl list-timers moreigory-healthcheck.timer --no-pager
```

The timer calls only the loopback health endpoint. Inspect failures with
`journalctl -u moreigory-healthcheck --since today`; it does not send data to an
external monitoring service.

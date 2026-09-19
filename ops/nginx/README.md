# Nginx contracts

Current runtime (preview/staging): `more-previu.tw1.ru.conf`.

It terminates TLS, overwrites `X-Forwarded-For` with `$remote_addr` (trusted
real IP at this edge), sets security headers, body size, proxy timeouts,
caches `/_next/static/`, and proxies `/api/` and `/admin` to loopback Node.

HTTP-only ACME bootstrap: `more-previu.tw1.ru.http.conf` (not the live TLS vhost).

`legacy/moreigori-static.example.conf` is a historical static-export sample. It is
not the current runtime config and must not be installed on the host.

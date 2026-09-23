# Nginx contracts

Current runtime (preview/staging): `more-previu.tw1.ru.conf`.

It terminates TLS, overwrites `X-Forwarded-For` with `$remote_addr` (trusted
real IP at this edge), sets security headers, body size, proxy timeouts,
caches `/_next/static/`, and proxies `/api/` and `/admin` to loopback Node.

The enforced header baseline includes CSP with `frame-ancestors 'none'`, HSTS,
`nosniff`, `Referrer-Policy` and `X-Frame-Options: DENY`. Locations that define
their own `add_header` repeat the complete baseline because Nginx stops
inheriting server-level headers in that case. The general and Payload API upload
limit is 12 MiB; the public lead endpoint remains restricted to 64 KiB.

HTTP-only ACME bootstrap: `more-previu.tw1.ru.http.conf` (not the live TLS vhost).

`legacy/moreigori-static.example.conf` is a historical static-export sample. It is
not the current runtime config and must not be installed on the host.

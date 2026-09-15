# ADR-008: Next Image, sharp and S3 Media Pipeline

Status: Accepted
Date: 2026-09-15

## Context

Static export optimizer и локальная папка `public/images` не подходят для
Payload upload workflow и управляемых remote media. Одновременно wildcard hosts
создают security и content ownership risk.

## Decision

Использовать `next/image` с `sharp`. Payload media загружает originals в
утверждённый S3 bucket. `remotePatterns` содержит только exact approved S3 host;
wildcard запрещён.

Каждое content image хранит width, height и meaningful alt. На странице только
один LCP-кандидат получает priority; ниже критической зоны используется lazy,
а `sizes` и стабильный aspect ratio обязательны. Существующие локальные masters
переносятся в EPIC 6 после оптимизации и создания media-документов.

## Alternatives Considered

- сохранить `next-image-export-optimizer`;
- раздавать originals без image optimization;
- разрешить произвольные remote hosts;
- добавить отдельный imgproxy.

## Consequences

- image pipeline принадлежит Next.js, Payload и S3 без второго optimizer;
- S3 host становится проверяемой конфигурацией;
- migration существующих assets требует отдельного proof и Lighthouse gate.

## Revisit When

Измеренный media bottleneck оправдает отдельный image service.

# ADR-007: Retire Static Route Stripping and StaticLink-only Policy

Status: Accepted
Date: 2026-09-15

## Context

Static preview удалял route JavaScript и поэтому требовал внутренние plain
anchors через `StaticLink`. После перехода на Node.js этот workaround конфликтует
с обычной App Router navigation и делает два режима ссылок.

## Decision

В EPIC 1 удалить `strip-static-route-js` и перевести внутреннюю навигацию на
`next/link`. `StaticLink` допускается только для внешней или якорной ссылки,
если это остаётся полезной узкой обёрткой; иначе компонент удаляется.

Нельзя сохранять параллельный static-only build и нельзя распространять client
components ради одной ссылки: server-first invariant остаётся.

## Alternatives Considered

- продолжать stripping после каждой сборки;
- оставить `StaticLink` для всех внутренних URL;
- сделать всю навигацию client component.

## Consequences

- routing следует документированному Next.js contract;
- исчезает post-build mutation artifact;
- guards и UI-документы меняются вместе с runtime pivot.

## Revisit When

Только если официальный runtime contract Next.js потребует другого механизма.

# ADR-011: Lead delivery duplicates are operator-visible, not recipient-deduped

Status: Accepted
Date: 2026-09-18

## Context

`lead-deliveries.idempotencyKey` is unique and shaped as
`lead:<id>:channel:<channelId>`. That protects our database and job claim path.
A typical notification channel does not accept that key. TASK 23.6 treats
`unknown` / timeout as retryable, so a later successful retry can produce a
second message for the same delivery.

## Decision

Recipient-side deduplication is **not guaranteed**. The product does not claim
exactly-once delivery to Telegram or any future channel.

Operators distinguish copies by `deliveryId` printed in the outbound message
together with `leadId`. Payload Admin remains the source of truth for
`idempotencyKey`, `attempts`, `attemptLog` and `externalRef`.

## Alternatives Considered

- treat unknown outcomes as sent (rejected: false confirmation);
- disable retries after first unknown (rejected: drops recoverable outages);
- require channel-native idempotency keys (not available on the current
  transports and out of this program: no live notification channel).

## Consequences

- retries after timeout may create duplicate operator notifications;
- `possibleDuplicate` on unknown failures is an operational hint, not a
  guarantee that a duplicate already exists;
- OPERATIONS describes how to match two messages to one delivery row.

## Revisit When

A real channel with documented idempotency is connected by a later owner
decision, or the unknown/retry policy changes.

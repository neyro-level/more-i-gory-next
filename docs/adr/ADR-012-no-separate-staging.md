# ADR-012: Temporary no-separate-staging exception

Status: Accepted / time-boxed
Date: 2026-09-23
Owner decision: Plan №4 OD-08

## Context

Владелец решил не создавать отдельные staging host и staging database до
переключения основного домена. Текущий `more-previu.tw1.ru` используется как
технический preview и будущий production candidate, но это не делает его
production и не разрешает реальный трафик.

## Decision

- Не создавать постоянную staging/test database или второй staging host.
- Проверять миграции и restore только на одноразовых изолированных fixtures.
- Сохранять preview под `noindex, nofollow`; feed, реальные лиды и внешний
  delivery остаются выключены.
- Не выполнять production rollout, включение jobs owner, реальный трафик,
  DNS/domain cutover или снятие preview-ограничений без отдельной команды
  владельца `Выпускаем production` и release checklist.
- Текущий preview может называться только `production candidate`, пока не
  доказан exact tuple SHA + digest + installed path + smoke.

## Expiry

Исключение автоматически прекращает действие перед domain cutover
`moreigori.ru`. До cutover владелец обязан либо утвердить отдельный staging
контур, либо отдельным архитектурным решением принять новую production
топологию и её риски. Молчаливое продление запрещено.

## Consequences

- нет расходов и технического долга от временного второго постоянного контура;
- preview нельзя использовать как безопасную замену production rehearsal;
- restore proof выполняется только на временной recovery target в отдельной
  release-фазе;
- этот ADR не разрешает production и не меняет публичные страницы.

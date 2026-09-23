# Plan 4 / Epic 62 — Payload runtime evidence

Дата проверки: 2026-09-23.

## Контур

- Локальный PostgreSQL 18.6, loopback `127.0.0.1:5435`.
- Для каждого сценария создавались отдельные одноразовые база и роль без superuser-прав.
- Production, постоянная тестовая база и публичные страницы не затрагивались.

## Миграции

- Чистая база: полный проход 27 миграций; поле восстановления пароля создано (`27|1`).
- Заполненная база-предшественник: сохранён пользователь, последняя миграция повторно применена, поле создано (`27|1|1`).
- После обоих сценариев одноразовые базы и роли удалены (`0|0`).

## Payload runtime

На чистой мигрированной базе подтверждены:

- bootstrap владельца через System Gateway;
- вход владельца и редактора;
- JWT-сессия;
- запрет редактору создавать пользователей;
- блокировка после пяти неудачных попыток;
- запрос и завершение сброса пароля при отключённой почтовой доставке;
- чтение users и globals;
- конфигурация Payload Admin и Lexical editor.

Итог runtime-матрицы: `PASS`.

## Сопутствующие проверки

- schema verification и генерация Payload types/import map;
- origin/CORS policy;
- public/system gateways;
- jobs и maintenance;
- media, S3/Timeweb и Next Image;
- page blocks, leads intake и catalog lifecycle;
- architecture guards, TypeScript и ESLint.

Финальный полный `pnpm verify` завершён с кодом `0`: contract suite, production
build и `verify:runtime` прошли; runtime verdict — `PASS`.

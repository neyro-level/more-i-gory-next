# Индекс документов проекта «Море и Горы»

**Дата:** 2026-09-10
**Статус:** рабочий канон перед сборкой static Next.js
**Режим проекта:** документация и проектирование, сборка ещё не начата

## 1. Как читать проект

1. `01_PROJECT_PASSPORT.md` — что это за проект, стек, текущий этап и источники правды.
2. `02_SITE_ARCHITECTURE.md` — утверждённая архитектура сайта, URL, роли страниц, шаблон аналитической статьи, SEO-логика и правила расширения.
3. `03_DESIGN_SYSTEM.md` — полная стартовая дизайн-система на базе текущего `moreigori.ru`.
4. `04_SEO_PASSPORT.md` — SEO-ядро, спрос, регионы, кластеры, контентные направления и правила ведения аналитики.
5. `05_TECHNICAL_ARCHITECTURE.md` — детальный стек, production, изображения, карты Яндекса/резерв 2ГИС, блоговый pipeline, гидратация, клиентский JavaScript и безопасные сценарии backend/CMS.
6. `site-transfer-moreigori-2026-09-09/00_READ_FIRST.md` — визуальный transfer package текущего сайта: скриншоты, ассеты, измерения и шаблоны страниц.
7. `AMS_STATIC_SITE_CORE_STANDARD_1.1_SOLO_MINIMAL.md` — общий технический стандарт будущего статического Next.js-сайта.

## 2. Главные документы

| Документ | Роль | Статус |
| --- | --- | --- |
| `01_PROJECT_PASSPORT.md` | краткий паспорт проекта | active |
| `02_SITE_ARCHITECTURE.md` | архитектура сайта и SEO-структура | active |
| `03_DESIGN_SYSTEM.md` | визуальный канон и UI-компоненты | active |
| `04_SEO_PASSPORT.md` | SEO-ядро и поисковые приоритеты | active |
| `05_TECHNICAL_ARCHITECTURE.md` | проектный стек, production и backend evolution | active |
| `site-transfer-moreigori-2026-09-09/` | evidence-пакет текущего дизайна | active reference |

## 3. Исследования и черновики

Эти файлы полезны как история решений и доказательная база, но не являются главным каноном для сборки:

| Файл | Роль |
| --- | --- |
| `deep-research-report  №1.md` | исследование по позиционированию/рынку |
| `deep-research-report №2.md` | дополнительное исследование |
| `deep-research-report № 3 Konkurenty.md` | конкурентное исследование |
| `more_i_gory_site_strategy.md` | ранняя стратегия, частично superseded текущим каноном |
| `01_research/` | рабочие SEO/Topvisor материалы |

## 4. Что является источником правды

- По структуре сайта: `02_SITE_ARCHITECTURE.md`.
- По визуальному стилю: `03_DESIGN_SYSTEM.md`.
- По SEO и семантике: `04_SEO_PASSPORT.md`.
- По стеку, production, изображениям, карте, клиентскому JavaScript и будущему backend: `05_TECHNICAL_ARCHITECTURE.md`.
- По фактическому текущему дизайну live-сайта: `site-transfer-moreigori-2026-09-09/`.
- По общим техническим правилам static Next.js: `AMS_STATIC_SITE_CORE_STANDARD_1.1_SOLO_MINIMAL.md`.

## 5. Что пока не делаем

- Не начинаем сборку Next.js.
- Не создаём CMS, Payload, Prisma или базу данных.
- Не копируем WordPress/Elementor/WooCommerce runtime.
- Не расширяем архитектуру десятками городских страниц без SEO/data gate.
- Не создаём отдельные документы под каждую страницу до старта контентного этапа.

## 6. Следующий этап

После утверждения документов можно начинать сборку проекта:

```text
документы утверждены
→ scaffold static Next.js
→ design tokens/assets
→ shell/header/footer
→ главная
→ региональные хабы
→ объекты
→ аналитика
→ SEO/metadata/sitemap
```

# Design System — «Море и Горы»

**Статус:** Active
**Версия:** 1.5
**Дата:** 2026-09-10
**Role:** самостоятельный source of truth визуального языка проекта

## 1. Visual Direction

```text
deep navy premium base
+ white rounded surfaces
+ restrained coral accent
+ large real sea/mountain/property photography
+ calm investment presentation
+ high information clarity
```

Сайт должен выглядеть как инвестиционное бюро, а не marketplace.

## 2. Core Principles

1. Премиальность без визуального шума.
2. Фото несёт эмоцию, данные несут решение.
3. Белые поверхности создают читаемые смысловые острова.
4. Коралловый используется как action signal.
5. SEO/content не прячется в carousel.
6. Карточка проекта — вход в investment passport, не WooCommerce product.
7. Инвестиционные таблицы/риски должны читаться легче рекламных блоков.

## 3. Colors

```css
--color-brand-navy: #08192c;
--color-brand-coral: #ff6a55;
--color-surface-white: #ffffff;
--color-text-dark: #1a1a1a;
--color-text-light: #ffffff;
--color-navy-74: rgba(8, 25, 44, 0.74);
--color-navy-50: rgba(8, 25, 44, 0.50);
--color-navy-35: rgba(8, 25, 44, 0.35);
```

## 4. Typography

Display:
- `EuropeExt, sans-serif`.

UI/body:
- `Montserrat, sans-serif`.

Fallback:
- system sans.

Responsive uses fixed breakpoint steps, not continuous viewport scaling.

## 5. Layout

- desktop content container ≈ 1200px;
- generous vertical rhythm;
- white rounded hero/surface blocks;
- cards 16–24px radius;
- major surfaces 24–32px;
- buttons pill-shaped where appropriate.

## 6. Core Components

### 6.0. UI foundation

Официальный shadcn/ui используется как контролируемый источник primitives, а не
как готовый визуальный бренд. Основа: Base UI, preset `nova`, Tailwind CSS 4,
CSS variables, Lucide. Community registries и вторая UI-библиотека запрещены.

Базовые primitives:

- Button;
- Card;
- Badge;
- Sheet;
- Field;
- Input;
- Textarea;
- Checkbox;
- Alert;
- Separator;
- Breadcrumb;
- Accordion.

Проектные компоненты:

- Container;
- SectionShell;
- PageHero;
- RegionCard;
- ObjectCard;
- ProofBlock;
- RiskBlock;
- ScenarioTable;
- SourceList;
- LeadFormSection;
- SiteHeader;
- SiteFooter.

### 6.1. Ownership rule

Project components владеют композицией и визуальной индивидуальностью.
shadcn primitives владеют доступными интерактивными состояниями. Страницы не
копируют primitive markup и не создают локальную вторую систему tokens.

### SiteHeader
- logo;
- main nav;
- phone/contact;
- CTA;
- mobile drawer.

### HomeHero
Must communicate:
- investment resort real estate category;
- what bureau does differently;
- primary CTA;
- secondary path to regions/projects.

### RegionCard
- image;
- region;
- investment thesis;
- normal anchor.

### ObjectCard
- image;
- name;
- region/area;
- format;
- entry budget if verified;
- operator/stage if useful;
- concise thesis;
- key risk/updatedAt where appropriate;
- CTA to passport.

### ProofBlock
New required component.

Purpose:
show why selection can be trusted.

May include:
- methodology;
- data sources;
- review date;
- reviewer;
- compensation/conflict policy;
- verified evidence.

### RiskBlock
Separate from generic marketing cards.

### ScenarioTable
Conservative / Base / Optimistic with visible assumptions.

### SourceList
Readable provenance and dates.

### LeadForm
Compact, one-column on mobile, clear progress/error/success.

### ArticlePage
Readable long-form layout with TOC, source notes and related commercial links.

## 7. Page Visual Priority

Project Passport:
1. verdict;
2. facts;
3. economics;
4. risks;
5. exit;
6. visual gallery.

Do not place large gallery before investment decision data unless UX testing proves otherwise.

## 8. Images

Use:
- real landscapes;
- recognizable regional context;
- architecture;
- actual project imagery.

Avoid:
- random stock;
- over-dark overlays;
- low-information decorative image walls;
- duplicated carousel content in DOM.

## 9. Motion

Allowed:
- subtle reveal;
- card hover;
- lightweight carousel;
- mobile drawer.

Not allowed:
- content hidden until animation;
- heavy parallax;
- animation that delays reading;
- motion copied from Elementor without product value.

## 10. Responsive

Mobile is a first-class target.

Required:
- no horizontal overflow;
- one-column forms;
- readable investment tables;
- cards fit long Russian names;
- CTA remains clear;
- sticky/fixed UI only if it does not cover content.

## 11. Accessibility

- focus state;
- semantic anchors/buttons;
- contrast;
- content image alt;
- decorative assets hidden from screen readers;
- no SEO meaning only in visual carousel.

## 12. Transfer Rule

Transfer package is visual evidence, not implementation source.

Preserve:
- palette;
- mood;
- image scale;
- white rounded surfaces;
- recognizable brand character.

Do not preserve:
- Elementor wrappers;
- WooCommerce UI model;
- old URL structure;
- empty headings;
- duplicated DOM carousel content;
- old technical CSS/class system.

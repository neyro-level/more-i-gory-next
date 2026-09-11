# Design System — «Море и Горы»

**Статус:** Active
**Версия:** 2.0
**Дата:** 2026-09-12
**Назначение:** проектная visual policy. Числовые значения живут только в
src/app/globals.css.

## 1. Visual Character

~~~text
premium
calm
evidence-led
spacious
natural
~~~

Сайт должен выглядеть как инвестиционное бюро, а не marketplace или
развлекательный travel-портал. Фото создаёт контекст, данные помогают принять
решение, коралловый остаётся сигналом действия.

## 2. Source / Status

- Main design source: утверждённое направление transfer package, нормализованное
  в проектную систему; reference не является runtime source of truth.
- Representative page: главная плюс PageHero/SectionShell templates.
- Token source: src/app/globals.css.
- AMS Distribution Mode: DISABLED.
- Dark mode: DISABLED.

## 3. Semantic Colors / Surfaces

Approved roles:

~~~text
background / foreground
card / card-foreground
muted / muted-foreground
primary / primary-foreground
action / action-foreground / action-on-dark
destructive / success / warning
surface-dark / surface-dark-foreground
border / input / ring
~~~

Navy используется как dark brand surface, coral — как action signal.
Success, warning и destructive сообщают состояние не только цветом, но и
текстом. Raw brand/color values в TSX запрещены.

## 4. Typography

Primary/display font: Montserrat variable через next/font.

- Cyrillic coverage: VERIFIED.
- Approved weights: 400, 500, 600, 700.
- Source/license: Google Fonts, OFL, VERIFIED.
- EuropeExt: REQUIRES_OWNER_DECISION и лицензированный font file; в коде не
  имитируется fallback-шрифтом.

Approved roles:

~~~text
text-h1 / text-h2 / text-h3 / text-h4
text-body-lg / text-body / text-body-sm
text-label / text-caption
~~~

HTML semantics и visual role независимы. Heading weight задаётся явно через
font utilities, а не скрывается внутри typography token. Один logical H1
обязателен для коммерческой/SEO-страницы. Article/legal text использует narrow
container. Новая типографическая роль требует project decision.

## 5. Containers / Section Rhythm

Containers:

~~~text
site   → коммерческие страницы и основные композиции
narrow → статьи, legal, сфокусированный текст и формы
~~~

Wide container пока не определён: в текущем UI нет доказанной потребности.
Horizontal padding принадлежит Container.

Section rhythm:

~~~text
sm   → compact supporting/footer
md   → default semantic section
lg   → major separation
hero → PageHero only
~~~

Vertical rhythm принадлежит SectionShell/semantic section, не page-level
случайным значениям.

## 6. Radii / Shadows

Approved roles:

~~~text
control → controls, mobile navigation items
card    → cards, compact surfaces and card media
large   → hero, lead form and major feature surfaces
~~~

Project shadow role: shadow-surface для elevated hero/menu surfaces.
shadcn primitives сохраняют свои внутренние preset radii/shadows; project
composition не переопределяет их случайными значениями.

## 7. Buttons / Actions

Canonical primitive: shadcn Button.

- variant=accent, size=cta — primary conversion;
- variant=default, size=cta — strong navy action;
- variant=outline, size=cta — secondary action;
- button-like links использует project ActionLink поверх buttonVariants,
  сохраняя обычный anchor для static export;
- page files не меняют CTA color/radius/padding.

## 8. Forms / States

LeadForm — единственный visual pattern для текущего lead intent.

Required states:

~~~text
default / validating / validation-error / submitting
server-disabled / server-error / success
~~~

Field label/help/error программно связаны; error status содержит текст.
Transport, server validation, anti-spam и persistence принадлежат Technical Core.

## 9. Media

Approved roles:

~~~text
aspect-hero   → PageHero on compact layouts
aspect-card   → region card
aspect-object → property/project card
~~~

Media использует local registry, meaningful alt или explicit decorative
treatment, stable wrapper и responsive sizes. Допустимы реальные ландшафты,
региональный контекст, архитектура и подтверждённые project images.

Запрещены random stock, decorative image walls, excessive dark overlays и
дублированный carousel DOM.

## 10. Icons / Motion

- Canonical icons: Lucide only.
- Icons support meaning; status remains readable as text.
- Motion: CSS/Tailwind first, transform/opacity where useful.
- Project transitions use semantic easing and approved duration utilities.
- Global prefers-reduced-motion foundation обязателен.
- Heavy parallax/hero animation and content hidden until animation are forbidden.

## 11. Responsive

Mobile is first-class.

- mobile: one column and full-width primary actions;
- tablet: two columns only when content stays readable;
- laptop: compact header/menu;
- desktop: full navigation and multi-column composition;
- controls/actions use the canonical touch-target size;
- flex/grid children with long Russian text preserve min-width: 0;
- no horizontal page overflow; wide semantic tables own local scrolling.

## 12. Shared Project Patterns

| Component | Layer | Contract |
|---|---|---|
| Container | layout | site/narrow width, horizontal padding, className via cn() |
| SectionShell | layout | semantic section + SectionHeader composition, className via cn() |
| PageHero | shared marketing | H1, lead, actions, optional LCP image |
| ActionLink | navigation | canonical button-like anchor |
| ArticleCard / RegionCard / ObjectCard | domain marketing | typed safe props, semantic card roles |
| NumberedSteps | shared marketing | repeated ordered step composition |
| ProofBlock / RiskBlock / SourceList | domain marketing | trust/evidence/risk patterns |
| ScenarioTable | domain marketing | semantic shadcn Table with local mobile scroll |
| LeadForm / LeadFormSection | form/shared marketing | functional form separated from wrapper |

Page files predominantly compose these sections. New page means a new
composition of the same system, not a new visual language.

## 13. Approved Exceptions

| Date | Location | Exception | Reason | Owner decision |
|---|---|---|---|---|
| 2026-09-12 | LeadForm fields/checkbox | Native semantic wrappers and checkbox instead of hydrated shadcn Field/Checkbox | Static routes deliberately ship without React hydration; FormData enhancement remains framework-free | Approved by static architecture and UI remediation scope |

If this exception repeats outside the static lead form, it requires a new
decision. @ams distribution files are absent and must not be invented.

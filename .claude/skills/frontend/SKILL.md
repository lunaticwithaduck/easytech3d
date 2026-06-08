---
name: frontend
description: This skill should be used when the user asks about "HTML semantics", "CSS architecture", "JavaScript patterns", "TypeScript types", "web accessibility", "web performance", "frontend testing", "responsive design", "browser APIs", "CSS Grid", "Flexbox", "Tailwind patterns", or needs fundamental frontend development knowledge that is not React or Next.js specific.
version: 1.0.0
---

# Frontend Engineering Fundamentals

Base-layer skill for HTML, CSS, JavaScript, and TypeScript frontend development. Covers semantic markup, styling architecture, accessibility, performance, and testing. React and Next.js specifics are in their own skills — this skill covers the universal foundations.

## Core Workflow

### Phase 1: Understand Requirements

Before writing code, establish:

1. **Browser support** — what is the target? Modern evergreen only, or legacy support needed?
2. **Device context** — mobile-first or desktop-first? Touch-primary or pointer-primary?
3. **Existing stack** — what CSS framework (Tailwind, CSS Modules, vanilla)? What bundler? What test runner?
4. **Accessibility level** — WCAG AA (standard) or AAA (enhanced)?
5. **Performance budget** — what are the Core Web Vitals targets?

Read the existing codebase first. Match conventions. Consistency beats novelty.

### Phase 2: Semantic Structure

Start with correct HTML before any styling.

**HTML Element Decision Table:**

| Purpose | Correct Element | Wrong |
|---------|----------------|-------|
| Clickable action | `<button>` | `<div onClick>` |
| Navigate to URL | `<a href="...">` | `<button onClick={navigate}>` |
| Page regions | `<nav>`, `<main>`, `<aside>`, `<header>`, `<footer>` | `<div class="nav">` |
| Heading | `<h1>` through `<h6>` (sequential, no skips) | `<div class="title">` |
| List of items | `<ul>`/`<ol>` + `<li>` | Nested `<div>` |
| Tabular data | `<table>` + `<thead>` + `<th scope>` | Grid of divs |
| Form group | `<fieldset>` + `<legend>` | `<div class="group">` |
| Input label | `<label for="id">` | `<span>` as label |
| Time/date | `<time datetime="...">` | `<span>` |
| Dialog/modal | `<dialog>` | `<div role="dialog">` (unless needing more control) |
| Expandable | `<details>` + `<summary>` | Custom accordion (unless needing animation) |

**Heading Hierarchy Rules:**
- Exactly ONE `<h1>` per page
- Never skip levels (h1 → h3 is wrong, must go h1 → h2 → h3)
- Heading level = document structure, NOT visual size (use CSS for sizing)

**Landmark Regions:**
- `<header>` — site header
- `<nav aria-label="Main">` — primary navigation (use aria-label when multiple navs)
- `<main>` — ONE per page, primary content
- `<aside>` — sidebar/supplementary
- `<footer>` — site footer

### Phase 3: Style Architecture

**CSS Framework Decision:**

| Framework | Best For | Trade-off |
|-----------|----------|-----------|
| Tailwind CSS | Rapid development, utility-first, design system enforcement | Class verbosity, build step required |
| CSS Modules | Component scoping, standard CSS, no runtime | Less design system enforcement |
| Vanilla CSS | Simple projects, no build step, full control | Manual scoping, no built-in design tokens |

**Tailwind Class Ordering Convention:**
1. Layout (display, position, grid/flex) → 2. Sizing (w, h, min/max) → 3. Spacing (p, m, gap) → 4. Typography (font, text, leading) → 5. Color (bg, text, border colors) → 6. Borders (border, rounded) → 7. Effects (shadow, opacity) → 8. Transitions → 9. Responsive (sm:, md:, lg:) → 10. States (hover:, focus:, dark:)

**CSS Custom Properties Architecture (3 layers):**
```css
/* Layer 1: Primitive tokens */
--color-blue-500: #3b82f6;
--spacing-4: 1rem;

/* Layer 2: Semantic tokens */
--color-primary: var(--color-blue-500);
--spacing-card-padding: var(--spacing-4);

/* Layer 3: Component tokens */
--button-bg: var(--color-primary);
--card-padding: var(--spacing-card-padding);
```

### Phase 4: Enhance and Test

**Progressive Enhancement Order:**
1. Semantic HTML (works without CSS or JS)
2. CSS layout and styling
3. JavaScript interactivity
4. Animations and micro-interactions

**Testing Decision Tree:**

| Level | Tool | Test What |
|-------|------|-----------|
| Unit | Vitest | Pure functions, utilities, transformations |
| Component | Testing Library | Component rendering, user interactions, state changes |
| Integration | Testing Library + MSW | Data fetching, form submission, multi-component flows |
| E2E | Playwright | Critical user journeys, cross-page flows |
| Visual | Playwright screenshots | Layout regression, responsive breakpoints |
| Accessibility | axe-core | WCAG violations, ARIA correctness |

**Test Priority:** Integration > Component > E2E > Unit > Visual

## TypeScript for Frontend

**Key Patterns:**

| Pattern | Use Case |
|---------|----------|
| Discriminated unions | State machines: `{ status: 'loading' } \| { status: 'success', data: T } \| { status: 'error', error: Error }` |
| Template literal types | Route params: `` `/users/${string}` `` |
| `satisfies` keyword | Validate object shape while preserving literal types |
| Generic components | Reusable typed components: `<List<T> items={T[]} renderItem={(item: T) => ReactNode}>` |
| `as const` assertions | Narrow literal types for config objects |

**Rules:**
- Never use `any` — use `unknown` and narrow with type guards
- Prefer `interface` for object shapes that may be extended
- Prefer `type` for unions, intersections, and computed types
- Always type event handlers explicitly: `React.MouseEvent<HTMLButtonElement>`

## Accessibility Quick Reference

| Requirement | Target | Technique |
|-------------|--------|-----------|
| Color contrast (text) | 4.5:1 minimum (AA) | Check with browser DevTools or contrast checkers |
| Color contrast (large text) | 3:1 minimum | Text ≥18px bold or ≥24px regular |
| Color contrast (UI) | 3:1 minimum | Borders, icons, form controls |
| Touch targets | 44x44px minimum | Add padding to small interactive elements |
| Focus indicators | Visible on all interactive elements | `focus-visible:ring-2 focus-visible:ring-ring` |
| Reduced motion | Respect `prefers-reduced-motion` | `motion-reduce:transition-none` |
| Color independence | Never color-only indicators | Add icons, text, or patterns |
| Keyboard navigation | Tab order matches visual order | Never use `tabindex > 0` |
| Screen readers | Meaningful content announced | Semantic HTML + ARIA where needed |
| Skip links | First focusable element | Link to `#main-content` |

## Performance Fundamentals

**Core Web Vitals Targets:**

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP (Largest Contentful Paint) | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| INP (Interaction to Next Paint) | ≤ 200ms | ≤ 500ms | > 500ms |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | ≤ 0.25 | > 0.25 |

**Image Format Decision Tree:**
1. Is it a photo? → AVIF (best compression) > WebP > JPEG
2. Is it an illustration with flat colors? → SVG (if vector) > WebP > PNG
3. Does it need transparency? → WebP > PNG (never transparent JPEG)
4. Is it an icon? → Inline SVG (accessible, styleable, cacheable)

**Font Loading Strategy:**
- Use `font-display: swap` to prevent invisible text
- Preload critical fonts: `<link rel="preload" href="font.woff2" as="font" crossorigin>`
- Subset fonts to needed character ranges
- Prefer variable fonts (one file, multiple weights)

## Pre-Delivery Checklist

- [ ] Semantic HTML elements used correctly
- [ ] Heading hierarchy sequential (h1 → h2 → h3)
- [ ] All images have appropriate `alt` text
- [ ] All form inputs have visible, associated labels
- [ ] Focus indicators visible on all interactive elements
- [ ] Color contrast meets 4.5:1 for text, 3:1 for UI
- [ ] Touch targets ≥ 44x44px
- [ ] Responsive at 375/768/1024/1440px
- [ ] `prefers-reduced-motion` respected
- [ ] No TypeScript `any` types
- [ ] Loading, empty, and error states handled
- [ ] Matches existing codebase conventions

## Additional Resources

Detailed references for each topic:

- `references/html-semantics.md` — complete semantic HTML reference
- `references/css-patterns.md` — layout recipes, modern CSS features
- `references/typescript-frontend.md` — strict TypeScript patterns for UI
- `references/accessibility-deep.md` — ARIA patterns catalog, keyboard navigation
- `references/performance-guide.md` — CWV optimization, resource loading
- `references/testing-fundamentals.md` — testing strategies and tool patterns

Working examples:

- `examples/accessible-form.md` — production-quality accessible form
- `examples/responsive-layout.md` — mobile-first responsive layout

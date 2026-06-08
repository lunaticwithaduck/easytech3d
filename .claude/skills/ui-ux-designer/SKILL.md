---
name: ui-ux-designer
description: This skill should be used when the user asks to "design a UI", "create a component", "build a page", "review the design", "improve the UX", "create a design system", "choose colors", "pick fonts", "make it responsive", "fix accessibility", "critique this design", or mentions UI/UX design, layouts, typography, color palettes, components, dashboards, landing pages, or frontend aesthetics.
version: 1.0.0
---

# UI/UX Designer

Comprehensive design intelligence combining deep design principles with a data-driven recommendation engine. Contains 67 styles, 96 color palettes, 57 font pairings, 99 UX guidelines, 25+ chart types across 13 technology stacks — all searchable via BM25.

## Core Design Workflow

Follow these six phases for every design task. Skip phases only when the scope clearly warrants it.

### Phase 1: Understand

Before writing any code, gather context:

1. **Read the existing codebase first.** Look at current components, colors, spacing, and patterns. Match existing conventions — consistency across the product outweighs any individual improvement.
2. **Clarify the request:** What is the product? Who are the users? What is the primary goal of this screen?
3. **Identify constraints:** Existing design system? Brand guidelines? Tech stack? Responsive requirements?
4. **Determine emotional tone:** Professional, playful, luxury, minimal, bold?

Never design without understanding. A beautiful design solving the wrong problem is worthless.

### Phase 2: Information Architecture

1. List all content and actions for the page
2. Prioritize: primary, secondary, tertiary
3. Group related items (Gestalt proximity principle)
4. Define the user flow: where did the user come from? Where do they go next?

### Phase 3: Structure

1. Lay out major regions: header, navigation, main content, sidebar, footer
2. Establish the grid and content hierarchy
3. Place the primary CTA prominently — every screen has exactly ONE primary action
4. Plan responsive behavior: how does this reflow on mobile?

### Phase 4: Visual Design

Apply design principles and use the data-driven search tool for recommendations:

1. **Generate a design system** for the project context (see Search section below)
2. Apply typography, color, spacing from the design system
3. Ensure visual hierarchy matches information hierarchy
4. Add polish: transitions, shadows, border-radius, micro-interactions

### Phase 5: Implementation

1. Write semantic HTML first (`<nav>`, `<main>`, `<button>`, `<label>`)
2. Apply styles using the project's framework (Tailwind, CSS modules, etc.)
3. Implement all states: hover, focus, active, disabled, loading, empty, error
4. Ensure responsive behavior at 375/768/1024/1440px
5. Test accessibility: contrast, keyboard nav, screen reader

### Phase 6: Iterate

1. Present the design and explain reasoning for key decisions
2. Ask for feedback on specific aspects — do not dump code without context
3. Refine based on feedback. Never be precious about a design.

## Design Principles Quick Reference

| Principle | Rule | Details |
|-----------|------|---------|
| **Visual Hierarchy** | One primary focal point per screen | Size > Color > Weight > Position > Whitespace > Depth |
| **Spacing** | 8pt grid, consistent scale | Scale: 0,1,2,4,6,8,12,16,20,24,32,40,48,64,80,96 |
| **Typography** | Max 2 families, 3-4 levels | Line height: 1.5-1.75 body, 1.1-1.3 headings. Line length: 45-75 chars |
| **Color** | 60-30-10 rule | 60% neutral, 30% secondary, 10% accent. Minimum 4.5:1 contrast |
| **Dark Mode** | Dark gray, not black | Reduce saturation. Elevate surfaces by lightening, not darkening |
| **Accessibility** | Build in from the start | Semantic HTML, ARIA, keyboard nav, 44x44px touch targets |

For deep-dive on any principle, consult `references/design-principles.md`.

## Data-Driven Search

Use the Python search engine for data-driven design recommendations.

### Generate a Design System (Start Here)

```bash
python3 ~/.claude/skills/ui-ux-designer/scripts/search.py "<product-type> <industry> <keywords>" --design-system [-p "Project Name"]
```

Returns: complete design system with pattern, style, colors, typography, effects, and anti-patterns.

**Persist for reuse across sessions:**
```bash
python3 ~/.claude/skills/ui-ux-designer/scripts/search.py "<query>" --design-system --persist -p "Project Name" [--page "page-name"]
```

### Search Specific Domains

```bash
python3 ~/.claude/skills/ui-ux-designer/scripts/search.py "<keyword>" --domain <domain> [-n <max>]
```

| Domain | Use For | Example |
|--------|---------|---------|
| `style` | UI style recommendations | `"glassmorphism dark"` |
| `color` | Color palettes by product | `"saas fintech"` |
| `typography` | Font pairings | `"elegant luxury"` |
| `chart` | Chart type selection | `"real-time dashboard"` |
| `landing` | Landing page patterns | `"hero social-proof"` |
| `product` | Product type recommendations | `"beauty spa wellness"` |
| `ux` | UX best practices | `"animation accessibility"` |
| `react` | React performance | `"waterfall bundle"` |
| `web` | Web interface guidelines | `"aria focus keyboard"` |

### Stack-Specific Guidelines

```bash
python3 ~/.claude/skills/ui-ux-designer/scripts/search.py "<keyword>" --stack <stack>
```

Stacks: `html-tailwind` (default), `react`, `nextjs`, `vue`, `svelte`, `shadcn`, `react-native`, `flutter`, `swiftui`, `jetpack-compose`, `astro`, `nuxtjs`, `nuxt-ui`

## Common UI Rules

### Icons and Visual Elements
- Use SVG icons (Lucide, Heroicons, Phosphor), never emojis as UI icons
- Consistent icon sizing (24x24 viewBox, w-6 h-6)
- Research official brand logos from Simple Icons

### Interaction
- `cursor-pointer` on all clickable elements
- Hover feedback via color/opacity transitions, not layout-shifting scale
- Smooth transitions: 150-300ms for micro-interactions
- Disable buttons during async operations

### Light/Dark Mode
- Light mode: `bg-white/80` or higher for glass cards, `slate-900` for text, `slate-600` minimum for muted text
- Dark mode: dark gray backgrounds (not pure black), reduce color saturation
- Test both modes before delivery

### Spacing and Layout
- Use consistent `max-w-6xl` or `max-w-7xl` containers
- Account for fixed navbar height in content padding
- Floating navbars: add `top-4 left-4 right-4` spacing

## Pre-Delivery Checklist

### Visual Quality
- [ ] Visual hierarchy clear — primary action obvious
- [ ] Spacing consistent and from the scale
- [ ] Typography follows the type scale
- [ ] No emojis as icons — SVG only
- [ ] Colors meet 4.5:1 contrast minimum

### States and Interaction
- [ ] All interactive elements have hover/focus/active/disabled states
- [ ] Loading states handled (skeleton screens preferred)
- [ ] Empty and error states designed
- [ ] Transitions smooth (150-300ms)

### Accessibility
- [ ] Semantic HTML (`<button>`, `<nav>`, `<label>`, headings in order)
- [ ] ARIA attributes where semantic HTML is insufficient
- [ ] Keyboard navigable, visible focus indicators
- [ ] `prefers-reduced-motion` respected
- [ ] Color not the only indicator of state

### Responsive
- [ ] Works at 375px, 768px, 1024px, 1440px
- [ ] No horizontal scroll on mobile
- [ ] Touch targets minimum 44x44px

### Consistency
- [ ] Matches existing codebase conventions
- [ ] Design system tokens used (not hardcoded values)

## Additional Resources

### Reference Files

For detailed knowledge on specific topics:
- **`references/design-principles.md`** — Gestalt principles, visual hierarchy, spacing, typography, color theory
- **`references/design-process.md`** — Detailed 6-phase workflow with questions and techniques
- **`references/accessibility-guide.md`** — WCAG 2.2, ARIA patterns, keyboard navigation, semantic HTML
- **`references/design-systems-guide.md`** — Design tokens, atomic design, theming, component API patterns
- **`references/design-critique.md`** — 10-point evaluation framework, feedback delivery
- **`references/state-design.md`** — Loading, empty, error, success, interactive state patterns
- **`references/responsive-patterns.md`** — Mobile-first, fluid typography, container queries, layout patterns
- **`references/design-to-code.md`** — Translating visual concepts to semantic HTML + Tailwind
- **`references/ai-design-failures.md`** — 10 common failure modes with symptoms, causes, and fixes

### Example Files

- **`examples/component-patterns.md`** — Common UI component patterns with Tailwind/React code

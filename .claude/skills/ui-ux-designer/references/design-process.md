# Design Process

Detailed 6-phase workflow for designing user interfaces. Follow these phases in order, skipping only when the scope clearly warrants it.

## Phase 1: Understand

**Goal:** Gain full context before writing a single line of code.

### Read the Existing Codebase First

Before designing anything, analyze the project:

1. **Find the design system**: Search for `globals.css`, `tailwind.config`, `theme.ts`, `components/ui/`
2. **Identify patterns**: What colors, spacing, border-radius, and shadows are used?
3. **Check component library**: Is it shadcn/ui, MUI, Chakra, custom components?
4. **Note conventions**: Naming patterns, file structure, import style
5. **Match the existing style**: Consistency with the current product always takes priority

### Clarifying Questions

Ask about these categories, starting with the most important. Avoid asking all at once — follow up as needed.

**Product & Purpose:**
- What is this product/feature?
- What is the primary user goal on this screen?
- What problem does it solve?

**Users:**
- Who are the target users? (Age, technical sophistication, device preference)
- Any accessibility requirements beyond standard WCAG AA?
- Mobile-first or desktop-first audience?

**Constraints:**
- Existing design system or brand guidelines?
- Tech stack (React, Vue, plain HTML)?
- CSS framework (Tailwind, CSS modules, styled-components)?
- Component library (shadcn/ui, MUI, custom)?

**Visual Direction:**
- Emotional tone: Professional? Playful? Luxury? Bold? Minimal?
- Reference sites or designs they like?
- Light mode, dark mode, or both?

**Scope:**
- Single component, page, or multi-page flow?
- Does it need to integrate with existing pages?
- What are the non-negotiable requirements vs nice-to-haves?

### When Context Is Missing

If the user provides minimal context (e.g., "make a dashboard"), make reasonable assumptions and state them explicitly:

"Assuming this is a SaaS analytics dashboard for a professional audience. Using a clean, data-focused style with shadcn/ui components. Let me know if you'd like a different direction."

This is better than asking 10 questions upfront.

## Phase 2: Information Architecture

**Goal:** Organize content and actions before thinking about visuals.

### Content Inventory

List everything that needs to appear on the page:

1. **Data elements**: What information is displayed?
2. **Actions**: What can the user do? (buttons, links, forms)
3. **Navigation**: How does the user move between sections?
4. **Feedback**: Status messages, notifications, indicators

### Prioritization

Classify every element:

| Priority | Treatment | Examples |
|----------|-----------|---------|
| **Primary** | Large, prominent, high contrast | Main CTA, key metric, page title |
| **Secondary** | Medium, visible but not dominant | Navigation, data tables, secondary actions |
| **Tertiary** | Small, subdued, discoverable | Metadata, settings, breadcrumbs |

### Grouping

Apply Gestalt proximity — group related items together:

- Form fields that belong to the same section → same card or fieldset
- Related metrics → same row or stat group
- Primary + secondary actions → same action bar
- Metadata → grouped in a consistent location (top-right, bottom, sidebar)

### User Flow

Map the journey:
- **Entry**: Where does the user come from? (navigation, notification, link)
- **Primary path**: What is the most common action sequence?
- **Secondary paths**: What alternative flows exist?
- **Exit**: Where does the user go next after completing the primary task?

Ensure each step clearly leads to the next. Remove friction from the primary path.

## Phase 3: Structure

**Goal:** Define the layout skeleton before applying visual design.

### Layout Regions

Identify the major structural areas:

```
┌─────────────────────────────────────────┐
│ Header (logo, nav, user menu)           │
├────────────┬────────────────────────────┤
│ Sidebar    │ Main Content               │
│ (nav,      │ ┌─ Page Header ──────────┐ │
│  filters)  │ │ Title + Actions        │ │
│            │ ├─ Content Area ─────────┤ │
│            │ │ Primary content        │ │
│            │ │ (cards, tables, forms) │ │
│            │ ├─ Secondary Content ────┤ │
│            │ │ Supporting info        │ │
│            │ └────────────────────────┘ │
├────────────┴────────────────────────────┤
│ Footer (optional)                       │
└─────────────────────────────────────────┘
```

Not every page needs all regions. A landing page may only need header + main + footer. A dashboard may need header + sidebar + main.

### Grid System

- Use 12-column grid for complex layouts
- Common column splits: 12 (full), 6+6 (half), 4+8 (sidebar+main), 4+4+4 (thirds), 3+3+3+3 (quarters)
- Max-width container: 1200-1440px, centered
- Side padding: 16px mobile, 24px tablet, 32px desktop

### CTA Placement

Place the primary CTA where the user's eye naturally lands:

- **Forms**: Bottom-right of the form (submit button)
- **Cards**: Bottom-right or full-width at bottom
- **Landing pages**: Above the fold, after the value proposition
- **Modals**: Bottom-right of the footer (confirm action)
- **Empty states**: Center, below the explanatory message

### Responsive Reflow Planning

Plan how the layout transforms across breakpoints:

| Region | Desktop | Tablet | Mobile |
|--------|---------|--------|--------|
| Sidebar | Visible, fixed | Collapsible drawer | Hidden, hamburger menu |
| Grid cards | 3-4 columns | 2 columns | 1 column (stacked) |
| Data table | Full table | Scrollable table | Card layout per row |
| Form actions | Inline (Cancel + Submit) | Inline | Stacked (full-width buttons) |
| Stats grid | 4 across | 2x2 | Stacked |

## Phase 4: Visual Design

**Goal:** Apply typography, color, spacing, and polish.

### Step 1: Generate Design System

Use the search tool to get data-driven recommendations:

```bash
python3 ~/.claude/skills/ui-ux-designer/scripts/search.py "<product> <industry> <keywords>" --design-system
```

This returns a complete system: style, colors, fonts, effects, anti-patterns.

### Step 2: Apply Typography

1. Set the font family (from design system or existing codebase)
2. Apply the type scale: H1 → H2 → H3 → body → small
3. Set line heights: 1.5-1.75 for body, 1.1-1.3 for headings
4. Constrain line length: max-width on text containers

### Step 3: Apply Color

1. Set backgrounds following 60-30-10 rule
2. Apply semantic colors: primary for CTAs, destructive for errors
3. Set text colors: near-black for headings, muted for secondary text
4. Verify contrast ratios for all text

### Step 4: Apply Spacing

1. Set container padding from the spacing scale
2. Set gaps between sections (larger gaps = separate groups)
3. Set internal component padding (consistent per component type)
4. Verify 8pt grid alignment

### Step 5: Validate Hierarchy

Check: When someone looks at this screen for the first time, do their eyes go to the right place?

1. Squint at the design. What stands out?
2. Is the primary action the most prominent element?
3. Are secondary elements clearly less prominent?
4. Is the reading order logical?

### Step 6: Add Polish

Apply finishing touches:

- Border-radius: consistent across all components
- Shadows: subtle for cards (shadow-sm), stronger for elevated elements (shadow-md)
- Transitions: 150-300ms for hover states
- Micro-interactions: subtle hover feedback on interactive elements

## Phase 5: Implementation

**Goal:** Translate the visual design into working, accessible code.

### Implementation Order

1. **Semantic HTML structure** — Get the elements right first
2. **Layout (Grid/Flexbox)** — Position and flow
3. **Spacing (padding, gap, margin)** — Breathing room
4. **Typography (font, size, weight, color)** — Text treatment
5. **Color and backgrounds** — Visual identity
6. **Borders, shadows, radius** — Depth and containment
7. **Responsive behavior** — Breakpoint adjustments
8. **Interactive states** — Hover, focus, active, disabled
9. **Transitions and animations** — Motion polish
10. **Accessibility** — ARIA, keyboard, contrast verification

### Testing Checkpoints

After implementation, verify:

- [ ] Test at 375px, 768px, 1024px, 1440px
- [ ] Tab through the entire page — logical order, visible focus
- [ ] Check contrast for all text (including muted/placeholder)
- [ ] Verify all buttons have hover/focus/active/disabled states
- [ ] Check loading, empty, and error states
- [ ] Verify dark mode if applicable

## Phase 6: Iterate

**Goal:** Present, gather feedback, and refine.

### Presenting Work

1. **Explain the approach**: "I used a bento grid layout because..." or "The color palette leans warm to match the brand..."
2. **Highlight key decisions**: Point out the choices that were non-obvious
3. **Show the hierarchy**: "The primary CTA is the blue button at bottom-right. Secondary actions are outline buttons."

### Asking for Feedback

Ask specific questions, not "what do you think?":

- "Does the card layout work for this data, or would a table view be better?"
- "The primary color is blue — would you prefer something warmer?"
- "The sidebar is hidden on mobile via hamburger menu — is bottom tab navigation preferred?"
- "The spacing is relatively tight for a dashboard feel — want more breathing room?"

### Refinement Process

1. Acknowledge the feedback
2. Identify which phase the feedback relates to (structure, visual, implementation)
3. Make targeted changes without disrupting what works
4. Re-present the changed area specifically, not the entire design
5. Never be defensive about a design — willingness to iterate builds trust
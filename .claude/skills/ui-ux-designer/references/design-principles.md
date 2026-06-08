# Design Principles

Foundational visual design knowledge: Gestalt perception, visual hierarchy, spacing, typography, color theory, and accessibility foundations.

## 1. Gestalt Principles

These principles describe how the human brain perceives visual groups. Apply them deliberately in every layout.

### Proximity

Elements close together are perceived as related. This is the single most powerful organizing tool in UI.

- Group form fields that belong together
- Group navigation items within a nav region
- Group card content (title, description, meta) with tighter internal spacing
- Use more space BETWEEN groups than WITHIN groups

```
✅ [Label] [Input]     ← 8px gap (tight = related)
   [Help text]
                        ← 24px gap (wide = separate group)
   [Label] [Input]
   [Help text]
```

### Similarity

Elements that look alike (same color, shape, size, typography) are perceived as related.

- Apply consistent button styles for same-level actions
- Use the same badge style for all status indicators
- Keep all navigation items at the same font size and weight
- Use color consistently to group related elements

### Continuity

The eye follows lines, curves, and sequences. Align elements along invisible grid lines.

- Align form labels and inputs to the same left edge
- Align card content to a consistent internal grid
- Use the page grid to create strong alignment rails
- Break alignment intentionally and rarely — it draws powerful attention

### Closure

The brain completes incomplete shapes. Enables minimalist icons, logos, and decorative elements without drawing every line.

### Figure/Ground

Users distinguish foreground from background. Modals, cards, dropdowns, and elevated surfaces all rely on this principle.

- Use shadows to elevate foreground elements
- Use overlays (bg-black/50) to push background content back
- Cards need visible boundaries: border, shadow, or background color change
- Layered UIs: base → card → popover → modal → toast (each level more elevated)

### Common Region

Elements within a visible boundary (card, box, background color section) are perceived as a group.

- Use cards to group related data
- Use background color shifts to define page sections
- Use dividers sparingly — boundaries are often sufficient
- Borders and background colors are both effective region markers

## 2. Visual Hierarchy

The most critical skill in UI design. Hierarchy determines what users see first, second, third.

### Hierarchy Tools (In Order of Power)

| Rank | Tool | Effect | Example |
|------|------|--------|---------|
| 1 | **Size** | Larger elements dominate | H1 (48px) > H2 (30px) > body (16px) |
| 2 | **Color/Contrast** | High contrast draws the eye | Primary CTA = highest contrast on screen |
| 3 | **Weight** | Bold draws attention before regular | Font-bold for headings, font-normal for body |
| 4 | **Position** | Top-left scanned first (LTR) | F-pattern for text-heavy, Z-pattern for sparse |
| 5 | **Whitespace** | Isolated elements feel more important | Hero headline with 64px+ padding |
| 6 | **Depth** | Elevated elements feel closer | Shadow on floating CTA, overlay on modal |

### The One Primary Action Rule

Every screen has exactly ONE primary action. Everything else is secondary or tertiary.

- If everything is bold, nothing is bold
- If there are 3 "primary" buttons on a page, none is primary
- Secondary actions: outline or ghost variant buttons
- Tertiary actions: text links or icon-only buttons

### Scanning Patterns

**F-Pattern** (text-heavy pages):
1. Horizontal scan across the top
2. Move down, shorter horizontal scan
3. Vertical scan down the left side

**Z-Pattern** (sparse pages, landing pages):
1. Top-left to top-right
2. Diagonal to bottom-left
3. Bottom-left to bottom-right (CTA placement)

Place the most important content along these natural scan paths.

## 3. Spacing and Layout

### The 8-Point Grid

Nearly all modern design systems use 8px as the base unit. All heights, widths, padding, and margins snap to multiples of 4 or 8.

**Spacing Scale:**

| Token | Value | Use For |
|-------|-------|---------|
| 0 | 0px | Reset |
| 1 | 4px | Tight inline gaps (icon + text) |
| 2 | 8px | Between related elements |
| 3 | 12px | Form field internal padding |
| 4 | 16px | Standard component padding |
| 6 | 24px | Between sections within a card |
| 8 | 32px | Between cards |
| 12 | 48px | Between page sections |
| 16 | 64px | Major section breaks |
| 20 | 80px | Hero section padding |
| 24 | 96px | Maximum section spacing |

**Never use arbitrary values** like 13px, 7px, or 23px. If the design calls for 13px, round to 12px or 16px.

### Internal Padding vs External Margin

- **Internal padding**: Space inside a component (card padding, button padding). Consistent per component.
- **External margin/gap**: Space between sibling components. Use gap (Flexbox/Grid) rather than margin for consistency.

### Content Density

| Context | Spacing | Gap | Padding |
|---------|---------|-----|---------|
| Dashboard/table | Dense | 8-12px | 12-16px |
| Form | Standard | 16-20px | 16-24px |
| Article/blog | Comfortable | 20-24px | 24-32px |
| Landing/marketing | Spacious | 32-64px | 48-96px |

### Layout Patterns

- **CSS Grid**: 2D layouts (page grids, card grids, dashboard layouts)
- **Flexbox**: 1D alignment (navbars, inline groups, stacking)
- **Max-width containers**: 1200-1440px centered, with 16-24px side padding
- **Content max-width**: Text blocks at max 65-75ch for readability

## 4. Typography

### Type Scale

Use a mathematical ratio to derive all font sizes. The 1.25 (major third) ratio produces:

| Level | Size | Line Height | Use |
|-------|------|-------------|-----|
| xs | 12px | 1.5 (18px) | Captions, fine print |
| sm | 14px | 1.5 (21px) | Secondary text, metadata |
| base | 16px | 1.5-1.75 (24-28px) | Body text |
| lg | 20px | 1.4 (28px) | Lead text, intro paragraphs |
| xl | 24px | 1.3 (31px) | H4, card headings |
| 2xl | 30px | 1.2 (36px) | H3, section headings |
| 3xl | 36px | 1.2 (43px) | H2, page headings |
| 4xl | 48px | 1.1 (53px) | H1, hero headings |
| 5xl | 60px | 1.1 (66px) | Display text |
| 6xl | 72px | 1.0 (72px) | Large display |

### Line Height Rules

- **Body text** (14-18px): 1.5 to 1.75 line height. Generous leading improves readability.
- **Headings** (24px+): 1.1 to 1.3. Tighter leading for larger text.
- **Display text** (48px+): 1.0 to 1.1. Tightest leading for maximum impact.

### Line Length

Optimal line length: **45-75 characters per line**. 66 characters is ideal.

```css
/* Apply max-width to text containers */
.prose { max-width: 65ch; }
```

On wide screens without max-width, text becomes unreadable. Always constrain.

### Font Pairing Principles

- Maximum 2 font families (one for headings, one for body)
- Combine contrast: serif heading + sans-serif body, or different weights of the same family
- A single excellent sans-serif handles most UI needs: Inter, Geist, Plus Jakarta Sans, DM Sans
- Load only the weights used: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Font Weight Usage

| Weight | Name | Use For |
|--------|------|---------|
| 400 | Regular | Body text, descriptions |
| 500 | Medium | Labels, navigation, metadata |
| 600 | Semibold | Subheadings, button text |
| 700 | Bold | Headings, emphasis |

Avoid using more than 3 weights. More weights = more visual noise.

## 5. Color Theory

### The 60-30-10 Rule

- **60%** — Neutral/background (white, light gray, dark gray in dark mode)
- **30%** — Secondary color (cards, sections, borders)
- **10%** — Accent/primary (CTAs, links, active states)

This ratio creates visual balance. Violating it (too much accent color) creates chaos.

### HSL for UI Work

Think in Hue/Saturation/Lightness. Create cohesive palettes by varying one axis:

- **Same hue, varying lightness** → shade scale for a single color (primary-50 through primary-950)
- **Same saturation + lightness, varying hue** → harmonious multi-color palette
- **Reducing saturation** → muted, sophisticated tones

### Semantic Color System

Every design system needs these semantic colors, each with a full shade scale (50-950):

| Token | Purpose | Example Hue |
|-------|---------|-------------|
| `primary` | Brand, CTAs, links | Blue (221°) |
| `secondary` | Supporting actions | Gray-blue |
| `destructive` | Errors, delete actions | Red (0°) |
| `warning` | Caution states | Amber (38°) |
| `success` | Confirmations, positive | Green (142°) |
| `info` | Informational states | Blue (199°) |
| `muted` | Subdued backgrounds | Neutral gray |

### Dark Mode Rules

Do NOT simply invert colors. Follow these rules:

1. **Backgrounds**: Dark gray (hsl 222 84% 5%), NOT pure black (#000)
2. **Surface elevation**: Lighter backgrounds for elevated elements (cards slightly lighter than page bg)
3. **Saturation**: Reduce color saturation by 10-20% in dark mode
4. **Text**: Near-white (slate-50 or slate-100), not pure white (#fff)
5. **Borders**: Gray-700 or gray-800 (visible but not harsh)
6. **Shadows**: Less effective in dark mode — use border or background lightening instead

### Contrast Requirements

| Level | Ratio | Applies To |
|-------|-------|------------|
| AA normal | 4.5:1 | Body text, labels, all text <18px |
| AA large | 3:1 | Headings ≥18px bold or ≥24px regular |
| AA UI | 3:1 | Borders, icons, form controls |
| AAA normal | 7:1 | Enhanced contrast (optional, best practice) |

Always verify. Common failures: placeholder text, muted/subtle text, light borders on white.

## 6. Accessibility Foundations

These are the non-negotiable minimums. For comprehensive patterns, consult `references/accessibility-guide.md`.

### Color

- Never use color as the sole indicator of state. Add icons, text, or patterns alongside.
- Error states: red border + error icon + error text (not just red border)
- Status badges: color + text label (not just colored dot)

### Touch Targets

- Minimum 44x44px (WCAG) or 48x48px (Material Design)
- Apply to all interactive elements: buttons, links, checkboxes, toggles
- Add padding to small text links to meet the target size

### Keyboard

- All interactive elements reachable via Tab
- Logical tab order matching visual layout
- Visible focus indicators (focus-visible ring)
- Escape key closes overlays

### Motion

- Respect `prefers-reduced-motion` media query
- Provide controls for auto-playing content
- Avoid flashing content (>3 flashes per second)

## Quick Reference Table

| Principle | Key Number | Remember |
|-----------|-----------|----------|
| Spacing base | 8px | Everything multiples of 4 or 8 |
| Body line height | 1.5-1.75 | Generous for readability |
| Line length | 45-75 chars | 66 ideal, use max-width |
| Color ratio | 60-30-10 | Neutral-secondary-accent |
| Contrast minimum | 4.5:1 | For all normal text |
| Touch target | 44x44px | Minimum interactive area |
| Font families | ≤2 | One heading, one body |
| Font weights | ≤3 | 400, 500/600, 700 |
| Primary actions | 1 per screen | If everything is bold, nothing is |
| Container max | 1200-1440px | Centered with side padding |
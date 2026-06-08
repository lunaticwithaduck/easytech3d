# CSS Patterns

Layout recipes, modern CSS features, and Tailwind equivalents.

## CSS Grid Recipes

### 12-Column Grid

```css
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
}
.col-span-4 { grid-column: span 4; }
.col-span-8 { grid-column: span 8; }
```

Tailwind: `grid grid-cols-12 gap-6` with `col-span-4`, `col-span-8`.

### Auto-Fit Card Grid

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}
```

Tailwind: `grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6`

### Sidebar + Main

```css
.layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100dvh;
}
@media (max-width: 768px) {
  .layout { grid-template-columns: 1fr; }
}
```

Tailwind: `grid grid-cols-1 md:grid-cols-[280px_1fr] min-h-dvh`

### Holy Grail Layout

```css
.holy-grail {
  display: grid;
  grid-template: "header header header" auto
                 "nav    main   aside" 1fr
                 "footer footer footer" auto
                 / 200px 1fr 200px;
  min-height: 100dvh;
}
```

## Flexbox Patterns

### Navbar

```css
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  height: 4rem;
}
```

Tailwind: `flex items-center justify-between px-6 h-16`

### Centered Content

```css
.centered {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
}
```

Tailwind: `flex items-center justify-center min-h-dvh`

### Sticky Footer

```css
body {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}
main { flex: 1; }
```

Tailwind: `flex flex-col min-h-dvh` on body, `flex-1` on main.

## Container Queries

### CSS Native

```css
.card-container { container-type: inline-size; }

@container (min-width: 400px) {
  .card { flex-direction: row; }
}
@container (min-width: 600px) {
  .card { grid-template-columns: 200px 1fr; }
}
```

### Tailwind v3.4+

```html
<div class="@container">
  <div class="flex flex-col @md:flex-row @lg:grid @lg:grid-cols-[200px_1fr]">
    ...
  </div>
</div>
```

## CSS @layer

```css
@layer base, components, utilities;

@layer base {
  h1 { font-size: 2.5rem; font-weight: 700; }
}
@layer components {
  .btn { padding: 0.5rem 1rem; border-radius: 0.5rem; }
}
@layer utilities {
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; }
}
```

Lower layers have lower specificity. Utilities always win.

## :has() Selector

```css
/* Style parent when child has specific state */
.form-group:has(input:invalid) { border-color: var(--destructive); }
.form-group:has(input:focus) { border-color: var(--ring); }

/* Card with image gets different layout */
.card:has(img) { grid-template-rows: 200px 1fr; }

/* Disable submit when form is invalid */
form:has(:invalid) button[type="submit"] { opacity: 0.5; pointer-events: none; }
```

## CSS Nesting

```css
.card {
  border: 1px solid var(--border);
  border-radius: 0.75rem;

  & .title {
    font-size: 1.25rem;
    font-weight: 600;
  }

  &:hover {
    box-shadow: var(--shadow-md);
  }

  @media (width >= 768px) {
    padding: 2rem;
  }
}
```

## Fluid Typography

### Formula

```css
/* clamp(minimum, preferred, maximum) */
h1 { font-size: clamp(2rem, 1rem + 3vw, 3.5rem); }
h2 { font-size: clamp(1.5rem, 0.75rem + 2vw, 2.5rem); }
body { font-size: clamp(1rem, 0.875rem + 0.5vw, 1.125rem); }
```

### Scale

| Level | Clamp | Min (375px) | Max (1440px) |
|-------|-------|-------------|--------------|
| Display | `clamp(2.5rem, 1.5rem + 3.5vw, 4.5rem)` | 40px | 72px |
| H1 | `clamp(2rem, 1rem + 3vw, 3.5rem)` | 32px | 56px |
| H2 | `clamp(1.5rem, 0.75rem + 2vw, 2.5rem)` | 24px | 40px |
| H3 | `clamp(1.25rem, 0.75rem + 1.5vw, 2rem)` | 20px | 32px |
| Body | `clamp(1rem, 0.875rem + 0.5vw, 1.125rem)` | 16px | 18px |

## Aspect Ratio

```css
.video { aspect-ratio: 16 / 9; }
.square { aspect-ratio: 1; }
.card-image { aspect-ratio: 3 / 2; }
```

Tailwind: `aspect-video`, `aspect-square`, `aspect-[3/2]`

## Scroll Snap

```css
.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 1rem;
}
.carousel > * {
  scroll-snap-align: start;
  flex-shrink: 0;
  width: 300px;
}
```

Tailwind: `flex overflow-x-auto snap-x snap-mandatory gap-4` with children `snap-start shrink-0 w-[300px]`
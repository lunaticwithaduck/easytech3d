# Responsive Design Patterns

Reference for building responsive interfaces — mobile-first approach, breakpoints, fluid typography, and layout patterns.

## Mobile-First Approach

Design for the smallest screen first, then enhance for larger screens. This forces prioritization — if content does not fit on 375px, it may not be essential.

### Why Mobile-First

1. **Forces prioritization**: Limited space means only essential content survives
2. **Progressive enhancement**: Start simple, add complexity for larger screens
3. **Performance**: Mobile users get only the CSS they need
4. **Natural fit with Tailwind**: Unprefixed utilities apply to all sizes, prefixed utilities add enhancements

```html
<!-- Mobile-first: single column by default, grid at medium+ -->
<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
  <!-- Cards stack on mobile, 2-col on tablet, 3-col on desktop -->
</div>
```

## Breakpoints

### Tailwind Default Breakpoints

| Prefix | Min-width | Typical Device |
|--------|-----------|----------------|
| (none) | 0px | Mobile (default) |
| `sm` | 640px | Large phone / small tablet |
| `md` | 768px | Tablet |
| `lg` | 1024px | Small desktop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large desktop |

### Testing Breakpoints

Always test at these specific widths:
- **375px** — iPhone SE / small phones
- **390px** — iPhone 14 / modern phones
- **768px** — iPad / tablets
- **1024px** — Small laptops
- **1440px** — Standard desktops
- **1920px** — Large monitors

### Design for Content, Not Devices

Breakpoints should respond to content needs, not specific devices. If a layout breaks at 850px, add a breakpoint at 850px — do not force it into the 768px or 1024px standard breakpoints.

## Fluid Typography

### The clamp() Function

Use `clamp(min, preferred, max)` for font sizes that scale smoothly between breakpoints:

```css
/* Heading: 24px on mobile, scales up to 48px on desktop */
font-size: clamp(1.5rem, 1rem + 2vw, 3rem);

/* Body: 16px minimum, scales to 18px */
font-size: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);

/* Large display: 36px to 72px */
font-size: clamp(2.25rem, 1.5rem + 3.5vw, 4.5rem);
```

### Fluid Typography Scale

| Element | Mobile (375px) | Desktop (1440px) | clamp() |
|---------|---------------|-------------------|---------|
| Display | 36px | 72px | `clamp(2.25rem, 1rem + 4vw, 4.5rem)` |
| H1 | 30px | 48px | `clamp(1.875rem, 1.25rem + 2vw, 3rem)` |
| H2 | 24px | 36px | `clamp(1.5rem, 1.1rem + 1.5vw, 2.25rem)` |
| H3 | 20px | 24px | `clamp(1.25rem, 1.1rem + 0.5vw, 1.5rem)` |
| Body | 16px | 18px | `clamp(1rem, 0.95rem + 0.25vw, 1.125rem)` |
| Small | 14px | 14px | `0.875rem` (fixed) |

### In Tailwind

Apply fluid typography via arbitrary values:

```html
<h1 class="text-[clamp(1.875rem,1.25rem+2vw,3rem)] font-bold leading-tight">
  Heading
</h1>
```

Or define in the Tailwind config:

```js
fontSize: {
  'fluid-display': 'clamp(2.25rem, 1rem + 4vw, 4.5rem)',
  'fluid-h1': 'clamp(1.875rem, 1.25rem + 2vw, 3rem)',
  'fluid-h2': 'clamp(1.5rem, 1.1rem + 1.5vw, 2.25rem)',
}
```

## Container Queries

Container queries allow components to respond to their container size, not the viewport. More composable than media queries.

```css
/* Define a containment context */
.card-container {
  container-type: inline-size;
  container-name: card;
}

/* Style based on container width */
@container card (min-width: 400px) {
  .card-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
```

### In Tailwind (v3.4+)

```html
<div class="@container">
  <div class="flex flex-col @md:flex-row @md:items-center gap-4">
    <!-- Stacks on narrow containers, rows on wider ones -->
  </div>
</div>
```

Use container queries for:
- Sidebar components that may be in narrow or wide containers
- Card components used in different grid layouts
- Reusable widgets that appear in varying contexts

## Responsive Images

### srcset for Resolution Switching

```html
<img
  src="image-800.jpg"
  srcset="image-400.jpg 400w, image-800.jpg 800w, image-1200.jpg 1200w"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt="Description"
  loading="lazy"
  decoding="async"
/>
```

### picture Element for Art Direction

```html
<picture>
  <source media="(min-width: 1024px)" srcset="hero-desktop.webp" />
  <source media="(min-width: 640px)" srcset="hero-tablet.webp" />
  <img src="hero-mobile.webp" alt="Hero image" class="w-full" />
</picture>
```

### Aspect Ratio Preservation

Prevent layout shift by reserving space:

```html
<div class="aspect-video overflow-hidden rounded-lg">
  <img src="..." alt="..." class="h-full w-full object-cover" loading="lazy" />
</div>
```

Common ratios: `aspect-video` (16:9), `aspect-square` (1:1), `aspect-[4/3]`, `aspect-[3/2]`

## Common Layout Patterns

### Responsive Grid

```html
<!-- Auto-fit: cards expand to fill space -->
<div class="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
  <!-- Cards -->
</div>

<!-- Fixed columns: explicit breakpoints -->
<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  <!-- Cards -->
</div>
```

### Sidebar Layout

```html
<div class="flex min-h-screen">
  <!-- Sidebar: hidden on mobile, visible on desktop -->
  <aside class="hidden w-64 shrink-0 border-r lg:block">
    <!-- Nav items -->
  </aside>
  <!-- Main content: full width on mobile -->
  <main class="flex-1 overflow-auto p-6">
    <!-- Content -->
  </main>
</div>
```

### Stack → Row Pattern

```html
<!-- Stack on mobile, row on tablet+ -->
<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h2 class="text-lg font-semibold">Title</h2>
    <p class="text-sm text-muted-foreground">Description</p>
  </div>
  <div class="flex gap-2">
    <button class="rounded-lg border px-3 py-2 text-sm">Cancel</button>
    <button class="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">Save</button>
  </div>
</div>
```

### Responsive Table

On narrow screens, transform tables into card layouts:

```html
<!-- Table on desktop, cards on mobile -->
<div class="hidden md:block">
  <table><!-- Full table --></table>
</div>
<div class="space-y-4 md:hidden">
  <!-- Card for each row -->
  <div class="rounded-lg border p-4">
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium">Name</span>
      <span class="text-sm text-muted-foreground">Value</span>
    </div>
  </div>
</div>
```

## Navigation Patterns

### Mobile Navigation

| Pattern | Best For | Implementation |
|---------|----------|----------------|
| **Hamburger menu** | Complex navigation (5+ items) | Sheet/drawer from left |
| **Bottom tab bar** | Primary navigation (3-5 items) | Fixed bottom bar |
| **Collapsible header** | Content-focused pages | Hide on scroll down, show on scroll up |

### Responsive Navbar

```html
<header class="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
  <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
    <a href="/" class="text-lg font-bold">Logo</a>
    <!-- Desktop nav -->
    <nav class="hidden items-center gap-6 md:flex">
      <a href="#" class="text-sm font-medium">Features</a>
      <a href="#" class="text-sm font-medium">Pricing</a>
      <button class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
        Get Started
      </button>
    </nav>
    <!-- Mobile menu button -->
    <button class="md:hidden" aria-label="Toggle menu">
      <svg class="h-6 w-6"><!-- menu icon --></svg>
    </button>
  </div>
</header>
```
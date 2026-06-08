# Design-to-Code Translation

Reference for translating visual design concepts into semantic HTML, Tailwind CSS, and React components.

## The Mental Model

Design-to-code translation follows this sequence:

```
Visual concept → Component structure → Semantic HTML → Styling → Interactivity → Accessibility
```

Never skip steps. Starting with styling before HTML structure leads to fragile, inaccessible code.

## Step 1: Component Structure

Break the visual design into components using these questions:

1. **What repeats?** Repeated patterns become shared components (cards, list items, buttons)
2. **What is independent?** Self-contained UI regions become their own components
3. **What changes state?** Stateful areas need component boundaries for state management
4. **What is the nesting hierarchy?** Parent-child relationships define component composition

### Component Decomposition Example

A dashboard page might decompose into:

```
DashboardPage
├── Header
│   ├── Logo
│   ├── NavLinks
│   └── UserMenu (Avatar + Dropdown)
├── Sidebar
│   ├── NavItem (repeated)
│   └── SidebarFooter
└── MainContent
    ├── PageHeader (Title + Actions)
    ├── StatsGrid
    │   └── StatCard (repeated)
    ├── DataTable
    │   ├── TableHeader
    │   ├── TableRow (repeated)
    │   └── Pagination
    └── ActivityFeed
        └── ActivityItem (repeated)
```

## Step 2: Semantic HTML

Choose HTML elements based on meaning, not appearance:

| Purpose | Element | NOT |
|---------|---------|-----|
| Navigation | `<nav>` | `<div class="nav">` |
| Main content | `<main>` | `<div class="main">` |
| Page heading | `<h1>` through `<h6>` | `<div class="title">` |
| Clickable action | `<button>` | `<div onClick>` |
| Link to another page | `<a href>` | `<button onClick={navigate}>` |
| Form input label | `<label for="id">` | `<span>Label</span>` |
| List of items | `<ul>` / `<ol>` + `<li>` | `<div>` + `<div>` |
| Tabular data | `<table>` + `<thead>` + `<th>` | Div grid pretending to be table |
| Sidebar | `<aside>` | `<div class="sidebar">` |
| Section with heading | `<section aria-labelledby>` | `<div>` |
| Time/date | `<time datetime>` | `<span>` |

### Heading Hierarchy

Maintain strict heading order. Never skip levels:

```html
<h1>Dashboard</h1>           <!-- Page title (one per page) -->
  <h2>Revenue Overview</h2>  <!-- Section -->
    <h3>Monthly Trend</h3>   <!-- Subsection -->
  <h2>Recent Activity</h2>   <!-- Section -->
    <h3>Today</h3>           <!-- Subsection -->
    <h3>Yesterday</h3>       <!-- Subsection -->
```

## Step 3: CSS Architecture with Tailwind

### Class Ordering Convention

Order Tailwind classes by category for readability:

```html
<button class="
  inline-flex items-center justify-center gap-2    /* 1. Layout */
  h-10 px-4 py-2                                   /* 2. Sizing/Spacing */
  rounded-lg                                        /* 3. Shape */
  bg-primary text-primary-foreground                /* 4. Colors */
  text-sm font-medium                               /* 5. Typography */
  shadow-sm                                         /* 6. Effects */
  ring-offset-background                            /* 7. Focus setup */
  transition-colors duration-200                    /* 8. Transitions */
  hover:bg-primary/90                               /* 9. Hover state */
  focus-visible:outline-none                        /* 10. Focus state */
  focus-visible:ring-2 focus-visible:ring-ring
  focus-visible:ring-offset-2
  active:scale-[0.98]                               /* 11. Active state */
  disabled:pointer-events-none disabled:opacity-50  /* 12. Disabled state */
">
  Save Changes
</button>
```

### The cn() Utility

Use `cn()` (clsx + tailwind-merge) for conditional class composition:

```tsx
import { cn } from '@/lib/utils'

function Button({ variant = 'default', size = 'md', className, ...props }) {
  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        // Variants
        variant === 'default' && 'bg-primary text-primary-foreground hover:bg-primary/90',
        variant === 'outline' && 'border bg-background hover:bg-accent',
        variant === 'ghost' && 'hover:bg-accent hover:text-accent-foreground',
        variant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        // Sizes
        size === 'sm' && 'h-9 px-3 text-sm',
        size === 'md' && 'h-10 px-4 text-sm',
        size === 'lg' && 'h-11 px-6 text-base',
        // Custom overrides
        className
      )}
      {...props}
    />
  )
}
```

### Class Variance Authority (CVA)

For complex variant systems, use CVA:

```tsx
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border bg-background hover:bg-accent',
        ghost: 'hover:bg-accent',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)
```

## Step 4: Interactivity

### Hover States

Apply hover styles that provide clear feedback without layout shift:

```html
<!-- Color change (preferred) -->
<button class="bg-primary hover:bg-primary/90 transition-colors">

<!-- Shadow lift -->
<div class="shadow-sm hover:shadow-md transition-shadow">

<!-- Border highlight -->
<div class="border border-transparent hover:border-primary/20 transition-colors">

<!-- AVOID: Scale that shifts layout -->
<div class="hover:scale-105"> <!-- Shifts siblings -->
```

### Focus States

Use `focus-visible` instead of `focus` to show rings only for keyboard navigation:

```html
<button class="
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-ring
  focus-visible:ring-offset-2
  focus-visible:ring-offset-background
">
```

### Transitions

```html
<!-- Color transitions (most common) -->
<button class="transition-colors duration-200">

<!-- Multiple properties -->
<div class="transition-[color,background-color,box-shadow] duration-200">

<!-- Respect reduced motion -->
<div class="transition-all duration-200 motion-reduce:transition-none">
```

## Step 5: Accessibility Integration

### After Building, Verify

1. **Tab through the page**: Does focus order make sense? Can every interactive element be reached?
2. **Screen reader test**: Do elements announce correctly? Are dynamic updates communicated?
3. **Keyboard shortcuts**: Can modals be closed with Escape? Can dropdowns be navigated with arrows?
4. **Contrast check**: Run all text through a contrast checker
5. **Zoom to 200%**: Does the layout still work at 200% zoom?

### Common ARIA Additions

```html
<!-- Icon-only button -->
<button aria-label="Close dialog">
  <svg><!-- X icon --></svg>
</button>

<!-- Dynamic region -->
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

<!-- Expandable section -->
<button aria-expanded={isOpen} aria-controls="content-id">
  Toggle Section
</button>
<div id="content-id" hidden={!isOpen}>
  Content
</div>

<!-- Decorative image -->
<img src="decoration.svg" alt="" aria-hidden="true" />

<!-- Required form field -->
<input required aria-required="true" aria-describedby="help-text error-msg" />
```

## Common Translation Patterns

### Card Component

Visual: rounded container with image, title, description, action button.

```tsx
<article class="overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
  <div class="aspect-video overflow-hidden">
    <img src={image} alt={title} class="h-full w-full object-cover" loading="lazy" />
  </div>
  <div class="p-6">
    <h3 class="text-lg font-semibold leading-tight">{title}</h3>
    <p class="mt-2 line-clamp-2 text-sm text-muted-foreground">{description}</p>
    <div class="mt-4 flex items-center justify-between">
      <span class="text-sm text-muted-foreground">{meta}</span>
      <Button variant="outline" size="sm">View</Button>
    </div>
  </div>
</article>
```

### Form Field

Visual: label above input, optional help text, error state.

```tsx
<div class="space-y-2">
  <Label htmlFor="field-id">Field Label</Label>
  <Input
    id="field-id"
    placeholder="Enter value..."
    aria-describedby="field-help field-error"
    aria-invalid={!!error}
    className={cn(error && 'border-destructive')}
  />
  {helpText && (
    <p id="field-help" class="text-sm text-muted-foreground">{helpText}</p>
  )}
  {error && (
    <p id="field-error" class="text-sm text-destructive" role="alert">{error}</p>
  )}
</div>
```

### Stats Card

Visual: icon, label, big number, trend indicator.

```tsx
<div class="rounded-xl border bg-card p-6">
  <div class="flex items-center gap-2">
    <div class="rounded-lg bg-primary/10 p-2">
      <Icon class="h-4 w-4 text-primary" />
    </div>
    <span class="text-sm font-medium text-muted-foreground">{label}</span>
  </div>
  <div class="mt-3">
    <span class="text-3xl font-bold tracking-tight">{value}</span>
    <span class={cn(
      "ml-2 text-sm font-medium",
      trend > 0 ? "text-emerald-600" : "text-red-600"
    )}>
      {trend > 0 ? '+' : ''}{trend}%
    </span>
  </div>
</div>
```
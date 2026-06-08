# Design Systems Guide

Reference for building and maintaining design systems — tokens, components, theming, and architecture.

## Design Tokens

Design tokens are the atomic values of a design system: colors, spacing, typography, shadows, border-radius, and other visual properties stored as variables.

### CSS Custom Properties

```css
:root {
  /* Colors - Semantic tokens */
  --color-background: hsl(0 0% 100%);
  --color-foreground: hsl(222 47% 11%);
  --color-primary: hsl(221 83% 53%);
  --color-primary-foreground: hsl(0 0% 100%);
  --color-secondary: hsl(210 40% 96%);
  --color-secondary-foreground: hsl(222 47% 11%);
  --color-destructive: hsl(0 84% 60%);
  --color-muted: hsl(210 40% 96%);
  --color-muted-foreground: hsl(215 16% 47%);
  --color-border: hsl(214 32% 91%);
  --color-ring: hsl(221 83% 53%);

  /* Spacing */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */

  /* Typography */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Border Radius */
  --radius-sm: 0.375rem;  /* 6px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

### Tailwind Theme Configuration

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
}
```

### Token Naming Conventions

Use **semantic tokens** that describe purpose, not raw values:

| Semantic (Correct) | Raw (Incorrect) |
|-------------------|-----------------|
| `--color-primary` | `--blue-500` |
| `--color-destructive` | `--red-600` |
| `--color-background` | `--white` |
| `--space-content` | `--16px` |

Semantic tokens allow theme changes without renaming. Swapping the primary color from blue to purple requires changing one value, not hundreds of references.

## Atomic Design

Organize components in five levels of increasing complexity:

### 1. Atoms
Smallest building blocks. Cannot be broken down further.

- Button, Input, Label, Badge, Avatar, Icon, Separator
- Each atom has a consistent API: `size`, `variant`, `disabled`

### 2. Molecules
Groups of atoms functioning together as a unit.

- Search bar (Input + Button)
- Form field (Label + Input + Error message)
- Nav item (Icon + Text + Badge)

### 3. Organisms
Complex UI sections composed of molecules and atoms.

- Header (Logo + Nav items + Avatar dropdown)
- Card (Image + Title + Description + Actions)
- Data table (Table header + Rows + Pagination)

### 4. Templates
Page-level layouts that place organisms into a structure. Define the grid and content regions without real content.

### 5. Pages
Templates filled with real content. Where the design is tested against actual data, edge cases, and states.

## Component API Patterns

### Consistent Variant System

Every component should have predictable props:

```tsx
interface ButtonProps {
  variant: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'
  size: 'sm' | 'md' | 'lg' | 'icon'
  disabled?: boolean
  loading?: boolean
}
```

Apply this pattern consistently. If buttons have `sm/md/lg`, inputs should too. If buttons have `destructive`, alerts should too.

### Compound Components

Build complex UI from composable primitives:

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

Benefits: flexible composition, clear structure, each part independently stylable.

### The shadcn/ui Philosophy

shadcn/ui is not a component library — it is a collection of copy-paste components built on Radix UI + Tailwind.

Core principles:
- **Own the code**: Components live in the project, fully customizable
- **Accessible by default**: Built on Radix primitives with proper ARIA
- **Composable**: Compound component patterns throughout
- **Themeable**: CSS variables for all design tokens

When using shadcn/ui:
- Install components with `npx shadcn@latest add <component>`
- Components live in `components/ui/`
- Customize by editing the component source directly
- Use the `cn()` utility for conditional class merging

## Theming

### Dark Mode with next-themes

```tsx
// providers.tsx
import { ThemeProvider } from 'next-themes'

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  )
}
```

```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 47.4% 11.2%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

### Dark Mode Token Rules

| Property | Light Mode | Dark Mode |
|----------|-----------|-----------|
| Background | White or near-white | Dark gray (NOT pure black) |
| Text | Near-black (slate-900) | Near-white (slate-50/100) |
| Borders | Light gray (gray-200) | Dark gray (gray-700/800) |
| Cards | White with shadow | Slightly lighter than background |
| Saturation | Full saturation | Reduced 10-20% |
| Elevation | Darken (shadows) | Lighten (lighter bg) |

### CSS Variable Architecture

Structure tokens in three layers:

1. **Primitive tokens**: Raw values (`--blue-500: 221 83% 53%`)
2. **Semantic tokens**: Purpose-based (`--color-primary: var(--blue-500)`)
3. **Component tokens**: Component-specific (`--button-bg: var(--color-primary)`)

Most projects need only primitive + semantic layers. Add component tokens only for large design systems with many themes.

## Design System Outputs

When generating a design system (via the search tool), the output includes:

1. **Pattern**: Overall layout approach (bento grid, card-based, hero-centric)
2. **Style**: Visual aesthetic (minimalism, glassmorphism, brutalism)
3. **Colors**: Full palette with primary, secondary, accent, neutral, semantic
4. **Typography**: Font pairing with sizes, weights, line heights
5. **Effects**: Shadows, border-radius, gradients, animations
6. **Anti-patterns**: What to avoid for this specific style

Persist design systems with `--persist` to create `design-system/MASTER.md` for cross-session consistency. Use `--page` for page-specific overrides that deviate from the master.
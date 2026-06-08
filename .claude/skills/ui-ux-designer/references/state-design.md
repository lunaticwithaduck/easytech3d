# State Design Patterns

Reference for designing all UI states: loading, empty, error, success, and interactive states. Every screen and component must handle these states gracefully.

## Loading States

### Skeleton Screens (Preferred)

Skeleton screens are the best loading pattern. They show a placeholder UI that mirrors the eventual content shape, reducing perceived load time.

```html
<!-- Skeleton card -->
<div class="rounded-lg border p-6 space-y-4">
  <div class="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
  <div class="h-4 w-1/2 animate-pulse rounded bg-muted"></div>
  <div class="space-y-2">
    <div class="h-3 w-full animate-pulse rounded bg-muted"></div>
    <div class="h-3 w-5/6 animate-pulse rounded bg-muted"></div>
  </div>
</div>
```

Rules for skeletons:
- Match the shape and size of the actual content
- Use `animate-pulse` (Tailwind) for subtle animation
- Use `bg-muted` or a neutral gray for the placeholder blocks
- Show the page layout structure (header, sidebar, content areas)
- Avoid showing skeletons for more than 3 seconds — if the load takes longer, add a progress indicator

### Spinners (Secondary)

Use spinners only for discrete actions (submitting a form, loading a modal). Never for full-page loads.

```html
<svg class="h-5 w-5 animate-spin text-primary" viewBox="0 0 24 24">
  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
</svg>
```

### Button Loading States

Disable the button and show a spinner during async operations:

```html
<button class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50" disabled>
  <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24">...</svg>
  Saving...
</button>
```

Rules:
- Disable the button to prevent double-submission
- Replace the button text with an action verb ("Saving...", "Sending...")
- Keep the button the same size to avoid layout shift
- Show the spinner inline, replacing or alongside the icon

### Loading Hierarchy

| Context | Pattern | Example |
|---------|---------|---------|
| Full page | Skeleton screen | Dashboard loading |
| Section/card | Skeleton for that section | Table loading |
| Button action | Inline spinner + disabled | Form submit |
| Inline data | Placeholder text | "Loading..." |
| Background refresh | No visible indicator | Silent re-fetch |

## Empty States

Empty states are critical moments — they are the first thing new users see. Turn them into opportunities for engagement.

### Structure

Every empty state needs three elements:

1. **Illustration or icon** — Visual that communicates the concept (not required but highly effective)
2. **Message** — Explain why it is empty and what the user can do
3. **Call to action** — Button or link to take the logical next step

```html
<div class="flex flex-col items-center justify-center py-16 text-center">
  <div class="rounded-full bg-muted p-4">
    <svg class="h-8 w-8 text-muted-foreground"><!-- icon --></svg>
  </div>
  <h3 class="mt-4 text-lg font-semibold">No projects yet</h3>
  <p class="mt-2 max-w-sm text-sm text-muted-foreground">
    Create your first project to get started. Projects help you organize your work.
  </p>
  <button class="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
    Create Project
  </button>
</div>
```

### Empty State Types

| Type | Message Tone | CTA |
|------|-------------|-----|
| **First use** | Welcoming, educational | "Create your first..." |
| **Search no results** | Helpful, suggest alternatives | "Try different keywords" |
| **Filtered empty** | Explain filter impact | "Clear filters" |
| **Completed tasks** | Celebratory | "View completed" or "Add new" |
| **Error-caused empty** | Honest, recovery-focused | "Retry" or "Contact support" |

## Error States

### Inline Field Errors

Display error messages directly below the problematic input:

```html
<div class="space-y-2">
  <label for="email" class="text-sm font-medium">Email</label>
  <input
    id="email"
    type="email"
    class="rounded-lg border border-destructive px-3 py-2 text-sm ring-destructive/20 focus:ring-2"
    aria-describedby="email-error"
    aria-invalid="true"
  />
  <p id="email-error" class="text-sm text-destructive" role="alert">
    Enter a valid email address (e.g., name@example.com)
  </p>
</div>
```

Rules for field errors:
- Use `border-destructive` to highlight the problematic field
- Associate the error message with `aria-describedby`
- Mark the field with `aria-invalid="true"`
- Be specific: "Password must be at least 8 characters" not "Invalid password"
- Show errors on blur, not on every keystroke

### Page-Level Errors

For API failures or unexpected errors:

```html
<div class="flex flex-col items-center justify-center py-16 text-center">
  <div class="rounded-full bg-destructive/10 p-4">
    <svg class="h-8 w-8 text-destructive"><!-- alert icon --></svg>
  </div>
  <h3 class="mt-4 text-lg font-semibold">Something went wrong</h3>
  <p class="mt-2 max-w-sm text-sm text-muted-foreground">
    We couldn't load your data. This is usually temporary.
  </p>
  <button class="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
    Try Again
  </button>
</div>
```

### Toast Notifications

For non-blocking errors (background operations, minor issues):

```html
<div class="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4" role="alert">
  <svg class="h-5 w-5 shrink-0 text-destructive"><!-- alert icon --></svg>
  <div>
    <p class="text-sm font-medium">Failed to save changes</p>
    <p class="text-sm text-muted-foreground">Check your connection and try again.</p>
  </div>
  <button class="ml-auto text-sm font-medium text-destructive hover:underline">Retry</button>
</div>
```

### Error Message Guidelines

| Principle | Good | Bad |
|-----------|------|-----|
| Be specific | "Email must include @" | "Invalid input" |
| Suggest action | "Check your connection and retry" | "Error occurred" |
| Use plain language | "Password needs 8+ characters" | "Error 422: Validation failed" |
| Take responsibility | "We couldn't save your changes" | "You made an error" |

## Success States

### Confirmation Patterns

After successful actions, confirm and guide to the next step:

```html
<!-- Inline success -->
<div class="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
  <svg class="h-4 w-4 shrink-0"><!-- check icon --></svg>
  Changes saved successfully
</div>
```

### Success Feedback Types

| Action | Feedback | Duration |
|--------|----------|----------|
| Form submit | Toast notification | 5 seconds auto-dismiss |
| Delete | Toast with undo action | 8 seconds |
| Settings change | Inline confirmation | 3 seconds |
| Multi-step complete | Full success page | Persistent |

## Interactive States

Every interactive element needs these states defined:

### State Matrix

| State | Visual Change | Cursor | Example (Tailwind) |
|-------|--------------|--------|-------------------|
| **Default** | Base appearance | default | `bg-primary text-primary-foreground` |
| **Hover** | Subtle color shift | pointer | `hover:bg-primary/90` |
| **Focus** | Ring/outline | — | `focus-visible:ring-2 focus-visible:ring-ring` |
| **Active** | Pressed feel | pointer | `active:scale-[0.98]` |
| **Disabled** | Reduced opacity | not-allowed | `disabled:opacity-50 disabled:pointer-events-none` |
| **Loading** | Spinner + disabled | wait | `animate-spin` + `disabled` |

### Focus State Rules

- Always provide visible focus indicators
- Use `focus-visible` (not `focus`) to avoid showing rings on click
- Ring should use the `--ring` token color
- Ring offset separates the ring from the element: `ring-offset-2 ring-offset-background`
- Never set `outline: none` without a replacement

### Transitions Between States

- Use `transition-colors` for color changes (hover, focus)
- Use `transition-all` sparingly — prefer specific transitions
- Duration: 150ms for micro-interactions, 200-300ms for larger transitions
- Easing: `ease-in-out` for most, `ease-out` for entries, `ease-in` for exits
- Respect `prefers-reduced-motion`: `motion-reduce:transition-none`
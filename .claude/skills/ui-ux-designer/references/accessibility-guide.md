# Accessibility Guide

Comprehensive reference for building accessible interfaces. WCAG 2.2, semantic HTML, ARIA patterns, keyboard navigation, and forms.

## WCAG 2.2 Core Principles (POUR)

### Perceivable
Information must be presentable in ways all users can perceive. Provide text alternatives for non-text content. Make content adaptable and distinguishable.

### Operable
Interface must be operable by all users. Make all functionality keyboard accessible. Give users enough time. Do not cause seizures. Provide navigation aids.

### Understandable
Information and operation must be understandable. Make text readable. Make behavior predictable. Help users avoid and correct mistakes.

### Robust
Content must work with diverse user agents and assistive technologies. Use valid, semantic markup. Ensure compatibility with current and future tools.

## Semantic HTML

Semantic HTML is the foundation of accessibility. Use elements for their meaning, not their appearance.

### Element Selection Guide

| Purpose | Correct Element | Incorrect |
|---------|----------------|-----------|
| Clickable action | `<button>` | `<div onClick>`, `<span onClick>` |
| Navigate to URL | `<a href="...">` | `<button onClick={navigate}>` |
| Page regions | `<nav>`, `<main>`, `<aside>`, `<header>`, `<footer>` | `<div class="nav">` |
| Page heading | `<h1>` through `<h6>` | `<div class="title">`, `<p class="heading">` |
| List of items | `<ul>` / `<ol>` + `<li>` | Nested `<div>` elements |
| Tabular data | `<table>` + `<thead>` + `<th scope>` | Grid of divs |
| Form group | `<fieldset>` + `<legend>` | `<div class="group">` |
| Input label | `<label for="id">` | `<span>`, `<p>` |
| Time/date | `<time datetime="...">` | `<span>` |

### Heading Hierarchy

Maintain strict heading order. Never skip levels:

```html
<h1>Page Title</h1>              <!-- ONE per page -->
  <h2>Section</h2>               <!-- Major section -->
    <h3>Subsection</h3>          <!-- Within section -->
      <h4>Detail</h4>            <!-- Within subsection -->
  <h2>Another Section</h2>       <!-- Back to h2 -->
```

Skipping h2 and jumping from h1 to h3 breaks screen reader navigation. Heading level is about document structure, not visual size — use CSS for sizing.

### Landmark Regions

```html
<body>
  <header>                        <!-- Site header -->
    <nav aria-label="Main">       <!-- Primary navigation -->
      ...
    </nav>
  </header>
  <main>                          <!-- Primary content (ONE per page) -->
    <section aria-labelledby="section-heading">
      <h2 id="section-heading">Section Title</h2>
      ...
    </section>
  </main>
  <aside aria-label="Related">    <!-- Sidebar/supplementary -->
    ...
  </aside>
  <footer>                        <!-- Site footer -->
    ...
  </footer>
</body>
```

Multiple `<nav>` elements require unique `aria-label` values to distinguish them:
```html
<nav aria-label="Main navigation">...</nav>
<nav aria-label="Breadcrumb">...</nav>
<nav aria-label="Footer links">...</nav>
```

## ARIA Patterns

### The First Rule of ARIA

Do not use ARIA if a native HTML element achieves the same result. ARIA adds roles and properties that semantic HTML provides natively. Use it only when HTML is insufficient.

```html
<!-- WRONG: ARIA on a native element -->
<div role="button" tabindex="0" aria-label="Submit">Submit</div>

<!-- RIGHT: Use the native element -->
<button>Submit</button>
```

### Dialog (Modal)

```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-desc"
>
  <h2 id="dialog-title">Confirm Deletion</h2>
  <p id="dialog-desc">This action cannot be undone.</p>
  <button>Cancel</button>
  <button>Delete</button>
</div>
```

Requirements:
- Focus moves into the dialog on open
- Focus is trapped inside the dialog (Tab cannot escape)
- Escape key closes the dialog
- Focus returns to the trigger element on close

### Tabs

```html
<div role="tablist" aria-label="Account settings">
  <button role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1">
    Profile
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2" tabindex="-1">
    Security
  </button>
</div>
<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">
  <!-- Profile content -->
</div>
<div role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden>
  <!-- Security content -->
</div>
```

Keyboard: Arrow keys move between tabs. Tab moves into the panel.

### Accordion / Expandable

```html
<h3>
  <button
    aria-expanded="false"
    aria-controls="section-1-content"
  >
    Section Title
  </button>
</h3>
<div id="section-1-content" hidden>
  Section content...
</div>
```

Toggle `aria-expanded` and the `hidden` attribute together.

### Live Regions

For dynamic content that updates without page reload:

```html
<!-- Toast notifications -->
<div aria-live="polite" aria-atomic="true">
  {toastMessage}
</div>

<!-- Form validation errors -->
<div aria-live="assertive" role="alert">
  {errorMessage}
</div>

<!-- Loading status -->
<div aria-live="polite">
  {isLoading ? 'Loading results...' : `${count} results found`}
</div>
```

- `aria-live="polite"`: Announces after current speech finishes (most cases)
- `aria-live="assertive"`: Interrupts current speech (errors only)
- `aria-atomic="true"`: Announces entire region, not just changed text

### Descriptive Associations

```html
<!-- Help text for an input -->
<input id="password" aria-describedby="password-help password-error" />
<p id="password-help">Must be at least 8 characters</p>
<p id="password-error" role="alert">Password is too short</p>

<!-- Icon-only button -->
<button aria-label="Close dialog">
  <svg aria-hidden="true"><!-- X icon --></svg>
</button>

<!-- Label from another element -->
<div aria-labelledby="section-title">
  <h2 id="section-title">Recent Activity</h2>
  <!-- content -->
</div>
```

### Hiding from Assistive Technology

```html
<!-- Decorative image (no informational value) -->
<img src="decoration.svg" alt="" aria-hidden="true" />

<!-- Decorative icon next to text -->
<button>
  <svg aria-hidden="true"><!-- icon --></svg>
  Delete
</button>

<!-- Visually hidden but screen-reader accessible -->
<span class="sr-only">Sort ascending</span>
```

The Tailwind `sr-only` class: visually hidden but announced by screen readers.

## Keyboard Navigation

### Tab Order

- Tab moves focus forward through interactive elements
- Shift+Tab moves focus backward
- Tab order must follow the visual reading order
- Never use `tabindex` values greater than 0 — they create unpredictable order
- Use `tabindex="0"` to add custom elements to tab order
- Use `tabindex="-1"` to make elements focusable programmatically but not via Tab

### Focus Trapping

Trap focus inside modals, dialogs, and drawers:

1. On open: move focus to the first focusable element inside
2. Tab from the last element wraps to the first
3. Shift+Tab from the first element wraps to the last
4. Escape closes and returns focus to the trigger

Libraries like Radix UI, Headless UI, and React Aria handle this automatically.

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Tab | Move to next focusable element |
| Shift+Tab | Move to previous focusable element |
| Enter | Activate button or link |
| Space | Activate button, toggle checkbox |
| Escape | Close modal, dropdown, popover |
| Arrow keys | Navigate within tabs, menus, radio groups, select |
| Home/End | Jump to first/last item in a list |

### Focus Indicators

```css
/* NEVER do this without a replacement */
*:focus { outline: none; }  /* ❌ WRONG */

/* Use focus-visible for keyboard-only rings */
button:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

/* Tailwind */
.focus-visible:outline-none
.focus-visible:ring-2
.focus-visible:ring-ring
.focus-visible:ring-offset-2
```

### Skip Links

Provide a "Skip to main content" link as the first focusable element:

```html
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg">
  Skip to main content
</a>
<!-- ... header, nav ... -->
<main id="main-content">
```

## Color and Contrast

### Contrast Ratios

| Level | Ratio | Applies To |
|-------|-------|------------|
| AA normal text | 4.5:1 | All text below 18px bold / 24px regular |
| AA large text | 3:1 | Text at 18px+ bold or 24px+ regular |
| AA UI components | 3:1 | Borders, icons, form controls, focus indicators |
| AAA normal text | 7:1 | Enhanced (optional but recommended) |

### Common Contrast Failures

| Element | Typical Problem | Fix |
|---------|----------------|-----|
| Placeholder text | Gray on white, ~2:1 ratio | Use slate-500 minimum |
| Muted text | gray-400 on white, ~3:1 | Use slate-600+ in light mode |
| Disabled text | Too faint to read | opacity-50 on already-contrasting text |
| Light borders | white/10 on white | Use gray-200 in light, gray-700 in dark |
| Brand color on white | Some brand blues are too light | Darken for text, keep original for large areas |

### Color Independence

Never rely solely on color to convey meaning:

```html
<!-- ❌ Color only -->
<span class="text-red-500">Error</span>
<span class="text-green-500">Success</span>

<!-- ✅ Color + icon + text -->
<span class="text-red-500 flex items-center gap-1">
  <svg><!-- X icon --></svg> Error: Invalid email
</span>
<span class="text-green-500 flex items-center gap-1">
  <svg><!-- check icon --></svg> Saved successfully
</span>
```

## Motion and Animation

### prefers-reduced-motion

```css
/* Disable animations for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Tailwind: motion-reduce variant */
<div class="transition-transform duration-300 motion-reduce:transition-none">
```

### Rules

- All animations must respect `prefers-reduced-motion`
- Provide pause/stop controls for auto-playing content (carousels, videos)
- No content should flash more than 3 times per second
- Parallax scrolling must be disable-able

## Forms

### Labels

Every input needs a visible, associated label:

```html
<!-- Explicit association (preferred) -->
<label for="email">Email address</label>
<input id="email" type="email" />

<!-- Implicit wrapping -->
<label>
  Email address
  <input type="email" />
</label>
```

Never use placeholder text as the only label — it disappears on focus.

### Error Messages

```html
<div>
  <label for="password">Password</label>
  <input
    id="password"
    type="password"
    aria-describedby="password-help password-error"
    aria-invalid="true"
    required
  />
  <p id="password-help" class="text-sm text-muted-foreground">
    Must be at least 8 characters
  </p>
  <p id="password-error" class="text-sm text-destructive" role="alert">
    Password must be at least 8 characters
  </p>
</div>
```

Rules:
- Associate with `aria-describedby` pointing to the error element
- Mark the field with `aria-invalid="true"`
- Use `role="alert"` on the error message for screen reader announcement
- Be specific: "Email must include @" not "Invalid input"
- Show on blur or submit, not on every keystroke

### Required Fields

```html
<label for="name">
  Full name <span class="text-destructive" aria-hidden="true">*</span>
</label>
<input id="name" required aria-required="true" />
```

Indicate required fields both visually (asterisk) and programmatically (`required` attribute).

## Quick Reference Checklist

### Before Delivery

- [ ] All interactive elements use semantic HTML (`<button>`, `<a>`, `<input>`)
- [ ] Heading hierarchy is sequential (h1 → h2 → h3, no skips)
- [ ] All images have appropriate `alt` text (or `alt=""` for decorative)
- [ ] All form inputs have visible, associated labels
- [ ] Error messages are specific and associated with fields
- [ ] Color contrast meets 4.5:1 for normal text, 3:1 for large
- [ ] Color is not the sole indicator of any state
- [ ] Focus indicators are visible on all interactive elements
- [ ] Tab order follows logical reading order
- [ ] Escape closes all overlays (modals, dropdowns, popovers)
- [ ] Touch targets are at least 44x44px
- [ ] `prefers-reduced-motion` is respected
- [ ] `aria-live` regions exist for dynamic content updates
- [ ] Skip link is present for keyboard navigation
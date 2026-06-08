# Accessibility Deep Dive

ARIA patterns, keyboard navigation, focus management, and screen reader optimization.

## ARIA Roles Quick Reference

| Role | Use When | Example |
|------|----------|---------|
| `alert` | Dynamic error/status message | Toast notification |
| `alertdialog` | Modal requiring acknowledgment | Confirm delete dialog |
| `dialog` | Modal overlay | Settings panel |
| `tablist` / `tab` / `tabpanel` | Tabbed interface | Settings tabs |
| `menu` / `menuitem` | Action menu (not navigation) | Context menu |
| `tree` / `treeitem` | Hierarchical list | File explorer |
| `combobox` + `listbox` | Searchable dropdown | Autocomplete select |
| `toolbar` | Group of action buttons | Text editor toolbar |
| `tooltip` | Supplementary label on hover/focus | Info hover |
| `status` | Non-urgent status updates | "3 items selected" |
| `progressbar` | Loading/progress indicator | Upload progress |
| `switch` | On/off toggle | Dark mode toggle |
| `feed` | Infinite scrolling content | Social media feed |

## Accordion Pattern

```html
<div class="accordion">
  <h3>
    <button
      aria-expanded="false"
      aria-controls="panel-1"
      id="header-1"
    >
      Section Title
      <svg aria-hidden="true"><!-- chevron --></svg>
    </button>
  </h3>
  <div
    id="panel-1"
    role="region"
    aria-labelledby="header-1"
    hidden
  >
    <p>Panel content...</p>
  </div>
</div>
```

**Keyboard:** Enter/Space toggles. Optional: Up/Down navigates headers, Home/End first/last.

## Tabs Pattern

```html
<div class="tabs">
  <div role="tablist" aria-label="Account settings">
    <button role="tab" aria-selected="true" aria-controls="panel-profile" id="tab-profile" tabindex="0">
      Profile
    </button>
    <button role="tab" aria-selected="false" aria-controls="panel-security" id="tab-security" tabindex="-1">
      Security
    </button>
    <button role="tab" aria-selected="false" aria-controls="panel-billing" id="tab-billing" tabindex="-1">
      Billing
    </button>
  </div>

  <div role="tabpanel" id="panel-profile" aria-labelledby="tab-profile" tabindex="0">
    Profile content...
  </div>
  <div role="tabpanel" id="panel-security" aria-labelledby="tab-security" tabindex="0" hidden>
    Security content...
  </div>
  <div role="tabpanel" id="panel-billing" aria-labelledby="tab-billing" tabindex="0" hidden>
    Billing content...
  </div>
</div>
```

**Keyboard:** Arrow Left/Right moves between tabs. Home/End first/last tab. Tab key moves into panel.

**Key rules:**
- Active tab: `aria-selected="true"`, `tabindex="0"`
- Inactive tabs: `aria-selected="false"`, `tabindex="-1"`
- Use roving tabindex pattern (only active tab is in tab order)

## Combobox (Autocomplete) Pattern

```html
<div class="combobox-wrapper">
  <label for="search-input">Search users</label>
  <div role="combobox" aria-expanded="true" aria-haspopup="listbox" aria-owns="search-listbox">
    <input
      id="search-input"
      type="text"
      aria-autocomplete="list"
      aria-controls="search-listbox"
      aria-activedescendant="option-2"
      autocomplete="off"
    />
  </div>
  <ul id="search-listbox" role="listbox" aria-label="Search results">
    <li id="option-1" role="option" aria-selected="false">Alice Johnson</li>
    <li id="option-2" role="option" aria-selected="true">Bob Smith</li>
    <li id="option-3" role="option" aria-selected="false">Carol White</li>
  </ul>
</div>
```

**Keyboard:** Down opens list. Up/Down navigates options. Enter selects. Escape closes. Type to filter.

**Key rules:**
- `aria-activedescendant` points to visually focused option
- `aria-expanded` reflects list visibility
- Filter results on each keystroke

## Dialog (Modal) Pattern

```html
<dialog id="settings-dialog" aria-labelledby="dialog-title" aria-describedby="dialog-desc">
  <h2 id="dialog-title">Settings</h2>
  <p id="dialog-desc">Configure your preferences below.</p>

  <form method="dialog">
    <!-- form content -->
    <div class="dialog-actions">
      <button value="cancel">Cancel</button>
      <button value="save" autofocus>Save</button>
    </div>
  </form>
</dialog>
```

**Rules:**
- Use native `<dialog>` with `showModal()` (auto focus trap + Escape close)
- Return focus to trigger element on close
- `aria-labelledby` for title, `aria-describedby` for description
- First focusable element or `autofocus` receives focus on open

```javascript
const dialog = document.getElementById('settings-dialog')
const trigger = document.getElementById('open-settings')

trigger.addEventListener('click', () => dialog.showModal())
dialog.addEventListener('close', () => trigger.focus())
```

## Keyboard Navigation Patterns

### Roving Tabindex

One item focusable at a time within a group. Arrow keys move focus.

```javascript
function rovingTabindex(container, selector, orientation = 'horizontal') {
  const items = Array.from(container.querySelectorAll(selector))
  let current = 0

  items.forEach((item, i) => {
    item.setAttribute('tabindex', i === 0 ? '0' : '-1')
  })

  container.addEventListener('keydown', (e) => {
    const prev = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp'
    const next = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown'

    if (e.key === next) {
      items[current].setAttribute('tabindex', '-1')
      current = (current + 1) % items.length
      items[current].setAttribute('tabindex', '0')
      items[current].focus()
      e.preventDefault()
    } else if (e.key === prev) {
      items[current].setAttribute('tabindex', '-1')
      current = (current - 1 + items.length) % items.length
      items[current].setAttribute('tabindex', '0')
      items[current].focus()
      e.preventDefault()
    } else if (e.key === 'Home') {
      items[current].setAttribute('tabindex', '-1')
      current = 0
      items[current].setAttribute('tabindex', '0')
      items[current].focus()
      e.preventDefault()
    } else if (e.key === 'End') {
      items[current].setAttribute('tabindex', '-1')
      current = items.length - 1
      items[current].setAttribute('tabindex', '0')
      items[current].focus()
      e.preventDefault()
    }
  })
}
```

### Focus Trap

Keep focus within a container (for modals without native `<dialog>`).

```javascript
function trapFocus(container) {
  const focusable = container.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )
  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  container.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return
    if (e.shiftKey) {
      if (document.activeElement === first) { last.focus(); e.preventDefault() }
    } else {
      if (document.activeElement === last) { first.focus(); e.preventDefault() }
    }
  })

  first?.focus()
}
```

## Live Regions

```html
<!-- Assertive: interrupts screen reader (errors, alerts) -->
<div role="alert" aria-live="assertive">
  Form submission failed. Please fix the errors below.
</div>

<!-- Polite: announced when idle (status updates) -->
<div aria-live="polite" aria-atomic="true">
  3 results found
</div>

<!-- Status: like polite but with implicit role="status" -->
<div role="status">
  Saving...
</div>
```

**Rules:**
- Region must exist in DOM before content changes
- `aria-atomic="true"` reads entire region on change (not just diff)
- `aria-relevant="additions text"` (default) — announces new content + text changes
- Use `role="alert"` sparingly (interrupts everything)

## Skip Navigation

```html
<body>
  <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:shadow-lg">
    Skip to main content
  </a>
  <header><!-- nav --></header>
  <main id="main-content" tabindex="-1">
    <!-- content -->
  </main>
</body>
```

## Color Contrast Requirements

| Level | Normal Text (< 18px / 14px bold) | Large Text (>= 18px / 14px bold) |
|-------|----------------------------------|----------------------------------|
| AA | 4.5:1 | 3:1 |
| AAA | 7:1 | 4.5:1 |
| Non-text (icons, borders) | 3:1 | 3:1 |

## Touch Target Sizes

| Guideline | Minimum Size | Recommended |
|-----------|-------------|-------------|
| WCAG 2.2 (Level AA) | 24x24px | 44x44px |
| WCAG 2.2 (Level AAA) | 44x44px | 48x48px |
| Apple HIG | 44x44pt | — |
| Material Design | 48x48dp | — |

Ensure adequate spacing between targets. Use padding, not just element size.

## Screen Reader Only Utility

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
/* Tailwind: class="sr-only" */
```

## Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

```javascript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
```

## Common Accessibility Mistakes

| Mistake | Fix |
|---------|-----|
| `<div onClick>` for clickable elements | Use `<button>` or `<a href>` |
| Missing form labels | Add `<label for="id">` |
| Color alone conveys meaning | Add icon, text, or pattern |
| Auto-playing media | Provide pause/stop controls |
| Missing alt text on images | Add descriptive `alt` (or `alt=""` for decorative) |
| Focus not visible | Never remove `outline` without replacement |
| Missing skip link | Add skip to main content link |
| Keyboard trap | Ensure Escape or Tab can always leave |
| Dynamic content not announced | Use `aria-live` regions |
| Custom widget without ARIA | Follow WAI-ARIA Authoring Practices |
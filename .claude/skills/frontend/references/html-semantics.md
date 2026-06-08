# HTML Semantics

Complete reference for semantic HTML elements, landmark regions, heading hierarchy, and form patterns.

## Landmark Regions

```html
<body>
  <header>
    <nav aria-label="Main navigation">...</nav>
  </header>
  <main>
    <section aria-labelledby="section-heading">
      <h2 id="section-heading">Section Title</h2>
    </section>
  </main>
  <aside aria-label="Related content">...</aside>
  <footer>
    <nav aria-label="Footer links">...</nav>
  </footer>
</body>
```

Multiple `<nav>` elements require unique `aria-label` values. ONE `<main>` per page.

## Heading Hierarchy

```html
<h1>Page Title</h1>              <!-- ONE per page -->
  <h2>Major Section</h2>          <!-- h1 > h2 -->
    <h3>Subsection</h3>           <!-- h2 > h3 -->
      <h4>Detail</h4>             <!-- h3 > h4 -->
  <h2>Another Section</h2>        <!-- Back to h2 is fine -->
```

Never skip levels. Use CSS for visual sizing, not heading level.

## Form Patterns

### Label Association

```html
<!-- Explicit (preferred) -->
<label for="email">Email address</label>
<input id="email" type="email" />

<!-- Implicit wrapping -->
<label>
  Email address
  <input type="email" />
</label>
```

### Fieldset and Legend

```html
<fieldset>
  <legend>Shipping Address</legend>
  <label for="street">Street</label>
  <input id="street" type="text" />
  <label for="city">City</label>
  <input id="city" type="text" />
</fieldset>
```

### Error States

```html
<label for="email">Email <span class="text-destructive" aria-hidden="true">*</span></label>
<input
  id="email"
  type="email"
  required
  aria-required="true"
  aria-invalid="true"
  aria-describedby="email-help email-error"
/>
<p id="email-help" class="text-sm text-muted-foreground">We'll never share your email.</p>
<p id="email-error" class="text-sm text-destructive" role="alert">
  Enter a valid email address (e.g., name@example.com)
</p>
```

### Required Fields

```html
<label for="name">
  Full name <span class="text-destructive" aria-hidden="true">*</span>
</label>
<input id="name" required aria-required="true" />
```

## Table Markup

```html
<table>
  <caption>Monthly Revenue by Region</caption>
  <thead>
    <tr>
      <th scope="col">Region</th>
      <th scope="col">Revenue</th>
      <th scope="col">Growth</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">North America</th>
      <td>$1.2M</td>
      <td>+12%</td>
    </tr>
  </tbody>
</table>
```

Use `scope="col"` for column headers, `scope="row"` for row headers. `<caption>` describes the table for screen readers.

## Dialog Element

```html
<dialog id="confirm-dialog">
  <form method="dialog">
    <h2>Confirm Deletion</h2>
    <p>This action cannot be undone.</p>
    <button value="cancel">Cancel</button>
    <button value="confirm">Delete</button>
  </form>
</dialog>

<script>
  // Open: dialog.showModal()
  // Close: dialog.close() or form method="dialog"
  // Focus trapped automatically when using showModal()
  // Escape key closes automatically
</script>
```

## Details and Summary

```html
<details>
  <summary>How do I reset my password?</summary>
  <p>Click "Forgot Password" on the login page and follow the email instructions.</p>
</details>
```

Native accordion without JavaScript. No animation by default (add with CSS transitions on grid-template-rows).

## Lists

```html
<!-- Unordered (bullet points) -->
<ul>
  <li>Item one</li>
  <li>Item two</li>
</ul>

<!-- Ordered (numbered) -->
<ol>
  <li>Step one</li>
  <li>Step two</li>
</ol>

<!-- Definition list (term + description) -->
<dl>
  <dt>LCP</dt>
  <dd>Largest Contentful Paint - measures loading performance</dd>
  <dt>CLS</dt>
  <dd>Cumulative Layout Shift - measures visual stability</dd>
</dl>
```

## Time Element

```html
<time datetime="2024-01-15">January 15, 2024</time>
<time datetime="2024-01-15T14:30:00Z">2:30 PM UTC</time>
<time datetime="PT2H30M">2 hours and 30 minutes</time>
```

Machine-readable datetime with human-readable display text.

## Element Selection Quick Reference

| Purpose | Use | Not |
|---------|-----|-----|
| Clickable action | `<button>` | `<div onClick>`, `<a href="#">` |
| Navigate to URL | `<a href="...">` | `<button onClick={navigate}>` |
| Page title | `<h1>` (one per page) | `<div class="title">` |
| Section heading | `<h2>`, `<h3>` etc. | `<p class="heading">` |
| Navigation | `<nav aria-label="...">` | `<div class="nav">` |
| Primary content | `<main>` | `<div class="main">` |
| Sidebar | `<aside>` | `<div class="sidebar">` |
| Group of items | `<ul>` + `<li>` | Nested `<div>` |
| Data | `<table>` + `<th scope>` | Grid of `<div>` |
| Form group | `<fieldset>` + `<legend>` | `<div class="group">` |
| Input label | `<label for="id">` | `<span>` before input |
| Modal | `<dialog>` | `<div role="dialog">` |
| Expandable | `<details>` + `<summary>` | Custom JS accordion |

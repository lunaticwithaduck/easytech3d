# Component Patterns

Common UI component patterns with Tailwind CSS and React code. Copy and adapt these as starting points.

## Button Variants

```tsx
// Using cn() utility for conditional classes
function Button({ variant = 'default', size = 'md', children, ...props }) {
  return (
    <button
      className={cn(
        // Base
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        // Variants
        variant === 'default' && 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        variant === 'outline' && 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        variant === 'ghost' && 'hover:bg-accent hover:text-accent-foreground',
        variant === 'destructive' && 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        variant === 'link' && 'text-primary underline-offset-4 hover:underline',
        // Sizes
        size === 'sm' && 'h-9 px-3 text-sm',
        size === 'md' && 'h-10 px-4 text-sm',
        size === 'lg' && 'h-11 px-6 text-base',
        size === 'icon' && 'h-10 w-10',
      )}
      {...props}
    >
      {children}
    </button>
  )
}
```

## Card Component

```html
<article class="overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
  <!-- Optional image -->
  <div class="aspect-video overflow-hidden">
    <img
      src="..."
      alt="Descriptive text"
      class="h-full w-full object-cover"
      loading="lazy"
    />
  </div>

  <!-- Content -->
  <div class="p-6">
    <div class="flex items-center gap-2">
      <span class="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
        Category
      </span>
      <span class="text-xs text-muted-foreground">3 min read</span>
    </div>

    <h3 class="mt-3 text-lg font-semibold leading-tight">Card Title</h3>
    <p class="mt-2 line-clamp-2 text-sm text-muted-foreground">
      Card description that may be long and needs to be clamped to two lines maximum.
    </p>

    <!-- Footer -->
    <div class="mt-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="h-6 w-6 rounded-full bg-muted"></div>
        <span class="text-sm text-muted-foreground">Author Name</span>
      </div>
      <button class="text-sm font-medium text-primary hover:underline">
        Read more
      </button>
    </div>
  </div>
</article>
```

## Form with Validation

```html
<form class="space-y-6" novalidate>
  <!-- Text field -->
  <div class="space-y-2">
    <label for="name" class="text-sm font-medium leading-none">
      Full name <span class="text-destructive" aria-hidden="true">*</span>
    </label>
    <input
      id="name"
      type="text"
      required
      aria-required="true"
      placeholder="Enter your full name"
      class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    />
  </div>

  <!-- Email with error state -->
  <div class="space-y-2">
    <label for="email" class="text-sm font-medium leading-none">
      Email <span class="text-destructive" aria-hidden="true">*</span>
    </label>
    <input
      id="email"
      type="email"
      required
      aria-required="true"
      aria-invalid="true"
      aria-describedby="email-error"
      class="flex h-10 w-full rounded-lg border border-destructive bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
    />
    <p id="email-error" class="text-sm text-destructive" role="alert">
      Enter a valid email address (e.g., name@example.com)
    </p>
  </div>

  <!-- Select -->
  <div class="space-y-2">
    <label for="role" class="text-sm font-medium leading-none">Role</label>
    <select
      id="role"
      class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <option value="">Select a role...</option>
      <option value="admin">Admin</option>
      <option value="editor">Editor</option>
      <option value="viewer">Viewer</option>
    </select>
  </div>

  <!-- Actions -->
  <div class="flex items-center justify-end gap-3">
    <button type="button" class="h-10 rounded-lg border px-4 text-sm font-medium hover:bg-accent">
      Cancel
    </button>
    <button type="submit" class="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
      Save Changes
    </button>
  </div>
</form>
```

## Responsive Navbar

```html
<header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
    <!-- Logo -->
    <a href="/" class="flex items-center gap-2 font-bold">
      <svg class="h-6 w-6 text-primary" viewBox="0 0 24 24"><!-- logo --></svg>
      <span>Brand</span>
    </a>

    <!-- Desktop navigation -->
    <nav class="hidden items-center gap-6 md:flex" aria-label="Main navigation">
      <a href="/features" class="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        Features
      </a>
      <a href="/pricing" class="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        Pricing
      </a>
      <a href="/docs" class="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        Docs
      </a>
    </nav>

    <!-- Desktop actions -->
    <div class="hidden items-center gap-3 md:flex">
      <a href="/login" class="text-sm font-medium text-muted-foreground hover:text-foreground">
        Log in
      </a>
      <a href="/signup" class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
        Get Started
      </a>
    </div>

    <!-- Mobile menu button -->
    <button
      class="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent md:hidden"
      aria-label="Toggle navigation menu"
    >
      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 12h18M3 6h18M3 18h18" />
      </svg>
    </button>
  </div>
</header>
```

## Data Table

```html
<div class="rounded-xl border">
  <!-- Table header -->
  <div class="flex items-center justify-between border-b px-6 py-4">
    <h2 class="text-lg font-semibold">Users</h2>
    <div class="flex items-center gap-3">
      <input
        type="search"
        placeholder="Search users..."
        class="h-9 w-64 rounded-lg border px-3 text-sm"
        aria-label="Search users"
      />
      <button class="h-9 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground">
        Add User
      </button>
    </div>
  </div>

  <!-- Table -->
  <table class="w-full">
    <thead>
      <tr class="border-b bg-muted/50">
        <th scope="col" class="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
        <th scope="col" class="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
        <th scope="col" class="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Role</th>
        <th scope="col" class="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
        <th scope="col" class="px-6 py-3 text-right text-sm font-medium text-muted-foreground">
          <span class="sr-only">Actions</span>
        </th>
      </tr>
    </thead>
    <tbody class="divide-y">
      <tr class="transition-colors hover:bg-muted/50">
        <td class="px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">JD</div>
            <span class="text-sm font-medium">Jane Doe</span>
          </div>
        </td>
        <td class="px-6 py-4 text-sm text-muted-foreground">jane@example.com</td>
        <td class="px-6 py-4 text-sm">Admin</td>
        <td class="px-6 py-4">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Active
          </span>
        </td>
        <td class="px-6 py-4 text-right">
          <button class="h-8 w-8 rounded-lg hover:bg-accent" aria-label="Actions for Jane Doe">
            <svg class="mx-auto h-4 w-4 text-muted-foreground"><!-- dots icon --></svg>
          </button>
        </td>
      </tr>
    </tbody>
  </table>

  <!-- Pagination -->
  <div class="flex items-center justify-between border-t px-6 py-4">
    <p class="text-sm text-muted-foreground">Showing 1-10 of 42 results</p>
    <div class="flex items-center gap-2">
      <button class="h-9 rounded-lg border px-3 text-sm disabled:opacity-50" disabled>Previous</button>
      <button class="h-9 rounded-lg border px-3 text-sm">Next</button>
    </div>
  </div>
</div>
```

## Empty State

```html
<div class="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
  <div class="rounded-full bg-muted p-4">
    <svg class="h-8 w-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  </div>
  <h3 class="mt-4 text-lg font-semibold">No documents yet</h3>
  <p class="mt-2 max-w-sm text-sm text-muted-foreground">
    Upload your first document to get started. Supported formats: PDF, DOCX, TXT.
  </p>
  <button class="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
    Upload Document
  </button>
</div>
```

## Loading Skeleton

```html
<!-- Card skeleton -->
<div class="overflow-hidden rounded-xl border">
  <div class="aspect-video animate-pulse bg-muted"></div>
  <div class="space-y-3 p-6">
    <div class="h-4 w-1/4 animate-pulse rounded bg-muted"></div>
    <div class="h-5 w-3/4 animate-pulse rounded bg-muted"></div>
    <div class="space-y-2">
      <div class="h-3 w-full animate-pulse rounded bg-muted"></div>
      <div class="h-3 w-5/6 animate-pulse rounded bg-muted"></div>
    </div>
    <div class="flex items-center justify-between pt-2">
      <div class="flex items-center gap-2">
        <div class="h-6 w-6 animate-pulse rounded-full bg-muted"></div>
        <div class="h-3 w-20 animate-pulse rounded bg-muted"></div>
      </div>
      <div class="h-3 w-16 animate-pulse rounded bg-muted"></div>
    </div>
  </div>
</div>

<!-- Table skeleton -->
<div class="divide-y rounded-xl border">
  <div class="flex items-center gap-4 px-6 py-4">
    <div class="h-8 w-8 animate-pulse rounded-full bg-muted"></div>
    <div class="flex-1 space-y-2">
      <div class="h-4 w-1/3 animate-pulse rounded bg-muted"></div>
      <div class="h-3 w-1/4 animate-pulse rounded bg-muted"></div>
    </div>
    <div class="h-6 w-16 animate-pulse rounded-full bg-muted"></div>
  </div>
  <!-- Repeat rows as needed -->
</div>

<!-- Stat card skeleton -->
<div class="rounded-xl border p-6">
  <div class="flex items-center gap-2">
    <div class="h-8 w-8 animate-pulse rounded-lg bg-muted"></div>
    <div class="h-3 w-20 animate-pulse rounded bg-muted"></div>
  </div>
  <div class="mt-3 h-8 w-24 animate-pulse rounded bg-muted"></div>
</div>
```

## Stats Card

```html
<div class="rounded-xl border bg-card p-6">
  <div class="flex items-center gap-2">
    <div class="rounded-lg bg-primary/10 p-2">
      <svg class="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <span class="text-sm font-medium text-muted-foreground">Revenue</span>
  </div>
  <div class="mt-3 flex items-baseline gap-2">
    <span class="text-3xl font-bold tracking-tight">$45,231</span>
    <span class="flex items-center gap-0.5 text-sm font-medium text-emerald-600">
      <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M7 17l5-5 5 5M7 7l5 5 5-5" />
      </svg>
      +12.5%
    </span>
  </div>
  <p class="mt-1 text-xs text-muted-foreground">vs last month</p>
</div>
```
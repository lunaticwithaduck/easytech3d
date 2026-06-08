# Example: Responsive Layout

Mobile-first responsive layout using CSS Grid, container queries, fluid typography, and responsive images.

## Full Page Layout

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Responsive Layout Example</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    body { font-family: 'Inter', sans-serif; }

    /* Fluid typography */
    .fluid-display { font-size: clamp(2rem, 1rem + 3vw, 3.5rem); }
    .fluid-h2 { font-size: clamp(1.5rem, 0.75rem + 2vw, 2.5rem); }
    .fluid-body { font-size: clamp(1rem, 0.875rem + 0.5vw, 1.125rem); }

    /* Auto-fit card grid */
    .auto-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
      gap: 1.5rem;
    }

    /* Container query card */
    .card-container { container-type: inline-size; }
    .card-inner { display: flex; flex-direction: column; }
    @container (min-width: 500px) {
      .card-inner { flex-direction: row; }
      .card-inner .card-image { width: 200px; flex-shrink: 0; }
    }
  </style>
</head>
<body class="min-h-dvh bg-background text-foreground">
  <!-- Skip link -->
  <a
    href="#main"
    class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
  >
    Skip to main content
  </a>

  <!-- Header -->
  <header class="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <a href="/" class="text-lg font-bold">Brand</a>

      <!-- Desktop nav -->
      <nav class="hidden items-center gap-6 md:flex" aria-label="Main navigation">
        <a href="#features" class="text-sm font-medium text-muted-foreground hover:text-foreground">Features</a>
        <a href="#pricing" class="text-sm font-medium text-muted-foreground hover:text-foreground">Pricing</a>
        <a href="#about" class="text-sm font-medium text-muted-foreground hover:text-foreground">About</a>
      </nav>

      <div class="hidden items-center gap-3 md:flex">
        <a href="/login" class="text-sm font-medium text-muted-foreground hover:text-foreground">Log in</a>
        <a href="/signup" class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
          Get Started
        </a>
      </div>

      <!-- Mobile menu button -->
      <button class="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent md:hidden" aria-label="Toggle menu">
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>
    </div>
  </header>

  <main id="main" tabindex="-1">
    <!-- Hero: full-width, centered content -->
    <section class="px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
      <div class="mx-auto max-w-3xl text-center">
        <h1 class="fluid-display font-bold tracking-tight">
          Build better products with our platform
        </h1>
        <p class="fluid-body mt-6 text-muted-foreground">
          Everything you need to design, develop, and deploy modern web applications.
          Start building today with our comprehensive toolkit.
        </p>
        <div class="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a href="/signup" class="w-full rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 sm:w-auto">
            Start Free Trial
          </a>
          <a href="/demo" class="w-full rounded-lg border px-6 py-3 text-sm font-medium hover:bg-accent sm:w-auto">
            Watch Demo
          </a>
        </div>
      </div>
    </section>

    <!-- Features: auto-fit grid -->
    <section id="features" class="border-t px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="features-heading">
      <div class="mx-auto max-w-7xl">
        <h2 id="features-heading" class="fluid-h2 font-bold text-center">Features</h2>
        <p class="mt-4 text-center text-muted-foreground">Everything you need in one place.</p>

        <div class="auto-grid mt-12">
          <!-- Feature cards -->
          <article class="rounded-xl border p-6">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <svg class="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-semibold">Lightning Fast</h3>
            <p class="mt-2 text-sm text-muted-foreground">
              Optimized for Core Web Vitals with sub-second load times.
            </p>
          </article>

          <article class="rounded-xl border p-6">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <svg class="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-semibold">Secure by Default</h3>
            <p class="mt-2 text-sm text-muted-foreground">
              Built-in security features protect your data and users.
            </p>
          </article>

          <article class="rounded-xl border p-6">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <svg class="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-semibold">Fully Accessible</h3>
            <p class="mt-2 text-sm text-muted-foreground">
              WCAG 2.2 AA compliant with keyboard and screen reader support.
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- Content with container queries -->
    <section class="border-t px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="blog-heading">
      <div class="mx-auto max-w-7xl">
        <h2 id="blog-heading" class="fluid-h2 font-bold">Latest Articles</h2>

        <div class="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <!-- Featured article (large, uses container query) -->
          <div class="card-container">
            <article class="card-inner overflow-hidden rounded-xl border">
              <div class="card-image aspect-video overflow-hidden">
                <picture>
                  <source
                    type="image/avif"
                    srcset="https://placehold.co/400x225/avif 400w, https://placehold.co/800x450/avif 800w"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                  <img
                    src="https://placehold.co/800x450"
                    alt="Abstract illustration of web development workflow"
                    width="800"
                    height="450"
                    class="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              </div>
              <div class="flex flex-1 flex-col justify-center p-6">
                <span class="w-fit rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  Tutorial
                </span>
                <h3 class="mt-3 text-lg font-semibold leading-tight">
                  Building Responsive Layouts with Modern CSS
                </h3>
                <p class="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  Learn how to use CSS Grid, container queries, and fluid typography to create
                  layouts that adapt beautifully to any screen size.
                </p>
                <div class="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <time datetime="2025-01-15">Jan 15, 2025</time>
                  <span aria-hidden="true">&middot;</span>
                  <span>5 min read</span>
                </div>
              </div>
            </article>
          </div>

          <!-- Sidebar articles -->
          <div class="space-y-4">
            <article class="flex gap-4 rounded-xl border p-4">
              <img
                src="https://placehold.co/80x80"
                alt=""
                width="80"
                height="80"
                class="h-20 w-20 rounded-lg object-cover"
                loading="lazy"
                decoding="async"
              />
              <div>
                <h3 class="text-sm font-semibold leading-tight">TypeScript Tips for Frontend Devs</h3>
                <p class="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  Practical TypeScript patterns for React development.
                </p>
                <time class="mt-2 block text-xs text-muted-foreground" datetime="2025-01-10">Jan 10</time>
              </div>
            </article>

            <article class="flex gap-4 rounded-xl border p-4">
              <img
                src="https://placehold.co/80x80"
                alt=""
                width="80"
                height="80"
                class="h-20 w-20 rounded-lg object-cover"
                loading="lazy"
                decoding="async"
              />
              <div>
                <h3 class="text-sm font-semibold leading-tight">Accessibility Testing Guide</h3>
                <p class="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  Automated and manual testing for WCAG compliance.
                </p>
                <time class="mt-2 block text-xs text-muted-foreground" datetime="2025-01-05">Jan 5</time>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  </main>

  <!-- Footer -->
  <footer class="border-t px-4 py-12 sm:px-6 lg:px-8">
    <div class="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <p class="font-bold">Brand</p>
        <p class="mt-2 text-sm text-muted-foreground">Building the future of web development.</p>
      </div>
      <nav aria-label="Product links">
        <p class="text-sm font-semibold">Product</p>
        <ul class="mt-3 space-y-2">
          <li><a href="#" class="text-sm text-muted-foreground hover:text-foreground">Features</a></li>
          <li><a href="#" class="text-sm text-muted-foreground hover:text-foreground">Pricing</a></li>
          <li><a href="#" class="text-sm text-muted-foreground hover:text-foreground">Changelog</a></li>
        </ul>
      </nav>
      <nav aria-label="Company links">
        <p class="text-sm font-semibold">Company</p>
        <ul class="mt-3 space-y-2">
          <li><a href="#" class="text-sm text-muted-foreground hover:text-foreground">About</a></li>
          <li><a href="#" class="text-sm text-muted-foreground hover:text-foreground">Blog</a></li>
          <li><a href="#" class="text-sm text-muted-foreground hover:text-foreground">Careers</a></li>
        </ul>
      </nav>
      <nav aria-label="Legal links">
        <p class="text-sm font-semibold">Legal</p>
        <ul class="mt-3 space-y-2">
          <li><a href="#" class="text-sm text-muted-foreground hover:text-foreground">Privacy</a></li>
          <li><a href="#" class="text-sm text-muted-foreground hover:text-foreground">Terms</a></li>
        </ul>
      </nav>
    </div>
    <div class="mx-auto mt-12 max-w-7xl border-t pt-8 text-center text-sm text-muted-foreground">
      <p>&copy; 2025 Brand. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>
```

## Responsive Techniques Used

1. **Mobile-first breakpoints**: Base styles for mobile, `sm:` / `md:` / `lg:` for larger screens
2. **Fluid typography**: `clamp()` for display, h2, and body text — no breakpoint jumps
3. **Auto-fit grid**: `repeat(auto-fit, minmax(300px, 1fr))` — cards flow naturally
4. **Container queries**: Featured article switches column/row layout based on container width
5. **Responsive images**: `<picture>` with AVIF source + `sizes` attribute for optimal loading
6. **Flexible buttons**: Stack on mobile (`flex-col`), row on larger (`sm:flex-row`)
7. **Responsive spacing**: `py-16 sm:py-24 lg:py-32` for breathing room on larger screens
8. **Content-aware grid**: `lg:grid-cols-[2fr_1fr]` for main+sidebar layout
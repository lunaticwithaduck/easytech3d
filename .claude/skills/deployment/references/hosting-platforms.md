# Hosting Platforms

## Vercel

### vercel.json

```json
{
  "framework": null,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm ci",
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ],
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://api.example.com/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "redirects": [
    { "source": "/old-page", "destination": "/new-page", "permanent": true }
  ]
}
```

### Key Features

| Feature | Details |
|---------|---------|
| Free tier | 100GB bandwidth, 100 deploys/day |
| Preview deploys | Automatic per PR |
| Edge Functions | `vercel.json` + middleware |
| Analytics | Web Vitals (paid) |
| Cron jobs | `vercel.json` crons (paid) |
| Environment variables | Per-environment (preview/production) |
| Custom domains | Free SSL, unlimited |

### CLI

```bash
npm i -g vercel
vercel                          # Deploy preview
vercel --prod                   # Deploy production
vercel env pull .env.local      # Pull env vars
vercel logs                     # View function logs
```

---

## Netlify

### netlify.toml

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
  NPM_FLAGS = "--prefix=/dev/null"

# SPA routing — redirect all routes to index.html
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# API proxy
[[redirects]]
  from = "/api/*"
  to = "https://api.example.com/:splat"
  status = 200
  force = true

# Custom headers
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"

# Branch-specific build
[context.deploy-preview]
  command = "npm run build:preview"

[context.production]
  command = "npm run build"
  environment = { NODE_ENV = "production" }
```

### Alternative: _redirects & _headers Files

```
# public/_redirects
/api/*  https://api.example.com/:splat  200
/*      /index.html                      200
```

```
# public/_headers
/assets/*
  Cache-Control: public, max-age=31536000, immutable
/*
  X-Frame-Options: SAMEORIGIN
```

### Key Features

| Feature | Details |
|---------|---------|
| Free tier | 100GB bandwidth, 300 build minutes/month |
| Preview deploys | Automatic per PR (Deploy Previews) |
| Functions | Netlify Functions (AWS Lambda) |
| Forms | Built-in form handling |
| Identity | Auth service (free tier) |
| Split testing | A/B branch deploys |
| Plugins | Build plugins ecosystem |

### CLI

```bash
npm i -g netlify-cli
netlify init                    # Link to site
netlify deploy                  # Deploy draft
netlify deploy --prod           # Deploy production
netlify dev                     # Local dev server with functions
netlify env:set KEY value       # Set env var
```

---

## Cloudflare Pages

### Configuration

```json
// wrangler.toml (or through dashboard)
// Build settings configured in Cloudflare dashboard:
// - Build command: npm run build
// - Build output: dist
// - Root directory: /
```

### _headers and _redirects

```
# public/_headers (same format as Netlify)
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
```

```
# public/_redirects
/*  /index.html  200
```

### Cloudflare Pages Functions (Workers)

```tsx
// functions/api/hello.ts — runs at the edge
export const onRequest: PagesFunction = async (context) => {
  return new Response(JSON.stringify({ message: 'Hello from the edge!' }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

// functions/api/users/[id].ts — dynamic route
export const onRequestGet: PagesFunction = async ({ params }) => {
  const userId = params.id
  return new Response(JSON.stringify({ id: userId }))
}
```

### Key Features

| Feature | Details |
|---------|---------|
| Free tier | Unlimited bandwidth, 500 builds/month |
| Preview deploys | Automatic per PR |
| Edge functions | Pages Functions (Workers runtime) |
| KV storage | Cloudflare KV (key-value at edge) |
| D1 database | SQLite at the edge |
| R2 storage | S3-compatible object storage |
| Custom domains | Free SSL, unlimited |

### CLI

```bash
npm i -g wrangler
npx wrangler pages dev dist           # Local dev
npx wrangler pages deploy dist        # Deploy
npx wrangler pages project list       # List projects
```

---

## GitHub Pages

### GitHub Actions Deployment

```yaml
# .github/workflows/deploy-pages.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run build
        env:
          BASE_URL: /${{ github.event.repository.name }}/

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### SPA Routing Workaround

GitHub Pages doesn't support server-side routing. Workaround with 404.html:

```html
<!-- public/404.html — redirects to index.html with path preserved -->
<!DOCTYPE html>
<html>
<head>
  <script>
    // Redirect 404 to index.html with path in query string
    const path = window.location.pathname
    window.location.replace('/' + '?p=' + encodeURIComponent(path))
  </script>
</head>
</html>
```

```tsx
// In your app's entry point — restore the path
const params = new URLSearchParams(window.location.search)
const redirectPath = params.get('p')
if (redirectPath) {
  window.history.replaceState(null, '', decodeURIComponent(redirectPath))
}
```

### Key Features

| Feature | Details |
|---------|---------|
| Free tier | 1GB storage, 100GB bandwidth/month |
| Custom domain | CNAME file, free SSL |
| SPA support | No native (404.html workaround) |
| Build | GitHub Actions or manual push to gh-pages branch |
| Preview deploys | Not built-in (use Actions + surge.sh/Vercel) |

---

## Platform Comparison

| Feature | Vercel | Netlify | Cloudflare Pages | GitHub Pages |
|---------|--------|---------|-----------------|--------------|
| Free bandwidth | 100GB | 100GB | Unlimited | 100GB |
| Free builds | 100/day | 300 min/month | 500/month | Actions minutes |
| Preview deploys | Yes | Yes | Yes | Manual |
| Edge functions | Yes | Yes (limited) | Yes (Workers) | No |
| SPA routing | Yes | Yes | Yes | 404.html hack |
| Custom headers | vercel.json | _headers / toml | _headers | No |
| SSR support | Yes (Next.js) | Yes (Netlify Functions) | Yes (Workers) | No (static only) |
| Form handling | No | Built-in | No | No |
| Analytics | Yes (paid) | Yes (paid) | Yes (free) | No |
| Best for | Next.js, React | JAMstack, forms | Edge-first, Workers | Static sites, OSS |

---

## CDN Configuration

### Cache Headers Strategy

```
Static assets with content hash (app.a1b2c3.js):
  Cache-Control: public, max-age=31536000, immutable
  → Cache forever, filename changes on content change

HTML files (index.html):
  Cache-Control: no-cache, no-store, must-revalidate
  → Always fetch fresh to get latest asset references

Images without hash (/images/logo.png):
  Cache-Control: public, max-age=86400
  → Cache for 1 day, manual cache busting if needed

API responses:
  Cache-Control: private, no-cache
  → User-specific, always validate
```

### CDN Providers

| CDN | Integration | Edge Locations | Best For |
|-----|------------|----------------|----------|
| Cloudflare | DNS-level, zero-config | 300+ | Everything, free tier |
| Vercel Edge | Built into Vercel | 70+ | Vercel deployments |
| AWS CloudFront | S3 + CloudFront | 450+ | AWS ecosystem |
| Fastly | Origin shield, VCL | 80+ | Enterprise, custom logic |
| Bunny CDN | Pull zone, cheap | 100+ | Cost-effective |

---

## DNS Setup

### Common Records

| Record | Purpose | Example |
|--------|---------|---------|
| A | Root domain → IPv4 | `@ → 76.76.21.21` |
| AAAA | Root domain → IPv6 | `@ → 2606:4700::6810:85e5` |
| CNAME | Subdomain → hostname | `www → cname.vercel-dns.com` |
| TXT | Verification | `@ → "v=spf1 include:_spf.google.com ~all"` |

### Platform DNS

```
Vercel:
  CNAME: cname.vercel-dns.com
  A: 76.76.21.21

Netlify:
  CNAME: [site-name].netlify.app
  Check Netlify DNS for A records

Cloudflare Pages:
  CNAME: [project].pages.dev
  (Use Cloudflare DNS for best integration)

GitHub Pages:
  CNAME: [user].github.io
  A: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
```

### Custom Domain Checklist

1. Add domain in hosting platform dashboard
2. Set DNS records (A/CNAME) at your registrar
3. Wait for DNS propagation (up to 48h, usually minutes)
4. Verify SSL certificate provisioned
5. Set up `www` redirect (CNAME + redirect rule)
6. Test with `dig example.com` and `curl -I https://example.com`
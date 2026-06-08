# Deployment & Configuration

next.config.js, environment variables, Docker, and Vercel vs self-hosted.

## next.config.js

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // --- Images ---
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.example.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // --- Redirects ---
  async redirects() {
    return [
      {
        source: '/old-blog/:slug',
        destination: '/blog/:slug',
        permanent: true, // 308 (was 301)
      },
      {
        source: '/docs',
        destination: '/docs/getting-started',
        permanent: false, // 307 (was 302)
      },
    ]
  },

  // --- Rewrites ---
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'https://api.external.com/:path*',
      },
    ]
  },

  // --- Headers ---
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://example.com' },
        ],
      },
    ]
  },

  // --- Logging ---
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // --- Experimental ---
  experimental: {
    typedRoutes: true,           // Type-safe Link href
    serverActions: {
      bodySizeLimit: '2mb',       // Increase for file uploads
    },
  },
}

module.exports = nextConfig
```

## Environment Variables

### Convention

```env
# .env.local (NEVER commit — in .gitignore)
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
AUTH_SECRET=super-secret-key
STRIPE_SECRET_KEY=sk_test_...

# Public (exposed to browser — prefix with NEXT_PUBLIC_)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_GA_ID=G-XXXXXXX
```

### Loading Order

| File | Loaded | Git | Use For |
|------|--------|-----|---------|
| `.env` | Always | Commit | Default values |
| `.env.local` | Always (overrides .env) | Ignore | Secrets, local overrides |
| `.env.development` | `next dev` | Commit | Dev-specific defaults |
| `.env.production` | `next build` / `next start` | Commit | Prod-specific defaults |
| `.env.development.local` | `next dev` | Ignore | Dev secrets |
| `.env.production.local` | `next build` / `next start` | Ignore | Prod secrets |

**Priority:** `.env.local` > `.env.{environment}.local` > `.env.{environment}` > `.env`

### Type-Safe Env Validation

```tsx
// env.ts
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  NEXT_PUBLIC_APP_URL: z.string().url(),
})

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
})
```

## Docker Deployment

### Dockerfile (Standalone Output)

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time env vars
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

### next.config.js for Standalone

```js
const nextConfig = {
  output: 'standalone', // Required for Docker
}
```

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      args:
        NEXT_PUBLIC_APP_URL: https://example.com
    ports:
      - '3000:3000'
    environment:
      DATABASE_URL: postgresql://user:pass@db:5432/mydb
      AUTH_SECRET: ${AUTH_SECRET}
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: mydb
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

## Vercel vs Self-Hosted

| Feature | Vercel | Self-Hosted |
|---------|--------|-------------|
| Deployment | Git push | Docker / Node.js server |
| Edge Functions | Native support | Limited (need edge runtime) |
| ISR | Automatic | Need `output: 'standalone'` |
| Image Optimization | Built-in (free tier limited) | Self-configured (sharp) |
| Analytics | Vercel Analytics | Custom (web-vitals + own backend) |
| Caching | Edge CDN automatic | Configure CDN manually |
| Server Actions | Zero config | Works in standalone mode |
| Cost | Free tier → paid scaling | Infrastructure costs |
| Preview Deployments | Automatic per PR | Manual CI/CD setup |

### Self-Hosted Checklist

- [ ] `output: 'standalone'` in next.config.js
- [ ] `sharp` installed for image optimization
- [ ] Reverse proxy (nginx/caddy) for HTTPS + compression
- [ ] CDN for static assets (`/_next/static/`)
- [ ] Process manager (PM2) or container orchestration
- [ ] Health check endpoint (`/api/health`)
- [ ] Environment variables configured in hosting platform
- [ ] Persistent storage for ISR cache (or disable ISR)

## Performance Configuration

### Bundle Analyzer

```js
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)
```

```bash
ANALYZE=true npm run build
```

### Security Headers

```js
// middleware.ts or next.config.js headers()
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]
```

### Font Optimization

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter', // CSS variable for Tailwind
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

```js
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', ...defaultTheme.fontFamily.sans],
      },
    },
  },
}
```
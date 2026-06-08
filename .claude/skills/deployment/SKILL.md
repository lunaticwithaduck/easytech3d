---
name: deployment
description: >
  This skill should be used when the user asks about "nginx", "Caddy", "web server
  config", "SPA routing", "try_files", "reverse proxy", "GitHub Actions", "GitLab CI",
  "CI/CD pipeline", "deployment pipeline", "Netlify", "Cloudflare Pages",
  "GitHub Pages", "PM2", "process manager", "Docker multi-stage", "Docker compose
  production", "zero-downtime deployment", "blue-green", "rolling deployment",
  "health check endpoint", "CDN config", "cache headers", "gzip", "Brotli", "TLS",
  "SSL certificate", "Let's Encrypt", or needs frontend infrastructure knowledge
  beyond Next.js-specific deployment. For Next.js-specific deployment (next.config.js,
  output standalone, ISR, env var loading), see the nextjs skill.
keywords:
  - nginx
  - Caddy
  - reverse proxy
  - web server
  - SPA routing
  - try_files
  - GitHub Actions
  - GitLab CI
  - CI/CD
  - deployment pipeline
  - Netlify
  - Cloudflare Pages
  - GitHub Pages
  - PM2
  - process manager
  - Docker multi-stage
  - Docker compose production
  - zero-downtime
  - blue-green deployment
  - rolling deployment
  - health check
  - CDN
  - cache headers
  - Brotli
  - TLS certificate
  - Let's Encrypt
---

# Deployment — Web Servers, CI/CD & Infrastructure

Frontend deployment infrastructure: web server configuration (nginx, Caddy), CI/CD pipelines (GitHub Actions, GitLab CI), hosting platforms, Docker patterns, and zero-downtime strategies. For Next.js-specific deployment, see `~/.claude/skills/nextjs/references/deployment-config.md`.

## Hosting Platform Decision Tree

```
Where to host?
├── Static site / SPA (no server-side rendering)?
│   ├── Git push → auto deploy, best free limits → Cloudflare Pages
│   ├── Need form handling, edge functions → Netlify
│   ├── Already in GitHub ecosystem, simple → GitHub Pages
│   └── Need preview deploys, analytics → Vercel
│
├── Node.js / SSR application?
│   ├── Next.js App Router → Vercel (zero config) or Docker self-hosted
│   ├── Remix, Astro SSR, Express → Fly.io, Railway, Render
│   └── Full control on VPS → nginx/Caddy + PM2 or Docker
│
├── Enterprise / existing infrastructure?
│   └── Docker → Kubernetes or Docker Swarm behind nginx/Caddy
│
└── Need CDN regardless of hosting?
    └── Cloudflare (free tier), AWS CloudFront, Fastly
```

## Platform Comparison

| Platform | Free Tier | SPA | SSR | Preview PRs | Custom Domain | Edge Functions |
|----------|-----------|-----|-----|------------|--------------|---------------|
| Vercel | 100GB BW | Yes | Yes | Yes | Yes | Yes |
| Netlify | 100GB BW | Yes | Limited | Yes | Yes | Yes |
| Cloudflare Pages | Unlimited BW | Yes | Via Workers | Yes | Yes | Via Workers |
| GitHub Pages | 1GB storage | Yes | No | No | Yes | No |
| Fly.io | $5 credit | Via static | Yes | Manual | Yes | No |
| Render | 750h/month | Yes | Yes | Yes | Yes | No |
| Railway | $5 credit | Yes | Yes | Manual | Yes | No |

## Web Server Decision Tree

```
Setting up a web server?
├── New project, want automatic HTTPS, simple config?
│   └── Caddy (automatic Let's Encrypt, minimal config)
├── Existing nginx expertise, need fine-grained control?
│   └── nginx (most documentation, widest adoption)
├── SPA routing (HTML5 history API)?
│   ├── nginx → try_files $uri $uri/ /index.html;
│   └── Caddy → try_files {path} /index.html
├── Reverse proxy to Node.js app?
│   ├── nginx → proxy_pass http://localhost:3000;
│   └── Caddy → reverse_proxy localhost:3000
└── Need HTTP/3 / QUIC?
    └── Caddy (native) or nginx (requires build flag)
```

## nginx SPA Quick Config

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/app/dist;

    # SPA routing — serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets — immutable cache (hashed filenames)
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API reverse proxy
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
}
```

## Caddy SPA Quick Config

```
example.com {
    root * /var/www/app/dist
    encode gzip
    try_files {path} /index.html
    file_server

    handle /api/* {
        reverse_proxy localhost:3000
    }

    header /assets/* Cache-Control "public, max-age=31536000, immutable"
}
```

## Zero-Downtime Strategy

| Strategy | Complexity | Downtime | Rollback Speed | Use When |
|----------|-----------|---------|---------------|---------|
| Rolling | Low | None | Slow (roll forward) | Stateless apps, multiple replicas |
| Blue-Green | Medium | None | Instant (switch back) | Any app, need instant rollback |
| Canary | High | None | Fast (route away) | High traffic, risk mitigation |
| Recreate | None | Yes (brief) | N/A | Dev/staging, single replica |

## CI/CD Pipeline Structure

| Phase | GitHub Actions | GitLab CI |
|-------|---------------|-----------|
| Install | `actions/setup-node` + `npm ci` | `image: node:20-alpine` + `npm ci` |
| Cache | `actions/cache` with `package-lock.json` hash | `cache: { key, paths }` |
| Lint | `npm run lint` | `npm run lint` (stage: test) |
| Test | `npm test -- --coverage` | `npm test -- --coverage` (stage: test) |
| Build | `npm run build` | `npm run build` (stage: build) |
| Deploy | Custom step or platform action | `environment:` + deploy script |
| Protect | `environment: production` (manual approval) | `when: manual` |

## Health Check Quick Reference

```tsx
// /api/health (Express / Node.js)
app.get('/api/health', async (req, res) => {
  const checks = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
    checks: {
      database: await checkDB(),  // { status: 'ok' } or { status: 'error', message }
      redis: await checkRedis(),
    },
  }
  const isHealthy = Object.values(checks.checks).every(c => c.status === 'ok')
  res.status(isHealthy ? 200 : 503).json(checks)
})
```

```dockerfile
# Docker health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1
```

## Common Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| No `try_files` for SPA | Direct URL access returns 404 | Add `try_files $uri $uri/ /index.html` |
| Caching `index.html` as immutable | Users never see updates | `Cache-Control: no-cache` for HTML, immutable only for hashed assets |
| Missing `COPY --chown` in Dockerfile | Permission errors at runtime | `COPY --chown=node:node` for app files |
| No health check in Docker Compose | `depends_on` doesn't wait for ready | Add `healthcheck` + `depends_on.condition: service_healthy` |
| Using `latest` Docker tag in production | Unpredictable deployments, no rollback | Pin semantic version tags (e.g., `app:1.2.3`) |
| Missing Brotli on nginx | Larger responses than necessary | Install `ngx_brotli` module or use Caddy (built-in) |
| Not pinning Node version in CI | Builds break on new Node release | Pin `node-version: '20.x'` in workflow |
| No SSL redirect | Mixed content warnings, insecure | Add HTTP → HTTPS redirect in nginx/Caddy |

## References

- `~/.claude/skills/deployment/references/web-servers.md` — nginx and Caddy full configurations, SSL, compression, security headers
- `~/.claude/skills/deployment/references/ci-cd-pipelines.md` — GitHub Actions and GitLab CI complete workflows, secrets, environments
- `~/.claude/skills/deployment/references/docker-patterns.md` — Multi-stage Dockerfiles, Docker Compose production, PM2, image optimization
- `~/.claude/skills/deployment/references/hosting-platforms.md` — Vercel, Netlify, Cloudflare Pages, GitHub Pages, CDN config, DNS
- `~/.claude/skills/deployment/examples/nginx-spa-config.md` — Production nginx config for SPA with API proxy and SSL
- `~/.claude/skills/deployment/examples/github-actions-deploy.md` — Complete CI/CD pipeline with Docker and environment protection
- `~/.claude/skills/deployment/examples/zero-downtime-docker.md` — Blue-green deployment with Docker Compose
- `~/.claude/skills/nextjs/references/deployment-config.md` — Next.js-specific deployment (existing, cross-reference)
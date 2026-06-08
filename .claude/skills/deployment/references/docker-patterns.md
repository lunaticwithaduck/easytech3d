# Docker Patterns for Frontend Apps

## Multi-Stage Dockerfile (Generic Node.js)

```dockerfile
# Dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production=false

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production (static SPA served by nginx)
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf (for the container)
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache hashed assets
    location ~* \.[0-9a-f]{8,}\.(js|css|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Don't cache HTML
    location ~* \.html$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
}
```

## Node.js SSR Dockerfile

```dockerfile
# Dockerfile (for SSR apps like Next.js standalone, Express, etc.)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

# Copy only production artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=deps /app/node_modules ./node_modules

USER appuser
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

## Image Size Optimization

| Technique | Impact | How |
|-----------|--------|-----|
| Alpine base | ~5MB vs ~350MB | `FROM node:20-alpine` |
| Multi-stage | Remove build deps | Separate deps/build/production stages |
| `.dockerignore` | Skip unnecessary files | Exclude node_modules, .git, tests |
| `npm ci --omit=dev` | Production deps only | In final stage if needed |
| Pruned copy | Only copy artifacts | `COPY --from=builder /app/dist ./dist` |

### .dockerignore

```
node_modules
.git
.gitignore
.env*
*.md
tests/
coverage/
.github/
.vscode/
docker-compose*.yml
Dockerfile
```

### Layer Ordering for Cache Efficiency

```dockerfile
# Good — package files change less often than source code
COPY package.json package-lock.json ./  # Layer 1: rarely changes
RUN npm ci                               # Layer 2: cached if lockfile unchanged
COPY . .                                 # Layer 3: changes on every build
RUN npm run build                        # Layer 4: always rebuilds
```

---

## Docker Compose — Production

```yaml
# docker-compose.yml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '1.0'
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      app:
        condition: service_healthy
    restart: unless-stopped
```

### Docker Compose with Database

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://app:secret@db:5432/appdb
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: appdb
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  pgdata:
```

---

## PM2 — Process Manager

### PM2 vs Docker Restart

| Feature | PM2 | Docker restart policy |
|---------|-----|----------------------|
| Process restart | Built-in | `restart: unless-stopped` |
| Cluster mode | `pm2 start -i max` | Multiple container replicas |
| Log management | `pm2 logs`, log rotation | Docker logging drivers |
| Zero-downtime reload | `pm2 reload` | Rolling update with health checks |
| Monitoring | `pm2 monit`, pm2.io | Docker stats, external tools |
| When to use | Bare metal / VM | Containerized environments |

### PM2 Ecosystem Config

```javascript
// ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'web-app',
      script: 'dist/server.js',
      instances: 'max',            // Cluster mode — one per CPU
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Restart policy
      max_restarts: 10,
      min_uptime: '5s',
      max_memory_restart: '500M',
      // Logging
      log_file: '/var/log/app/combined.log',
      error_file: '/var/log/app/error.log',
      out_file: '/var/log/app/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,
    },
  ],
}
```

```bash
# PM2 Commands
pm2 start ecosystem.config.cjs --env production
pm2 reload web-app            # Zero-downtime reload
pm2 stop web-app
pm2 delete web-app
pm2 logs web-app --lines 100  # View logs
pm2 monit                     # Real-time monitoring
pm2 save                      # Save process list
pm2 startup                   # Generate startup script
```

### PM2 in Docker (when needed)

```dockerfile
FROM node:20-alpine
RUN npm install -g pm2
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY ecosystem.config.cjs ./
EXPOSE 3000
CMD ["pm2-runtime", "ecosystem.config.cjs", "--env", "production"]
```

**Note:** `pm2-runtime` (not `pm2 start`) keeps the container alive. Generally prefer Docker's restart policy + health checks over PM2 inside Docker.

---

## Multi-Architecture Builds

```bash
# Build for both amd64 and arm64 (Apple Silicon, AWS Graviton)
docker buildx create --name multiarch --use
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag ghcr.io/user/app:latest \
  --push .
```

```yaml
# GitHub Actions multi-arch
- uses: docker/setup-qemu-action@v3
- uses: docker/setup-buildx-action@v3
- uses: docker/build-push-action@v5
  with:
    platforms: linux/amd64,linux/arm64
    push: true
    tags: ghcr.io/user/app:latest
```

---

## Tagging Strategy

| Tag | When | Example |
|-----|------|---------|
| `latest` | Every push to main | `app:latest` |
| Git SHA (short) | Every build | `app:a1b2c3d` |
| Semver | On release | `app:1.2.3`, `app:1.2`, `app:1` |
| Branch name | On push to branch | `app:develop` |
| `stable` | After production verification | Manual promotion |

```yaml
# Docker metadata action generates tags
- uses: docker/metadata-action@v5
  with:
    images: ghcr.io/user/app
    tags: |
      type=sha,prefix=
      type=ref,event=branch
      type=semver,pattern={{version}}
      type=semver,pattern={{major}}.{{minor}}
      type=raw,value=latest,enable={{is_default_branch}}
```

---

## Health Check Patterns

### HTTP Health Check in App

```tsx
// Express
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() })
})

// With dependency checks
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1')
    res.status(200).json({ status: 'ok', db: 'connected' })
  } catch {
    res.status(503).json({ status: 'degraded', db: 'disconnected' })
  }
})
```

### Docker Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=10s \
  CMD wget --spider -q http://localhost:3000/health || exit 1
```

### Docker Compose Health Check

```yaml
healthcheck:
  test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/health"]
  interval: 30s
  timeout: 5s
  retries: 3
  start_period: 10s
```

---

## Common Docker Commands

```bash
# Build
docker build -t app:latest .
docker build --no-cache -t app:latest .   # Force rebuild

# Run
docker run -d -p 3000:3000 --name app app:latest
docker run --env-file .env.production -p 3000:3000 app:latest

# Inspect
docker logs app --tail 100 -f
docker exec -it app sh
docker stats app

# Compose
docker compose up -d                       # Start detached
docker compose up -d --build               # Rebuild and start
docker compose down                        # Stop and remove
docker compose logs -f app                 # Follow logs
docker compose pull && docker compose up -d  # Update to latest images

# Cleanup
docker image prune -f                      # Remove dangling images
docker system prune -a --volumes           # Remove everything unused
```
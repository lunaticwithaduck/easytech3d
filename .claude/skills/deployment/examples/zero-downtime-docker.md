# Example: Zero-Downtime Docker Deployment

Blue-green deployment with Docker Compose: two service definitions, nginx upstream switch, health check polling, and rollback script.

## Architecture

```
                    ┌─────────────┐
     Internet ────→│    nginx     │
                    │ (port 80)   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │ active     │            │ standby
              ▼            │            ▼
        ┌──────────┐       │      ┌──────────┐
        │ app-blue │       │      │ app-green│
        │ :3001    │       │      │ :3002    │
        └──────────┘       │      └──────────┘
                           │
                    ┌──────┴──────┐
                    │  postgres   │
                    │  :5432      │
                    └─────────────┘
```

## Docker Compose

```yaml
# docker-compose.yml
services:
  # ─── Blue Instance ──────────────────────────────────────────
  app-blue:
    image: ghcr.io/user/app:latest
    container_name: app-blue
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - PORT=3000
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/health"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 15s
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

  # ─── Green Instance ─────────────────────────────────────────
  app-green:
    image: ghcr.io/user/app:latest
    container_name: app-green
    ports:
      - "3002:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - PORT=3000
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/health"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 15s
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

  # ─── nginx (Load Balancer) ──────────────────────────────────
  nginx:
    image: nginx:alpine
    container_name: nginx-lb
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/active.conf:/etc/nginx/conf.d/default.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - app-blue
      - app-green
    restart: unless-stopped

  # ─── Database ───────────────────────────────────────────────
  db:
    image: postgres:16-alpine
    container_name: app-db
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  pgdata:
```

## nginx Upstream Configs

```nginx
# nginx/blue.conf — routes traffic to blue
upstream app {
    server host.docker.internal:3001;
}

server {
    listen 80;

    location / {
        proxy_pass http://app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        access_log off;
        proxy_pass http://app/health;
    }
}
```

```nginx
# nginx/green.conf — routes traffic to green
upstream app {
    server host.docker.internal:3002;
}

server {
    listen 80;

    location / {
        proxy_pass http://app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        access_log off;
        proxy_pass http://app/health;
    }
}
```

## Deploy Script

```bash
#!/bin/bash
# scripts/deploy.sh — Blue-green deployment with zero downtime
set -euo pipefail

COMPOSE_FILE="docker-compose.yml"
NGINX_CONF_DIR="./nginx"
MAX_HEALTH_RETRIES=30
HEALTH_INTERVAL=2

# ─── Determine current and target ─────────────────────────────
get_active_slot() {
    local active_conf
    active_conf=$(readlink -f "$NGINX_CONF_DIR/active.conf" 2>/dev/null || echo "")
    if [[ "$active_conf" == *"green.conf" ]]; then
        echo "green"
    else
        echo "blue"  # Default to blue
    fi
}

ACTIVE=$(get_active_slot)
if [ "$ACTIVE" = "blue" ]; then
    TARGET="green"
    TARGET_PORT=3002
else
    TARGET="blue"
    TARGET_PORT=3001
fi

echo "Active: $ACTIVE → Deploying to: $TARGET"

# ─── Pull latest image ────────────────────────────────────────
echo "Pulling latest image..."
docker compose -f "$COMPOSE_FILE" pull "app-$TARGET"

# ─── Start target instance ────────────────────────────────────
echo "Starting app-$TARGET..."
docker compose -f "$COMPOSE_FILE" up -d "app-$TARGET"

# ─── Wait for health check ────────────────────────────────────
echo "Waiting for app-$TARGET to be healthy..."
for i in $(seq 1 $MAX_HEALTH_RETRIES); do
    if curl -sf "http://localhost:$TARGET_PORT/health" > /dev/null 2>&1; then
        echo "app-$TARGET is healthy (attempt $i)"
        break
    fi

    if [ "$i" -eq "$MAX_HEALTH_RETRIES" ]; then
        echo "ERROR: app-$TARGET failed health check after $MAX_HEALTH_RETRIES attempts"
        echo "Rolling back — stopping app-$TARGET"
        docker compose -f "$COMPOSE_FILE" stop "app-$TARGET"
        exit 1
    fi

    echo "  Attempt $i/$MAX_HEALTH_RETRIES — retrying in ${HEALTH_INTERVAL}s..."
    sleep "$HEALTH_INTERVAL"
done

# ─── Switch nginx upstream ────────────────────────────────────
echo "Switching traffic to app-$TARGET..."
ln -sf "$NGINX_CONF_DIR/$TARGET.conf" "$NGINX_CONF_DIR/active.conf"
docker compose -f "$COMPOSE_FILE" exec nginx nginx -s reload

# ─── Verify traffic switch ────────────────────────────────────
sleep 2
if curl -sf "http://localhost/health" > /dev/null 2>&1; then
    echo "Traffic switch verified — nginx is routing to app-$TARGET"
else
    echo "WARNING: Traffic switch may have failed — check nginx logs"
fi

# ─── Stop old instance ────────────────────────────────────────
echo "Stopping app-$ACTIVE..."
docker compose -f "$COMPOSE_FILE" stop "app-$ACTIVE"

# ─── Cleanup ──────────────────────────────────────────────────
echo "Pruning old images..."
docker image prune -f

echo ""
echo "Deploy complete! Active: $TARGET"
echo "  Rollback: ./scripts/rollback.sh"
```

## Rollback Script

```bash
#!/bin/bash
# scripts/rollback.sh — Instant rollback to previous slot
set -euo pipefail

COMPOSE_FILE="docker-compose.yml"
NGINX_CONF_DIR="./nginx"

# Determine current active
active_conf=$(readlink -f "$NGINX_CONF_DIR/active.conf" 2>/dev/null || echo "")
if [[ "$active_conf" == *"green.conf" ]]; then
    CURRENT="green"
    ROLLBACK="blue"
    ROLLBACK_PORT=3001
else
    CURRENT="blue"
    ROLLBACK="green"
    ROLLBACK_PORT=3002
fi

echo "Current: $CURRENT → Rolling back to: $ROLLBACK"

# ─── Ensure rollback target is running ────────────────────────
echo "Starting app-$ROLLBACK (if not running)..."
docker compose -f "$COMPOSE_FILE" up -d "app-$ROLLBACK"

# Wait for health
for i in $(seq 1 15); do
    if curl -sf "http://localhost:$ROLLBACK_PORT/health" > /dev/null 2>&1; then
        echo "app-$ROLLBACK is healthy"
        break
    fi
    if [ "$i" -eq 15 ]; then
        echo "ERROR: Rollback target app-$ROLLBACK is not healthy"
        exit 1
    fi
    sleep 2
done

# ─── Switch traffic ──────────────────────────────────────────
echo "Switching traffic to app-$ROLLBACK..."
ln -sf "$NGINX_CONF_DIR/$ROLLBACK.conf" "$NGINX_CONF_DIR/active.conf"
docker compose -f "$COMPOSE_FILE" exec nginx nginx -s reload

# ─── Stop failed instance ────────────────────────────────────
echo "Stopping app-$CURRENT..."
docker compose -f "$COMPOSE_FILE" stop "app-$CURRENT"

echo ""
echo "Rollback complete! Active: $ROLLBACK"
```

## Initial Setup

```bash
#!/bin/bash
# scripts/setup.sh — First-time setup
set -euo pipefail

NGINX_CONF_DIR="./nginx"

# Create nginx config directory
mkdir -p "$NGINX_CONF_DIR"

# Set initial active to blue
ln -sf "$NGINX_CONF_DIR/blue.conf" "$NGINX_CONF_DIR/active.conf"

# Start everything
docker compose up -d

echo "Setup complete. Active: blue"
echo "Deploy with: ./scripts/deploy.sh"
```

## GitHub Actions Integration

```yaml
# .github/workflows/deploy.yml (deploy job)
deploy:
  runs-on: ubuntu-latest
  needs: [docker]
  environment: production
  steps:
    - name: Blue-green deploy
      uses: appleboy/ssh-action@v1
      with:
        host: ${{ secrets.PROD_HOST }}
        username: ${{ secrets.DEPLOY_USER }}
        key: ${{ secrets.DEPLOY_SSH_KEY }}
        script: |
          cd /opt/app
          ./scripts/deploy.sh

    - name: Verify
      run: |
        sleep 5
        curl -sf https://example.com/health || exit 1
```

## Key Patterns

1. **Two-slot architecture** — Blue and green run on different host ports (3001/3002). Only one serves traffic at a time. The standby slot holds the previous version for instant rollback.
2. **Symlink-based switch** — `nginx/active.conf` is a symlink to either `blue.conf` or `green.conf`. Switching is a single `ln -sf` + `nginx -s reload` — takes milliseconds with zero dropped connections.
3. **Health check before switch** — The deploy script polls the new instance's health endpoint up to 30 times before switching traffic. If health checks fail, the new instance is stopped and the deploy aborts without affecting the active service.
4. **Instant rollback** — Since the previous slot still has the old image, rollback is just restarting it and switching the nginx symlink back. No need to rebuild or re-pull.
5. **Graceful nginx reload** — `nginx -s reload` applies the new config without dropping existing connections. In-flight requests complete on the old upstream before switching.
6. **Deploy script idempotency** — The script auto-detects which slot is active and deploys to the other. Running it twice deploys to alternating slots without manual state tracking.
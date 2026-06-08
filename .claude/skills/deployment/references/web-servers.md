# Web Servers — nginx & Caddy

## nginx

### SPA Routing (React/Vue/Angular)

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/app/dist;
    index index.html;

    # SPA fallback — serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Full Production Config

```nginx
# /etc/nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_min_length 1024;
    gzip_comp_level 5;
    gzip_types
        text/plain
        text/css
        text/javascript
        application/javascript
        application/json
        application/xml
        image/svg+xml
        font/woff2;

    # Brotli (requires ngx_brotli module)
    # brotli on;
    # brotli_comp_level 6;
    # brotli_types text/plain text/css application/javascript application/json image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;

    include /etc/nginx/conf.d/*.conf;
}
```

### Site Config with API Proxy

```nginx
# /etc/nginx/conf.d/app.conf
upstream api_backend {
    server 127.0.0.1:3001;
    keepalive 32;
}

server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;
    root /var/www/app/dist;
    index index.html;

    # SSL/TLS
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # Content Security Policy (adjust per app)
    # add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';" always;

    # Hashed static assets — cache aggressively
    location ~* \.(?:js|css|woff2?|ttf|eot)$ {
        # Files with content hash in filename (e.g., app.a1b2c3.js)
        if ($uri ~* "\.[0-9a-f]{8,}\." ) {
            add_header Cache-Control "public, max-age=31536000, immutable";
        }
        # Files without hash — short cache
        add_header Cache-Control "public, max-age=3600";
        try_files $uri =404;
    }

    # Images & media — long cache
    location ~* \.(?:jpg|jpeg|png|gif|ico|svg|webp|avif|mp4|webm)$ {
        add_header Cache-Control "public, max-age=2592000"; # 30 days
        try_files $uri =404;
    }

    # API reverse proxy
    location /api/ {
        limit_req zone=api burst=20 nodelay;

        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";

        # Timeouts
        proxy_connect_timeout 5s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # WebSocket proxy
    location /ws {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400s; # Keep WS alive for 24h
    }

    # SPA fallback (must be last)
    location / {
        limit_req zone=general burst=10 nodelay;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        try_files $uri $uri/ /index.html;
    }

    # Block dotfiles
    location ~ /\. {
        deny all;
        return 404;
    }
}
```

### SSL with Let's Encrypt (Certbot)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate (auto-configures nginx)
sudo certbot --nginx -d example.com -d www.example.com

# Auto-renewal (certbot adds a systemd timer or cron automatically)
sudo certbot renew --dry-run
```

### Common nginx Directives

| Directive | Purpose | Example |
|-----------|---------|---------|
| `try_files` | Try paths in order, fallback to last | `try_files $uri $uri/ /index.html` |
| `proxy_pass` | Forward to upstream | `proxy_pass http://localhost:3001` |
| `add_header` | Set response header | `add_header X-Frame-Options SAMEORIGIN` |
| `limit_req` | Rate limit requests | `limit_req zone=api burst=20 nodelay` |
| `gzip_types` | MIME types to compress | Include JS, CSS, JSON, SVG |
| `ssl_protocols` | Allowed TLS versions | `TLSv1.2 TLSv1.3` |
| `client_max_body_size` | Max upload size | `client_max_body_size 10m` |
| `proxy_set_header` | Set header for upstream | `X-Real-IP $remote_addr` |

### Testing nginx Config

```bash
# Test syntax
sudo nginx -t

# Reload without downtime
sudo nginx -s reload

# View access logs
sudo tail -f /var/log/nginx/access.log

# View error logs
sudo tail -f /var/log/nginx/error.log
```

---

## Caddy

### SPA Routing

```
# Caddyfile
example.com {
    root * /var/www/app/dist
    try_files {path} /index.html
    file_server
}
```

**Note:** Caddy automatically provisions and renews SSL certificates via Let's Encrypt. No manual SSL config needed.

### Full Production Config

```
# /etc/caddy/Caddyfile

example.com {
    root * /var/www/app/dist

    # Compression (enabled by default in Caddy, but explicit config)
    encode gzip zstd

    # Security headers
    header {
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
        Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
        -Server  # Remove Server header
    }

    # Hashed static assets — immutable cache
    @hashedAssets path_regexp hash \.[0-9a-f]{8,}\.(js|css|woff2?)$
    header @hashedAssets Cache-Control "public, max-age=31536000, immutable"

    # Images — long cache
    @images path *.jpg *.jpeg *.png *.gif *.svg *.webp *.avif *.ico
    header @images Cache-Control "public, max-age=2592000"

    # HTML — no cache
    @html path *.html /
    header @html Cache-Control "no-cache, no-store, must-revalidate"

    # API reverse proxy
    handle /api/* {
        reverse_proxy localhost:3001 {
            header_up X-Real-IP {remote_host}
            header_up X-Forwarded-For {remote_host}
            header_up X-Forwarded-Proto {scheme}
        }
    }

    # WebSocket proxy
    handle /ws {
        reverse_proxy localhost:3001
    }

    # Rate limiting (requires caddy-ratelimit plugin)
    # rate_limit {remote.ip} 10r/s

    # SPA fallback
    handle {
        try_files {path} /index.html
        file_server
    }

    # Logging
    log {
        output file /var/log/caddy/access.log
        format json
    }
}

# Redirect www to non-www
www.example.com {
    redir https://example.com{uri} permanent
}
```

### Caddy with Docker (Reverse Proxy)

```
# Caddyfile for Docker Compose
:80 {
    # Frontend
    handle {
        reverse_proxy frontend:3000
    }

    # API
    handle /api/* {
        reverse_proxy api:3001
    }
}
```

### Caddy Commands

```bash
# Validate config
caddy validate --config /etc/caddy/Caddyfile

# Reload without downtime
caddy reload --config /etc/caddy/Caddyfile

# Format Caddyfile
caddy fmt --overwrite /etc/caddy/Caddyfile

# Run in foreground (dev)
caddy run --config Caddyfile

# List certificates
caddy list-modules | grep tls
```

---

## nginx vs Caddy Comparison

| Feature | nginx | Caddy |
|---------|-------|-------|
| SSL/TLS | Manual (certbot) | Automatic (built-in ACME) |
| Config syntax | Custom directives | Simple, readable Caddyfile |
| Config reload | `nginx -s reload` | `caddy reload` |
| Compression | gzip built-in, Brotli via module | gzip + zstd built-in |
| HTTP/2 | Yes (with SSL) | Yes (automatic) |
| HTTP/3 (QUIC) | Experimental | Built-in |
| Performance | Slightly higher throughput | Comparable for most apps |
| Rate limiting | Built-in (`limit_req`) | Plugin required |
| WebSocket proxy | Manual upgrade headers | Automatic detection |
| Community | Massive, battle-tested | Growing, modern |
| When to use | High-traffic, complex routing | Quick setup, auto-SSL |

### Decision Guide

```
Choose nginx when:
├── High traffic (>10k req/s)
├── Complex routing rules
├── Team already knows nginx
├── Need rate limiting built-in
└── Enterprise with existing nginx infrastructure

Choose Caddy when:
├── Want automatic HTTPS with zero config
├── Simpler config is priority
├── HTTP/3 support needed
├── Quick prototyping or small-medium apps
└── Don't want to manage certbot/cron
```

---

## Common Patterns

### Serving Pre-compressed Files

```nginx
# nginx — serve .br or .gz if pre-compressed files exist
location ~* \.(js|css|svg)$ {
    gzip_static on;  # Serve .gz if available
    # brotli_static on;  # Serve .br if available (with ngx_brotli)
}
```

```
# Caddy — automatic with encode
encode {
    gzip
    zstd
}
```

### Custom Error Pages

```nginx
# nginx
error_page 404 /404.html;
error_page 500 502 503 504 /50x.html;
location = /50x.html {
    root /var/www/error-pages;
    internal;
}
```

```
# Caddy
handle_errors {
    @404 expression {err.status_code} == 404
    handle @404 {
        rewrite * /404.html
        file_server
    }
}
```

### Health Check Endpoint

```nginx
# nginx — simple health check
location /health {
    access_log off;
    return 200 'OK';
    add_header Content-Type text/plain;
}
```

```
# Caddy
handle /health {
    respond "OK" 200
}
```

### Multiple SPAs on Subpaths

```nginx
# nginx — two SPAs under one domain
location /admin {
    alias /var/www/admin-app/dist;
    try_files $uri $uri/ /admin/index.html;
}

location / {
    root /var/www/main-app/dist;
    try_files $uri $uri/ /index.html;
}
```
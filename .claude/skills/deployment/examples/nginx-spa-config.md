# Example: Production nginx SPA Config

Full production nginx configuration for a React/Vue/Angular SPA with API reverse proxy, compression, split cache headers, security headers, SSL/TLS, and rate limiting.

## Complete nginx.conf

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
                    '"$http_user_agent" rt=$request_time';
    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10m;

    # ─── Gzip Compression ─────────────────────────────────────
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
        application/xml+rss
        image/svg+xml
        font/woff2;

    # ─── Rate Limiting Zones ──────────────────────────────────
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/s;

    # ─── Upstream (API Backend) ───────────────────────────────
    upstream api_backend {
        server 127.0.0.1:3001;
        keepalive 32;
    }

    # ─── HTTP → HTTPS Redirect ────────────────────────────────
    server {
        listen 80;
        server_name example.com www.example.com;

        # Let's Encrypt challenge
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$host$request_uri;
        }
    }

    # ─── www → non-www Redirect ───────────────────────────────
    server {
        listen 443 ssl http2;
        server_name www.example.com;

        ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

        return 301 https://example.com$request_uri;
    }

    # ─── Main Application Server ─────────────────────────────
    server {
        listen 443 ssl http2;
        server_name example.com;
        root /var/www/app/dist;
        index index.html;

        # ─── SSL/TLS ─────────────────────────────────────────
        ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 1d;
        ssl_session_tickets off;

        # OCSP Stapling
        ssl_stapling on;
        ssl_stapling_verify on;
        resolver 1.1.1.1 8.8.8.8 valid=300s;

        # ─── Security Headers ────────────────────────────────
        add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

        # ─── Hashed Static Assets (immutable cache) ──────────
        # Matches filenames like: app.a1b2c3d4.js, style.5f6g7h8i.css
        location ~* \.[0-9a-f]{8,}\.(js|css|woff2?|ttf|eot)$ {
            add_header Cache-Control "public, max-age=31536000, immutable";
            add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
            access_log off;
            try_files $uri =404;
        }

        # ─── Images & Media (long cache) ─────────────────────
        location ~* \.(?:jpg|jpeg|png|gif|ico|svg|webp|avif|mp4|webm|woff2?)$ {
            add_header Cache-Control "public, max-age=2592000"; # 30 days
            add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
            access_log off;
            try_files $uri =404;
        }

        # ─── Service Worker (never cache) ────────────────────
        location = /sw.js {
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
            try_files $uri =404;
        }

        # ─── API Reverse Proxy ───────────────────────────────
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

            # Buffer settings
            proxy_buffering on;
            proxy_buffer_size 4k;
            proxy_buffers 8 4k;
        }

        # ─── Auth Rate Limiting (stricter) ───────────────────
        location /api/auth/ {
            limit_req zone=auth burst=5 nodelay;

            proxy_pass http://api_backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Connection "";
        }

        # ─── WebSocket Proxy ─────────────────────────────────
        location /ws {
            proxy_pass http://api_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_read_timeout 86400s;
            proxy_send_timeout 86400s;
        }

        # ─── Health Check (for load balancers) ───────────────
        location /health {
            access_log off;
            return 200 'OK';
            add_header Content-Type text/plain;
        }

        # ─── SPA Fallback (must be last) ─────────────────────
        location / {
            limit_req zone=general burst=10 nodelay;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
            try_files $uri $uri/ /index.html;
        }

        # ─── Block Hidden Files ──────────────────────────────
        location ~ /\. {
            deny all;
            return 404;
        }

        # ─── Custom Error Pages ──────────────────────────────
        error_page 502 503 504 /50x.html;
        location = /50x.html {
            root /usr/share/nginx/html;
            internal;
        }
    }
}
```

## Docker Version (nginx Container)

```nginx
# nginx.conf — for Docker container serving SPA
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;

    # Hashed assets — immutable
    location ~* \.[0-9a-f]{8,}\.(js|css|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # HTML — no cache
    location ~* \.html$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check
    location /health {
        access_log off;
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
```

## Key Patterns

1. **Split cache headers** — Hashed assets (`app.a1b2c3.js`) get `immutable` + 1 year max-age. HTML gets `no-cache` so the browser always fetches the latest, which references the correct hashed assets. Service worker file (`sw.js`) is always revalidated.
2. **Rate limiting zones** — Three zones with different rates: general (10r/s for pages), API (30r/s for data), auth (5r/s for login/register). `burst` allows short spikes, `nodelay` processes burst immediately.
3. **Proxy headers** — `X-Real-IP` and `X-Forwarded-For` pass the client IP through the proxy. `X-Forwarded-Proto` tells the backend whether the original request was HTTPS. `Connection ""` enables keepalive to upstream.
4. **WebSocket upgrade** — Separate location with `Upgrade` and `Connection "upgrade"` headers. Long `proxy_read_timeout` (24h) prevents nginx from closing idle WS connections.
5. **SSL hardening** — TLSv1.2+ only, modern cipher suite, HSTS with preload, OCSP stapling, session tickets disabled. Let's Encrypt provides free certificates with auto-renewal.
6. **SPA `try_files` order** — `$uri` first (exact file match), then `$uri/` (directory), then `/index.html` (SPA fallback). This ensures static assets are served directly while all routes fall through to the SPA.
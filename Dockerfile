# Build: docker build --build-arg NEXT_PUBLIC_SITE_URL=... -t easytech3d-web .
#
# Railway passes service variables as --build-arg only for ARGs declared here, so every
# NEXT_PUBLIC_* var must be listed below to be inlined by `next build`.

# ---------- build ----------
FROM node:22-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_MEDIA_HOST
COPY . .
RUN pnpm build

# ---------- runner ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup -S app && adduser -S app -G app

# Standalone output bundles only the minimal runtime + required deps.
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static

USER app
EXPOSE 3000
# HOSTNAME must be set here, not via ENV: Docker overwrites HOSTNAME with the container name at
# runtime, and Next standalone would bind to that instead of 0.0.0.0.
CMD ["sh", "-c", "HOSTNAME=0.0.0.0 exec node server.js"]

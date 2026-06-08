# Example: GitHub Actions CI/CD Pipeline

Complete deployment pipeline: lint + type check + test + build, Docker push to GHCR, SSH deploy to production, PR preview to Vercel, environment protection, and failure notifications.

## Main Deploy Pipeline

```yaml
# .github/workflows/deploy.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}

env:
  NODE_VERSION: '20'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # ─── Quality Checks ─────────────────────────────────────────
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - run: npm ci

      - name: ESLint
        run: npm run lint

      - name: TypeScript
        run: npm run typecheck

  # ─── Tests ───────────────────────────────────────────────────
  test:
    name: Unit & Integration Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - run: npm ci

      - name: Run tests
        run: npm test -- --coverage --ci

      - name: Upload coverage
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage
          path: coverage/
          retention-days: 7

  # ─── Build ───────────────────────────────────────────────────
  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - run: npm ci

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ vars.API_URL }}
          NEXT_PUBLIC_SENTRY_DSN: ${{ vars.SENTRY_DSN }}

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: dist/
          retention-days: 1

  # ─── Docker Build & Push ─────────────────────────────────────
  docker:
    name: Docker Build & Push
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    permissions:
      contents: read
      packages: write
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-buildx-action@v3

      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Docker metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=sha,prefix=
            type=ref,event=branch
            type=raw,value=latest,enable=${{ github.ref == 'refs/heads/main' }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            NODE_ENV=production

  # ─── Deploy Staging ──────────────────────────────────────────
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [docker]
    if: github.ref == 'refs/heads/develop'
    environment:
      name: staging
      url: https://staging.example.com
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_SSH_KEY }}
          script: |
            cd /opt/app
            docker compose pull app
            docker compose up -d app --remove-orphans
            docker image prune -f

      - name: Verify staging
        run: |
          for i in {1..10}; do
            if curl -sf https://staging.example.com/health; then
              echo "Staging is healthy"
              exit 0
            fi
            echo "Attempt $i failed, retrying..."
            sleep 5
          done
          echo "Staging health check failed"
          exit 1

  # ─── Deploy Production ──────────────────────────────────────
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [docker]
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://example.com
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_SSH_KEY }}
          script: |
            cd /opt/app
            # Pull new image
            docker compose pull app
            # Rolling restart with health check
            docker compose up -d app --remove-orphans --wait
            # Cleanup old images
            docker image prune -f

      - name: Verify production
        run: |
          sleep 10
          HTTP_STATUS=$(curl -so /dev/null -w "%{http_code}" https://example.com/health)
          if [ "$HTTP_STATUS" != "200" ]; then
            echo "Health check failed with status $HTTP_STATUS"
            exit 1
          fi
          echo "Production is healthy (HTTP $HTTP_STATUS)"

      - name: Notify success
        if: success()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Deployed to production",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Deployed to production*\nCommit: `${{ github.sha }}`\nBy: ${{ github.actor }}\n<${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View run>"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}

      - name: Notify failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Production deploy FAILED! <${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View run>"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

## PR Preview Deploy

```yaml
# .github/workflows/preview.yml
name: Preview

on:
  pull_request:
    types: [opened, synchronize, reopened]

concurrency:
  group: preview-${{ github.event.pull_request.number }}
  cancel-in-progress: true

jobs:
  preview:
    name: Deploy Preview
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        id: vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Comment PR
        uses: actions/github-script@v7
        with:
          script: |
            const body = `### Preview Deployment

            | Status | URL |
            |--------|-----|
            | Ready | ${{ steps.vercel.outputs.preview-url }} |

            Commit: \`${{ github.event.pull_request.head.sha }}\``

            // Find existing comment
            const { data: comments } = await github.rest.issues.listComments({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
            })
            const existing = comments.find(c => c.body.includes('### Preview Deployment'))

            if (existing) {
              await github.rest.issues.updateComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                comment_id: existing.id,
                body,
              })
            } else {
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body,
              })
            }
```

## E2E Tests on Preview

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  deployment_status:

jobs:
  e2e:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npx playwright install --with-deps chromium

      - name: Run Playwright tests
        run: npx playwright test
        env:
          BASE_URL: ${{ github.event.deployment_status.target_url }}

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

## Required Secrets

```
Repository Secrets:
├── DEPLOY_SSH_KEY          — SSH private key for server access
├── SLACK_WEBHOOK           — Slack incoming webhook URL
├── VERCEL_TOKEN            — Vercel API token
├── VERCEL_ORG_ID           — Vercel organization ID
├── VERCEL_PROJECT_ID       — Vercel project ID
│
├── Staging Environment:
│   └── STAGING_HOST        — Staging server IP/hostname
│
└── Production Environment:
    ├── PROD_HOST           — Production server IP/hostname
    └── DEPLOY_USER         — SSH username

Repository Variables (non-secret):
├── API_URL                 — Public API URL
└── SENTRY_DSN              — Sentry DSN (public)
```

## Key Patterns

1. **Parallel quality gates** — Lint and test jobs run in parallel (`needs` not specified between them). Build waits for both to pass before starting.
2. **Concurrency groups** — `cancel-in-progress` cancels outdated runs on the same branch, but is disabled for `main` to ensure production deploys complete.
3. **Environment protection** — The `production` environment in GitHub Settings requires manual approval and restricts to `main` branch only. Staging auto-deploys from `develop`.
4. **Health check verification** — After deploy, the pipeline polls the health endpoint with retries. If the check fails, the workflow fails and triggers the failure notification.
5. **PR preview updates** — The preview comment is updated in-place (not duplicated) by searching for existing comments with the matching header.
6. **Docker layer caching** — `cache-from: type=gha` + `cache-to: type=gha,mode=max` uses GitHub Actions cache backend for Docker build layers, dramatically speeding up rebuilds.
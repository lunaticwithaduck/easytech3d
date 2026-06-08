# CI/CD Pipelines

## GitHub Actions

### Complete Frontend Deploy Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '20'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # ─── Lint & Type Check ───────────────────────────────────────
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - run: npm ci

      - run: npm run lint
      - run: npm run typecheck

  # ─── Test ────────────────────────────────────────────────────
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - run: npm ci
      - run: npm test -- --coverage

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage-report
          path: coverage/
          retention-days: 7

  # ─── Build ───────────────────────────────────────────────────
  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - run: npm ci
      - run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ vars.API_URL }}

      - uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: dist/
          retention-days: 1

  # ─── Docker Build & Push ─────────────────────────────────────
  docker:
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/main'
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: docker/metadata-action@v5
        id: meta
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=sha,prefix=
            type=raw,value=latest

      - uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # ─── Deploy to Production ───────────────────────────────────
  deploy:
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
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_SSH_KEY }}
          script: |
            cd /opt/app
            docker compose pull
            docker compose up -d --remove-orphans
            docker image prune -f

      - name: Verify deployment
        run: |
          sleep 10
          curl -sf https://example.com/health || exit 1

      - name: Notify on failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {"text": "Deploy failed: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"}
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### PR Preview Deploy (Vercel)

```yaml
# .github/workflows/preview.yml
name: Preview

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  preview:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    steps:
      - uses: actions/checkout@v4

      - uses: amondnet/vercel-action@v25
        id: vercel
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./

      - name: Comment PR with preview URL
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: `Preview deployed: ${{ steps.vercel.outputs.preview-url }}`
            })
```

### E2E Tests with Playwright

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  pull_request:
    branches: [main]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npx playwright install --with-deps chromium

      - run: npm run build
      - run: npx playwright test

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

### Matrix Testing

```yaml
# Test across multiple Node versions / OS
jobs:
  test:
    strategy:
      matrix:
        node-version: [18, 20, 22]
        os: [ubuntu-latest, macos-latest]
      fail-fast: false
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm test
```

### Monorepo Path Filters

```yaml
# Only run when relevant files change
on:
  push:
    paths:
      - 'apps/web/**'
      - 'packages/ui/**'
      - 'package-lock.json'
    paths-ignore:
      - '**.md'
      - '.github/ISSUE_TEMPLATE/**'
```

---

## GitLab CI

### Complete Pipeline

```yaml
# .gitlab-ci.yml
stages:
  - validate
  - test
  - build
  - deploy

variables:
  NODE_VERSION: '20'

default:
  image: node:${NODE_VERSION}-alpine
  cache:
    key:
      files:
        - package-lock.json
    paths:
      - node_modules/
    policy: pull

# ─── Install ──────────────────────────────────────────────────
install:
  stage: .pre
  script:
    - npm ci
  cache:
    key:
      files:
        - package-lock.json
    paths:
      - node_modules/
    policy: pull-push

# ─── Validate ─────────────────────────────────────────────────
lint:
  stage: validate
  script:
    - npm run lint
    - npm run typecheck

# ─── Test ──────────────────────────────────────────────────────
test:
  stage: test
  script:
    - npm test -- --coverage
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

# ─── Build ─────────────────────────────────────────────────────
build:
  stage: build
  script:
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 day

# ─── Deploy ───────────────────────────────────────────────────
deploy:staging:
  stage: deploy
  environment:
    name: staging
    url: https://staging.example.com
  script:
    - echo "Deploy to staging..."
  rules:
    - if: $CI_COMMIT_BRANCH == "develop"

deploy:production:
  stage: deploy
  environment:
    name: production
    url: https://example.com
  script:
    - echo "Deploy to production..."
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
  when: manual  # Require manual approval
```

---

## Secrets Management

### GitHub Actions Secrets

```yaml
# Access in workflow
env:
  API_KEY: ${{ secrets.API_KEY }}        # Repository secret
  DB_URL: ${{ secrets.DB_URL }}          # Repository secret
  API_URL: ${{ vars.API_URL }}           # Repository variable (non-sensitive)

# Environment-specific secrets
jobs:
  deploy:
    environment: production              # Uses production environment secrets
    steps:
      - run: echo "${{ secrets.PROD_API_KEY }}"
```

### Environment Protection Rules

```
GitHub Settings → Environments → production:
├── Required reviewers: team-lead, devops
├── Wait timer: 5 minutes
├── Deployment branches: main only
└── Environment secrets: DEPLOY_SSH_KEY, PROD_DB_URL
```

### Never Commit Secrets

```yaml
# .github/workflows/secret-scan.yml
name: Secret Scan
on: [push, pull_request]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Branch Strategy

### Trunk-Based (Recommended for Small Teams)

```
main ──────●──────●──────●──────●──── (always deployable)
            \    /        \    /
             feat-1        feat-2     (short-lived, <1 day)
```

```yaml
# Deploy on every push to main
on:
  push:
    branches: [main]
```

### Git Flow (Larger Teams)

```
main ──────────────●──────────────── (releases only)
                  /
develop ──●──●──●──────●──●──────── (integration)
           \  /          \  /
            feat-1        feat-2
```

```yaml
# Deploy staging on develop, production on main
on:
  push:
    branches: [main, develop]

jobs:
  deploy:
    steps:
      - name: Deploy
        run: |
          if [ "${{ github.ref }}" = "refs/heads/main" ]; then
            echo "Deploying to production"
          else
            echo "Deploying to staging"
          fi
```

---

## Caching Strategies

### npm Cache

```yaml
# GitHub Actions — built-in cache
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'  # Automatically caches ~/.npm
```

### Docker Layer Cache

```yaml
# GitHub Actions — GHA cache backend
- uses: docker/build-push-action@v5
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

### Build Output Cache

```yaml
# Cache build output for deploy job
- uses: actions/cache@v4
  with:
    path: dist/
    key: build-${{ github.sha }}
    restore-keys: build-
```

---

## Workflow Patterns

### Reusable Workflows

```yaml
# .github/workflows/reusable-build.yml
name: Reusable Build
on:
  workflow_call:
    inputs:
      node-version:
        type: string
        default: '20'
    secrets:
      NPM_TOKEN:
        required: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm run build
```

```yaml
# .github/workflows/deploy.yml — call reusable workflow
jobs:
  build:
    uses: ./.github/workflows/reusable-build.yml
    with:
      node-version: '20'
    secrets: inherit
```

### Conditional Steps

```yaml
steps:
  # Only on main branch
  - if: github.ref == 'refs/heads/main'
    run: npm run deploy

  # Only on PRs
  - if: github.event_name == 'pull_request'
    run: npm run preview

  # Only when specific files changed
  - uses: dorny/paths-filter@v3
    id: changes
    with:
      filters: |
        frontend:
          - 'apps/web/**'
        api:
          - 'apps/api/**'

  - if: steps.changes.outputs.frontend == 'true'
    run: npm run build:web
```

### Scheduled Workflows

```yaml
on:
  schedule:
    - cron: '0 6 * * 1'  # Every Monday at 6am UTC

jobs:
  dependency-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --production
```

---

## GitHub Actions vs GitLab CI

| Feature | GitHub Actions | GitLab CI |
|---------|---------------|-----------|
| Config file | `.github/workflows/*.yml` | `.gitlab-ci.yml` |
| Runner | GitHub-hosted or self-hosted | GitLab-hosted or self-hosted |
| Caching | `actions/cache` or setup-node cache | `cache:` directive with policies |
| Artifacts | `actions/upload-artifact` | `artifacts:` directive |
| Environments | Environment protection rules | Environment + approval gates |
| Secrets | Repository / Environment secrets | CI/CD Variables (protected, masked) |
| Matrix builds | `strategy.matrix` | `parallel:matrix` |
| Reusable | `workflow_call` | `include:` templates |
| Container registry | GHCR (ghcr.io) | GitLab Container Registry |
| Free tier | 2000 min/month (public unlimited) | 400 min/month |
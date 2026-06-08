---
name: devops
description: This skill should be used when the user asks about "AWS", "GCP", "Azure", "cloud", "Terraform", "Kubernetes", "K8s", "Docker compose", "monitoring", "Sentry", "Datadog", "logging", "infrastructure", "load balancer", "auto-scaling", "secrets management", "environment variables", "cloud architecture", or needs DevOps and infrastructure knowledge.
keywords:
  - AWS
  - GCP
  - Azure
  - cloud
  - Terraform
  - Kubernetes
  - K8s
  - Docker compose
  - monitoring
  - Sentry
  - Datadog
  - logging
  - infrastructure
  - load balancer
  - auto-scaling
  - secrets management
  - environment variables
  - cloud architecture
---

# DevOps & Infrastructure

Infrastructure-layer skill covering cloud providers, containerization, orchestration, monitoring, logging, secrets management, and CI/CD pipelines. Focuses on practical production patterns.

## Cloud Provider Comparison

| Service | AWS | GCP | Azure |
|---------|-----|-----|-------|
| Compute (VM) | EC2 | Compute Engine | Virtual Machines |
| Containers | ECS / EKS | Cloud Run / GKE | ACI / AKS |
| Serverless | Lambda | Cloud Functions | Functions |
| Object Storage | S3 | Cloud Storage | Blob Storage |
| Database (SQL) | RDS / Aurora | Cloud SQL / AlloyDB | Azure SQL |
| Database (NoSQL) | DynamoDB | Firestore | Cosmos DB |
| CDN | CloudFront | Cloud CDN | Front Door |
| DNS | Route 53 | Cloud DNS | Azure DNS |
| Secrets | Secrets Manager | Secret Manager | Key Vault |
| Queues | SQS | Pub/Sub | Service Bus |
| Auth | Cognito | Identity Platform | AD B2C |

### Cloud Decision Tree

```
What's your scale and team?
├── Startup / small team
│   ├── Want managed everything? → Vercel / Railway / Render
│   ├── Need more control? → AWS (most tutorials, largest community)
│   └── Already Google ecosystem? → GCP
│
├── Enterprise / compliance-heavy
│   ├── Microsoft ecosystem? → Azure
│   ├── Need broadest service catalog? → AWS
│   └── Data/ML focused? → GCP
│
└── For this project specifically
    ├── Static site / Jamstack → Vercel / Cloudflare Pages
    ├── Containers → Cloud Run (GCP) / ECS Fargate (AWS)
    ├── Kubernetes needed → EKS (AWS) / GKE (GCP)
    └── Serverless functions → Lambda (AWS) / Cloud Functions (GCP)
```

## Docker Patterns

### Multi-Stage Build

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

USER appuser
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

**Dockerfile Best Practices:**
- Use multi-stage builds (smaller images, no dev dependencies)
- Run as non-root user
- Use `.dockerignore` (node_modules, .git, .env)
- Pin base image versions (`node:20.11-alpine`, not `node:latest`)
- Order layers by change frequency (dependencies before source code)
- Use `npm ci` instead of `npm install`

### Docker Compose for Development

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports: ["3000:3000"]
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      db: { condition: service_healthy }
      redis: { condition: service_started }

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_PASSWORD: postgres
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports: ["5432:5432"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

volumes:
  pgdata:
```

## Terraform Basics

### Structure

```
infrastructure/
  main.tf          # Provider config, backend
  variables.tf     # Input variables
  outputs.tf       # Output values
  modules/
    vpc/           # Reusable VPC module
    ecs/           # Reusable ECS module
```

### Example: AWS ECS Service

```hcl
# main.tf
terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
  backend "s3" {
    bucket = "my-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" { region = var.aws_region }

resource "aws_ecs_service" "app" {
  name            = "my-app"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.instance_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = var.private_subnets
    security_groups = [aws_security_group.app.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "app"
    container_port   = 3000
  }
}
```

**Terraform Rules:**
- Always use remote state (S3, GCS) with state locking
- Use modules for reusable infrastructure patterns
- Run `terraform plan` before every `apply`
- Version-pin providers
- Use workspaces or separate directories for environments
- Never store secrets in Terraform state — use secret manager references

## Kubernetes Essentials

### Core Resources

| Resource | Purpose | Example |
|----------|---------|---------|
| Pod | Smallest deployable unit (1+ containers) | Single container instance |
| Deployment | Manages pod replicas, rolling updates | Web server with 3 replicas |
| Service | Stable network endpoint for pods | ClusterIP, LoadBalancer |
| Ingress | HTTP routing and TLS termination | Host/path-based routing |
| ConfigMap | Non-sensitive configuration | App settings |
| Secret | Sensitive configuration | DB passwords, API keys |
| HPA | Horizontal Pod Autoscaler | Scale on CPU/memory |

### Minimal Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels: { app: my-app }
  template:
    metadata:
      labels: { app: my-app }
    spec:
      containers:
        - name: app
          image: my-app:1.0.0
          ports: [{ containerPort: 3000 }]
          resources:
            requests: { cpu: "100m", memory: "128Mi" }
            limits: { cpu: "500m", memory: "512Mi" }
          readinessProbe:
            httpGet: { path: /health, port: 3000 }
            periodSeconds: 10
          livenessProbe:
            httpGet: { path: /health, port: 3000 }
            periodSeconds: 30
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef: { name: app-secrets, key: database-url }
```

## Monitoring Decision Tree

```
What do you need to monitor?
├── Error tracking (crashes, exceptions)
│   └── Sentry — best for application errors, stack traces, breadcrumbs
│
├── APM (request traces, latency, throughput)
│   ├── Datadog — comprehensive, expensive
│   ├── New Relic — similar to Datadog
│   └── Grafana + Tempo — open-source alternative
│
├── Infrastructure metrics (CPU, memory, disk)
│   ├── Datadog — all-in-one
│   ├── Prometheus + Grafana — open-source standard
│   └── CloudWatch / Cloud Monitoring — cloud-native
│
├── Logs
│   ├── Datadog Logs — if already using Datadog
│   ├── Loki + Grafana — open-source, pairs with Prometheus
│   └── ELK Stack — powerful but complex
│
└── Uptime / synthetic monitoring
    ├── Better Uptime / Checkly
    └── Grafana Synthetic Monitoring
```

## Logging Best Practices

### Structured Logging

```typescript
import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined,
})

// Structured log with context
logger.info({ userId: user.id, action: 'login', ip: req.ip }, 'User logged in')

// Error with stack trace
logger.error({ err, requestId: req.id }, 'Failed to process payment')
```

**Log Levels:**

| Level | When | Example |
|-------|------|---------|
| `fatal` | App cannot continue | Database connection lost |
| `error` | Operation failed | Payment processing failed |
| `warn` | Unexpected but handled | Rate limit approaching |
| `info` | Business events | User signed up, order placed |
| `debug` | Diagnostic detail | Query timing, cache hit/miss |
| `trace` | Very verbose | Full request/response bodies |

**Logging Rules:**
- Use structured JSON logs in production (not `console.log`)
- Include request ID / correlation ID in every log
- Never log passwords, tokens, or PII
- Log at appropriate levels (don't over-log INFO)
- Use sampling for high-volume debug logs

## Secrets Management

| Environment | Strategy |
|-------------|----------|
| Local development | `.env` file (in `.gitignore`) |
| CI/CD | GitHub Actions secrets / GitLab CI variables |
| Production | Cloud secret manager (AWS Secrets Manager, GCP Secret Manager) |
| Kubernetes | K8s Secrets (+ external secrets operator for cloud sync) |

**Secrets Rules:**
- Never commit secrets to git (use `.gitignore`, `git-secrets`)
- Rotate secrets regularly (automate with secret manager)
- Use different secrets per environment
- Audit secret access logs
- Use short-lived tokens over long-lived API keys

## CI/CD Pipeline Patterns

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push: { branches: [main] }

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE }}:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to production
        run: |
          # Update ECS service / K8s deployment / etc.
```

## Common DevOps Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Running as root in container | Security vulnerability | Add non-root USER in Dockerfile |
| No health checks | Dead containers stay in rotation | Add readiness + liveness probes |
| Secrets in env vars in Dockerfile | Leaked in image layers | Use secret managers, build args for build-time only |
| No resource limits | One pod consumes all resources | Set CPU/memory requests and limits |
| Using `latest` tag | Non-reproducible deployments | Pin exact image versions |
| No log aggregation | Can't debug production issues | Centralized logging (Loki, Datadog) |
| Manual deployments | Inconsistent, error-prone | Automate with CI/CD |
| No rollback plan | Stuck with broken deployment | Blue-green or rolling updates, easy revert |
| Single availability zone | Full outage on zone failure | Multi-AZ deployment |
| No monitoring/alerting | Find out about issues from users | Sentry + uptime monitoring + alerts |

## Pre-Delivery Checklist

- [ ] Dockerfile uses multi-stage build, non-root user
- [ ] Docker Compose works for local development
- [ ] CI pipeline runs tests, builds, deploys
- [ ] Health check endpoint (`/health`) implemented
- [ ] Environment variables documented
- [ ] Secrets stored in secret manager (not in code)
- [ ] Monitoring and error tracking configured
- [ ] Structured logging implemented
- [ ] Rollback strategy documented
- [ ] Resource limits set (CPU, memory)

## References

- `references/aws-patterns.md` — AWS service patterns: ECS, Lambda, RDS, S3, CloudFront
- `references/docker-patterns.md` — Dockerfile optimization, compose patterns, networking
- `references/terraform-guide.md` — Terraform modules, state management, multi-environment
- `references/kubernetes-guide.md` — K8s resources, Helm charts, scaling, troubleshooting
- `references/monitoring-guide.md` — Sentry, Datadog, Prometheus/Grafana setup
- `examples/docker-compose-fullstack.md` — complete app + DB + cache + monitoring stack
- `examples/github-actions-pipeline.md` — full CI/CD pipeline with test, build, deploy stages

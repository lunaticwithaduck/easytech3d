---
name: orchestrator
description: >
  Use when the user asks to "build an app", "start a project", "plan a feature", "what skills do I need",
  "help me build", "full-stack", "SaaS", "end-to-end", "project setup", "architecture plan",
  "tech stack", "which skill", "how do I start", "scaffold project", "new product", "build from scratch",
  or needs guidance on which skills to combine for a multi-step task.
keywords:
  - build an app
  - start a project
  - plan a feature
  - what skills do I need
  - help me build
  - full-stack
  - SaaS
  - end-to-end
  - project setup
  - architecture plan
  - tech stack
  - which skill
  - how do I start
  - scaffold project
  - new product
  - build from scratch
---

# Orchestrator — The Boss Skill

Meta-skill that knows the entire team of 24 skills and routes tasks to the right specialist(s). Use this when a task spans multiple domains or when you're unsure which skill to reach for.

---

## The Team — All 25 Skills at a Glance

### Engineering (11 skills)

| Skill | Domain | Reach for when... |
|---|---|---|
| **frontend** | HTML, CSS, JS/TS, accessibility, Tailwind | Building UI foundations, responsive layouts, browser APIs |
| **react** | React components, hooks, state, RSC | React-specific patterns, Zustand, TanStack Query, Hook Form |
| **nextjs** | App Router, SSR/SSG/ISR, middleware | Next.js routing, caching, server components, Vercel deploy |
| **backend** | Express, Fastify, REST, GraphQL, tRPC | API design, auth (JWT/OAuth), middleware, validation (Zod) |
| **database** | Postgres, MongoDB, Prisma, SQL | Schema design, migrations, queries, indexing, N+1 |
| **data-state** | Redux, SWR, localStorage, IndexedDB | Client state management, caching, browser storage |
| **realtime** | WebSockets, SSE, Web Workers, PWA | Live updates, background processing, offline support |
| **testing** | Playwright, Vitest, Jest, MSW | Test strategy, E2E, unit, integration, mocking |
| **security** | OWASP, XSS, CSRF, CSP, rate limiting | Security hardening, auth security, input sanitization |
| **mobile** | React Native, Expo, EAS Build | Mobile apps, native modules, app store deployment |
| **figma** | Figma MCP, design tokens, handoff | Reading/creating Figma designs, design-to-code |

### Infrastructure (3 skills)

| Skill | Domain | Reach for when... |
|---|---|---|
| **deployment** | Nginx, CI/CD, Docker, CDN, TLS | Deploying apps, pipelines, zero-downtime, web servers |
| **devops** | AWS/GCP/Azure, Terraform, K8s, monitoring | Cloud infrastructure, Sentry, logging, secrets |
| **git-review** | Git workflows, PRs, conventional commits | Branching strategy, code review, monorepo, merge conflicts |

### Design (2 skills)

| Skill | Domain | Reach for when... |
|---|---|---|
| **ui-ux-designer** | Design systems, layouts, typography, color | Designing UI, picking fonts/colors, improving UX |
| **seo** | Meta tags, structured data, Core Web Vitals | Search optimization, OG tags, sitemaps, JSON-LD |

### Business (7 skills)

| Skill | Domain | Reach for when... |
|---|---|---|
| **payments** | Stripe, subscriptions, billing, PCI | Payment processing, pricing models, checkout flows |
| **analytics** | PostHog, Mixpanel, feature flags, A/B tests | Event tracking, experiments, KPIs, user segmentation |
| **email** | Resend, React Email, notifications, drip | Sending emails, notification systems, deliverability |
| **product** | User stories, PRDs, agile, estimation | Product planning, sprints, roadmaps, prioritization |
| **compliance** | GDPR, CCPA, SOC 2, cookie consent, audit | Privacy, data protection, legal requirements |
| **documentation** | OpenAPI, Storybook, ADRs, changelogs | API docs, doc sites, READMEs, architecture decisions |
| **integrations** | Webhooks, BullMQ, OAuth apps, Zapier | Third-party APIs, background jobs, Slack/Discord bots |

### Meta (2 skills)

| Skill | Domain | Reach for when... |
|---|---|---|
| **create-skill** | Skill scaffolding | Creating new skills from scratch |
| **orchestrator** | This skill — task routing | Multi-domain tasks, project planning |

---

## Task → Skill Router

### "I want to build a..." Decision Tree

```
"I want to build a..."
├── SaaS product
│   └── See: SaaS Blueprint below
├── Landing page
│   └── frontend + nextjs + seo + ui-ux-designer
├── REST API / Backend service
│   └── backend + database + testing + security + deployment
├── Mobile app
│   └── mobile + backend + database + analytics
├── Component library / Design system
│   └── react + frontend + ui-ux-designer + documentation (Storybook)
├── E-commerce store
│   └── nextjs + payments + email + seo + analytics
├── Dashboard / Admin panel
│   └── react + nextjs + database + backend + ui-ux-designer
├── Real-time app (chat, collab)
│   └── realtime + backend + database + frontend
├── API with documentation
│   └── backend + database + documentation + security
├── Chrome extension / Browser tool
│   └── frontend + data-state + security
├── CLI tool
│   └── backend (Node patterns) + testing
└── Integration / Webhook service
    └── integrations + backend + database + email
```

---

## Common Multi-Skill Workflows

### New Feature (standard)

```
1. product     → Write user story + acceptance criteria
2. ui-ux       → Design the UI (or read from Figma)
3. figma       → Extract design tokens / specs
4. database    → Schema changes + migration
5. backend     → API endpoint(s)
6. react/next  → Frontend implementation
7. testing     → Unit + integration + E2E tests
8. security    → Review for vulnerabilities
9. documentation → Update API docs / changelog
10. git-review → PR, code review, merge
11. deployment → Ship it
12. analytics  → Add event tracking
```

### Bug Fix (expedited)

```
1. testing     → Reproduce with a failing test
2. [domain]    → Fix the bug (frontend/backend/database/etc.)
3. testing     → Verify fix, add regression test
4. git-review  → PR + review
5. deployment  → Ship hotfix
```

### New Integration

```
1. integrations → Architecture (webhook vs API vs queue)
2. backend      → API routes / webhook handlers
3. database     → Store tokens, events, sync state
4. security     → OAuth flow, token encryption, signature verification
5. email        → Notification on connect/disconnect
6. testing      → Mock external API, test webhook handling
7. documentation → Integration guide for users
```

---

## SaaS Blueprint — Full Product Skill Map

Building a complete SaaS product touches nearly every skill. Here's the build order:

### Phase 1: Foundation (Week 1-2)

| Step | Skills | Deliverable |
|---|---|---|
| Project scaffold | **nextjs** | Next.js app with App Router |
| Database setup | **database** | Prisma schema, PostgreSQL, migrations |
| Auth system | **backend** + **security** | JWT/OAuth, login/register, middleware |
| Basic UI shell | **frontend** + **react** + **ui-ux-designer** | Layout, nav, theme, design system |
| CI/CD pipeline | **deployment** + **devops** | GitHub Actions, preview deploys |
| Git workflow | **git-review** | Branch strategy, PR template |

### Phase 2: Core Product (Week 3-5)

| Step | Skills | Deliverable |
|---|---|---|
| Core features | **react** + **nextjs** + **backend** + **database** | The thing your product does |
| API design | **backend** + **documentation** | REST/tRPC endpoints, OpenAPI spec |
| Real-time (if needed) | **realtime** | WebSocket/SSE for live features |
| State management | **data-state** | Client caching, optimistic updates |
| Testing | **testing** | Unit, integration, E2E test suite |
| Error handling | **security** + **devops** | Sentry, error boundaries, logging |

### Phase 3: Monetization & Growth (Week 6-8)

| Step | Skills | Deliverable |
|---|---|---|
| Payments | **payments** | Stripe subscriptions, billing portal |
| Email system | **email** | Transactional emails, welcome sequence |
| Analytics | **analytics** | Event tracking, funnels, feature flags |
| SEO | **seo** | Meta tags, sitemap, structured data |
| Landing page | **frontend** + **ui-ux-designer** + **seo** | Marketing site |

### Phase 4: Scale & Compliance (Week 9+)

| Step | Skills | Deliverable |
|---|---|---|
| Compliance | **compliance** | Privacy policy, cookie consent, GDPR |
| Integrations | **integrations** | Zapier, Slack, webhooks |
| Documentation | **documentation** | API docs, user guides, changelog |
| Performance | **frontend** + **database** + **devops** | Optimization, caching, CDN |
| Mobile (optional) | **mobile** | React Native app |
| Product process | **product** | PRDs, roadmap, sprint cadence |

---

## Cross-Cutting Concerns — Which Skills Share Responsibility

Some concerns span multiple skills. Here's who owns what:

### Authentication & Authorization

| Aspect | Primary skill | Supporting |
|---|---|---|
| JWT / session management | **backend** | security |
| OAuth provider (Google, GitHub login) | **backend** | security |
| OAuth app building (your app as provider) | **integrations** | backend, security |
| Password hashing, CSRF, rate limiting | **security** | backend |
| Auth UI (login/register forms) | **react** | frontend, ui-ux-designer |
| Auth middleware | **nextjs** (Next.js) or **backend** | security |

### Webhooks

| Aspect | Primary skill | Supporting |
|---|---|---|
| Receiving Stripe webhooks | **payments** | integrations |
| Receiving any external webhook | **integrations** | backend |
| Sending webhooks to consumers | **integrations** | backend |
| Email event webhooks | **email** | integrations |
| Webhook signature verification | **integrations** | security |

### Data & State

| Aspect | Primary skill | Supporting |
|---|---|---|
| Database schema & queries | **database** | backend |
| API data fetching (server) | **backend** | database |
| API data fetching (client) | **data-state** | react |
| Real-time data sync | **realtime** | data-state, backend |
| Form state | **react** (React Hook Form) | frontend |
| Browser storage | **data-state** | frontend |

### Notifications

| Aspect | Primary skill | Supporting |
|---|---|---|
| Email notifications | **email** | integrations (queue) |
| In-app notifications | **email** (notification system section) | react, realtime |
| Push notifications (web) | **realtime** (Service Worker) | frontend |
| Push notifications (mobile) | **mobile** | backend |
| Slack/Discord notifications | **integrations** | email |

### Error Handling & Monitoring

| Aspect | Primary skill | Supporting |
|---|---|---|
| Sentry / error tracking | **devops** | frontend, backend |
| Error boundaries (React) | **react** | frontend |
| API error responses | **backend** | security |
| Logging | **devops** | backend |
| Uptime monitoring | **devops** | deployment |
| Audit logging | **compliance** | backend, database |

---

## Project Health Checklist

Use this to audit a project's completeness across all domains:

### Engineering Health

- [ ] **Frontend**: Responsive, accessible, performant (Lighthouse > 90)
- [ ] **React/Next.js**: Server components where possible, proper data fetching
- [ ] **Backend**: Input validated, errors handled, rate limited
- [ ] **Database**: Indexed queries, no N+1, migrations versioned
- [ ] **State**: No prop drilling, proper cache invalidation
- [ ] **Real-time**: Reconnection logic, fallback for failures
- [ ] **Testing**: E2E for critical paths, unit for business logic, >70% coverage
- [ ] **Security**: OWASP top 10 addressed, CSP headers, secrets not in code
- [ ] **Mobile**: If applicable — responsive or native app works

### Infrastructure Health

- [ ] **Deployment**: CI/CD pipeline, preview deploys, rollback capability
- [ ] **DevOps**: Monitoring (Sentry), logging, alerting, secrets management
- [ ] **Git**: Branch strategy, PR reviews, conventional commits

### Design Health

- [ ] **UI/UX**: Consistent design system, responsive, accessible
- [ ] **SEO**: Meta tags, sitemap, structured data, Core Web Vitals pass

### Business Health

- [ ] **Payments**: Stripe integrated, webhooks idempotent, billing portal
- [ ] **Analytics**: Tracking plan, key funnels, feature flags
- [ ] **Email**: Transactional emails, deliverability (SPF/DKIM/DMARC)
- [ ] **Product**: PRD for features, roadmap shared, sprint cadence
- [ ] **Compliance**: Privacy policy, cookie consent, data deletion flow
- [ ] **Documentation**: API docs, README, changelog, ADRs
- [ ] **Integrations**: Webhook handlers verified, retries configured, queues stable

---

## Quick Skill Lookup by Keyword

When you hear these words, reach for these skills:

| Keyword | Skill(s) |
|---|---|
| Stripe, payment, subscription, billing | **payments** |
| PostHog, Mixpanel, A/B test, feature flag | **analytics** |
| Email, Resend, notification, drip | **email** |
| GDPR, CCPA, cookie, privacy, SOC 2 | **compliance** |
| User story, PRD, sprint, roadmap | **product** |
| OpenAPI, Swagger, Storybook, ADR, changelog | **documentation** |
| Webhook, BullMQ, Zapier, Slack bot, queue | **integrations** |
| React, hooks, Zustand, TanStack Query | **react** |
| Next.js, App Router, SSR, ISR | **nextjs** |
| HTML, CSS, Tailwind, accessibility | **frontend** |
| Express, REST, GraphQL, tRPC, JWT | **backend** |
| Prisma, PostgreSQL, MongoDB, SQL | **database** |
| Redux, SWR, IndexedDB, localStorage | **data-state** |
| WebSocket, SSE, Worker, PWA | **realtime** |
| Playwright, Vitest, Jest, E2E | **testing** |
| OWASP, XSS, CSRF, CSP | **security** |
| React Native, Expo, iOS, Android | **mobile** |
| Figma, design tokens, design-to-code | **figma** |
| Nginx, CI/CD, Docker, CDN, TLS | **deployment** |
| AWS, Terraform, K8s, Sentry, monitoring | **devops** |
| Git, PR, code review, branching | **git-review** |
| SEO, meta tags, sitemap, JSON-LD | **seo** |
| Design, layout, typography, color | **ui-ux-designer** |
| Create skill, scaffold skill | **create-skill** |

---

## Anti-Patterns: The Orchestrator Watches For

| Anti-Pattern | What's happening | Intervention |
|---|---|---|
| **Building without a plan** | Jumping to code without PRD/stories | Route to **product** first |
| **Skipping auth security** | Auth works but isn't secure | Route to **security** for review |
| **No tests before shipping** | "We'll add tests later" | Route to **testing** — write tests now |
| **No error monitoring** | Shipping without Sentry/logging | Route to **devops** |
| **No analytics** | Can't measure feature success | Route to **analytics** |
| **No compliance** | GDPR/CCPA violation risk | Route to **compliance** before launch |
| **Hardcoded secrets** | Secrets in code or .env committed | Route to **security** + **devops** |
| **No documentation** | API undocumented, no README | Route to **documentation** |
| **Single point of failure** | No retries, no queues, no fallbacks | Route to **integrations** (resilience patterns) |
| **Premature optimization** | Optimizing before measuring | Route to **analytics** to measure, then optimize |

---

## Escalation Path

When a task doesn't fit any skill:

```
1. Check this orchestrator's keyword table
2. Check if it's a cross-cutting concern (see table above)
3. If truly new domain → use create-skill to build a new skill
4. If meta-question about skills → this orchestrator handles it
```

---

## References

This skill references all 24 other skills:
- Engineering: frontend, react, nextjs, backend, database, data-state, realtime, testing, security, mobile, figma
- Infrastructure: deployment, devops, git-review
- Design: ui-ux-designer, seo
- Business: payments, analytics, email, product, compliance, documentation, integrations
- Meta: create-skill

---
name: documentation
description: >
  Use when the user asks about "API documentation", "OpenAPI", "Swagger", "technical writing",
  "changelog", "Storybook", "Mintlify", "Nextra", "README", "ADR", "architecture decision",
  "doc site", "API reference", "JSDoc", "TypeDoc", "documentation site",
  or needs documentation strategy and tooling knowledge.
keywords:
  - API documentation
  - OpenAPI
  - Swagger
  - technical writing
  - changelog
  - Storybook
  - Mintlify
  - Nextra
  - README
  - ADR
  - architecture decision
  - doc site
  - API reference
  - JSDoc
  - TypeDoc
  - documentation site
---

# Documentation & API Docs Skill

Comprehensive guide for creating and maintaining technical documentation, API references, and documentation sites for software projects.

---

## Documentation Types Decision Tree

```
What do you need to document?
├── API endpoints?
│   ├── REST API → OpenAPI / Swagger spec
│   ├── GraphQL → GraphQL schema + descriptions
│   └── tRPC → TypeScript types (self-documenting)
├── UI components?
│   └── Storybook (visual component docs)
├── Architecture decisions?
│   └── ADRs (Architecture Decision Records)
├── User-facing docs?
│   ├── Developer docs (API reference) → Mintlify, Nextra, or Docusaurus
│   └── End-user docs (how-to guides) → Mintlify, GitBook, or Notion
├── Code documentation?
│   ├── TypeScript → JSDoc / TypeDoc
│   └── Auto-generated → TypeDoc, Typedoc-plugin-markdown
├── Project overview?
│   └── README.md
└── Version history?
    └── CHANGELOG.md
```

---

## API Documentation with OpenAPI

### OpenAPI Spec Structure

```yaml
# openapi.yaml
openapi: 3.1.0
info:
  title: MyApp API
  version: 1.0.0
  description: API for managing users and subscriptions
  contact:
    email: api@myapp.com

servers:
  - url: https://api.myapp.com/v1
    description: Production
  - url: https://staging-api.myapp.com/v1
    description: Staging

paths:
  /users:
    get:
      summary: List users
      operationId: listUsers
      tags: [Users]
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
      responses:
        '200':
          description: List of users
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
        '401':
          $ref: '#/components/responses/Unauthorized'

    post:
      summary: Create a user
      operationId: createUser
      tags: [Users]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserInput'
      responses:
        '201':
          description: User created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          $ref: '#/components/responses/BadRequest'
        '409':
          description: Email already exists

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          example: "usr_abc123"
        email:
          type: string
          format: email
        name:
          type: string
        createdAt:
          type: string
          format: date-time
      required: [id, email, name, createdAt]

    CreateUserInput:
      type: object
      properties:
        email:
          type: string
          format: email
        name:
          type: string
          minLength: 1
          maxLength: 100
      required: [email, name]

    Pagination:
      type: object
      properties:
        page:
          type: integer
        limit:
          type: integer
        total:
          type: integer
        hasMore:
          type: boolean

  responses:
    Unauthorized:
      description: Authentication required
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    BadRequest:
      description: Invalid input
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - bearerAuth: []
```

### OpenAPI Tools

| Tool | Purpose | Use case |
|---|---|---|
| **Scalar** | Beautiful API reference from OpenAPI | Modern, themeable docs |
| **Swagger UI** | Interactive API explorer | Classic, well-known |
| **Redoc** | Clean documentation renderer | Three-panel layout |
| **Stoplight** | Visual OpenAPI editor | Design-first API development |
| **openapi-typescript** | Generate TS types from spec | Type-safe API clients |

### Generating Types from OpenAPI

```bash
# Generate TypeScript types from OpenAPI spec
npx openapi-typescript openapi.yaml -o src/types/api.ts

# Use with fetch
import type { paths } from './types/api';
type ListUsersResponse = paths['/users']['get']['responses']['200']['content']['application/json'];
```

---

## Doc Site Tool Comparison

| Tool | Framework | Best for | Hosting | Pricing |
|---|---|---|---|---|
| **Mintlify** | Custom | Beautiful API docs | Managed | Free (OSS), Paid |
| **Nextra** | Next.js | Next.js ecosystem | Self-host / Vercel | Free |
| **Docusaurus** | React | Large doc sites | Self-host | Free |
| **Starlight** | Astro | Performance-focused | Self-host | Free |
| **GitBook** | Custom | Non-technical teams | Managed | Free tier + Paid |
| **Fumadocs** | Next.js | App Router docs | Self-host / Vercel | Free |

### Mintlify Setup

```json
// mint.json
{
  "name": "MyApp",
  "logo": { "dark": "/logo/dark.svg", "light": "/logo/light.svg" },
  "favicon": "/favicon.svg",
  "colors": { "primary": "#0055FF" },
  "navigation": [
    {
      "group": "Getting Started",
      "pages": ["introduction", "quickstart", "authentication"]
    },
    {
      "group": "API Reference",
      "pages": ["api-reference/users", "api-reference/subscriptions"]
    }
  ],
  "api": {
    "baseUrl": "https://api.myapp.com",
    "auth": { "method": "bearer" }
  }
}
```

### Nextra Setup

```bash
npm install nextra nextra-theme-docs
```

```js
// next.config.mjs
import nextra from 'nextra';

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
});

export default withNextra();
```

```tsx
// theme.config.tsx
import type { DocsThemeConfig } from 'nextra-theme-docs';

const config: DocsThemeConfig = {
  logo: <span>MyApp Docs</span>,
  project: { link: 'https://github.com/myorg/myapp' },
  docsRepositoryBase: 'https://github.com/myorg/myapp/tree/main/docs',
  footer: { text: '© 2024 MyApp' },
};

export default config;
```

---

## README Template

```markdown
# Project Name

[![CI](https://github.com/org/repo/actions/workflows/ci.yml/badge.svg)](https://github.com/org/repo/actions)
[![npm version](https://badge.fury.io/js/package-name.svg)](https://www.npmjs.com/package/package-name)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Brief description of what this project does and who it's for.

## Features

- Feature 1
- Feature 2
- Feature 3

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+

### Installation

\`\`\`bash
npm install package-name
\`\`\`

### Usage

\`\`\`typescript
import { something } from 'package-name';

const result = something({ option: 'value' });
\`\`\`

## API Reference

### `functionName(options)`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `option1` | `string` | required | Description |
| `option2` | `number` | `10` | Description |

Returns: `Promise<Result>`

## Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `API_KEY` | Yes | — | API authentication key |

## Development

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build
npm run build
\`\`\`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE)
```

---

## Changelog Format

### Keep a Changelog (Recommended)

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- New feature description

## [1.2.0] - 2024-03-15

### Added
- Team invitation system with email notifications
- CSV export for user data

### Changed
- Improved dashboard loading performance by 40%

### Fixed
- Fix payment webhook handling for disputed charges

### Deprecated
- Legacy API v1 endpoints (will be removed in v2.0.0)

## [1.1.0] - 2024-02-01

### Added
- Dark mode support
- Subscription management page

### Security
- Updated dependencies to patch CVE-2024-xxxx
```

### Auto-Generation Tools

| Tool | How | Best for |
|---|---|---|
| **Changesets** | PR-based changelogs | Monorepos, npm packages |
| **Conventional Commits + auto-changelog** | Commit-based | Conventional commit workflow |
| **Release Drafter** | GitHub Action, PR labels | GitHub-native workflow |
| **Semantic Release** | Full automation | CI/CD automated releases |

### Conventional Commits Format

```
feat: add team invitation system
fix: resolve payment webhook race condition
docs: update API reference for v2 endpoints
chore: upgrade dependencies
refactor: extract email service from user controller
perf: optimize dashboard query with pagination
BREAKING CHANGE: remove legacy v1 API endpoints
```

---

## ADR (Architecture Decision Record)

### Template

```markdown
# ADR-001: Use PostgreSQL as Primary Database

## Status
Accepted (2024-01-15)

## Context
We need to choose a primary database for our SaaS application. The app
requires relational data, full-text search, and JSON storage for flexible
schema areas.

## Decision
We will use PostgreSQL as our primary database, accessed through Prisma ORM.

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| PostgreSQL | Relational + JSON, mature, great tooling | More ops than managed NoSQL |
| MongoDB | Flexible schema, easy start | Joins are painful, consistency issues |
| PlanetScale (MySQL) | Serverless, branching | MySQL limitations, vendor lock-in |

## Consequences

### Positive
- Strong relational model for our domain
- JSON columns for flexible metadata
- Excellent Prisma support
- Full-text search without extra service

### Negative
- Need to manage migrations carefully
- Connection pooling needed for serverless

### Risks
- Scaling beyond single instance requires read replicas or Citus

## References
- [Prisma PostgreSQL Docs](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
```

### ADR Workflow
1. Create ADR for every significant technical decision
2. Number sequentially: `ADR-001`, `ADR-002`, etc.
3. Store in `docs/adr/` or `docs/decisions/`
4. Status values: `Proposed` → `Accepted` / `Rejected` / `Superseded`
5. Never delete — supersede old ADRs with new ones

---

## Storybook for Component Documentation

### Setup

```bash
npx storybook@latest init
```

### Story Example

```tsx
// components/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'], // Auto-generate docs page
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'destructive'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { children: 'Primary Button', variant: 'primary' },
};

export const Secondary: Story = {
  args: { children: 'Secondary Button', variant: 'secondary' },
};

export const Destructive: Story = {
  args: { children: 'Delete', variant: 'destructive' },
};

export const Loading: Story = {
  args: { children: 'Saving...', loading: true },
};
```

---

## JSDoc / TypeDoc Patterns

### JSDoc for Functions

```typescript
/**
 * Creates a new user account and sends a welcome email.
 *
 * @param input - The user creation input
 * @param input.email - The user's email address (must be unique)
 * @param input.name - The user's display name
 * @returns The created user object
 * @throws {ConflictError} If email is already registered
 *
 * @example
 * ```ts
 * const user = await createUser({ email: 'jane@example.com', name: 'Jane' });
 * ```
 */
export async function createUser(input: CreateUserInput): Promise<User> {
  // implementation
}
```

### TypeDoc Setup

```bash
npm install typedoc --save-dev
```

```json
// typedoc.json
{
  "entryPoints": ["src/index.ts"],
  "out": "docs/api",
  "plugin": ["typedoc-plugin-markdown"],
  "exclude": ["**/*.test.ts", "**/*.spec.ts"],
  "excludePrivate": true,
  "readme": "README.md"
}
```

```bash
npx typedoc
```

### When to Use JSDoc

| Scenario | Use JSDoc? |
|---|---|
| Public API / Library | Yes — essential |
| Complex business logic | Yes — explain *why* |
| Simple getter/setter | No — self-documenting |
| Internal utility | Only if non-obvious |
| Type definition | Only if types aren't self-explanatory |

**Rule**: Document the *why*, not the *what*. Good types + good naming > excessive JSDoc.

---

## Writing Style Guide

### Technical Writing Principles

| Principle | Do | Don't |
|---|---|---|
| **Active voice** | "The function returns a user" | "A user is returned by the function" |
| **Concise** | "Run `npm install`" | "You should run the `npm install` command" |
| **Scannable** | Headers, lists, tables, code blocks | Long paragraphs |
| **Present tense** | "This endpoint creates a user" | "This endpoint will create a user" |
| **Second person** | "You can configure..." | "One can configure..." / "The user can..." |
| **Specific** | "Returns a 404 error" | "Returns an error" |

### Structure Pattern

```
1. What it does (1 sentence)
2. When to use it (context)
3. How to use it (code example)
4. Parameters / options (table)
5. Common pitfalls (if any)
```

---

## Documentation-as-Code Workflow

### File Structure

```
docs/
├── pages/
│   ├── index.mdx          # Home
│   ├── quickstart.mdx     # Getting started
│   ├── authentication.mdx # Auth guide
│   └── api/
│       ├── users.mdx       # Users API
│       └── billing.mdx     # Billing API
├── components/             # Custom MDX components
│   └── ApiEndpoint.tsx
├── public/                 # Static assets
│   └── images/
└── mint.json / next.config.mjs  # Config
```

### MDX Components

```tsx
// docs/components/ApiEndpoint.tsx
interface ApiEndpointProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
}

export function ApiEndpoint({ method, path, description }: ApiEndpointProps) {
  const colors = {
    GET: 'bg-green-100 text-green-800',
    POST: 'bg-blue-100 text-blue-800',
    PUT: 'bg-yellow-100 text-yellow-800',
    DELETE: 'bg-red-100 text-red-800',
  };

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg mb-4">
      <span className={`px-2 py-1 rounded text-sm font-mono font-bold ${colors[method]}`}>
        {method}
      </span>
      <code className="font-mono text-sm">{path}</code>
      <span className="text-gray-500 text-sm ml-auto">{description}</span>
    </div>
  );
}
```

### CI Validation

```yaml
# .github/workflows/docs.yml
name: Docs
on:
  pull_request:
    paths: ['docs/**']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: cd docs && npm ci
      - run: cd docs && npm run build
      # Catches broken links, missing images, build errors
```

---

## Common Mistakes

| Mistake | Problem | Fix |
|---|---|---|
| No documentation at all | New devs lost, onboarding slow | Start with README + quickstart |
| Outdated docs | Worse than no docs (misleading) | Docs-as-code in same repo, PR reviews include docs |
| Documenting *what* not *why* | Redundant with code | Focus on decisions, trade-offs, context |
| No code examples | Hard to understand usage | Every API endpoint and function needs an example |
| Monolithic README | Too long to find anything | Split into doc site for complex projects |
| No API versioning docs | Breaking changes surprise consumers | Document versions, deprecation notices |
| Missing error documentation | Users don't know how to handle failures | Document all error codes and responses |
| No changelog | Users don't know what changed | Keep a Changelog, automate if possible |
| Writing docs after shipping | Never happens, perpetually behind | Write docs as part of "Definition of Done" |
| Ignoring ADRs | Re-debating old decisions | Record decisions as you make them |

---

## Pre-Delivery Checklist

- [ ] README has install, usage, config, and dev instructions
- [ ] API endpoints documented with request/response examples
- [ ] OpenAPI spec matches actual API behavior
- [ ] Error responses documented with status codes
- [ ] Authentication documented with example
- [ ] Changelog maintained with notable changes
- [ ] ADRs recorded for significant architecture decisions
- [ ] Code examples are tested and working
- [ ] Docs build without errors in CI
- [ ] No broken links in documentation
- [ ] Complex functions have JSDoc with examples
- [ ] Storybook stories for shared UI components
- [ ] Doc site is accessible and searchable

---

## References

- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [Mintlify](https://mintlify.com/)
- [Nextra](https://nextra.site/)
- [Docusaurus](https://docusaurus.io/)
- [Storybook](https://storybook.js.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [ADR GitHub](https://adr.github.io/)
- [TypeDoc](https://typedoc.org/)

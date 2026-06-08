---
name: backend
description: This skill should be used when the user asks about "Express", "Fastify", "REST API", "GraphQL", "API routes", "middleware", "JWT", "OAuth", "authentication", "authorization", "API design", "rate limiting", "validation", "Zod schema", "tRPC", "API error handling", "CORS setup", "backend architecture", or needs backend/API development knowledge.
keywords:
  - Express
  - Fastify
  - REST API
  - GraphQL
  - API routes
  - middleware
  - JWT
  - OAuth
  - authentication
  - authorization
  - API design
  - rate limiting
  - validation
  - Zod schema
  - tRPC
  - API error handling
  - CORS setup
  - backend architecture
---

# Backend & API Development

Backend-layer skill covering REST API design, authentication, middleware architecture, validation, and error handling. Covers Express, Fastify, GraphQL, and tRPC patterns for Node.js server-side development.

## Framework Decision Tree

```
Choosing a Node.js framework?
├── Need maximum ecosystem/community support?
│   └── Express — most middleware, tutorials, hiring pool
│
├── Need best raw performance?
│   └── Fastify — 2-3x faster, schema-based validation, built-in logging
│
├── Building a Next.js app?
│   └── Next.js API routes / Server Actions (no separate server)
│
├── Want end-to-end type safety with React frontend?
│   └── tRPC — zero-codegen, inferred types across client/server
│
└── Need a full batteries-included framework?
    └── NestJS — decorators, DI, modules, opinionated structure
```

**Framework Comparison Table:**

| Feature | Express | Fastify | tRPC | NestJS |
|---------|---------|---------|------|--------|
| Performance | Moderate | High | N/A (adapter) | Moderate |
| TypeScript | Bolted on | First-class | Native | Native |
| Validation | Manual (Zod) | Built-in (JSON Schema) | Zod built-in | class-validator |
| Learning curve | Low | Low | Medium | High |
| Best for | Prototypes, APIs | High-perf APIs | Full-stack TS | Enterprise apps |

## REST API Design Patterns

### Resource Naming

| Pattern | Correct | Wrong |
|---------|---------|-------|
| Plural nouns | `/users`, `/posts` | `/user`, `/getPost` |
| Nested resources | `/users/:id/posts` | `/getUserPosts` |
| Query filtering | `/posts?status=draft` | `/posts/draft` |
| Actions (rare) | `POST /orders/:id/cancel` | `DELETE /orders/:id/cancel` |

### HTTP Methods and Status Codes

| Method | Purpose | Success Code | Body |
|--------|---------|-------------|------|
| `GET` | Read resource(s) | 200 | Resource data |
| `POST` | Create resource | 201 + Location header | Created resource |
| `PUT` | Full replace | 200 | Updated resource |
| `PATCH` | Partial update | 200 | Updated resource |
| `DELETE` | Remove | 204 | No body |

**Error Status Codes:**

| Code | Meaning | When |
|------|---------|------|
| 400 | Bad Request | Validation failed, malformed body |
| 401 | Unauthorized | Missing or invalid auth token |
| 403 | Forbidden | Valid auth but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource, version mismatch |
| 422 | Unprocessable Entity | Valid syntax but semantic errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server failure |

## Authentication Patterns

### JWT Flow

```
1. Client sends credentials → POST /auth/login
2. Server validates, returns { accessToken, refreshToken }
3. Client stores accessToken in memory, refreshToken in httpOnly cookie
4. Client sends Authorization: Bearer <accessToken> on each request
5. On 401, client calls POST /auth/refresh with refreshToken cookie
6. Server returns new accessToken
```

**Token Storage Rules:**
- Access token → JavaScript variable / memory (NEVER localStorage)
- Refresh token → httpOnly, Secure, SameSite=Strict cookie
- Never store sensitive tokens in localStorage (XSS vulnerable)

### OAuth2 Authorization Code Flow

```
1. Redirect user to provider: GET /oauth/authorize?client_id=X&redirect_uri=Y&scope=Z
2. User authenticates with provider
3. Provider redirects to callback: GET /callback?code=AUTH_CODE
4. Server exchanges code for tokens: POST /oauth/token (server-to-server)
5. Server creates session or JWT from provider profile
```

## Middleware Architecture

**Express/Fastify middleware ordering:**

```
1. Security headers (helmet)
2. CORS
3. Request parsing (body-parser / built-in)
4. Request logging (morgan / pino)
5. Rate limiting
6. Authentication (verify JWT)
7. Authorization (check permissions)
8. Route handlers
9. Error handling (MUST be last)
```

### Error Handling Pattern

```typescript
// Consistent error response shape
interface ApiError {
  statusCode: number
  message: string
  code: string          // Machine-readable: "VALIDATION_ERROR"
  details?: unknown     // Zod errors, field-level issues
}

// Express async error wrapper
const asyncHandler = (fn: RequestHandler) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next)

// Global error handler (register last)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      message: err.message,
      code: err.code,
    })
  }
  console.error(err)
  res.status(500).json({ statusCode: 500, message: 'Internal server error', code: 'INTERNAL_ERROR' })
})
```

## Request Validation with Zod

```typescript
import { z } from 'zod'

const CreateUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    name: z.string().min(1).max(100),
    role: z.enum(['admin', 'user']).default('user'),
  }),
  params: z.object({}),
  query: z.object({}),
})

// Validation middleware
function validate<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({ body: req.body, params: req.params, query: req.query })
    if (!result.success) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: result.error.flatten(),
      })
    }
    req.body = result.data.body
    next()
  }
}

app.post('/users', validate(CreateUserSchema), asyncHandler(createUser))
```

## GraphQL Quick Reference

| Approach | Tool | Best For |
|----------|------|----------|
| Schema-first | Apollo Server + codegen | Team with schema designers, API-first |
| Code-first | Pothos / TypeGraphQL | TypeScript-heavy, type inference |
| REST-like | tRPC | Full-stack TypeScript, no GraphQL needed |

**When to choose GraphQL over REST:**
- Frontend needs flexible data shapes (mobile vs web)
- Multiple related resources fetched together
- Real-time subscriptions needed
- NOT worth it for: simple CRUD, single frontend, few endpoints

## API Versioning Strategies

| Strategy | Example | Pros | Cons |
|----------|---------|------|------|
| URL path | `/api/v1/users` | Simple, explicit | URL pollution |
| Header | `Accept: application/vnd.api.v1+json` | Clean URLs | Less discoverable |
| Query param | `/users?version=1` | Easy to test | Messy |
| **No versioning** | Evolve with backwards compat | Simplest | Requires discipline |

**Recommendation:** Use URL path versioning (`/api/v1/`) for public APIs. For internal APIs, evolve without versioning and maintain backwards compatibility.

## Common Backend Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Storing JWT in localStorage | XSS can steal tokens | Memory + httpOnly refresh cookie |
| No input validation | Injection attacks, crashes | Zod on every endpoint |
| Returning stack traces in production | Information leakage | Generic error messages in prod |
| No rate limiting | DDoS, brute force attacks | express-rate-limit or similar |
| N+1 queries in resolvers | Slow API responses | DataLoader, eager loading |
| Synchronous password hashing | Blocks event loop | Use async bcrypt.hash() |
| No request ID/correlation | Can't trace distributed requests | Generate UUID per request, propagate |
| Hardcoded secrets | Leaked credentials | Environment variables, secret manager |
| No graceful shutdown | Dropped connections on deploy | Handle SIGTERM, drain connections |
| Missing CORS config | Frontend can't reach API | Configure allowed origins explicitly |

## Pre-Delivery Checklist

- [ ] All endpoints validate input with Zod or equivalent
- [ ] Authentication middleware on protected routes
- [ ] Authorization checks (not just authentication)
- [ ] Consistent error response format
- [ ] Rate limiting on auth and public endpoints
- [ ] CORS configured for specific origins (not `*` in production)
- [ ] No secrets in code (environment variables only)
- [ ] Request logging with correlation IDs
- [ ] Graceful shutdown handling
- [ ] API documented (OpenAPI/Swagger or tRPC panel)

## References

- `references/express-patterns.md` — Express middleware, routing, error handling deep dive
- `references/fastify-patterns.md` — Fastify plugins, schema validation, hooks
- `references/auth-patterns.md` — JWT, OAuth2, session management, RBAC
- `references/trpc-guide.md` — tRPC setup, routers, middleware, React integration
- `examples/rest-api-express.md` — complete Express REST API with Zod + JWT
- `examples/trpc-fullstack.md` — tRPC router + React Query integration

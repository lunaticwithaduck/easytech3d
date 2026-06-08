---
name: security
description: This skill should be used when the user asks about "security", "OWASP", "XSS", "SQL injection", "CSRF", "CORS", "CSP", "Content Security Policy", "input sanitization", "rate limiting", "helmet", "security headers", "authentication security", "password hashing", "bcrypt", "vulnerability", "penetration testing", "security audit", or needs web security knowledge.
keywords:
  - security
  - OWASP
  - XSS
  - SQL injection
  - CSRF
  - CORS
  - CSP
  - Content Security Policy
  - input sanitization
  - rate limiting
  - helmet
  - security headers
  - authentication security
  - password hashing
  - bcrypt
  - vulnerability
  - penetration testing
  - security audit
---

# Web Security

Security-layer skill covering OWASP Top 10 prevention, input validation, authentication security, security headers, and audit workflows. Applies to all web applications regardless of framework.

## OWASP Top 10 Quick Reference

| # | Vulnerability | Prevention | Priority |
|---|--------------|------------|----------|
| A01 | Broken Access Control | Deny by default, RBAC, server-side checks | Critical |
| A02 | Cryptographic Failures | TLS everywhere, bcrypt for passwords, no custom crypto | Critical |
| A03 | Injection (SQL, NoSQL, XSS) | Parameterized queries, input validation, output encoding | Critical |
| A04 | Insecure Design | Threat modeling, secure design patterns | High |
| A05 | Security Misconfiguration | Harden defaults, remove unused features, update deps | High |
| A06 | Vulnerable Components | npm audit, Dependabot, pin versions | High |
| A07 | Auth & Identity Failures | MFA, strong passwords, secure session management | Critical |
| A08 | Software & Data Integrity | Verify dependencies, signed commits, CI integrity | Medium |
| A09 | Logging & Monitoring Failures | Log security events, alert on anomalies | Medium |
| A10 | Server-Side Request Forgery | Validate URLs, allowlist destinations, block internal IPs | High |

## Input Validation & Sanitization

### Validation Strategy

```
Input arrives → Validate shape (Zod) → Sanitize content → Use safely

Validate at system boundaries:
├── API endpoints (request body, params, query)
├── Form submissions
├── URL parameters
├── File uploads
└── Third-party webhook payloads
```

### Zod Validation Patterns

```typescript
import { z } from 'zod'

// Strict string validation
const UserInput = z.object({
  email: z.string().email().max(254),
  name: z.string().min(1).max(100).trim(),
  bio: z.string().max(1000).optional(),
  age: z.number().int().min(13).max(150),
  url: z.string().url().startsWith('https://').optional(),
})

// Never trust client type assertions
const params = z.object({
  id: z.string().cuid(),  // validate ID format
})
```

**Validation Rules:**
- Validate on the server (client validation is UX only)
- Allowlist valid values, don't blocklist bad ones
- Validate type, length, range, and format
- Trim and normalize strings before validation
- Reject unexpected fields (use `.strict()` in Zod)

## XSS Prevention

| Attack Vector | Prevention |
|--------------|------------|
| Stored XSS (DB → page) | Output encoding, CSP, sanitize on input |
| Reflected XSS (URL → page) | Output encoding, CSP, validate URL params |
| DOM XSS (client-side injection) | Avoid `innerHTML`, use `textContent`, CSP |

### Prevention Techniques

```typescript
// React auto-escapes by default — this is SAFE:
<p>{userInput}</p>

// DANGEROUS — bypasses React's escaping:
<div dangerouslySetInnerHTML={{ __html: userContent }} />  // NEVER with user input

// If you MUST render HTML, sanitize first:
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />
```

**XSS Rules:**
- Never use `dangerouslySetInnerHTML` with user input
- Never use `eval()`, `new Function()`, or `document.write()`
- Use Content Security Policy headers
- Sanitize with DOMPurify if HTML rendering is required
- Encode output for the context (HTML, URL, JavaScript, CSS)

## SQL Injection Prevention

```typescript
// VULNERABLE — string concatenation
const query = `SELECT * FROM users WHERE id = '${userId}'`  // NEVER

// SAFE — Prisma (parameterized by default)
const user = await prisma.user.findUnique({ where: { id: userId } })

// SAFE — raw query with tagged template (Prisma)
const users = await prisma.$queryRaw`SELECT * FROM users WHERE id = ${userId}`

// VULNERABLE — raw query with string interpolation
const users = await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE id = '${userId}'`)  // NEVER
```

**SQL Injection Rules:**
- Always use parameterized queries or ORM methods
- Never concatenate user input into SQL strings
- Use `$queryRaw` (tagged template), never `$queryRawUnsafe` with user input
- Validate and type-check IDs before database queries

## CSRF Protection

| Strategy | Implementation | When |
|----------|---------------|------|
| SameSite cookies | `Set-Cookie: ...; SameSite=Strict` | Default for all auth cookies |
| CSRF tokens | Generate per-session, validate on server | Forms in non-SPA apps |
| Double-submit cookie | Cookie + header must match | SPA + API architecture |
| Origin header check | Verify `Origin`/`Referer` header | Additional layer |

```typescript
// Next.js Server Actions have CSRF protection built-in
// For custom APIs with cookie auth:
app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  next()
})
```

## Security Headers

### Helmet.js Setup

```typescript
import helmet from 'helmet'

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'strict-dynamic'"],
      styleSrc: ["'self'", "'unsafe-inline'"],  // needed for most CSS-in-JS
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.example.com'],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}))
```

### Security Headers Reference

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Security-Policy` | See above | Prevent XSS, data injection |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Force HTTPS |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer info |
| `Permissions-Policy` | `camera=(), microphone=()` | Restrict browser features |

### Next.js Security Headers

```typescript
// next.config.js
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
]

module.exports = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}
```

## Authentication Security

### Password Handling

```typescript
import bcrypt from 'bcrypt'

// Hashing (ALWAYS async — don't block event loop)
const SALT_ROUNDS = 12
const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS)

// Verification
const isValid = await bcrypt.compare(plainPassword, hashedPassword)
```

**Password Rules:**
- bcrypt with 12+ salt rounds (or Argon2id)
- Never store plain-text passwords
- Never log passwords or tokens
- Enforce minimum 8 characters (NIST recommends no complexity rules)
- Check against breached password lists (Have I Been Pwned API)

### Token Security

| Token Type | Storage | Lifetime | Rotation |
|-----------|---------|----------|----------|
| Access token | Memory (JS variable) | 15 minutes | On refresh |
| Refresh token | httpOnly cookie | 7 days | On use (rotate) |
| Session ID | httpOnly cookie | Until logout | On privilege change |
| API key | Server-side only | Long-lived | On compromise |

## Rate Limiting

```typescript
import rateLimit from 'express-rate-limit'

// Global rate limit
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                   // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
}))

// Strict limit on auth endpoints
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,                     // 5 attempts per 15 min
  skipSuccessfulRequests: true,
}))
```

## CORS Configuration

```typescript
import cors from 'cors'

// NEVER in production:
app.use(cors())  // allows ALL origins

// Production CORS:
app.use(cors({
  origin: ['https://myapp.com', 'https://staging.myapp.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
}))
```

## Dependency Audit Workflow

```bash
# Check for known vulnerabilities
npm audit

# Auto-fix what's safe
npm audit fix

# Check with Snyk (more comprehensive)
npx snyk test

# Keep dependencies updated
npx npm-check-updates -u

# Review before updating
npx npm-check-updates --interactive
```

**Dependency Rules:**
- Run `npm audit` in CI pipeline
- Enable Dependabot or Renovate for automated PRs
- Pin exact versions in production apps
- Review changelogs before major version bumps
- Remove unused dependencies regularly

## Security Audit Checklist

- [ ] All user input validated server-side with Zod
- [ ] No `dangerouslySetInnerHTML` with user content (or sanitized with DOMPurify)
- [ ] SQL queries parameterized (no string concatenation)
- [ ] Passwords hashed with bcrypt (12+ rounds) or Argon2id
- [ ] Tokens stored securely (access in memory, refresh in httpOnly cookie)
- [ ] Security headers configured (CSP, HSTS, X-Frame-Options)
- [ ] CORS restricted to specific origins
- [ ] Rate limiting on auth and sensitive endpoints
- [ ] No secrets in code or client bundles
- [ ] Dependencies audited for vulnerabilities
- [ ] HTTPS enforced everywhere
- [ ] Error messages don't leak stack traces or internals
- [ ] File uploads validated (type, size, content)
- [ ] Admin routes require authorization (not just authentication)
- [ ] Logging captures security events (failed logins, permission denials)

## References

- `references/owasp-prevention.md` — detailed OWASP Top 10 prevention for each vulnerability
- `references/csp-guide.md` — Content Security Policy configuration for common frameworks
- `references/auth-security.md` — authentication hardening, session management, MFA
- `references/api-security.md` — API-specific security: rate limiting, API keys, OAuth scopes
- `examples/secure-express-setup.md` — Express app with all security best practices applied
- `examples/security-audit-report.md` — template for conducting a security audit

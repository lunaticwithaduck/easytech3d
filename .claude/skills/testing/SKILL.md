---
name: testing
description: This skill should be used when the user asks about "Playwright", "Cypress", "E2E test", "end-to-end", "unit test", "integration test", "test strategy", "mocking", "MSW", "test coverage", "Vitest", "Jest", "test fixtures", "snapshot testing", "TDD", "testing pyramid", or needs testing strategy and implementation knowledge.
keywords:
  - Playwright
  - Cypress
  - E2E test
  - end-to-end
  - unit test
  - integration test
  - test strategy
  - mocking
  - MSW
  - test coverage
  - Vitest
  - Jest
  - test fixtures
  - snapshot testing
  - TDD
  - testing pyramid
---

# Testing Strategy

Testing-layer skill covering test architecture, tool selection, unit/integration/E2E patterns, mocking strategies, and CI integration. Focuses on the modern JavaScript/TypeScript testing stack.

## Testing Trophy Decision Tree

```
What to test? (Prioritize by confidence-per-effort)
├── Integration tests (MOST VALUE)
│   ├── API route + database + validation
│   ├── Component + data fetching + user interaction
│   └── Multi-module workflows
│
├── End-to-end tests (CRITICAL PATHS ONLY)
│   ├── Auth flow (signup → login → protected page)
│   ├── Payment/checkout flow
│   └── Core business workflows
│
├── Unit tests (PURE LOGIC ONLY)
│   ├── Utility functions, transformations
│   ├── Business rule calculations
│   └── Complex conditional logic
│
└── Static analysis (FREE — always on)
    ├── TypeScript strict mode
    ├── ESLint
    └── Prettier
```

**Testing trophy (not pyramid):** Integration > E2E > Unit. Write more integration tests than unit tests — they catch the bugs that matter.

## Tool Selection

| Category | Recommended | Alternative | Notes |
|----------|------------|-------------|-------|
| Unit + Integration | **Vitest** | Jest | Vitest is faster, native ESM, Vite-compatible |
| Component | **Testing Library** | Enzyme (deprecated) | Framework-agnostic, tests behavior |
| E2E | **Playwright** | Cypress | Multi-browser, faster, better DX |
| API mocking | **MSW** | nock | Intercepts at network level, works in browser + Node |
| Visual regression | Playwright screenshots | Chromatic | Built into Playwright, free |
| Coverage | **v8** (via Vitest) | Istanbul | v8 is faster and more accurate |

## Unit Testing with Vitest

### Setup

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom', // or 'node' for backend
    setupFiles: ['./tests/setup.ts'],
    coverage: { provider: 'v8', reporter: ['text', 'html'] },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

### Pattern

```typescript
import { describe, it, expect } from 'vitest'
import { calculateTotal } from './cart'

describe('calculateTotal', () => {
  it('sums item prices with quantity', () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 5, quantity: 3 },
    ]
    expect(calculateTotal(items)).toBe(35)
  })

  it('returns 0 for empty cart', () => {
    expect(calculateTotal([])).toBe(0)
  })

  it('applies discount code', () => {
    const items = [{ price: 100, quantity: 1 }]
    expect(calculateTotal(items, { code: 'SAVE10', percent: 10 })).toBe(90)
  })
})
```

**Unit test rules:**
- Test pure functions with clear inputs and outputs
- No mocking needed — if you need mocks, it's an integration test
- Fast: each test < 10ms
- Descriptive names: `it('returns 0 for empty cart')` not `it('works')`

## Integration Testing

### API Route Testing

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createServer } from '../server'
import { prisma } from '../db'

describe('POST /api/users', () => {
  let app: ReturnType<typeof createServer>

  beforeAll(async () => {
    app = createServer()
  })

  afterAll(async () => {
    await prisma.user.deleteMany()
    await prisma.$disconnect()
  })

  it('creates a user with valid data', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/users',
      payload: { email: 'test@example.com', name: 'Test' },
    })

    expect(res.statusCode).toBe(201)
    expect(res.json()).toMatchObject({ email: 'test@example.com' })
  })

  it('returns 400 for invalid email', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/users',
      payload: { email: 'not-an-email', name: 'Test' },
    })

    expect(res.statusCode).toBe(400)
    expect(res.json().code).toBe('VALIDATION_ERROR')
  })
})
```

### Component Integration Testing

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { UserProfile } from './UserProfile'

const server = setupServer(
  http.get('/api/user/:id', () =>
    HttpResponse.json({ id: '1', name: 'Alice', email: 'alice@example.com' })
  )
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('displays user profile after loading', async () => {
  render(<UserProfile userId="1" />)

  expect(screen.getByText(/loading/i)).toBeInTheDocument()
  await waitFor(() => {
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })
})

it('shows error when fetch fails', async () => {
  server.use(
    http.get('/api/user/:id', () => HttpResponse.json(null, { status: 500 }))
  )

  render(<UserProfile userId="1" />)

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })
})
```

## E2E with Playwright

### Setup and Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile', use: { ...devices['iPhone 14'] } },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
})
```

### Page Object Pattern

```typescript
// e2e/pages/login.page.ts
import { type Page, type Locator } from '@playwright/test'

export class LoginPage {
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator

  constructor(private page: Page) {
    this.emailInput = page.getByLabel('Email')
    this.passwordInput = page.getByLabel('Password')
    this.submitButton = page.getByRole('button', { name: /sign in/i })
    this.errorMessage = page.getByRole('alert')
  }

  async goto() { await this.page.goto('/login') }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }
}

// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/login.page'

test('successful login redirects to dashboard', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.goto()
  await loginPage.login('user@example.com', 'password123')

  await expect(page).toHaveURL('/dashboard')
  await expect(page.getByText(/welcome/i)).toBeVisible()
})
```

### Selector Priority

1. `page.getByRole('button', { name: /submit/i })` — accessible (best)
2. `page.getByLabel('Email')` — form fields
3. `page.getByText('Welcome back')` — visible text
4. `page.getByTestId('checkout-btn')` — last resort

## Mocking with MSW

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/users', () =>
    HttpResponse.json([
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ])
  ),
  http.post('/api/users', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: '3', ...body }, { status: 201 })
  }),
]
```

**MSW Rules:**
- Define default handlers for common endpoints
- Override per-test for error/edge cases with `server.use()`
- Works in both browser (service worker) and Node (interceptor)
- Never mock at the module level — mock at the network level

## What to Test / What NOT to Test

| Test | Don't Test |
|------|-----------|
| Business logic and calculations | Third-party library internals |
| User interactions and flows | Implementation details (state shape, method names) |
| Error states and edge cases | CSS styling or exact DOM structure |
| API contract (request/response shape) | Console.log output |
| Accessibility (roles, labels) | Framework lifecycle methods |
| Data transformations | Constants and config values |

## CI Integration Pattern

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx vitest --coverage
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Common Testing Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Testing implementation details | Tests break on refactor | Test behavior and outcomes |
| Too many unit tests, too few integration | High coverage, bugs in production | Write integration tests first |
| Mocking everything | Tests pass but app doesn't work | Only mock external boundaries (network, time) |
| Flaky E2E tests | Random CI failures | Use proper waitFor/expect patterns, avoid timeouts |
| No test data cleanup | Tests depend on order | Reset state in beforeEach/afterEach |
| Snapshot overuse | Meaningless diffs, approve-all habit | Snapshots for serializable output only, not UI |
| Testing third-party code | Wasted effort | Trust the library, test your usage of it |
| Slow test suite | Developers skip tests | Parallelize, mock network, avoid real DB in unit tests |
| No error case tests | Errors crash in production | Test 400s, 500s, network failures, empty states |
| Coupling tests to CSS selectors | Tests break on styling changes | Use accessible selectors (role, label, text) |

## Pre-Delivery Checklist

- [ ] Critical user flows covered with E2E tests
- [ ] API endpoints have integration tests (success + error cases)
- [ ] Pure business logic has unit tests
- [ ] Mocking uses MSW at network level (not module mocks)
- [ ] Tests run in CI on every PR
- [ ] No flaky tests (retry count = 0 locally)
- [ ] Test data cleaned up between tests
- [ ] Coverage report configured (target: 80%+ for business logic)

## References

- `references/vitest-patterns.md` — Vitest configuration, matchers, async testing, mocking
- `references/playwright-patterns.md` — Playwright selectors, fixtures, API testing, visual regression
- `references/msw-guide.md` — MSW v2 setup, handlers, scenarios, browser + Node
- `references/testing-recipes.md` — recipes for forms, auth flows, file uploads, WebSocket testing
- `examples/integration-test-suite.md` — complete API + component integration test suite
- `examples/e2e-test-suite.md` — Playwright E2E for auth, CRUD, and checkout flows

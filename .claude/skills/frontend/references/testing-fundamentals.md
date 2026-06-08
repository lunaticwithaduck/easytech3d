# Testing Fundamentals

Testing trophy, Vitest patterns, Playwright E2E, and axe-core accessibility testing.

## Testing Trophy

```
      ╱  E2E  ╲         Few, critical user flows
     ╱─────────╲
    ╱Integration ╲      Most tests here
   ╱───────────────╲
  ╱      Unit       ╲   Pure logic, utilities
 ╱───────────────────╲
╱    Static Analysis   ╲ TypeScript, ESLint
```

| Layer | Tools | What to Test | Speed |
|-------|-------|-------------|-------|
| Static | TypeScript, ESLint | Type errors, code quality | Instant |
| Unit | Vitest | Pure functions, utilities, hooks | < 10ms |
| Integration | Vitest + RTL | Component behavior, user interactions | < 100ms |
| E2E | Playwright | Critical user journeys, cross-browser | 1-10s |

## Vitest Setup

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'tests/'],
    },
  },
})
```

```typescript
// tests/setup.ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => cleanup())
```

## Unit Testing Patterns

### Pure Functions

```typescript
import { describe, it, expect } from 'vitest'

describe('formatCurrency', () => {
  it('formats USD with 2 decimals', () => {
    expect(formatCurrency(1234.5, 'USD')).toBe('$1,234.50')
  })

  it('handles zero', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00')
  })

  it('handles negative values', () => {
    expect(formatCurrency(-50, 'USD')).toBe('-$50.00')
  })
})
```

### Table-Driven Tests

```typescript
it.each([
  ['hello world', 'hello-world'],
  ['Hello World', 'hello-world'],
  ['  spaces  ', 'spaces'],
  ['special!@#chars', 'specialchars'],
  ['already-slugged', 'already-slugged'],
])('slugify(%s) → %s', (input, expected) => {
  expect(slugify(input)).toBe(expected)
})
```

### Mocking

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock module
vi.mock('./api', () => ({
  fetchUsers: vi.fn(),
}))

// Mock function
const onSubmit = vi.fn()

// Spy on method
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

// Restore after
afterEach(() => {
  vi.restoreAllMocks()
})

// Timer mocks
vi.useFakeTimers()
// ... trigger debounce ...
vi.advanceTimersByTime(300)
vi.useRealTimers()
```

## React Testing Library

### Query Priority

Use queries in this order (most to least accessible):

1. `getByRole` — accessible role + name (best)
2. `getByLabelText` — form elements
3. `getByPlaceholderText` — when no label
4. `getByText` — non-interactive elements
5. `getByDisplayValue` — filled form inputs
6. `getByAltText` — images
7. `getByTitle` — title attribute
8. `getByTestId` — last resort

### Integration Test Example

```typescript
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('UserForm', () => {
  it('submits valid form data', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<UserForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/name/i), 'Jane Doe')
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com')
    await user.selectOptions(screen.getByLabelText(/role/i), 'admin')
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'admin',
    })
  })

  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup()
    render(<UserForm onSubmit={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
  })

  it('disables submit while loading', () => {
    render(<UserForm onSubmit={vi.fn()} isLoading />)

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
  })
})
```

### Async Patterns

```typescript
// Wait for element to appear
await screen.findByText('Success!')

// Wait for element to disappear
await waitForElementToBeRemoved(() => screen.queryByText('Loading...'))

// Wait for condition
await waitFor(() => {
  expect(screen.getByRole('list').children).toHaveLength(5)
})

// Query vs Get vs Find
screen.getByText('exists')        // throws if not found
screen.queryByText('maybe')       // returns null if not found
await screen.findByText('async')  // waits up to 1000ms
```

### MSW (Mock Service Worker) Integration

```typescript
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: '1', name: 'Alice', email: 'alice@example.com' },
      { id: '2', name: 'Bob', email: 'bob@example.com' },
    ])
  }),
  http.post('/api/users', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: '3', ...body }, { status: 201 })
  }),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('displays users from API', async () => {
  render(<UserList />)
  expect(await screen.findByText('Alice')).toBeInTheDocument()
  expect(screen.getByText('Bob')).toBeInTheDocument()
})

// Override handler for error test
it('shows error on API failure', async () => {
  server.use(
    http.get('/api/users', () => {
      return HttpResponse.json({ error: 'Server error' }, { status: 500 })
    }),
  )
  render(<UserList />)
  expect(await screen.findByText(/failed to load/i)).toBeInTheDocument()
})
```

## Playwright E2E

### Setup

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile', use: { ...devices['iPhone 14'] } },
  ],
})
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('user can log in and see dashboard', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('Email').fill('user@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: 'Log in' }).click()

    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('Email').fill('wrong@example.com')
    await page.getByLabel('Password').fill('wrong')
    await page.getByRole('button', { name: 'Log in' }).click()

    await expect(page.getByText('Invalid credentials')).toBeVisible()
    await expect(page).toHaveURL('/login')
  })
})
```

### Page Object Model

```typescript
class LoginPage {
  constructor(private page: Page) {}

  async goto() { await this.page.goto('/login') }
  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email)
    await this.page.getByLabel('Password').fill(password)
    await this.page.getByRole('button', { name: 'Log in' }).click()
  }
}

// Usage
test('login flow', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.goto()
  await loginPage.login('user@example.com', 'password123')
  await expect(page).toHaveURL('/dashboard')
})
```

## Accessibility Testing with axe-core

### Vitest + axe-core

```typescript
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

it('form has no accessibility violations', async () => {
  const { container } = render(<ContactForm />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### Playwright + axe-core

```typescript
import AxeBuilder from '@axe-core/playwright'

test('homepage has no a11y violations', async ({ page }) => {
  await page.goto('/')
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

// Test specific section
test('navigation is accessible', async ({ page }) => {
  await page.goto('/')
  const results = await new AxeBuilder({ page })
    .include('nav')
    .withRules(['color-contrast', 'link-name', 'list'])
    .analyze()
  expect(results.violations).toEqual([])
})
```

## What to Test Decision Tree

```
Is it a pure utility function?
  → Unit test with Vitest

Is it a React component?
  → Does it have user interactions?
    → Integration test with RTL + userEvent
  → Is it purely presentational?
    → Snapshot or visual regression test
  → Does it fetch data?
    → Integration test with MSW

Is it a critical user journey (login, checkout, signup)?
  → E2E test with Playwright

Is it a style/layout?
  → Visual regression with Playwright screenshots
  → Accessibility test with axe-core
```

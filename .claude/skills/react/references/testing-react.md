# React Testing

React Testing Library guide: queries, user events, async patterns, mocking, and MSW integration.

## Setup

```typescript
// tests/setup.ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => cleanup())
```

## Query Priority

Always prefer queries that reflect how users find elements:

```tsx
// 1. Role (best - how assistive technology sees it)
screen.getByRole('button', { name: /submit/i })
screen.getByRole('heading', { level: 2 })
screen.getByRole('textbox', { name: /email/i })
screen.getByRole('checkbox', { name: /terms/i })
screen.getByRole('combobox', { name: /country/i })
screen.getByRole('tab', { name: /settings/i })

// 2. Label text (forms)
screen.getByLabelText(/email address/i)

// 3. Placeholder (when no label)
screen.getByPlaceholderText(/search/i)

// 4. Text content (non-interactive)
screen.getByText(/no results found/i)

// 5. Display value (filled inputs)
screen.getByDisplayValue('jane@example.com')

// 6. Alt text (images)
screen.getByAltText(/user avatar/i)

// 7. Test ID (last resort)
screen.getByTestId('complex-chart')
```

## Query Variants

| Get | Query | Find | Use When |
|-----|-------|------|----------|
| `getBy` | `queryBy` | `findBy` | |
| Throws if missing | Returns null | Async wait | |
| Assert present | Assert absent | Async appear | |

```tsx
// Element must exist
screen.getByText('Hello')

// Element might not exist
expect(screen.queryByText('Error')).not.toBeInTheDocument()

// Element appears asynchronously
await screen.findByText('Loaded!')
```

## User Events

Always use `userEvent` over `fireEvent` for realistic behavior:

```tsx
import userEvent from '@testing-library/user-event'

it('handles user interactions', async () => {
  const user = userEvent.setup()

  // Click
  await user.click(screen.getByRole('button', { name: /save/i }))

  // Type
  await user.type(screen.getByLabelText(/name/i), 'Jane Doe')

  // Clear and type
  await user.clear(screen.getByLabelText(/email/i))
  await user.type(screen.getByLabelText(/email/i), 'new@email.com')

  // Select option
  await user.selectOptions(screen.getByLabelText(/role/i), 'admin')

  // Check checkbox
  await user.click(screen.getByRole('checkbox', { name: /terms/i }))

  // Tab navigation
  await user.tab()
  expect(screen.getByLabelText(/name/i)).toHaveFocus()

  // Keyboard
  await user.keyboard('{Enter}')
  await user.keyboard('{Escape}')

  // Hover
  await user.hover(screen.getByText('Tooltip trigger'))

  // Upload file
  const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
  await user.upload(screen.getByLabelText(/upload/i), file)
})
```

## Async Patterns

```tsx
// Wait for element to appear
const heading = await screen.findByRole('heading', { name: /dashboard/i })

// Wait for element to disappear
await waitForElementToBeRemoved(() => screen.queryByText(/loading/i))

// Wait for assertion
await waitFor(() => {
  expect(screen.getByRole('list').children).toHaveLength(5)
})

// Wait for multiple conditions
await waitFor(() => {
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  expect(screen.getByText(/3 results/i)).toBeInTheDocument()
})
```

## Rendering Patterns

### Basic Render

```tsx
import { render, screen } from '@testing-library/react'

it('renders greeting', () => {
  render(<Greeting name="Jane" />)
  expect(screen.getByText('Hello, Jane!')).toBeInTheDocument()
})
```

### With Providers

```tsx
function renderWithProviders(ui: React.ReactElement, options?: RenderOptions) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light">
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

// Usage
it('renders user profile', () => {
  renderWithProviders(<UserProfile userId="1" />)
  // ...
})
```

### With Router

```tsx
import { MemoryRouter, Route, Routes } from 'react-router-dom'

function renderWithRouter(ui: React.ReactElement, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="*" element={ui} />
      </Routes>
    </MemoryRouter>
  )
}
```

## Mocking Hooks

```tsx
// Mock a custom hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Test User', role: 'admin' },
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}))

// Mock with different values per test
import * as authHook from '@/hooks/useAuth'

it('shows login button when not authenticated', () => {
  vi.spyOn(authHook, 'useAuth').mockReturnValue({
    user: null,
    isAuthenticated: false,
    logout: vi.fn(),
  })
  render(<Header />)
  expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument()
})
```

## MSW (Mock Service Worker)

### Setup

```tsx
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

// Default handlers
export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: '1', name: 'Alice', email: 'alice@example.com' },
      { id: '2', name: 'Bob', email: 'bob@example.com' },
    ])
  }),

  http.get('/api/users/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'Alice',
      email: 'alice@example.com',
    })
  }),

  http.post('/api/users', async ({ request }) => {
    const body = await request.json() as CreateUserInput
    return HttpResponse.json({ id: '3', ...body }, { status: 201 })
  }),

  http.delete('/api/users/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),
]

export const server = setupServer(...handlers)

// tests/setup.ts
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### Override Handlers in Tests

```tsx
it('shows error state on API failure', async () => {
  server.use(
    http.get('/api/users', () => {
      return HttpResponse.json(
        { message: 'Internal Server Error' },
        { status: 500 },
      )
    }),
  )

  renderWithProviders(<UserList />)

  expect(await screen.findByText(/failed to load users/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
})

it('shows empty state when no users', async () => {
  server.use(
    http.get('/api/users', () => HttpResponse.json([])),
  )

  renderWithProviders(<UserList />)

  expect(await screen.findByText(/no users found/i)).toBeInTheDocument()
})
```

## Testing Patterns

### Form Submission

```tsx
it('submits form with valid data', async () => {
  const user = userEvent.setup()
  const onSubmit = vi.fn()
  render(<ContactForm onSubmit={onSubmit} />)

  await user.type(screen.getByLabelText(/name/i), 'Jane Doe')
  await user.type(screen.getByLabelText(/email/i), 'jane@example.com')
  await user.type(screen.getByLabelText(/message/i), 'Hello, this is my message')
  await user.click(screen.getByRole('button', { name: /send/i }))

  expect(onSubmit).toHaveBeenCalledWith({
    name: 'Jane Doe',
    email: 'jane@example.com',
    message: 'Hello, this is my message',
  })
})

it('shows validation errors', async () => {
  const user = userEvent.setup()
  render(<ContactForm onSubmit={vi.fn()} />)

  await user.click(screen.getByRole('button', { name: /send/i }))

  expect(screen.getByText(/name is required/i)).toBeInTheDocument()
  expect(screen.getByText(/email is required/i)).toBeInTheDocument()
})
```

### Loading → Success → Error States

```tsx
it('shows loading, then data', async () => {
  renderWithProviders(<UserList />)

  // Loading state
  expect(screen.getByText(/loading/i)).toBeInTheDocument()

  // Data loaded
  expect(await screen.findByText('Alice')).toBeInTheDocument()
  expect(screen.getByText('Bob')).toBeInTheDocument()
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
})
```

### Accessibility Testing

```tsx
import { axe, toHaveNoViolations } from 'jest-axe'
expect.extend(toHaveNoViolations)

it('has no accessibility violations', async () => {
  const { container } = render(<Navigation />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

## What NOT to Test

- Implementation details (internal state, private methods)
- Third-party library internals
- Styling (unless critical to functionality)
- Exact text content that changes frequently
- Component snapshot structure (prefer behavior tests)

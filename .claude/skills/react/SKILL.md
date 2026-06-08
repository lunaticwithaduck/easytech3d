---
name: react
description: This skill should be used for any React work — components, JSX/TSX, hooks (useState, useEffect, useRef, useMemo, useCallback, useContext, useReducer, custom hooks), props, state, render guards, conditional rendering, early-return refactors, hook extraction, RTK Query (useQuery / useMutation / skipToken), redux toolkit, client/server components, React Server Components, Suspense, error boundaries, React Hook Form, React Testing Library, performance, or compound/render-prop/polymorphic component patterns.
keywords:
  - React
  - JSX
  - TSX
  - React component
  - React hook
  - custom hook
  - hook extraction
  - extract hook
  - useState
  - useEffect
  - useRef
  - useContext
  - useMemo
  - useCallback
  - useReducer
  - useTransition
  - useDeferredValue
  - useId
  - useImperativeHandle
  - useLayoutEffect
  - useSyncExternalStore
  - props
  - state
  - render
  - rerender
  - early return
  - if ladder
  - conditional rendering
  - render guard
  - orchestrator
  - flow hook
  - side effect
  - dependency array
  - stale closure
  - client component
  - server component
  - use client
  - RSC
  - RTK Query
  - useQuery
  - useMutation
  - skipToken
  - redux toolkit
  - discriminated union
  - tagged union
  - React performance
  - React testing
  - React Testing Library
  - RTL
  - React Hook Form
  - compound component
  - render props
  - polymorphic component
  - React error boundary
  - React Suspense
  - forwardRef
---

# React Skill

React-specific patterns, hooks, state management, performance, and testing. Extends the `frontend` skill with React expertise.

## Component Architecture Decision Tree

```
Building a new component?
├── Does it need browser APIs, event handlers, or state?
│   ├── Yes → Client Component ("use client")
│   └── No → Server Component (default in App Router)
│
├── Is it reusable across pages?
│   ├── Yes → Put in components/ with clear props interface
│   └── No → Co-locate with the page/feature
│
├── Is it getting large (>200 lines)?
│   ├── Split into smaller components
│   ├── Extract custom hooks for logic
│   └── Keep UI and logic separated
│
└── Does it need data?
    ├── Server data → Fetch in Server Component, pass as props
    ├── Client state → useState/useReducer
    ├── Shared state → Zustand store or Context
    ├── Server state in client → TanStack Query
    └── Form state → React Hook Form
```

## Hooks Quick Reference

| Hook | Use For | Anti-Pattern |
|------|---------|-------------|
| `useState` | Simple local state | Derived state (compute in render instead) |
| `useReducer` | Complex state with transitions | Simple boolean toggles |
| `useEffect` | Sync with external systems | Deriving state, data fetching (use TanStack Query) |
| `useRef` | DOM references, mutable values | Storing render-dependent values |
| `useMemo` | Expensive computations | Premature optimization of cheap calculations |
| `useCallback` | Stable function references | Every function (only when passed to memo'd children) |
| `useContext` | Dependency injection, themes | Frequently changing state (causes all consumers to re-render) |
| `useTransition` | Non-urgent state updates | Urgent UI feedback (input typing) |
| `useDeferredValue` | Deferred rendering of expensive children | Data fetching delays |
| `useId` | Generating unique IDs for accessibility | Keys in lists (use stable data IDs) |
| `useImperativeHandle` | Customizing ref-exposed API | Exposing internal state (use props) |

### Effect Rules

```
Need to sync with external system?
├── DOM manipulation → useEffect or useLayoutEffect
├── Subscription → useEffect with cleanup
├── Timer → useEffect with cleanup
├── NOT for: transforming data, handling events, or fetching
```

Always include cleanup:

```tsx
useEffect(() => {
  const controller = new AbortController()
  fetch(url, { signal: controller.signal }).then(/* ... */)
  return () => controller.abort()
}, [url])
```

## State Management Decision Tree

```
What kind of state?
├── UI state (modals, toggles, form inputs)
│   └── useState or useReducer (local)
│
├── Shared UI state (sidebar open, theme)
│   └── Zustand (lightweight, no providers)
│
├── Server/async state (API data)
│   └── TanStack Query (caching, background refresh, optimistic)
│
├── URL state (filters, pagination, search)
│   └── URL search params (useSearchParams)
│
└── Form state (validation, dirty tracking)
    └── React Hook Form + Zod
```

### Zustand Quick Pattern

```tsx
import { create } from 'zustand'

interface AppStore {
  sidebarOpen: boolean
  toggleSidebar: () => void
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
}

const useAppStore = create<AppStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  theme: 'light',
  setTheme: (theme) => set({ theme }),
}))

// Use with selector (prevents unnecessary re-renders)
const sidebarOpen = useAppStore((s) => s.sidebarOpen)
```

### TanStack Query Quick Pattern

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Read
const { data, isLoading, error } = useQuery({
  queryKey: ['users', filters],
  queryFn: () => fetchUsers(filters),
})

// Write with optimistic update
const queryClient = useQueryClient()
const mutation = useMutation({
  mutationFn: updateUser,
  onMutate: async (newUser) => {
    await queryClient.cancelQueries({ queryKey: ['users'] })
    const previous = queryClient.getQueryData(['users'])
    queryClient.setQueryData(['users'], (old) => /* optimistic update */)
    return { previous }
  },
  onError: (err, vars, context) => {
    queryClient.setQueryData(['users'], context.previous)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] })
  },
})
```

## Component Patterns Catalog

| Pattern | When | Complexity |
|---------|------|-----------|
| **Props + children** | Simple composition | Low |
| **Compound components** | Related components sharing implicit state (Select + Option) | Medium |
| **Render props** | Flexible rendering control by parent | Medium |
| **Custom hooks** | Reusable logic across components | Low–Medium |
| **Polymorphic `as` prop** | Component renders as different HTML elements | Medium |
| **Slot pattern** | Named insertion points (header, footer, actions) | Low |
| **HOC (higher-order)** | Cross-cutting concerns (withAuth, withTheme) | High (avoid if possible) |
| **Provider + hook** | Dependency injection for subtree | Medium |

## Performance Rules

1. **Don't optimize prematurely.** React is fast. Profile first with React DevTools.
2. **Prevent unnecessary re-renders:**
   - Lift state down (keep state close to where it's used)
   - Use Zustand selectors (not entire store)
   - Memoize expensive children with `React.memo` + stable props
3. **Code split heavy components:** `lazy(() => import('./HeavyComponent'))`
4. **Virtualize long lists:** Use `@tanstack/react-virtual` for 100+ items
5. **Debounce rapid updates:** Search inputs, resize handlers
6. **Use `useTransition`** for non-urgent updates (filtering large lists)

### Re-Render Causes

| Cause | Fix |
|-------|-----|
| Parent re-renders | `React.memo` if props are stable |
| New object/array prop on every render | `useMemo` the value |
| New function prop on every render | `useCallback` (only if child is memo'd) |
| Context value changes | Split contexts, use selectors |
| State update | Normal — keep state scoped |

## Testing with React Testing Library

**Philosophy:** Test behavior, not implementation. If a user can't see or interact with it, don't test it.

### Query Priority

1. `getByRole('button', { name: /submit/i })` — accessible (best)
2. `getByLabelText(/email/i)` — form fields
3. `getByText(/welcome/i)` — visible text
4. `getByTestId('custom')` — last resort

### Pattern

```tsx
// Arrange
const user = userEvent.setup()
render(<Component />)

// Act
await user.click(screen.getByRole('button', { name: /save/i }))

// Assert
expect(screen.getByText(/saved/i)).toBeInTheDocument()
```

## Common React Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| State for derived data | Extra re-renders, stale values | Compute in render body |
| `useEffect` for event handling | Delayed execution, race conditions | Handle in event handler directly |
| Missing dependency in useEffect | Stale closures, infinite loops | Add all dependencies, restructure if needed |
| Storing props in state | State and props diverge | Use props directly, derive values |
| Object/array in dependency array | Effect runs every render | `useMemo` the value or compare deeply |
| Context for frequently changing data | All consumers re-render | Zustand or split context |
| Index as key in dynamic lists | Wrong items update on reorder | Use stable unique IDs |
| Mutating state directly | UI doesn't update | Always create new objects/arrays |
| `useEffect` with `[]` for data fetching | No loading/error states, no cache | TanStack Query |
| Giant component files | Hard to test and maintain | Extract hooks + split components |

## References

- `~/.claude/skills/react/references/hooks-deep-dive.md` — every built-in hook with rules, anti-patterns, decision trees
- `~/.claude/skills/react/references/component-patterns.md` — compound components, render props, polymorphic, slots, forwardRef
- `~/.claude/skills/react/references/state-management.md` — Zustand, TanStack Query, React Hook Form, optimistic updates
- `~/.claude/skills/react/references/testing-react.md` — RTL guide: queries, async, mocking hooks, MSW integration
- `~/.claude/skills/react/references/react-performance.md` — profiling, re-render causes, memo strategies, code splitting
- `~/.claude/skills/react/examples/data-fetching-pattern.md` — TanStack Query + custom hooks + error boundaries
- `~/.claude/skills/react/examples/form-pattern.md` — RHF + Zod + field arrays + error display
- `~/.claude/skills/react/examples/compound-component.md` — accessible Select/Dropdown with TypeScript
- `~/.claude/skills/react/references/project-patterns.md` — majstorbg-specific render/extraction/i18n patterns (autolearned from workflows/done/*.sc)
# React Hooks Deep Dive

Every built-in hook with rules, decision trees, and anti-patterns.

## useState

```tsx
const [count, setCount] = useState(0)

// Functional update (when new state depends on previous)
setCount(prev => prev + 1)

// Lazy initialization (expensive computation)
const [data, setData] = useState(() => computeExpensiveDefault())
```

**Rules:**
- Never mutate state directly: `state.push(item)` is wrong, use `[...state, item]`
- Functional updates for state that depends on previous value
- Lazy initializer only runs on first render

**Anti-patterns:**
- Storing derived data: compute `filteredList` in render, don't store it
- Storing props in state: use props directly (state copy will become stale)
- Multiple related states: consider `useReducer` for state machines

## useReducer

```tsx
type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset'; payload: number }

function reducer(state: number, action: Action): number {
  switch (action.type) {
    case 'increment': return state + 1
    case 'decrement': return state - 1
    case 'reset': return action.payload
  }
}

const [count, dispatch] = useReducer(reducer, 0)
dispatch({ type: 'increment' })
```

**Use when:**
- State transitions follow specific rules
- Multiple related state values change together
- State logic is complex enough to test independently
- You'd otherwise have 4+ related `useState` calls

## useEffect

```tsx
// Runs after every render
useEffect(() => { /* ... */ })

// Runs once on mount
useEffect(() => {
  /* setup */
  return () => { /* cleanup */ }
}, [])

// Runs when dependencies change
useEffect(() => {
  const controller = new AbortController()
  fetchData(id, { signal: controller.signal })
  return () => controller.abort()
}, [id])
```

**Decision tree: Do you need useEffect?**

```
What are you trying to do?
├── Transform data for rendering → No. Compute during render.
├── Handle a user event → No. Use the event handler.
├── Send analytics on page view → Yes.
├── Subscribe to external store → Prefer useSyncExternalStore.
├── Fetch data → Prefer TanStack Query or framework data fetching.
├── Set up a timer/interval → Yes, with cleanup.
├── Focus an element on mount → Yes (or useRef callback).
├── Sync with browser API → Yes.
└── Initialize third-party library → Yes, with cleanup.
```

**Common mistakes:**
- Missing cleanup (memory leaks with subscriptions, timers)
- Object/function dependencies causing infinite loops
- Fetching without cancellation (race conditions)

## useRef

```tsx
// DOM reference
const inputRef = useRef<HTMLInputElement>(null)
// inputRef.current?.focus()

// Mutable value that persists across renders (no re-render on change)
const timerIdRef = useRef<number | null>(null)
const renderCountRef = useRef(0)

useEffect(() => {
  renderCountRef.current += 1
})
```

**Use for:**
- DOM element references
- Storing previous values
- Instance variables (timer IDs, mutation observers)
- Values needed in effects/callbacks that shouldn't trigger re-renders

**Never use for:**
- Values that should trigger re-renders (use `useState`)
- Values displayed in the UI (changes won't be reflected)

## useMemo and useCallback

```tsx
// Memoize expensive computation
const filtered = useMemo(
  () => items.filter(item => item.name.includes(search)),
  [items, search]
)

// Memoize function (stable reference for memo'd children)
const handleClick = useCallback(
  (id: string) => deleteItem(id),
  [deleteItem]
)
```

**When to use useMemo:**
- Filtering/sorting large lists (1000+ items)
- Complex calculations in render
- Creating objects/arrays passed to memo'd children
- Values used as effect dependencies

**When to use useCallback:**
- Functions passed to `React.memo()` wrapped children
- Functions used as effect dependencies
- Functions passed to custom hooks that track identity

**When NOT to use:**
- Simple computations (overhead > benefit)
- Functions not passed to children
- Primitive dependencies that rarely change

## useContext

```tsx
const ThemeContext = createContext<Theme>('light')

// Provider
function App() {
  const [theme, setTheme] = useState<Theme>('light')
  return (
    <ThemeContext.Provider value={theme}>
      <Main />
    </ThemeContext.Provider>
  )
}

// Consumer
function Button() {
  const theme = useContext(ThemeContext)
  return <button className={theme}>Click</button>
}
```

**Anti-patterns:**
- Using context for frequently changing state (every consumer re-renders)
- Putting everything in one giant context
- Not splitting read and write contexts

**Pattern — split contexts for performance:**

```tsx
const ThemeValueContext = createContext<Theme>('light')
const ThemeSetterContext = createContext<(t: Theme) => void>(() => {})

// Components that only set theme won't re-render when theme changes
```

## useTransition

```tsx
const [isPending, startTransition] = useTransition()

function handleFilter(query: string) {
  setInput(query) // Urgent: update input immediately
  startTransition(() => {
    setFilteredResults(filter(allItems, query)) // Non-urgent: can be interrupted
  })
}

return (
  <>
    <input value={input} onChange={e => handleFilter(e.target.value)} />
    {isPending ? <Spinner /> : <ResultList results={filteredResults} />}
  </>
)
```

**Use when:** A state update causes expensive re-renders (large list filtering, complex UI updates) and you want to keep the UI responsive.

## useDeferredValue

```tsx
function SearchResults({ query }: { query: string }) {
  const deferredQuery = useDeferredValue(query)
  const isStale = query !== deferredQuery

  const results = useMemo(
    () => expensiveFilter(items, deferredQuery),
    [deferredQuery]
  )

  return (
    <div style={{ opacity: isStale ? 0.7 : 1 }}>
      <ResultList results={results} />
    </div>
  )
}
```

**Difference from useTransition:** `useDeferredValue` defers the value itself (useful when you don't control the state update). `useTransition` wraps the state update.

## useId

```tsx
function FormField({ label }: { label: string }) {
  const id = useId()
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </>
  )
}
```

**Use for:** Generating unique IDs for accessibility attributes (`htmlFor`, `aria-describedby`). Works with SSR (consistent between server and client).

**Never use for:** List keys or CSS selectors.

## useImperativeHandle

```tsx
const Input = forwardRef<InputHandle, InputProps>((props, ref) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clear: () => {
      if (inputRef.current) inputRef.current.value = ''
    },
  }))

  return <input ref={inputRef} {...props} />
})

// Parent
const ref = useRef<InputHandle>(null)
ref.current?.focus()
ref.current?.clear()
```

**Use sparingly.** Only when you need to expose a limited imperative API to parent components.

## useSyncExternalStore

```tsx
function useWindowWidth() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('resize', callback)
      return () => window.removeEventListener('resize', callback)
    },
    () => window.innerWidth,     // client
    () => 1024,                  // server (SSR)
  )
}
```

**Use for:** Subscribing to external stores (browser APIs, third-party state libraries, global variables).

## useLayoutEffect

Same as `useEffect` but fires synchronously after DOM mutations, before browser paint.

**Use when:**
- Measuring DOM layout (getBoundingClientRect)
- Preventing visual flicker (tooltip positioning)
- Synchronously updating DOM before user sees it

**Avoid when:** `useEffect` works fine (most cases). `useLayoutEffect` blocks painting.

## Custom Hook Rules

1. Name starts with `use`
2. Call hooks at the top level (not inside conditions/loops)
3. Only call from React functions (components or other hooks)
4. Return a clear, minimal interface
5. Accept dependencies as arguments when they affect behavior

```tsx
// Good: focused, reusable
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
```
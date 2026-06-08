# React Performance

Profiling, re-render causes, memoization strategies, virtualization, and code splitting.

## Re-Render Causes

A component re-renders when:

1. **Its state changes** (setState)
2. **Its parent re-renders** (unless wrapped in React.memo with stable props)
3. **Its context value changes** (any consumer of that context)
4. **A custom hook's state changes**

### Identifying Unnecessary Re-Renders

```tsx
// React DevTools Profiler
// 1. Open React DevTools → Profiler tab
// 2. Click "Highlight updates when components render"
// 3. Interact with your app
// 4. Look for components that re-render unnecessarily

// Console logging (development only)
function ExpensiveComponent({ data }: Props) {
  console.count('ExpensiveComponent render')
  // ...
}

// why-did-you-render (development)
// npm install @welldone-software/why-did-you-render
ExpensiveComponent.whyDidYouRender = true
```

## React.memo

Prevents re-render if props haven't changed (shallow comparison).

```tsx
// Wrap expensive components that receive stable props
const ExpensiveList = React.memo(function ExpensiveList({ items }: { items: Item[] }) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{/* expensive rendering */}</li>
      ))}
    </ul>
  )
})

// Custom comparison (rare, usually shallow is fine)
const Chart = React.memo(
  function Chart({ data, config }: ChartProps) { /* ... */ },
  (prevProps, nextProps) => {
    return prevProps.data.length === nextProps.data.length
      && prevProps.config.type === nextProps.config.type
  },
)
```

**When to use React.memo:**
- Component renders expensively (long lists, charts, complex DOM)
- Component receives the same props often
- Parent re-renders frequently but child's props are stable

**When NOT to use:**
- Component is cheap to render
- Props change on almost every render
- Component always receives new objects/functions

## Memoization Strategy

```tsx
function ParentComponent() {
  const [search, setSearch] = useState('')
  const [data, setData] = useState<Item[]>([])

  // Problem: new array reference every render → child re-renders
  const filteredData = data.filter(item => item.name.includes(search))

  // Fix: memoize the computation
  const filteredData = useMemo(
    () => data.filter(item => item.name.includes(search)),
    [data, search],
  )

  // Problem: new function reference every render → memo'd child re-renders
  const handleDelete = (id: string) => deleteItem(id)

  // Fix: stable function reference
  const handleDelete = useCallback(
    (id: string) => deleteItem(id),
    [deleteItem],
  )

  return <MemoizedList items={filteredData} onDelete={handleDelete} />
}
```

### The Memoization Decision

```
Is the child component expensive to render?
├── No → Don't bother with memo/useMemo/useCallback
└── Yes → Is it wrapped in React.memo?
    ├── No → Wrap it first
    └── Yes → Are its props stable?
        ├── Objects/arrays → useMemo the prop value
        ├── Functions → useCallback the prop function
        └── Primitives → Already stable, nothing to do
```

## Component Composition (No-Memo Pattern)

Often, restructuring components eliminates the need for memoization:

```tsx
// Bad: SlowComponent re-renders on every keystroke
function Page() {
  const [search, setSearch] = useState('')
  return (
    <div>
      <input value={search} onChange={e => setSearch(e.target.value)} />
      <SlowComponent /> {/* re-renders on every keystroke! */}
    </div>
  )
}

// Good: Lift the stateful part into its own component
function SearchInput() {
  const [search, setSearch] = useState('')
  return <input value={search} onChange={e => setSearch(e.target.value)} />
}

function Page() {
  return (
    <div>
      <SearchInput />
      <SlowComponent /> {/* no longer re-renders on keystroke */}
    </div>
  )
}

// Alternative: Pass as children (children are stable references)
function SearchLayout({ children }: { children: React.ReactNode }) {
  const [search, setSearch] = useState('')
  return (
    <div>
      <input value={search} onChange={e => setSearch(e.target.value)} />
      {children} {/* stable reference, won't cause re-render */}
    </div>
  )
}

<SearchLayout>
  <SlowComponent />
</SearchLayout>
```

## Virtualization

For lists with 100+ items, render only visible items.

```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64, // estimated row height in px
    overscan: 5, // render 5 extra items above/below viewport
  })

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <ItemRow item={items[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Code Splitting

### Route-Level Splitting

```tsx
import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Settings = lazy(() => import('./pages/Settings'))
const Analytics = lazy(() => import('./pages/Analytics'))

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Suspense>
  )
}
```

### Component-Level Splitting

```tsx
// Heavy components loaded on demand
const CodeEditor = lazy(() => import('./components/CodeEditor'))
const ChartLibrary = lazy(() => import('./components/ChartLibrary'))
const MarkdownPreview = lazy(() => import('./components/MarkdownPreview'))

function PostEditor() {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <div>
      <Suspense fallback={<EditorSkeleton />}>
        <CodeEditor />
      </Suspense>
      {showPreview && (
        <Suspense fallback={<div>Loading preview...</div>}>
          <MarkdownPreview />
        </Suspense>
      )}
    </div>
  )
}
```

### Named Exports with Lazy

```tsx
// lazy() only supports default exports. For named exports:
const UserSettings = lazy(() =>
  import('./components/Settings').then(module => ({
    default: module.UserSettings,
  }))
)
```

## Context Performance

### Split Read and Write

```tsx
const ThemeContext = createContext<string>('light')
const ThemeDispatchContext = createContext<(theme: string) => void>(() => {})

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('light')
  return (
    <ThemeDispatchContext.Provider value={setTheme}>
      <ThemeContext.Provider value={theme}>
        {children}
      </ThemeContext.Provider>
    </ThemeDispatchContext.Provider>
  )
}

// Components that only toggle theme won't re-render when theme value changes
function ThemeToggle() {
  const setTheme = useContext(ThemeDispatchContext) // stable, no re-render
  return <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>Toggle</button>
}
```

### Memoize Provider Value

```tsx
function Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Memoize to prevent all consumers re-rendering on Provider re-render
  const value = useMemo(() => ({ state, dispatch }), [state])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
```

## useTransition for Non-Urgent Updates

```tsx
function FilterableList({ items }: { items: Item[] }) {
  const [query, setQuery] = useState('')
  const [filtered, setFiltered] = useState(items)
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setQuery(value) // Urgent: update input immediately

    startTransition(() => {
      // Non-urgent: filter can be interrupted by more typing
      setFiltered(items.filter(item =>
        item.name.toLowerCase().includes(value.toLowerCase())
      ))
    })
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      <div style={{ opacity: isPending ? 0.7 : 1 }}>
        {filtered.map(item => <ItemCard key={item.id} item={item} />)}
      </div>
    </>
  )
}
```

## Performance Checklist

- [ ] Profile with React DevTools before optimizing
- [ ] Keep state as close to where it's used as possible
- [ ] Use composition (children prop) to avoid unnecessary re-renders
- [ ] `React.memo` only for expensive components with stable props
- [ ] `useMemo`/`useCallback` only when children are memo'd
- [ ] Virtualize lists with 100+ items
- [ ] Lazy load routes and heavy components
- [ ] Use Zustand selectors (not entire store subscriptions)
- [ ] Split context into read/write for frequently changing data
- [ ] Use `useTransition` for non-urgent expensive updates

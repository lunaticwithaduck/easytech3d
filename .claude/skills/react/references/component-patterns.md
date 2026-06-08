# React Component Patterns

Compound components, render props, polymorphic, slots, forwardRef, and composition patterns.

## Compound Components

Components that share implicit state through Context.

```tsx
// --- Context ---
type SelectContextType = {
  value: string
  onChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = createContext<SelectContextType | null>(null)

function useSelectContext() {
  const ctx = useContext(SelectContext)
  if (!ctx) throw new Error('Select compound components must be used within <Select>')
  return ctx
}

// --- Root ---
function Select({ value, onChange, children }: {
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <SelectContext.Provider value={{ value, onChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

// --- Trigger ---
function SelectTrigger({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useSelectContext()
  return (
    <button
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      onClick={() => setOpen(!open)}
      className="flex h-10 w-full items-center justify-between rounded-lg border px-3"
    >
      {children}
    </button>
  )
}

// --- Content ---
function SelectContent({ children }: { children: React.ReactNode }) {
  const { open } = useSelectContext()
  if (!open) return null
  return (
    <ul role="listbox" className="absolute z-50 mt-1 w-full rounded-lg border bg-background shadow-lg">
      {children}
    </ul>
  )
}

// --- Item ---
function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  const { value: selected, onChange, setOpen } = useSelectContext()
  return (
    <li
      role="option"
      aria-selected={selected === value}
      onClick={() => { onChange(value); setOpen(false) }}
      className={cn('cursor-pointer px-3 py-2 hover:bg-accent', selected === value && 'bg-accent')}
    >
      {children}
    </li>
  )
}

// --- Attach sub-components ---
Select.Trigger = SelectTrigger
Select.Content = SelectContent
Select.Item = SelectItem

// --- Usage ---
<Select value={role} onChange={setRole}>
  <Select.Trigger>{role || 'Select role...'}</Select.Trigger>
  <Select.Content>
    <Select.Item value="admin">Admin</Select.Item>
    <Select.Item value="editor">Editor</Select.Item>
    <Select.Item value="viewer">Viewer</Select.Item>
  </Select.Content>
</Select>
```

## Render Props

Let the parent control what gets rendered using a function.

```tsx
type DataListProps<T> = {
  items: T[]
  isLoading: boolean
  error: Error | null
  renderItem: (item: T) => React.ReactNode
  renderEmpty?: () => React.ReactNode
  renderError?: (error: Error) => React.ReactNode
  renderLoading?: () => React.ReactNode
  keyExtractor: (item: T) => string
}

function DataList<T>({
  items, isLoading, error,
  renderItem, renderEmpty, renderError, renderLoading, keyExtractor,
}: DataListProps<T>) {
  if (isLoading) return renderLoading?.() ?? <div>Loading...</div>
  if (error) return renderError?.(error) ?? <div>Error: {error.message}</div>
  if (items.length === 0) return renderEmpty?.() ?? <div>No items</div>

  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  )
}

// Usage
<DataList
  items={users}
  isLoading={isLoading}
  error={error}
  keyExtractor={u => u.id}
  renderItem={user => <UserCard user={user} />}
  renderEmpty={() => <EmptyState message="No users found" />}
/>
```

## Polymorphic Component (as prop)

```tsx
type PolymorphicProps<E extends React.ElementType> = {
  as?: E
  children?: React.ReactNode
  className?: string
} & Omit<React.ComponentPropsWithoutRef<E>, 'as' | 'className' | 'children'>

function Text<E extends React.ElementType = 'p'>({
  as,
  className,
  children,
  ...props
}: PolymorphicProps<E>) {
  const Component = as || 'p'
  return (
    <Component className={cn('text-base text-foreground', className)} {...props}>
      {children}
    </Component>
  )
}

// Usage
<Text>Default paragraph</Text>
<Text as="span" className="text-sm">Inline text</Text>
<Text as="h2" className="text-2xl font-bold">Heading</Text>
<Text as="label" htmlFor="email">Email</Text>  // htmlFor is typed!
```

## Slot Pattern

Named insertion points for flexible composition.

```tsx
type CardProps = {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  actions?: React.ReactNode
}

function Card({ children, header, footer, actions }: CardProps) {
  return (
    <article className="rounded-xl border">
      {header && (
        <div className="border-b px-6 py-4">{header}</div>
      )}
      <div className="p-6">{children}</div>
      {(footer || actions) && (
        <div className="flex items-center justify-between border-t px-6 py-4">
          <div>{footer}</div>
          <div className="flex gap-2">{actions}</div>
        </div>
      )}
    </article>
  )
}

// Usage
<Card
  header={<h3 className="font-semibold">User Profile</h3>}
  footer={<span className="text-sm text-muted-foreground">Last updated: today</span>}
  actions={
    <>
      <Button variant="outline">Cancel</Button>
      <Button>Save</Button>
    </>
  }
>
  <p>Card content goes here</p>
</Card>
```

## forwardRef Pattern

```tsx
type InputProps = React.ComponentPropsWithoutRef<'input'> & {
  label: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const inputId = id || useId()
    const errorId = error ? `${inputId}-error` : undefined

    return (
      <div className="space-y-2">
        <label htmlFor={inputId} className="text-sm font-medium">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={cn(
            'flex h-10 w-full rounded-lg border px-3 text-sm',
            error && 'border-destructive',
            className,
          )}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
```

## Provider + Hook Pattern

Dependency injection for a subtree of components.

```tsx
// --- Types ---
type ToastType = 'success' | 'error' | 'info'
type Toast = { id: string; message: string; type: ToastType }

type ToastContextType = {
  toasts: Toast[]
  addToast: (message: string, type?: ToastType) => void
  removeToast: (id: string) => void
}

// --- Context + Provider ---
const ToastContext = createContext<ToastContextType | null>(null)

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), 5000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  )
}

// --- Hook ---
function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}

// --- Usage ---
function SaveButton() {
  const { addToast } = useToast()
  return <button onClick={() => addToast('Saved!', 'success')}>Save</button>
}
```

## Controlled vs Uncontrolled Pattern

Support both modes for flexible usage.

```tsx
type ToggleProps = {
  defaultPressed?: boolean          // Uncontrolled
  pressed?: boolean                 // Controlled
  onPressedChange?: (pressed: boolean) => void
  children: React.ReactNode
}

function Toggle({ defaultPressed, pressed: controlledPressed, onPressedChange, children }: ToggleProps) {
  const [uncontrolledPressed, setUncontrolledPressed] = useState(defaultPressed ?? false)

  const isControlled = controlledPressed !== undefined
  const pressed = isControlled ? controlledPressed : uncontrolledPressed

  function handlePress() {
    const next = !pressed
    if (!isControlled) setUncontrolledPressed(next)
    onPressedChange?.(next)
  }

  return (
    <button
      role="switch"
      aria-checked={pressed}
      onClick={handlePress}
      className={cn('rounded-lg px-4 py-2', pressed && 'bg-primary text-primary-foreground')}
    >
      {children}
    </button>
  )
}

// Uncontrolled (manages own state)
<Toggle defaultPressed={false} onPressedChange={console.log}>Bold</Toggle>

// Controlled (parent manages state)
<Toggle pressed={isBold} onPressedChange={setIsBold}>Bold</Toggle>
```

## Error Boundary

```tsx
type ErrorBoundaryProps = {
  children: React.ReactNode
  fallback: React.ReactNode | ((error: Error, reset: () => void) => React.ReactNode)
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      const { fallback } = this.props
      return typeof fallback === 'function'
        ? fallback(this.state.error, this.reset)
        : fallback
    }
    return this.props.children
  }
}

// Usage
<ErrorBoundary fallback={(error, reset) => (
  <div>
    <p>Something went wrong: {error.message}</p>
    <button onClick={reset}>Try again</button>
  </div>
)}>
  <RiskyComponent />
</ErrorBoundary>
```
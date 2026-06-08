# TypeScript for Frontend

Strict patterns, component types, event handlers, and utility types for frontend development.

## Discriminated Unions

```typescript
// Component states
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }

function renderState<T>(state: AsyncState<T>) {
  switch (state.status) {
    case 'idle': return null
    case 'loading': return <Spinner />
    case 'success': return <Data value={state.data} />  // data is typed
    case 'error': return <Error message={state.error.message} />  // error is typed
  }
}

// Button variants
type ButtonProps =
  | { variant: 'link'; href: string; onClick?: never }
  | { variant: 'button'; onClick: () => void; href?: never }
  | { variant: 'submit'; form: string; onClick?: never; href?: never }
```

## Generic Component Props

```typescript
// Generic list component
type ListProps<T> = {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T) => string
  emptyState?: React.ReactNode
}

function List<T>({ items, renderItem, keyExtractor, emptyState }: ListProps<T>) {
  if (items.length === 0) return emptyState ?? null
  return <ul>{items.map((item, i) => <li key={keyExtractor(item)}>{renderItem(item, i)}</li>)}</ul>
}

// Usage: <List items={users} renderItem={u => u.name} keyExtractor={u => u.id} />
```

## Polymorphic Components

```typescript
type PolymorphicProps<E extends React.ElementType> = {
  as?: E
} & Omit<React.ComponentPropsWithoutRef<E>, 'as'>

function Box<E extends React.ElementType = 'div'>({ as, ...props }: PolymorphicProps<E>) {
  const Component = as || 'div'
  return <Component {...props} />
}

// Usage:
// <Box>div by default</Box>
// <Box as="section">renders section</Box>
// <Box as="a" href="/link">renders anchor with href typed</Box>
```

## Event Handler Types

```typescript
// Form events
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  const formData = new FormData(e.currentTarget)
}

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value, type, checked } = e.target
  const val = type === 'checkbox' ? checked : value
}

const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const selected = e.target.value
}

// Keyboard events
const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
  if (e.key === 'Enter' && !e.shiftKey) { /* submit */ }
  if (e.key === 'Escape') { /* close */ }
}

// Mouse events
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.stopPropagation()
}

// Drag events
const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault()
  const files = Array.from(e.dataTransfer.files)
}

// Focus events
const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  validate(e.target.value)
}
```

## Utility Types for Props

```typescript
// Extract props from component
type ButtonProps = React.ComponentPropsWithoutRef<'button'>
type InputProps = React.ComponentPropsWithRef<'input'>

// Require some optional fields
type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>
type StrictDialogProps = RequireKeys<DialogProps, 'onClose' | 'title'>

// Make all nested fields optional
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// Strict omit (errors on non-existent keys)
type StrictOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
```

## Branded Types

```typescript
// Prevent mixing IDs of different entities
type Brand<T, B> = T & { __brand: B }
type UserId = Brand<string, 'UserId'>
type PostId = Brand<string, 'PostId'>

function createUserId(id: string): UserId { return id as UserId }
function createPostId(id: string): PostId { return id as PostId }

function getUser(id: UserId) { /* ... */ }
// getUser(postId) → Type error!
```

## Type-Safe CSS Custom Properties

```typescript
type CSSCustomProperties = {
  '--color-primary': string
  '--color-secondary': string
  '--spacing-base': string
  '--radius': string
}

type StyleWithCustomProps = React.CSSProperties & Partial<CSSCustomProperties>

const style: StyleWithCustomProps = {
  display: 'flex',
  '--color-primary': '#3b82f6',
  '--spacing-base': '1rem',
}
```

## Zod Schema Integration

```typescript
import { z } from 'zod'

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'editor', 'viewer']),
  age: z.number().int().min(18).optional(),
})

// Infer TypeScript type from schema
type User = z.infer<typeof userSchema>
// { name: string; email: string; role: 'admin' | 'editor' | 'viewer'; age?: number }

// Use for runtime validation
function validateUser(data: unknown): User {
  return userSchema.parse(data) // throws ZodError on failure
}
```

## Type Guards

```typescript
// Custom type guard
function isHTMLElement(node: Node): node is HTMLElement {
  return node.nodeType === Node.ELEMENT_NODE
}

// Assertion function
function assertDefined<T>(val: T | null | undefined, msg?: string): asserts val is T {
  if (val == null) throw new Error(msg ?? 'Expected defined value')
}

// Exhaustive check
function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`)
}

// Usage in switch for exhaustiveness
switch (state.status) {
  case 'idle': return null
  case 'loading': return <Spinner />
  case 'success': return <Data value={state.data} />
  case 'error': return <Error message={state.error.message} />
  default: return assertNever(state) // compile error if case is missing
}
```

## Record and Map Patterns

```typescript
// String literal keys
type Theme = 'light' | 'dark' | 'system'
const themeLabels: Record<Theme, string> = {
  light: 'Light Mode',
  dark: 'Dark Mode',
  system: 'System Default',
}

// Const assertion for objects
const ROUTES = {
  home: '/',
  about: '/about',
  blog: '/blog',
  post: (slug: string) => `/blog/${slug}`,
} as const

type StaticRoute = (typeof ROUTES)[keyof Omit<typeof ROUTES, 'post'>]
// '/' | '/about' | '/blog'
```

## Template Literal Types

```typescript
type EventName = 'click' | 'focus' | 'blur'
type HandlerName = `on${Capitalize<EventName>}`
// 'onClick' | 'onFocus' | 'onBlur'

type CSSUnit = `${number}${'px' | 'rem' | 'em' | '%' | 'vh' | 'vw'}`
type Spacing = CSSUnit | 'auto' | '0'
```
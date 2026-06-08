# Example: Compound Component

Accessible Dropdown/Select with TypeScript, context, keyboard navigation, and focus management.

## Types

```tsx
// types.ts
export type DropdownOption = {
  value: string
  label: string
  disabled?: boolean
}

type DropdownContextType = {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  selectedValue: string
  onSelect: (value: string) => void
  activeIndex: number
  setActiveIndex: (index: number) => void
  options: DropdownOption[]
  registerOption: (option: DropdownOption) => void
  triggerId: string
  listboxId: string
}
```

## Implementation

```tsx
// components/Dropdown.tsx
'use client'

import {
  createContext, useContext, useState, useRef, useCallback,
  useEffect, useId, type ReactNode, type KeyboardEvent,
} from 'react'

// --- Context ---
const DropdownContext = createContext<DropdownContextType | null>(null)

function useDropdown() {
  const ctx = useContext(DropdownContext)
  if (!ctx) throw new Error('Dropdown components must be used within <Dropdown.Root>')
  return ctx
}

// --- Root ---
function Root({
  value,
  onValueChange,
  children,
}: {
  value: string
  onValueChange: (value: string) => void
  children: ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [options, setOptions] = useState<DropdownOption[]>([])
  const id = useId()

  const registerOption = useCallback((option: DropdownOption) => {
    setOptions(prev => {
      if (prev.some(o => o.value === option.value)) return prev
      return [...prev, option]
    })
  }, [])

  const onSelect = useCallback((newValue: string) => {
    onValueChange(newValue)
    setIsOpen(false)
    setActiveIndex(-1)
  }, [onValueChange])

  return (
    <DropdownContext.Provider
      value={{
        isOpen,
        setIsOpen,
        selectedValue: value,
        onSelect,
        activeIndex,
        setActiveIndex,
        options,
        registerOption,
        triggerId: `${id}-trigger`,
        listboxId: `${id}-listbox`,
      }}
    >
      <div className="relative inline-block">{children}</div>
    </DropdownContext.Provider>
  )
}

// --- Trigger ---
function Trigger({ children, placeholder = 'Select...' }: { children?: ReactNode; placeholder?: string }) {
  const {
    isOpen, setIsOpen, selectedValue, options,
    activeIndex, setActiveIndex, triggerId, listboxId,
  } = useDropdown()
  const triggerRef = useRef<HTMLButtonElement>(null)

  const selectedLabel = options.find(o => o.value === selectedValue)?.label
  const activeOption = activeIndex >= 0 ? options[activeIndex] : null

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    const enabledOptions = options.filter(o => !o.disabled)

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          setActiveIndex(0)
          return
        }
        const direction = e.key === 'ArrowDown' ? 1 : -1
        const currentEnabled = enabledOptions.findIndex(o => o === options[activeIndex])
        const nextEnabled = (currentEnabled + direction + enabledOptions.length) % enabledOptions.length
        const nextIndex = options.indexOf(enabledOptions[nextEnabled])
        setActiveIndex(nextIndex)
        break
      }
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (isOpen && activeOption && !activeOption.disabled) {
          const { onSelect } = useDropdown()  // We already have it from outer scope
          // Actually let's use the context properly
        }
        if (!isOpen) {
          setIsOpen(true)
          setActiveIndex(0)
        } else if (activeOption && !activeOption.disabled) {
          // onSelect is available from useDropdown
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setActiveIndex(-1)
        break
      case 'Home':
        e.preventDefault()
        setActiveIndex(options.findIndex(o => !o.disabled))
        break
      case 'End':
        e.preventDefault()
        for (let i = options.length - 1; i >= 0; i--) {
          if (!options[i].disabled) { setActiveIndex(i); break }
        }
        break
    }
  }

  // Simplified — proper version below
  return null
}

// Full correct implementation:
function TriggerImpl({ placeholder = 'Select...' }: { placeholder?: string }) {
  const ctx = useDropdown()
  const triggerRef = useRef<HTMLButtonElement>(null)

  const selectedLabel = ctx.options.find(o => o.value === ctx.selectedValue)?.label
  const activeOption = ctx.activeIndex >= 0 ? ctx.options[ctx.activeIndex] : null

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    const enabledOptions = ctx.options.filter(o => !o.disabled)

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        e.preventDefault()
        if (!ctx.isOpen) {
          ctx.setIsOpen(true)
          ctx.setActiveIndex(0)
          return
        }
        const direction = e.key === 'ArrowDown' ? 1 : -1
        const currentIdx = enabledOptions.findIndex(o => o === ctx.options[ctx.activeIndex])
        const nextIdx = (currentIdx + direction + enabledOptions.length) % enabledOptions.length
        ctx.setActiveIndex(ctx.options.indexOf(enabledOptions[nextIdx]))
        break
      }
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (!ctx.isOpen) {
          ctx.setIsOpen(true)
          ctx.setActiveIndex(0)
        } else if (activeOption && !activeOption.disabled) {
          ctx.onSelect(activeOption.value)
          triggerRef.current?.focus()
        }
        break
      case 'Escape':
        e.preventDefault()
        ctx.setIsOpen(false)
        ctx.setActiveIndex(-1)
        triggerRef.current?.focus()
        break
      case 'Home':
        e.preventDefault()
        if (ctx.isOpen) ctx.setActiveIndex(ctx.options.findIndex(o => !o.disabled))
        break
      case 'End':
        e.preventDefault()
        if (ctx.isOpen) {
          for (let i = ctx.options.length - 1; i >= 0; i--) {
            if (!ctx.options[i].disabled) { ctx.setActiveIndex(i); break }
          }
        }
        break
    }
  }

  // Close on outside click
  useEffect(() => {
    if (!ctx.isOpen) return
    function handleClick(e: MouseEvent) {
      if (!triggerRef.current?.parentElement?.contains(e.target as Node)) {
        ctx.setIsOpen(false)
        ctx.setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [ctx.isOpen])

  return (
    <button
      ref={triggerRef}
      id={ctx.triggerId}
      role="combobox"
      aria-expanded={ctx.isOpen}
      aria-haspopup="listbox"
      aria-controls={ctx.listboxId}
      aria-activedescendant={activeOption ? `${ctx.listboxId}-${activeOption.value}` : undefined}
      onClick={() => {
        ctx.setIsOpen(!ctx.isOpen)
        if (!ctx.isOpen) ctx.setActiveIndex(0)
      }}
      onKeyDown={handleKeyDown}
      className="flex h-10 w-full min-w-[200px] items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <span className={selectedLabel ? '' : 'text-muted-foreground'}>
        {selectedLabel || placeholder}
      </span>
      <svg
        className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${ctx.isOpen ? 'rotate-180' : ''}`}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  )
}

// --- Listbox ---
function Content({ children }: { children: ReactNode }) {
  const { isOpen, listboxId, triggerId } = useDropdown()

  if (!isOpen) return null

  return (
    <ul
      id={listboxId}
      role="listbox"
      aria-labelledby={triggerId}
      className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-background p-1 shadow-lg"
    >
      {children}
    </ul>
  )
}

// --- Option ---
function Option({ value, label, disabled = false }: DropdownOption) {
  const ctx = useDropdown()
  const isSelected = ctx.selectedValue === value
  const index = ctx.options.findIndex(o => o.value === value)
  const isActive = ctx.activeIndex === index
  const optionId = `${ctx.listboxId}-${value}`

  // Register on mount
  useEffect(() => {
    ctx.registerOption({ value, label, disabled })
  }, [value, label, disabled])

  return (
    <li
      id={optionId}
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled}
      onMouseEnter={() => !disabled && ctx.setActiveIndex(index)}
      onClick={() => {
        if (!disabled) ctx.onSelect(value)
      }}
      className={`
        relative flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm outline-none
        ${disabled ? 'pointer-events-none opacity-50' : ''}
        ${isActive ? 'bg-accent text-accent-foreground' : ''}
        ${isSelected ? 'font-medium' : ''}
      `}
    >
      <span className="flex-1">{label}</span>
      {isSelected && (
        <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      )}
    </li>
  )
}

// --- Export as compound component ---
export const Dropdown = {
  Root,
  Trigger: TriggerImpl,
  Content,
  Option,
}
```

## Usage

```tsx
function RoleSelector() {
  const [role, setRole] = useState('')

  return (
    <div className="space-y-2">
      <label id="role-label" className="text-sm font-medium">Role</label>
      <Dropdown.Root value={role} onValueChange={setRole}>
        <Dropdown.Trigger placeholder="Select a role..." />
        <Dropdown.Content>
          <Dropdown.Option value="admin" label="Admin" />
          <Dropdown.Option value="editor" label="Editor" />
          <Dropdown.Option value="viewer" label="Viewer" />
          <Dropdown.Option value="guest" label="Guest" disabled />
        </Dropdown.Content>
      </Dropdown.Root>
    </div>
  )
}
```

## Accessibility Features

1. **ARIA combobox pattern**: `role="combobox"` on trigger, `role="listbox"` on list, `role="option"` on items
2. **aria-expanded**: reflects open/closed state
3. **aria-activedescendant**: points to visually focused option
4. **aria-selected**: marks currently selected option
5. **aria-disabled**: marks disabled options
6. **Keyboard navigation**: Arrow keys, Enter/Space to select, Escape to close, Home/End
7. **Focus management**: focus returns to trigger on close
8. **Outside click**: closes dropdown
9. **Visual indicators**: checkmark on selected, highlight on active
# Example: Form Pattern

React Hook Form + Zod validation + field arrays + server error handling + accessible error display.

## Schema

```tsx
// schemas/user.ts
import { z } from 'zod'

export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  role: z.enum(['admin', 'editor', 'viewer'], {
    errorMap: () => ({ message: 'Please select a role' }),
  }),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
  addresses: z.array(
    z.object({
      label: z.string().min(1, 'Label is required'),
      street: z.string().min(1, 'Street is required'),
      city: z.string().min(1, 'City is required'),
      zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Enter a valid ZIP code'),
    })
  ).min(1, 'At least one address is required').max(5, 'Maximum 5 addresses'),
  notifications: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
  }),
})

export type UserFormValues = z.infer<typeof userSchema>
```

## Reusable Form Field Component

```tsx
// components/FormField.tsx
import { useFormContext } from 'react-hook-form'

type FormFieldProps = {
  name: string
  label: string
  required?: boolean
  description?: string
  children: React.ReactNode
}

export function FormField({ name, label, required, description, children }: FormFieldProps) {
  const { formState: { errors } } = useFormContext()
  const error = errors[name]
  const errorId = `${name}-error`
  const descId = description ? `${name}-desc` : undefined

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-medium leading-none">
        {label}
        {required && <span className="text-destructive" aria-hidden="true"> *</span>}
      </label>
      {children}
      {description && (
        <p id={descId} className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error.message as string}
        </p>
      )}
    </div>
  )
}
```

## Full Form Component

```tsx
// components/UserForm.tsx
'use client'

import { useForm, useFieldArray, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userSchema, type UserFormValues } from '@/schemas/user'
import { FormField } from '@/components/FormField'

type UserFormProps = {
  defaultValues?: Partial<UserFormValues>
  onSubmit: (data: UserFormValues) => Promise<{ error?: string; fieldErrors?: Record<string, string> }>
}

export function UserForm({ defaultValues, onSubmit }: UserFormProps) {
  const methods = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: undefined,
      bio: '',
      addresses: [{ label: 'Home', street: '', city: '', zip: '' }],
      notifications: { email: true, sms: false, push: false },
      ...defaultValues,
    },
  })

  const {
    register,
    handleSubmit,
    setError,
    control,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = methods

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'addresses',
  })

  const bioLength = watch('bio')?.length ?? 0

  async function handleFormSubmit(data: UserFormValues) {
    const result = await onSubmit(data)

    if (result.error) {
      setError('root', { message: result.error })
    }

    if (result.fieldErrors) {
      Object.entries(result.fieldErrors).forEach(([field, message]) => {
        setError(field as keyof UserFormValues, { message })
      })
    }
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-8"
        noValidate
      >
        {/* Root error (server-side) */}
        {errors.root && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4" role="alert">
            <p className="text-sm font-medium text-destructive">{errors.root.message}</p>
          </div>
        )}

        {/* Basic info */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold">Basic Information</legend>

          <FormField name="name" label="Full name" required>
            <input
              id="name"
              {...register('name')}
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-[invalid=true]:border-destructive"
            />
          </FormField>

          <FormField name="email" label="Email" required>
            <input
              id="email"
              type="email"
              {...register('email')}
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={[errors.email && 'email-error', 'email-desc'].filter(Boolean).join(' ')}
              autoComplete="email"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-[invalid=true]:border-destructive"
            />
          </FormField>

          <FormField name="role" label="Role" required>
            <select
              id="role"
              {...register('role')}
              aria-required="true"
              aria-invalid={!!errors.role}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select a role...</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </FormField>

          <FormField name="bio" label="Bio" description={`${bioLength}/500 characters`}>
            <textarea
              id="bio"
              {...register('bio')}
              rows={4}
              maxLength={500}
              aria-describedby="bio-desc"
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </FormField>
        </fieldset>

        {/* Dynamic addresses */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold">Addresses</legend>
          {errors.addresses?.root && (
            <p className="text-sm text-destructive" role="alert">{errors.addresses.root.message}</p>
          )}

          {fields.map((field, index) => (
            <div key={field.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Address {index + 1}</h4>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-sm text-destructive hover:underline"
                    aria-label={`Remove address ${index + 1}`}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor={`addresses.${index}.label`} className="text-xs font-medium">Label</label>
                  <input
                    id={`addresses.${index}.label`}
                    {...register(`addresses.${index}.label`)}
                    placeholder="Home, Work..."
                    className="flex h-9 w-full rounded-lg border px-3 text-sm"
                  />
                  {errors.addresses?.[index]?.label && (
                    <p className="text-xs text-destructive" role="alert">
                      {errors.addresses[index].label?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label htmlFor={`addresses.${index}.street`} className="text-xs font-medium">Street</label>
                  <input
                    id={`addresses.${index}.street`}
                    {...register(`addresses.${index}.street`)}
                    className="flex h-9 w-full rounded-lg border px-3 text-sm"
                  />
                  {errors.addresses?.[index]?.street && (
                    <p className="text-xs text-destructive" role="alert">
                      {errors.addresses[index].street?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label htmlFor={`addresses.${index}.city`} className="text-xs font-medium">City</label>
                  <input
                    id={`addresses.${index}.city`}
                    {...register(`addresses.${index}.city`)}
                    className="flex h-9 w-full rounded-lg border px-3 text-sm"
                  />
                  {errors.addresses?.[index]?.city && (
                    <p className="text-xs text-destructive" role="alert">
                      {errors.addresses[index].city?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label htmlFor={`addresses.${index}.zip`} className="text-xs font-medium">ZIP Code</label>
                  <input
                    id={`addresses.${index}.zip`}
                    {...register(`addresses.${index}.zip`)}
                    className="flex h-9 w-full rounded-lg border px-3 text-sm"
                  />
                  {errors.addresses?.[index]?.zip && (
                    <p className="text-xs text-destructive" role="alert">
                      {errors.addresses[index].zip?.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {fields.length < 5 && (
            <button
              type="button"
              onClick={() => append({ label: '', street: '', city: '', zip: '' })}
              className="rounded-lg border border-dashed px-4 py-2 text-sm text-muted-foreground hover:bg-accent"
            >
              + Add Address
            </button>
          )}
        </fieldset>

        {/* Notification preferences */}
        <fieldset className="space-y-3">
          <legend className="text-lg font-semibold">Notification Preferences</legend>
          {(['email', 'sms', 'push'] as const).map((channel) => (
            <div key={channel} className="flex items-center gap-3">
              <input
                type="checkbox"
                id={`notifications.${channel}`}
                {...register(`notifications.${channel}`)}
                className="h-4 w-4 rounded border-input"
              />
              <label htmlFor={`notifications.${channel}`} className="text-sm capitalize">
                {channel} notifications
              </label>
            </div>
          ))}
        </fieldset>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t pt-6">
          <button
            type="reset"
            className="h-10 rounded-lg border px-4 text-sm font-medium hover:bg-accent"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="h-10 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save User'}
          </button>
        </div>
      </form>
    </FormProvider>
  )
}
```

## Usage with Server Action

```tsx
// app/users/new/page.tsx
import { UserForm } from '@/components/UserForm'
import { createUser } from '@/app/actions/users'

export default function NewUserPage() {
  async function handleSubmit(data: UserFormValues) {
    'use server'
    try {
      await createUser(data)
      redirect('/users')
      return {}
    } catch (e) {
      if (e instanceof ValidationError) {
        return { fieldErrors: e.fieldErrors }
      }
      return { error: 'Failed to create user. Please try again.' }
    }
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="text-2xl font-bold">Create User</h1>
      <UserForm onSubmit={handleSubmit} />
    </div>
  )
}
```

## Key Patterns

1. **Zod schema** — single source of truth for validation rules and TypeScript types
2. **FormProvider** — shares form context with nested FormField components
3. **Field arrays** — dynamic add/remove with independent validation per item
4. **Server errors** — `setError('root', ...)` for general errors, `setError(field, ...)` for field-specific
5. **Accessible errors** — `role="alert"` + `aria-invalid` + `aria-describedby` on every field
6. **Dirty tracking** — submit button disabled when no changes made
7. **Character counter** — live count using `watch()`
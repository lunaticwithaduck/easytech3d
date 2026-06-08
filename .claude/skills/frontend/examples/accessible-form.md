# Example: Accessible Form

Complete contact form with validation, error handling, keyboard navigation, and screen reader support.

## Full Implementation

```html
<form
  id="contact-form"
  class="mx-auto max-w-lg space-y-6"
  novalidate
  aria-labelledby="form-title"
>
  <h2 id="form-title" class="text-2xl font-bold">Contact Us</h2>
  <p class="text-sm text-muted-foreground">
    Fields marked with <span class="text-destructive" aria-hidden="true">*</span>
    <span class="sr-only">asterisk</span> are required.
  </p>

  <!-- Live region for form-level messages -->
  <div id="form-status" role="status" aria-live="polite" class="sr-only"></div>

  <!-- Name field -->
  <div class="space-y-2">
    <label for="name" class="text-sm font-medium leading-none">
      Full name <span class="text-destructive" aria-hidden="true">*</span>
    </label>
    <input
      id="name"
      name="name"
      type="text"
      required
      aria-required="true"
      autocomplete="name"
      placeholder="Jane Doe"
      class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive"
    />
    <p id="name-error" class="hidden text-sm text-destructive" role="alert"></p>
  </div>

  <!-- Email field -->
  <div class="space-y-2">
    <label for="email" class="text-sm font-medium leading-none">
      Email address <span class="text-destructive" aria-hidden="true">*</span>
    </label>
    <input
      id="email"
      name="email"
      type="email"
      required
      aria-required="true"
      autocomplete="email"
      placeholder="jane@example.com"
      aria-describedby="email-help"
      class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive"
    />
    <p id="email-help" class="text-xs text-muted-foreground">We'll never share your email.</p>
    <p id="email-error" class="hidden text-sm text-destructive" role="alert"></p>
  </div>

  <!-- Subject select -->
  <div class="space-y-2">
    <label for="subject" class="text-sm font-medium leading-none">
      Subject <span class="text-destructive" aria-hidden="true">*</span>
    </label>
    <select
      id="subject"
      name="subject"
      required
      aria-required="true"
      class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-[invalid=true]:border-destructive"
    >
      <option value="">Select a subject...</option>
      <option value="general">General Inquiry</option>
      <option value="support">Technical Support</option>
      <option value="billing">Billing Question</option>
      <option value="feedback">Feedback</option>
    </select>
    <p id="subject-error" class="hidden text-sm text-destructive" role="alert"></p>
  </div>

  <!-- Message textarea -->
  <div class="space-y-2">
    <label for="message" class="text-sm font-medium leading-none">
      Message <span class="text-destructive" aria-hidden="true">*</span>
    </label>
    <textarea
      id="message"
      name="message"
      required
      aria-required="true"
      rows="5"
      minlength="20"
      maxlength="1000"
      placeholder="Tell us how we can help..."
      aria-describedby="message-count"
      class="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive"
    ></textarea>
    <div class="flex justify-between">
      <p id="message-error" class="hidden text-sm text-destructive" role="alert"></p>
      <p id="message-count" class="text-xs text-muted-foreground" aria-live="polite">
        0 / 1000 characters
      </p>
    </div>
  </div>

  <!-- Consent checkbox -->
  <fieldset class="space-y-3">
    <legend class="text-sm font-medium leading-none">Preferences</legend>
    <div class="flex items-start gap-3">
      <input
        id="consent"
        name="consent"
        type="checkbox"
        required
        aria-required="true"
        class="mt-0.5 h-4 w-4 rounded border-input text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
      <label for="consent" class="text-sm leading-tight">
        I agree to the <a href="/privacy" class="text-primary underline underline-offset-4 hover:text-primary/80">Privacy Policy</a>
        <span class="text-destructive" aria-hidden="true">*</span>
      </label>
    </div>
    <p id="consent-error" class="hidden text-sm text-destructive" role="alert"></p>
  </fieldset>

  <!-- Actions -->
  <div class="flex items-center justify-end gap-3">
    <button
      type="reset"
      class="h-10 rounded-lg border border-input px-4 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      Clear form
    </button>
    <button
      type="submit"
      class="h-10 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    >
      Send Message
    </button>
  </div>
</form>
```

## Validation JavaScript

```javascript
const form = document.getElementById('contact-form')
const formStatus = document.getElementById('form-status')

const validators = {
  name: {
    validate: (value) => value.trim().length >= 2,
    message: 'Name must be at least 2 characters.',
  },
  email: {
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Enter a valid email address (e.g., name@example.com).',
  },
  subject: {
    validate: (value) => value !== '',
    message: 'Please select a subject.',
  },
  message: {
    validate: (value) => value.trim().length >= 20,
    message: 'Message must be at least 20 characters.',
  },
  consent: {
    validate: (_, el) => el.checked,
    message: 'You must agree to the Privacy Policy.',
  },
}

function showError(fieldId, message) {
  const field = document.getElementById(fieldId)
  const error = document.getElementById(`${fieldId}-error`)
  field.setAttribute('aria-invalid', 'true')
  field.setAttribute('aria-describedby',
    [field.getAttribute('aria-describedby'), `${fieldId}-error`].filter(Boolean).join(' ')
  )
  error.textContent = message
  error.classList.remove('hidden')
}

function clearError(fieldId) {
  const field = document.getElementById(fieldId)
  const error = document.getElementById(`${fieldId}-error`)
  field.removeAttribute('aria-invalid')
  error.textContent = ''
  error.classList.add('hidden')
}

// Validate on blur (after first submission attempt)
let hasAttemptedSubmit = false

Object.keys(validators).forEach((fieldId) => {
  const field = document.getElementById(fieldId)
  field.addEventListener('blur', () => {
    if (!hasAttemptedSubmit) return
    const { validate, message } = validators[fieldId]
    if (validate(field.value, field)) {
      clearError(fieldId)
    } else {
      showError(fieldId, message)
    }
  })
})

// Character counter
const messageField = document.getElementById('message')
const messageCount = document.getElementById('message-count')
messageField.addEventListener('input', () => {
  const count = messageField.value.length
  messageCount.textContent = `${count} / 1000 characters`
})

// Submit
form.addEventListener('submit', (e) => {
  e.preventDefault()
  hasAttemptedSubmit = true

  let firstError = null
  Object.keys(validators).forEach((fieldId) => {
    const field = document.getElementById(fieldId)
    const { validate, message } = validators[fieldId]
    if (!validate(field.value, field)) {
      showError(fieldId, message)
      if (!firstError) firstError = field
    } else {
      clearError(fieldId)
    }
  })

  if (firstError) {
    firstError.focus()
    formStatus.textContent = 'Please fix the errors in the form.'
    return
  }

  // Success
  const submitBtn = form.querySelector('[type="submit"]')
  submitBtn.disabled = true
  submitBtn.textContent = 'Sending...'
  formStatus.textContent = 'Submitting your message...'

  // Simulate API call
  setTimeout(() => {
    formStatus.textContent = 'Your message has been sent successfully!'
    form.reset()
    submitBtn.disabled = false
    submitBtn.textContent = 'Send Message'
    hasAttemptedSubmit = false
    messageCount.textContent = '0 / 1000 characters'
  }, 1500)
})
```

## Accessibility Features

1. **Labels**: Every input has an explicit `<label for="id">`
2. **Required fields**: `required` + `aria-required="true"` + visual asterisk with `aria-hidden="true"`
3. **Error display**: `role="alert"` on error messages for immediate screen reader announcement
4. **Error association**: `aria-describedby` links inputs to help text and error messages
5. **Invalid state**: `aria-invalid="true"` set on fields with errors
6. **Focus management**: First errored field receives focus on submit
7. **Live region**: `role="status"` for form-level announcements (submitting, success)
8. **Keyboard**: All inputs reachable via Tab, form submits with Enter
9. **Autocomplete**: `autocomplete` attributes for browser autofill
10. **Progressive validation**: Validates on blur only after first submit attempt
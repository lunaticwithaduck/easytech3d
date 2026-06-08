'use client';

import type { FormEvent } from 'react';
import { Button } from '@/design-system/primitives/Button/Button';
import { Input } from '@/design-system/primitives/Input/Input';
import { Textarea } from '@/design-system/primitives/Textarea/Textarea';
import {
  contactFieldClass,
  contactFieldControlClass,
  contactFormClass,
  contactFormRowClass,
  contactSubmitWrapClass,
  contactTextareaControlClass,
} from './ContactForm.styles';

// Contact form — 1:1 with `page-contact.liquid` `{% form 'contact' id:'ContactForm' %}`:
//   • Name + Email row (`.grid.grid--half-gutters` → two `medium-up--one-half`), both required.
//   • NO phone field — the theme's `custom_css` HIDES `#ContactForm-phone` on this page.
//   • Message textarea (required).
//   • Primary "Прати" button with the trailing `tail-right` arrow.
// Submission is a no-op stub this session — the Shopify contact form wiring comes later.
export function ContactForm() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // No-op: backend submission is not wired in this session.
  }

  return (
    <form id="ContactForm" className={contactFormClass} onSubmit={handleSubmit} noValidate>
      <div className={contactFormRowClass}>
        <Input
          label="Име *"
          name="contact[Име]"
          autoComplete="name"
          required
          className={contactFieldControlClass}
        />
        <Input
          label="Имейл *"
          name="contact[email]"
          type="email"
          autoComplete="email"
          required
          className={contactFieldControlClass}
        />
      </div>

      <div className={contactFieldClass}>
        <Textarea
          label="Съобщение *"
          name="contact[Съобщение]"
          rows={10}
          required
          className={contactTextareaControlClass}
        />
      </div>

      <div className={contactSubmitWrapClass}>
        <Button type="submit" variant="primary" iconRight>
          Прати
        </Button>
      </div>
    </form>
  );
}

'use client';

import { Send } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/design-system/primitives/Button/Button';
import { Icon } from '@/design-system/primitives/Icon/Icon';
import { Input } from '@/design-system/primitives/Input/Input';
import { Text } from '@/design-system/primitives/Text/Text';
import { Textarea } from '@/design-system/primitives/Textarea/Textarea';
import { contactFormClass, contactFormRowClass } from './ContactForm.styles';

// Contact form mirroring the Liquid `page-contact` section (name + email row, phone, message,
// submit). Submission is a no-op stub this session — the backend wiring comes later.
export function ContactForm() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // No-op: backend submission is not wired in this session.
  }

  return (
    <form className={contactFormClass} onSubmit={handleSubmit} noValidate>
      <div className={contactFormRowClass}>
        <Input label="Име" name="name" autoComplete="name" placeholder="Вашето име" />
        <Input
          label="Имейл"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
        />
      </div>

      <Input
        label="Телефон"
        name="phone"
        type="tel"
        autoComplete="tel"
        placeholder="+359 ..."
      />

      <Textarea label="Съобщение" name="message" rows={8} placeholder="Как можем да помогнем?" />

      <div>
        <Button type="submit" variant="primary" size="lg">
          <Text as="span" color="current" value="Изпрати" />
          <Icon icon={Send} size={18} />
        </Button>
      </div>
    </form>
  );
}

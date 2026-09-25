'use client';

import { useState } from 'react';
import { submitContact } from '@/actions/forms';
import { Button, Icon, Input, Text, Textarea } from '@/design-system';

// Contact form — wired to the backend /contact endpoint via the submitContact Server Action.
export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get('contact[Име]') ?? '').trim();
    const email = String(fd.get('contact[email]') ?? '').trim();
    const message = String(fd.get('contact[Съобщение]') ?? '').trim();
    if (!name || !email || !message) {
      setError('Моля, попълнете всички полета.');
      return;
    }
    setStatus('sending');
    const res = await submitContact(name, email, message);
    if (res.ok) setStatus('done');
    else {
      setStatus('idle');
      setError(res.error);
    }
  }

  if (status === 'done') {
    return (
      <Text
        as="p"
        weight="bold"
        className="rounded-md bg-success/10 px-4 py-3 text-success"
        value="Благодарим! Съобщението е изпратено — ще се свържем с Вас скоро."
      />
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      id="ContactForm"
      acceptCharset="UTF-8"
      className="flex flex-col gap-6"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="ContactForm-name" className="text-sm font-bold text-ink">
            Име<span aria-hidden="true"> *</span>
          </label>
          <Input
            type="text"
            id="ContactForm-name"
            name="contact[Име]"
            aria-required="true"
            required
            defaultValue=""
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="ContactForm-email" className="text-sm font-bold text-ink">
            Имейл<span aria-hidden="true"> *</span>
          </label>
          <Input
            type="email"
            id="ContactForm-email"
            name="contact[email]"
            autoCorrect="off"
            autoCapitalize="off"
            defaultValue=""
            aria-required="true"
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="ContactForm-message" className="text-sm font-bold text-ink">
          Съобщение<span aria-hidden="true"> *</span>
        </label>
        <Textarea
          rows={10}
          required
          aria-required="true"
          id="ContactForm-message"
          name="contact[Съобщение]"
        />
      </div>

      {error && <Text as="p" size="sm" className="text-sale" value={error} />}

      <div>
        <Button type="submit" variant="primary" disabled={status === 'sending'}>
          <Text
            as="span"
            weight="bold"
            color="white"
            value={status === 'sending' ? 'Изпращане…' : 'Прати'}
          />
          <Icon name="tail-right" className="size-4 shrink-0" />
        </Button>
      </div>
    </form>
  );
}

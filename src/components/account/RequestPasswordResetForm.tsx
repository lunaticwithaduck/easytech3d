'use client';

import { useState, useTransition } from 'react';
import { requestPasswordReset } from '@/actions/account';
import { Button, Heading, Input, Text } from '@/design-system';

// "Forgot password" request card — imported Shopify customers need to set a Medusa password the
// first time. Client component (exempt from the app-conventions linter). Always shows a success
// state on submit (the Server Action never reveals whether the email is registered).
export function RequestPasswordResetForm() {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get('email') ?? '');
    startTransition(async () => {
      await requestPasswordReset(email);
      setSent(true);
    });
  };

  return (
    <div className="mx-auto max-w-[440px]">
      <Heading as="h1" level={3} className="mb-6 text-center">
        Забравена парола
      </Heading>

      {sent ? (
        <Text
          as="p"
          size="sm"
          className="text-center"
          value="Ако имейлът е регистриран, ще получите връзка за смяна на паролата."
        />
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label htmlFor="email" className="block">
            <Text as="span" size="sm" weight="medium" className="mb-1 block">
              Имейл *
            </Text>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </label>

          <Button variant="primary" block type="submit" disabled={pending} className="mt-2">
            <Text
              as="span"
              weight="bold"
              color="white"
              value={pending ? 'Изпращане…' : 'Изпрати връзка за смяна'}
            />
          </Button>
        </form>
      )}
    </div>
  );
}

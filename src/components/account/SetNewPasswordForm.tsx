'use client';

import { useState, useTransition } from 'react';
import { setNewPassword } from '@/actions/account';
import { routes } from '@/config/routes';
import { Button, Heading, Input, Link, Text } from '@/design-system';
import { useRouter } from '@/i18n/navigation';

// Set-new-password page — the target of the emailed reset link (`?token=…&email=…`). Client
// component (exempt from the app-conventions linter). Calls the Medusa-backed Server Action with
// the token as a Bearer header (see `setNewPassword`'s doc comment for the contract gap).
export function SetNewPasswordForm({ token, email }: { token: string; email: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const password = String(new FormData(e.currentTarget).get('password') ?? '');
    startTransition(async () => {
      const res = await setNewPassword(token, email, password);
      if (res.ok) {
        setDone(true);
        setTimeout(() => router.push(routes.account.login), 2000);
      } else {
        setError(res.error);
      }
    });
  };

  if (!token || !email) {
    return (
      <div className="mx-auto max-w-[440px] text-center">
        <Heading as="h1" level={3} className="mb-4">
          Невалидна връзка
        </Heading>
        <Text as="p" size="sm" color="muted" className="mb-4" value="Липсват данни от връзката." />
        <Link href={routes.account.resetPassword} className="text-primary hover:underline">
          <Text as="span" size="sm" weight="medium" value="Заявете нова връзка" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[440px]">
      <Heading as="h1" level={3} className="mb-6 text-center">
        Нова парола
      </Heading>

      {done ? (
        <Text
          as="p"
          size="sm"
          className="text-center text-success"
          value="Паролата е сменена успешно. Пренасочваме Ви към входа…"
        />
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label htmlFor="password" className="block">
            <Text as="span" size="sm" weight="medium" className="mb-1 block">
              Нова парола *
            </Text>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>

          {error && <Text as="p" size="sm" className="text-sale" value={error} />}

          <Button variant="primary" block type="submit" disabled={pending} className="mt-2">
            <Text
              as="span"
              weight="bold"
              color="white"
              value={pending ? 'Запазване…' : 'Запази паролата'}
            />
          </Button>
        </form>
      )}
    </div>
  );
}

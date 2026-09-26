'use client';

import { useState, useTransition } from 'react';
import { login, register } from '@/actions/account';
import { routes } from '@/config/routes';
import { Button, Heading, Input, Link, Text } from '@/design-system';
import { useRouter } from '@/i18n/navigation';

type Mode = 'login' | 'register';

function Field({
  label,
  name,
  type = 'text',
  required = true,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label htmlFor={name} className="block">
      <Text as="span" size="sm" weight="medium" className="mb-1 block">
        {label}
        {required ? ' *' : ''}
      </Text>
      <Input id={name} name={name} type={type} required={required} autoComplete={autoComplete} />
    </label>
  );
}

// Login / register card. Client component (exempt from the app-conventions linter) — calls the
// account Server Actions, which set the httpOnly `etd_customer` session cookie on success.
export function AuthForms({ initialMode = 'login' }: { initialMode?: Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      const res =
        mode === 'login'
          ? await login(String(data.get('email')), String(data.get('password')))
          : await register({
              email: String(data.get('email')),
              password: String(data.get('password')),
              firstName: String(data.get('firstName')),
              lastName: String(data.get('lastName')),
              phone: String(data.get('phone') || '') || undefined,
            });
      if (res.ok) {
        router.push(routes.account.home);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <div className="mx-auto max-w-[440px]">
      <div className="mb-6 flex gap-1 rounded-btn border border-border p-1">
        {(['login', 'register'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={
              mode === m
                ? 'flex-1 rounded-btn bg-primary py-2 text-center'
                : 'flex-1 rounded-btn py-2 text-center transition-colors hover:bg-page'
            }
          >
            <Text
              as="span"
              size="sm"
              weight="bold"
              color={mode === m ? 'white' : 'ink'}
              value={m === 'login' ? 'Вход' : 'Регистрация'}
            />
          </button>
        ))}
      </div>

      <Heading as="h1" level={3} className="mb-6 text-center">
        {mode === 'login' ? 'Вход в акаунта' : 'Създаване на акаунт'}
      </Heading>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {mode === 'register' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Име" name="firstName" autoComplete="given-name" />
            <Field label="Фамилия" name="lastName" autoComplete="family-name" />
          </div>
        )}
        <Field label="Имейл" name="email" type="email" autoComplete="email" />
        <Field
          label="Парола"
          name="password"
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />
        {mode === 'register' && (
          <Field label="Телефон" name="phone" type="tel" required={false} autoComplete="tel" />
        )}

        {error && <Text as="p" size="sm" className="text-sale" value={error} />}

        <Button variant="primary" block type="submit" disabled={pending} className="mt-2">
          <Text
            as="span"
            weight="bold"
            color="white"
            value={pending ? 'Моля изчакайте…' : mode === 'login' ? 'Вход' : 'Създай акаунт'}
          />
        </Button>

        {mode === 'login' && (
          <Link
            href={routes.account.resetPassword}
            className="text-center text-sm text-ink/60 hover:text-primary"
          >
            <Text as="span" size="sm" value="Забравена парола?" />
          </Link>
        )}
      </form>
    </div>
  );
}

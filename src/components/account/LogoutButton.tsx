'use client';

import { useTransition } from 'react';
import { logout } from '@/actions/account';
import { routes } from '@/config/routes';
import { Button, Text } from '@/design-system';
import { useRouter } from '@/i18n/navigation';

// Clears the `etd_customer` session cookie (via the logout Server Action) and returns to login.
export function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await logout();
          router.push(routes.account.login);
          router.refresh();
        })
      }
    >
      <Text as="span" weight="bold" value={pending ? 'Излизане…' : 'Изход'} />
    </Button>
  );
}

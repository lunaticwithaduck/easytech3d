'use client';

import { useEffect, useState } from 'react';
import { getCurrentCustomer } from '@/actions/account';
import { routes } from '@/config/routes';
import { Icon, Link, Text } from '@/design-system';
import type { SafeCustomer } from '@/lib/shopify/types';

// Account entry in the header. Fetches auth state CLIENT-side after mount so the server-rendered
// header reads no cookie (keeping pages static). Renders the logged-out link first; if a session
// exists, it swaps to a greeting once resolved.
export function AccountLink() {
  const [customer, setCustomer] = useState<SafeCustomer | null>(null);

  useEffect(() => {
    let alive = true;
    getCurrentCustomer().then((c) => {
      if (alive) setCustomer(c);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Link
      href={customer ? routes.account.home : routes.account.login}
      className="inline-flex items-center gap-2 text-xs text-ink hover:text-primary"
    >
      <Icon name="account" className="size-4" />
      <Text
        as="span"
        size="xs"
        value={customer ? `Здравей, ${customer.firstName}` : 'Вход / Регистрация'}
      />
    </Link>
  );
}

'use client';

import { useLocale } from 'next-intl';
import { useTransition } from 'react';
import { Button } from '@/design-system/primitives/Button/Button';
import { Text } from '@/design-system/primitives/Text/Text';
import { usePathname, useRouter } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { LOCALE_OPTIONS } from '../../config/constants';
import { localeOptionVariants, localeSwitchClass } from './LocaleSwitch.styles';

// BG/EN switch. Swaps the active locale while preserving the current path.
export function LocaleSwitch() {
  const activeLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function selectLocale(locale: Locale) {
    if (locale === activeLocale) return;
    startTransition(() => {
      router.replace(pathname, { locale });
    });
  }

  return (
    <div className={localeSwitchClass}>
      {LOCALE_OPTIONS.map((option) => {
        const active = option.value === activeLocale;
        return (
          <Button
            key={option.value}
            type="button"
            variant="ghost"
            unstyled
            disabled={isPending}
            aria-pressed={active}
            className={localeOptionVariants({ active })}
            onClick={() => selectLocale(option.value)}
          >
            <Text as="span" size="xs" weight="semibold" color="current">
              {option.label}
            </Text>
          </Button>
        );
      })}
    </div>
  );
}

import type { ComponentProps } from 'react';
import { Link as IntlLink } from '@/i18n/navigation';
import { cn } from '@/design-system/lib/cn';

// Locale-aware internal link (keeps the /bg or /en prefix). Use this for any href starting with
// "/". For external URLs / anchors / javascript: use a plain <a>.
export type LinkProps = ComponentProps<typeof IntlLink>;

export function Link({ className, ...rest }: LinkProps) {
  return <IntlLink className={cn(className)} {...rest} />;
}

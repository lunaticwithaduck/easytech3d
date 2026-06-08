import { type ComponentPropsWithRef, forwardRef } from 'react';
import { cn } from '@/design-system/lib/cn';
import { Link as IntlLink } from '@/i18n/navigation';
import { type LinkVariants, linkVariants } from './Link.styles';

type IntlLinkProps = ComponentPropsWithRef<typeof IntlLink>;

export type LinkProps = LinkVariants &
  IntlLinkProps & {
    className?: string | undefined;
    external?: boolean;
  };

// Locale-aware link. Wraps next-intl's navigation Link so every href is prefixed with the
// active locale; `href` should come from `@/config/routes`, never a string literal (R7).
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ variant, size, className, external, ...rest }, ref) => {
    const externalProps = external
      ? { target: '_blank' as const, rel: 'noopener noreferrer' }
      : {};

    return (
      <IntlLink
        ref={ref}
        className={cn(linkVariants({ variant, size }), className)}
        {...externalProps}
        {...rest}
      />
    );
  },
);

Link.displayName = 'Link';

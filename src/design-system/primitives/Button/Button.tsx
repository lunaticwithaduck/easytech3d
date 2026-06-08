'use client';

import { Slot } from '@radix-ui/react-slot';
import { motion } from 'motion/react';
import { type ComponentPropsWithRef, forwardRef, type ReactNode, type Ref } from 'react';
import { cn } from '@/design-system/lib/cn';
import type { TranslationDefault } from '@/i18n/translate';
import { Text } from '../Text/Text';
import { type ButtonVariants, buttonVariants, iconRightClass } from './Button.styles';

// Maps the button size onto the label's <Text size>. The theme's .btn is 1em (16px); --small is 12px.
const textSizeMap = { sm: '2xs', md: 'base', lg: 'base', xl: 'base' } as const;

// The theme's trailing arrow icon (`{% include 'icon' with 'tail-right' %}`), ported verbatim from
// snippets/icon.liquid (viewBox 0 0 24 24, currentColor). The theme markup is `<span> + <svg>` with
// `.btn span + svg { margin-left:15px }`, so the icon sits 15px after the label span.
function TailRight() {
  return (
    <svg viewBox="0 0 24 24" role="presentation" className={iconRightClass} aria-hidden>
      <path
        fill="currentColor"
        d="M22.707 11.293L15 3.586 13.586 5l6 6H2c-.553 0-1 .448-1 1s.447 1 1 1h17.586l-6 6L15 20.414l7.707-7.707c.391-.391.391-1.023 0-1.414z"
      />
    </svg>
  );
}

type BaseProps = ButtonVariants &
  Omit<
    ComponentPropsWithRef<'button'>,
    'color' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'
  > & {
    className?: string | undefined;
    /** Skip the default variant/size classes — caller owns the surface, Button keeps semantics. */
    unstyled?: boolean;
    /**
     * Trailing arrow icon (theme `span + svg`, 15px gap). `true` renders the theme's `tail-right`
     * arrow; pass a node to supply a custom trailing icon.
     */
    iconRight?: boolean | ReactNode;
  };

type DefaultProps = BaseProps & {
  asChild?: false | undefined;
  children: ReactNode;
  loading?: boolean;
};

type AsChildProps = BaseProps & {
  asChild: true;
  children: ReactNode;
  loading?: undefined;
};

export type ButtonProps = DefaultProps | AsChildProps;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild, variant, size = 'md', className, children, disabled, ...rest }, ref) => {
    const { loading, unstyled, iconRight, ...domRest } = rest as {
      loading?: boolean;
      unstyled?: boolean;
      iconRight?: boolean | ReactNode;
    } & typeof rest;
    const classes = unstyled ? className : cn(buttonVariants({ variant, size }), className);

    if (asChild) {
      // asChild renders the single child element (e.g. a <Link>) carrying the .btn classes. The
      // caller composes its own inner span/icon, so we don't inject the trailing arrow here.
      return (
        <Slot ref={ref as Ref<never>} className={classes} {...domRest}>
          {children}
        </Slot>
      );
    }

    const isDisabled = disabled || loading;
    const trailingIcon =
      iconRight === true ? <TailRight /> : iconRight ? (iconRight as ReactNode) : null;

    return (
      <motion.button
        ref={ref}
        type="button"
        className={classes}
        disabled={isDisabled ?? false}
        aria-busy={loading || undefined}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        {...(domRest as Record<string, unknown>)}
      >
        {loading && (
          <span
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden
          />
        )}
        {typeof children === 'string' ? (
          <Text
            as="span"
            size={textSizeMap[size ?? 'md']}
            weight="bold"
            color="current"
            value={children as TranslationDefault}
          />
        ) : (
          children
        )}
        {trailingIcon}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';

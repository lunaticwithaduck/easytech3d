'use client';

import { Slot } from '@radix-ui/react-slot';
import { motion } from 'motion/react';
import { type ComponentPropsWithRef, forwardRef, type ReactNode, type Ref } from 'react';
import { cn } from '@/design-system/lib/cn';
import type { TranslationDefault } from '@/i18n/translate';
import { Text } from '../Text/Text';
import { type ButtonVariants, buttonVariants } from './Button.styles';

const textSizeMap = { sm: 'sm', md: 'base', lg: 'lg', xl: 'base' } as const;

type BaseProps = ButtonVariants &
  Omit<
    ComponentPropsWithRef<'button'>,
    'color' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'
  > & {
    className?: string | undefined;
    /** Skip the default variant/size classes — caller owns the surface, Button keeps semantics. */
    unstyled?: boolean;
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
    const { loading, unstyled, ...domRest } = rest as {
      loading?: boolean;
      unstyled?: boolean;
    } & typeof rest;
    const classes = unstyled ? className : cn(buttonVariants({ variant, size }), className);

    if (asChild) {
      return (
        <Slot ref={ref as Ref<never>} className={classes} {...domRest}>
          {children}
        </Slot>
      );
    }

    const isDisabled = disabled || loading;

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
            weight="medium"
            color="current"
            value={children as TranslationDefault}
          />
        ) : (
          children
        )}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
